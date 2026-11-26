// Captures the built homepage at 1280×720 in both themes for this site's entry on the Projects page.
// Run `npm run build` first, then `npm run site-screenshots`. Both themes deal the same photos (see dealSeed).
// The page is captured at twice the size and scaled down, which keeps text and photos crisp.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { projectWidths, writeSizes } from "./build-image-sizes.mjs";
import { findBrowser } from "./browser.mjs";

const width = 1280;
const height = 720;
// Seeds the page's shuffles so both screenshots deal the same three photos. Change it for a different deal.
const dealSeed = 7;
const shots = [
    { theme: "light", output: "public/projects/personal-website.webp" },
    { theme: "dark", output: "public/projects/personal-website-dark.webp" },
];
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".webp": "image/webp",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".txt": "text/plain",
};

function isFile(file) {
    return existsSync(file) && statSync(file).isFile();
}

// Maps a request path to a file in the export, like Vercel's clean URLs: "/" is index.html and "/projects" is
// projects.html. Returns null for missing files and anything outside the export.
export function fileForPath(root, urlPath) {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(urlPath, "http://site").pathname);
    } catch {
        return null;
    }
    const file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) {
        return null;
    }
    const candidates = pathname.endsWith("/") ? [path.join(file, "index.html")] : [file, `${file}.html`];
    return candidates.find(isFile) ?? null;
}

function serve(root) {
    const server = createServer((request, response) => {
        const file = fileForPath(root, request.url ?? "/");
        if (!file) {
            response.writeHead(404).end();
            return;
        }
        response.writeHead(200, { "content-type": mimeTypes[path.extname(file)] ?? "application/octet-stream" });
        response.end(readFileSync(file));
    });
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Starts the browser with a DevTools port and resolves with the address it prints once it's listening.
function launchBrowser(profile) {
    const browser = spawn(findBrowser(), [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--remote-debugging-port=0",
        `--user-data-dir=${profile}`,
        "about:blank",
    ]);
    return new Promise((resolve, reject) => {
        let output = "";
        browser.stderr.on("data", (chunk) => {
            output += chunk;
            const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
            if (match) {
                resolve({ browser, debuggerUrl: match[1] });
            }
        });
        browser.on("exit", () => reject(new Error(`The browser exited before it was ready.\n${output}`)));
    });
}

// A minimal DevTools Protocol client for one page: send a command and wait for its reply, or wait for an event.
async function openPage(debuggerUrl) {
    const port = new URL(debuggerUrl).port;
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target = targets.find((item) => item.type === "page");
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });
    let nextId = 0;
    const pending = new Map();
    const listeners = new Map();
    socket.onmessage = ({ data }) => {
        const message = JSON.parse(data);
        if (message.id !== undefined) {
            const { resolve, reject } = pending.get(message.id);
            pending.delete(message.id);
            message.error ? reject(new Error(message.error.message)) : resolve(message.result);
        } else {
            listeners.get(message.method)?.();
        }
    };
    return {
        send(method, params = {}) {
            const id = ++nextId;
            socket.send(JSON.stringify({ id, method, params }));
            return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
        },
        once(method) {
            return new Promise((resolve) => listeners.set(method, resolve));
        },
        close() {
            socket.close();
        },
    };
}

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function capture(page, url, theme, output) {
    // Reduced motion skips the intro, so the capture shows the page as it settles.
    await page.send("Emulation.setEmulatedMedia", {
        features: [
            { name: "prefers-color-scheme", value: theme },
            { name: "prefers-reduced-motion", value: "reduce" },
        ],
    });
    const loaded = page.once("Page.loadEventFired");
    await page.send("Page.navigate", { url });
    await loaded;
    // The deck deals after the page hydrates, so give it a moment, then wait for every photo and font.
    await pause(1000);
    await page.send("Runtime.evaluate", {
        expression: "Promise.all([document.fonts.ready, ...[...document.images].map((image) => image.decode().catch(() => {}))])",
        awaitPromise: true,
    });
    await pause(300);
    const { data } = await page.send("Page.captureScreenshot", { format: "png" });
    await sharp(Buffer.from(data, "base64")).resize({ width }).webp({ quality: 82 }).toFile(output);
    console.log(`Wrote ${output} (${theme}).`);
    await writeSizes(output, projectWidths);
}

async function main() {
    const root = path.resolve("out");
    if (!isFile(path.join(root, "index.html"))) {
        throw new Error("No built site in out/. Run `npm run build` first.");
    }
    const server = await serve(root);
    const profile = mkdtempSync(path.join(tmpdir(), "site-screenshots-"));
    const { browser, debuggerUrl } = await launchBrowser(profile);
    try {
        const page = await openPage(debuggerUrl);
        await page.send("Page.enable");
        await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: false });
        // A small seeded generator in place of Math.random, so the deck deals the same cards on every load.
        await page.send("Page.addScriptToEvaluateOnNewDocument", {
            source: `(() => { let state = ${dealSeed} >>> 0; Math.random = () => { state = (state + 0x6d2b79f5) >>> 0; let t = Math.imul(state ^ (state >>> 15), 1 | state); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();`,
        });
        const url = `http://127.0.0.1:${server.address().port}/`;
        for (const { theme, output } of shots) {
            await capture(page, url, theme, output);
        }
        page.close();
    } finally {
        browser.kill();
        server.close();
        // The browser may still hold its profile for a moment after it's told to quit.
        await pause(500);
        rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
}

// Only when run directly; importing the file (tests, other scripts, `node -e`) just loads its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
}
