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

const pages = ["index.html", "blog/index.html", "contact/index.html", "gospel/index.html", "photos/index.html", "projects/index.html", "work/index.html"];

test("the projects page lists the four projects in order, with tech, status, and GitHub links but no dates", async () => {
    const html = await readExport("projects/index.html");
    const text = html.replace(/<[^>]+>/g, "\n");
    const names = [...html.matchAll(/<h2[^>]*>([^<]+)</g)].map((match) => match[1]);

    assert.match(html, /<title>Projects \| Malcolm Shi<\/title>/);
    assert.deepEqual(names, ["LLM Inference Optimization Lab", "TFTeacher", "GojoBracken", "Personal Website"]);
    assert.match(text, /C#, Unity, Blender/);
    assert.match(text, /TypeScript, Next\.js, Formspree/);
    assert.match(html, /class="project-status">in progress</);
    assert.equal((html.match(/class="project-status"/g) ?? []).length, 1);
    for (const repo of ["llm-inference-optimization-lab", "tfteacher", "GojoBracken", "personal-website"]) {
        assert.match(html, new RegExp(`href="https://github\\.com/malcolmshi123/${repo}"`));
    }
    assert.doesNotMatch(html, /class="entry-date"/);
});

test("the projects page sits after Work in the navigation, and Work no longer lists projects", async () => {
    const html = await readExport("work/index.html");
    const nav = [...html.matchAll(/<a[^>]*href="(\/[a-z]+\/)"[^>]*>(The Good News|Experience|Projects|Blog|Gallery|Contact)<\/a>/g)].map((match) => match[2]);

    assert.deepEqual(nav.slice(0, 6), ["The Good News", "Experience", "Projects", "Blog", "Gallery", "Contact"]);
    assert.doesNotMatch(html, /id="projects"/);
    assert.doesNotMatch(html, /View on GitHub/);
});

test("the experience page lists roles without a subheading, team names, or long months", async () => {
    const page = await readExport("work/index.html");
    const main = page.slice(page.indexOf("<main"), page.indexOf("</main>"));
    const text = main.replace(/<[^>]+>/g, "\n");

    assert.match(page, /<title>Experience \| Malcolm Shi<\/title>/);
    assert.match(main, /<h1>Experience<\/h1>/);
    assert.doesNotMatch(main, /<h2[^>]*>Experience<\/h2>/);
    assert.deepEqual([...main.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]), ["Huawei", "Nest Wealth", "OpenText", "Education"]);
    assert.match(text, /Jan – Apr 2025/);
    assert.match(text, /May – Aug 2023/);
    assert.match(text, /Sep – Dec 2022/);
    assert.match(text, /Jun 2026/);
    assert.doesNotMatch(text, /January|April|August|September|December|June/);
    assert.doesNotMatch(text, /Software-Hardware Optimization Lab|Pro 1\.0 Platform|Content Server Core/);
    assert.match(text, /high-performance computing, machine learning, and distributed systems/);
});

test("each experience entry has a location under the date and a skills line, with no 'On the' opener", async () => {
    const page = await readExport("work/index.html");
    const main = page.slice(page.indexOf("<main"), page.indexOf("</main>"));
    const entries = [...main.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const expected = [
        ["Markham, ON", "Computer Graphics, GPU Programming, Performance Optimization"],
        ["Toronto, ON", "Wealth Management, Full-Stack Development, Security &amp; Compliance"],
        ["Waterloo, ON", "Content Management, QA &amp; Automation"],
    ];

    assert.equal(entries.length, 3);
    entries.forEach((entry, index) => {
        const [location, skills] = expected[index];
        assert.match(entry, new RegExp(`<p class="work-role">Software Engineer Intern</p><p class="entry-location">${location}</p>`));
        assert.match(entry, new RegExp(`<p class="work-meta">${skills.replace(/\+/g, "\\+")}</p>`));
        assert.doesNotMatch(entry, /<p>On (a|the) /);
    });
    assert.match(main, /<p class="entry-location">Waterloo, ON<\/p>[\s\S]*?Graduated with distinction/);
});

test("the homepage calls the work entry Experience", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<h3>Experience<\/h3>/);
    assert.doesNotMatch(html, /<h3>Work<\/h3>/);
});

test("the about page is gone from the export and the navigation", async () => {
    const html = await readExport("index.html");

    await assert.rejects(readFile(new URL("../out/about/index.html", import.meta.url)));
    assert.doesNotMatch(html, /href="\/about\/"/);
});

