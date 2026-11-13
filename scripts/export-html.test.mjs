import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readExport(path) {
    const html = await readFile(new URL(`../out/${path}`, import.meta.url), "utf8");

    // React separates adjacent text nodes with empty comments in static HTML.
    return html.replaceAll("<!-- -->", "");
}

test("homepage HTML contains the greeting and description without JavaScript", async () => {
    const html = await readExport("index.html");

    assert.match(html, /Hi/);
    assert.match(html, /Malcolm/);
    assert.match(html, /Computer engineering grad from Waterloo\. My faith, my work, and a few things I enjoy\./);
});

test("every page footer carries the verse", async () => {
    const html = await readExport("index.html");

    assert.match(html, /Do everything in love\./);
    assert.match(html, /1 Corinthians 16:14/);
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
