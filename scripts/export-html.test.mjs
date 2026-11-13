import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function readExport(path) {
    const html = await readFile(new URL(`../out/${path}`, import.meta.url), "utf8");

    // React separates adjacent text nodes with empty comments in static HTML.
    return html.replaceAll("<!-- -->", "");
}

test("homepage HTML contains the greeting and description without JavaScript", async () => {
    const html = await readExport("index.html");

    const greeting = html.match(/<h1[^>]*class="greeting"[^>]*>([\s\S]*?)<\/h1>/);

    assert.ok(greeting, "greeting heading is missing");
    assert.equal(greeting[1].replace(/<[^>]+>/g, ""), "Hi, I’m Malcolm.");
    assert.match(html, /Computer engineering grad from Waterloo\. My faith, my work, and a few things I enjoy\./);
});

const pages = ["index.html", "about/index.html", "blog/index.html", "contact/index.html", "gospel/index.html", "photos/index.html", "work/index.html"];

test("every page footer carries the verse", async () => {
    for (const page of pages) {
        const html = await readExport(page);

        assert.match(html, /Do everything in love\./, page);
        assert.match(html, /1 Corinthians 16:14/, page);
    }
});

test("the theme toggle is hidden when JavaScript never sets a theme", async () => {
    const cssDirectory = new URL("../out/_next/static/chunks/", import.meta.url);
    const cssFiles = (await readdir(cssDirectory)).filter((name) => name.endsWith(".css"));
    const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, cssDirectory), "utf8")))).join("");

    assert.match(css, /:root:not\(\[data-theme\]\) \.theme-toggle\{display:none\}/);
});

test("the theme boot script ships in the head", async () => {
    const html = await readExport("index.html");
    const head = html.slice(0, html.indexOf("</head>"));

    assert.match(head, /prefers-color-scheme/);
});

test("no content is hidden with inline opacity styles", async () => {
    const html = await readExport("index.html");

    assert.doesNotMatch(html, /opacity:\s*0[;"]/);
});

test("the gospel page shows its reading time", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /About 5 minutes/);
});