test("page introductions use the new wording", async () => {
    assert.match(await readExport("blog/index.html"), /class="introduction">Some blogs I&#x27;ve written\.</);
    assert.match(await readExport("photos/index.html"), /class="introduction">Some photos I&#x27;ve taken\.</);
    assert.match(await readExport("contact/index.html"), /class="introduction">Let’s get in touch!</);
});

test("the gallery has Food, Nature, and Places albums with no descriptions yet", async () => {
    const html = await readExport("photos/index.html");
    const grid = html.slice(html.indexOf('class="album-grid"'), html.indexOf("</ul>", html.indexOf('class="album-grid"')));
    const titles = [...grid.matchAll(/<h2>([^<]+)<\/h2>/g)].map((match) => match[1]);

    assert.deepEqual(titles, ["Food", "Nature", "Places"]);
    assert.doesNotMatch(grid, /<figcaption>[\s\S]*?<p>/);
});

test("the photos page is called Gallery in its heading and the navigation", async () => {
    const html = await readExport("photos/index.html");

    assert.match(html, /<h1>Gallery<\/h1>/);
    assert.match(html, /<title>Gallery \| Malcolm Shi<\/title>/);
    assert.match(html, /<a[^>]*href="\/photos\/"[^>]*>Gallery<\/a>/);
    assert.doesNotMatch(html.replace(/<[^>]+>/g, " "), /\bPhotos\b/);
});

test("every page footer carries Psalm 34:8", async () => {
    for (const page of pages) {
        const html = await readExport(page);

        assert.match(html.replace(/<[^>]+>/g, ""), /“Oh, taste and see that the LORD is good!” Psalm 34:8/, page);
    }
});

test("the homepage work entry says see more and names its destination for screen readers", async () => {
    const html = await readExport("index.html");

    assert.match(html, /href="\/work\/">See more<span class="visually-hidden"> of my experience<\/span><\/a>/);
});

test("the gospel testimony uses the updated wording and references", async () => {
    const page = await readExport("gospel/index.html");
    const body = page.slice(page.indexOf('class="prose"'), page.indexOf("<footer")).replace(/<[^>]+>/g, "\n");
    const testimony = body.slice(body.indexOf("My testimony"), body.indexOf("Come to Jesus"));

    assert.match(testimony, /I had experienced what the world had to offer, but I was still lost and unsatisfied\./);
    assert.match(testimony, /I have come to understand that His grace is sufficient\./);
    assert.doesNotMatch(body, /Psalm 34:8/);
    assert.equal((body.match(/Ephesians 2:1-5/g) ?? []).length, 1);
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

test("the header keeps the wordmark and the footer shows a copyright notice instead", async () => {
    for (const page of pages) {
        const html = await readExport(page);
        const footer = html.slice(html.indexOf("<footer"), html.indexOf("</footer>"));

        assert.match(html, /<a class="wordmark"[^>]*>Malcolm Shi\.<\/a>/, page);
        assert.match(footer, /<p class="site-footer-copyright">© \d{4} Malcolm Shi<\/p>/, page);
        assert.doesNotMatch(footer, /Malcolm Shi\./, page);
    }
});

test("the contact page lists LinkedIn, GitHub, and the resume with icons", async () => {
    const html = await readExport("contact/index.html");
    const links = [...html.matchAll(/<div class="related-links contact-links">([\s\S]*?)<\/div>/g)][0][1];

    assert.match(links, /<a href="https:\/\/linkedin\.com\/in\/malcolm-shi"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>LinkedIn<\/a>/);
    assert.match(links, /<a href="https:\/\/github\.com\/malcolmshi123"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>GitHub<\/a>/);
    assert.match(links, /<a href="\/resume\.pdf"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>Resume<\/a>/);
});

test("the work page resume link shows the resume icon", async () => {
    const html = await readExport("work/index.html");

    assert.match(html, /<a class="resume-download" href="\/resume\.pdf"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>View resume \(PDF\)<\/a>/);
});

test("resume links open the PDF in the browser instead of downloading it", async () => {
    for (const page of pages) {
        const html = await readExport(page);

        assert.doesNotMatch(html, /<a[^>]*href="\/resume\.pdf"[^>]*download/, page);
    }
});

test("the homepage hero shows a labeled photo stack in place of the single photo", async () => {
    const html = await readExport("index.html");
    const hero = html.slice(html.indexOf('class="home-hero"'), html.indexOf('class="home-ground'));

    assert.match(hero, /<button[^>]*class="photo-stack-button"[^>]*aria-label="Show another photo"/);
    assert.match(hero, /food photo coming soon/);
    assert.match(hero.replace(/<[^>]+>/g, ""), /Tasted/);
    assert.doesNotMatch(hero, /class="hero-photo"/);
});

test("the homepage greeting has the portrait photo beside it, outside the heading", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<div class="greeting-row"><h1[^>]*class="greeting"[^>]*>[\s\S]*?<\/h1><div class="greeting-portrait"><img[^>]*src="\/photos\/portrait\.webp"[^>]*><\/div><\/div>/);
    assert.match(html, /<img[^>]*alt="Malcolm smiling in a suit outdoors"/);
    assert.doesNotMatch(html, /portrait coming soon/);
    await readFile(new URL("../out/photos/portrait.webp", import.meta.url));
});

test("the homepage greeting is split into two lines that can rise in", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<h1[^>]*class="greeting"[^>]*><span class="greeting-line"><span>Hi, I’m <\/span><\/span><span class="greeting-line"><span class="greeting-accent">Malcolm!<\/span><\/span><\/h1>/);
});

