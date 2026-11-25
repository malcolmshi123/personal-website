import { readdir, readFile } from "node:fs/promises";

// Reads the exported stylesheet as rules instead of text, so page tests check what a rule says rather than how the
// minifier happened to spell it (".15s" or "150ms", "from" or "0%", "translateX(" or "translate(").

function expandHex(match) {
    const digits = match.slice(1).toLowerCase();
    return digits.length === 3 || digits.length === 4 ? `#${[...digits].map((digit) => digit + digit).join("")}` : `#${digits}`;
}

export function canonicalValue(value) {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s*!\s*important$/i, "!important")
        .replace(/\s*([,/])\s*/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .replace(/(^|[^\w.])\.(\d)/g, "$10.$2")
        .replace(/(\d+)\.(\d*?)0+(?!\d)/g, (_, whole, fraction) => (fraction ? `${whole}.${fraction}` : whole))
        .replace(/(?<![\w.])(\d+(?:\.\d+)?)s(?![\w-])/g, (_, seconds) => `${Math.round(Number(seconds) * 1000)}ms`)
        .replace(/(?<![\w.#-])0(?:px|r?em)(?!\w)/g, "0")
        .replace(/#[0-9a-f]{3,8}\b/gi, expandHex)
        .replace(/\btranslateX\(/g, "translate(");
}

export function canonicalSelector(selector) {
    const collapsed = selector.trim().replace(/\s+/g, " ");
    if (collapsed === "from") {
        return "0%";
    }
    if (collapsed === "to") {
        return "100%";
    }
    return collapsed
        .replace(/\s*([>+~,])\s*/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .replace(/\[([\w-]+)([~|^$*]?=)(["'])([^"']*)\3\]/g, "[$1$2$4]")
        .replace(/::?(before|after|first-line|first-letter|backdrop|selection)\b/g, "::$1");
}

export function canonicalCondition(prelude) {
    return prelude.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*:\s*/g, ":").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
}

function splitTopLevel(text, separator) {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of text) {
        depth += char === "(" || char === "[" ? 1 : char === ")" || char === "]" ? -1 : 0;
        if (char === separator && depth === 0) {
            parts.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    parts.push(current);
    return parts.map((part) => part.trim()).filter(Boolean);
}

export function parseRules(css) {
    const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = [];
    const declarations = [];
    const keyframes = new Set();
    const stack = [];
    let buffer = "";
    let quote = null;
    let parens = 0;

    const context = () => stack.filter((prelude) => prelude.startsWith("@")).map(canonicalCondition).join(" ");
    const record = () => {
        const text = buffer.trim();
        buffer = "";
        const prelude = stack.at(-1);
        const colon = text.indexOf(":");
        if (!prelude || colon < 0 || (prelude.startsWith("@") && !prelude.startsWith("@font-face"))) {
            return;
        }
        const name = text.slice(0, colon).trim();
        const property = name.startsWith("--") ? name : name.toLowerCase();
        const value = canonicalValue(text.slice(colon + 1));
        const within = canonicalCondition(stack.slice(0, -1).filter((item) => item.startsWith("@")).join(" "));
        for (const selector of splitTopLevel(prelude, ",")) {
            declarations.push({ within, selector: canonicalSelector(selector), property, value });
        }
    };

    for (const char of source) {
        if (quote) {
            buffer += char;
            quote = char === quote ? null : quote;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
        } else if (char === "(") {
            parens += 1;
        } else if (char === ")") {
            parens -= 1;
        } else if (char === "{" && parens === 0) {
            const prelude = buffer.trim();
            buffer = "";
            if (prelude.startsWith("@keyframes ")) {
                keyframes.add(prelude.slice("@keyframes ".length).trim());
            } else if (!prelude.startsWith("@")) {
                for (const selector of splitTopLevel(prelude, ",")) {
                    rules.push({ within: context(), selector: canonicalSelector(selector) });
                }
            }
            stack.push(prelude);
            continue;
        } else if (char === "}" && parens === 0) {
            record();
            stack.pop();
            continue;
        } else if (char === ";" && parens === 0) {
            record();
            continue;
        }
        buffer += char;
    }
    return { rules, declarations, keyframes };
}

export function readStyles(css) {
    const { rules, declarations, keyframes } = parseRules(css);
    const matches = (item, selector, within) => item.selector === canonicalSelector(selector) && item.within === canonicalCondition(within);
    return {
        rules,
        declarations,
        hasKeyframes: (name) => keyframes.has(name),
        hasRule: (selector, within = "") => rules.some((rule) => matches(rule, selector, within)),
        // The last declaration wins, the same way the cascade breaks a tie between equal selectors.
        value: (selector, property, within = "") =>
            declarations.findLast((item) => item.property === property && matches(item, selector, within))?.value,
    };
}

export async function loadBuiltStyles() {
    const directory = new URL("../out/_next/static/chunks/", import.meta.url);
    const files = (await readdir(directory)).filter((name) => name.endsWith(".css"));
    const css = await Promise.all(files.map((name) => readFile(new URL(name, directory), "utf8")));
    return readStyles(css.join("\n"));
}
