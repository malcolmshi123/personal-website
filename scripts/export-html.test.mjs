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

test("every page footer has labeled LinkedIn, GitHub, and resume icons", async () => {
    for (const page of pages) {
        const html = await readExport(page);
        const footer = html.slice(html.indexOf("<footer"));

        for (const [href, label] of [
            ["https://linkedin.com/in/malcolm-shi", "LinkedIn"],
            ["https://github.com/malcolmshi123", "GitHub"],
            ["/resume.pdf", "Resume (PDF)"],
        ]) {
            const link = footer.match(new RegExp(`<a href="${href}"[^>]*aria-label="${label.replace(/[()]/g, "\\$&")}"[^>]*>([\\s\\S]*?)</a>`));

            assert.ok(link, `${page}: footer ${label} link is missing`);
            assert.match(link[1], /^<svg[^>]*aria-hidden="true"/, `${page}: footer ${label} link has no icon`);
        }
    }
});

test("the header wordmark and footer name both end with a period", async () => {
    for (const page of pages) {
        const html = await readExport(page);

        assert.match(html, /<a class="wordmark"[^>]*>Malcolm Shi\.<\/a>/, page);
        assert.match(html, /<span class="site-footer-name">Malcolm Shi\.<\/span>/, page);
    }
});

test("the contact page lists LinkedIn, GitHub, and the resume with icons", async () => {
    const html = await readExport("contact/index.html");
    const links = [...html.matchAll(/<div class="related-links contact-links">([\s\S]*?)<\/div>/g)][0][1];

    assert.match(links, /<a href="https:\/\/linkedin\.com\/in\/malcolm-shi"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>LinkedIn<\/a>/);
    assert.match(links, /<a href="https:\/\/github\.com\/malcolmshi123"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>GitHub<\/a>/);
    assert.match(links, /<a href="\/resume\.pdf" download="Malcolm-Shi-Resume\.pdf"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>Resume<\/a>/);
});

test("the work page resume link shows the resume icon", async () => {
    const html = await readExport("work/index.html");

    assert.match(html, /<a class="resume-download" href="\/resume\.pdf" download="Malcolm-Shi-Resume\.pdf"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>Download resume \(PDF\)<\/a>/);
});

test("the homepage hero has no icon links of its own", async () => {
    const html = await readExport("index.html");
    const hero = html.slice(html.indexOf('class="home-hero"'), html.indexOf('class="home-ground'));

    assert.doesNotMatch(hero, /<svg/);
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