test("motion only runs during the intro and stops for reduced motion", async () => {
    const cssDirectory = new URL("../out/_next/static/chunks/", import.meta.url);
    const cssFiles = (await readdir(cssDirectory)).filter((name) => name.endsWith(".css"));
    const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, cssDirectory), "utf8")))).join("");

    assert.match(css, /:root\[data-intro=play\] \.greeting-line/);
    assert.match(css, /@keyframes greeting-rise/);
    assert.match(css, /@keyframes hill-breathe/);
    assert.match(css, /prefers-reduced-motion:reduce\)\{[^@]*animation:none!important/);
});

test("the photo stack hint is hidden when JavaScript never runs", async () => {
    const cssDirectory = new URL("../out/_next/static/chunks/", import.meta.url);
    const cssFiles = (await readdir(cssDirectory)).filter((name) => name.endsWith(".css"));
    const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, cssDirectory), "utf8")))).join("");

    assert.match(css, /:root:not\(\[data-theme\]\) \.photo-stack-hint\{display:none\}/);
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

test("every page links the M. favicon and the iPhone home screen icon", async () => {
    for (const page of pages) {
        const html = await readExport(page);
        const head = html.slice(0, html.indexOf("</head>"));

        assert.match(head, /<link rel="icon" href="\/icon\.svg[^"]*"[^>]*type="image\/svg\+xml"/, page);
        assert.match(head, /<link rel="apple-touch-icon" href="\/apple-icon\.png[^"]*"/, page);
    }

    const svg = await readFile(new URL("../out/icon.svg", import.meta.url), "utf8");

    assert.match(svg, /fill="#933f2a"/);

    const darkSvg = await readFile(new URL("../out/icon-dark.svg", import.meta.url), "utf8");

    assert.match(darkSvg, /fill="#1b1712"/);
    assert.match(darkSvg, /fill="#df937a"/);
    await readFile(new URL("../out/apple-icon.png", import.meta.url));
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
        "https://malcolmshi.ca/projects/",
        "https://malcolmshi.ca/work/",
    ]);
});

test("the gospel page shows its reading time", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /<p class="page-meta">4 min<\/p>/);
});

test("the sin section cites Romans 1 and names its vices", async () => {
    const html = await readExport("gospel/index.html");

    assert.match(html, /harms our communities, relationships, and even ourselves/);
    assert.match(html, /greed, envy, deceit, insolence, and the suffering we cause one another/);
    assert.doesNotMatch(html, /injustice/);
    assert.match(html, /Romans 1:29-30[\s\S]*?Romans 3:23[\s\S]*?Romans 6:23/);
});

test("Living as His people is one paragraph that includes loving our neighbors", async () => {
    const html = await readExport("gospel/index.html");
    const section = html.slice(html.indexOf('id="living-in-his-kingdom"'), html.indexOf('id="my-story"'));

    assert.equal([...section.matchAll(/<p>/g)].length, 1);
    assert.match(section, /We are called to love our neighbors and share the gospel through our words and actions so that others may come to know Him\./);
    assert.doesNotMatch(section, /suffering/);
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
