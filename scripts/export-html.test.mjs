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
    assert.equal(greeting[1].replace(/<[^>]+>/g, ""), "Hi, I’m Malcolm!");
    const description = html.match(/<p class="home-description">([\s\S]*?)<\/p>/);

    assert.ok(description, "homepage description is missing");
    assert.equal(description[1].replace(/<[^>]+>/g, ""), "I’m a computer engineering graduate from Waterloo. I like to write blogs and take photos. Have a look around!");
    assert.match(description[1], /<a href="\/blog\/">blogs<\/a>/);
    assert.match(description[1], /<a href="\/photos\/">photos<\/a>/);
});

const pages = ["index.html", "blog/index.html", "contact/index.html", "gospel/index.html", "photos/index.html", "work/index.html"];

test("the about page is gone from the export and the navigation", async () => {
    const html = await readExport("index.html");

    await assert.rejects(readFile(new URL("../out/about/index.html", import.meta.url)));
    assert.doesNotMatch(html, /href="\/about\/"/);
});

test("page introductions use the new wording", async () => {
    assert.match(await readExport("blog/index.html"), /class="introduction">Some things I&#x27;ve written\.</);
    assert.match(await readExport("photos/index.html"), /class="introduction">My most cherished memories\.</);
    assert.match(await readExport("photos/index.html"), /Japan \+ Korea 2026\./);
    assert.match(await readExport("contact/index.html"), /class="introduction">Let’s get in touch!</);
});

test("every page footer carries the verse", async () => {
    for (const page of pages) {
        const html = await readExport(page);

        assert.match(html.replace(/<[^>]+>/g, ""), /“Do everything in love\.” 1 Corinthians 16:14/, page);
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

test("the homepage has no streamed greeting readout", async () => {
    const html = await readExport("index.html");

    assert.doesNotMatch(html, /greeting-readout|greeting-token/);
});

test("the homepage band ends after the featured entries without an extra link row", async () => {
    const html = await readExport("index.html");

    assert.doesNotMatch(html, /class="home-also"/);
});

test("the homepage hero links to the contact page", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<a class="home-link" href="\/contact\/">Contact me<\/a>/);
});

test("the good news entry says read more and names its destination for screen readers", async () => {
    const html = await readExport("index.html");

    assert.match(html, /href="\/gospel\/">Read more<span class="visually-hidden"> about the good news<\/span><\/a>/);
});

test("the sitemap lists the homepage and every page in the navigation", async () => {
    const xml = await readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8");
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    assert.deepEqual(urls.sort(), [
        "https://malcolmshi.ca/",
        "https://malcolmshi.ca/blog/",
        "https://malcolmshi.ca/contact/",
        "https://malcolmshi.ca/gospel/",
        "https://malcolmshi.ca/photos/",
        "https://malcolmshi.ca/work/",
    ]);
});

test("the gospel page shows its reading time", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /About 4 minutes/);
});

test("the gospel introduction is one sentence above the first section", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /<p class="introduction">The gospel is the good news of God’s kingdom\.<\/p>/);
});

test("the gospel invitation links to the contact page", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /<p>You don’t need to have every question answered before taking this step\. If you have any, find a local church or ask me <a href="\/contact\/">here<\/a>!<\/p>/);
    assert.match(html, /receive the life He offers\.<\/p>/);
    assert.doesNotMatch(html, /Come to Jesus, grow in His love/);
});

test("gospel reference labels keep the capitals in each heading", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /aria-label="Bible passages for God’s kingdom"/);
    assert.match(html, /aria-label="Bible passages for Alive in Christ"/);
    assert.doesNotMatch(html, /aria-label="Bible passages for [^"]*\b(god|christ|his)\b/);
});
