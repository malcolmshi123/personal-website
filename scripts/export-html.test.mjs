import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { projectsDescription } from "../src/content/projects.ts";

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

test("the blog lists Medium posts newest first with Medium titles, short months, and read times", async () => {
    const page = await readExport("blog/index.html");
    const html = page.slice(page.indexOf('class="article-list"'), page.indexOf("</ul>", page.indexOf('class="article-list"')));
    const text = html.replace(/<[^>]+>/g, "\n");
    const titles = [...html.matchAll(/<h2><a href="https:\/\/medium\.com\/@malcolmshi123\/[^"]+">([^<]+)<\/a><\/h2>/g)].map((match) => match[1]);

    assert.deepEqual(titles.slice(-2), ["Running Thoughts", "my testimony"]);
    assert.doesNotMatch(html, /my testimony!/);
    assert.match(text, /Nov 18, 2026/);
    assert.match(text, /Nov 26, 2024/);
    assert.match(html, /<p class="article-meta">A Short Devo · 5 min<\/p>/);
    assert.match(html, /<p class="article-meta">the extended version · 6 min<\/p>/);
    assert.doesNotMatch(html, /article-duration/);
    assert.doesNotMatch(text, /min read/);
    assert.doesNotMatch(text, /November/);
});

test("blog links say Read without mentioning Medium", async () => {
    const page = await readExport("blog/index.html");
    const html = page.slice(page.indexOf('class="article-list"'), page.indexOf("</ul>", page.indexOf('class="article-list"')));
    const links = [...html.matchAll(/<a class="article-link"([^>]*)>([\s\S]*?)<\/a>/g)];

    assert.ok(links.length >= 2);
    for (const [, attributes, label] of links) {
        assert.match(label, /^Read <span aria-hidden="true">↗<\/span>$/);
        assert.match(attributes, /aria-label="Read [^"]+"/);
        assert.doesNotMatch(attributes, /Medium/);
    }
    assert.doesNotMatch(html, /Medium ·|on Medium/);
});

test("each blog post shows its Medium preview image", async () => {
    const page = await readExport("blog/index.html");
    const html = page.slice(page.indexOf('class="article-list"'), page.indexOf("</ul>", page.indexOf('class="article-list"')));
    const posts = html.split("<li>").slice(1);

    assert.ok(posts.length >= 2);
    for (const post of posts) {
        const image = post.match(/<img class="article-image"[^>]*>/)[0];
        assert.match(image, /src="https:\/\/miro\.medium\.com\/v2\/resize:fit:440\/[^"]+"/);
        assert.match(image, /srcSet="[^"]+ 440w, [^"]+resize:fit:880\/[^"]+ 880w"/i);
        assert.match(image, /sizes="\(max-width: 600px\) 100vw, 220px"/);
        assert.match(image, /alt=""/);
        assert.match(image, /loading="lazy"/);
    }
    assert.doesNotMatch(html, /_\/stat/);
});

test("blog thumbnail borders fade with the theme instead of jumping", async () => {
    const cssDirectory = new URL("../out/_next/static/chunks/", import.meta.url);
    const cssFiles = (await readdir(cssDirectory)).filter((name) => name.endsWith(".css"));
    const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, cssDirectory), "utf8")))).join("");

    assert.match(css, /\.article-with-image \.article-image\{[^}]*transition:border-color var\(--theme-fade\), ?background-color var\(--theme-fade\)/);
});

test("the projects page lists the three projects in order, with tech, status, and GitHub links but no dates", async () => {
    const html = await readExport("projects/index.html");
    const text = html.replace(/<[^>]+>/g, "\n");
    const names = [...html.matchAll(/<h2[^>]*>([^<]+)</g)].map((match) => match[1]);

    assert.match(html, /<title>Projects \| Malcolm Shi<\/title>/);
    assert.deepEqual(names, ["LLM Inference Optimization Lab", "GojoBracken", "Personal Website"]);
    assert.match(text, /C#, Unity, Blender/);
    assert.match(text, /TypeScript, Next\.js, Vercel, Formspree/);
    assert.match(text, /Python, vLLM, Modal, Prometheus, PyTorch Profiler/);
    assert.doesNotMatch(html, /TFTeacher|tfteacher/);
    for (const repo of ["llm-inference-optimization-lab", "GojoBracken", "personal-website"]) {
        assert.match(html, new RegExp(`href="https://github\\.com/malcolmshi123/${repo}"`));
    }
    assert.doesNotMatch(html, /class="entry-date"/);
});

test("each project shows its title, then its photo, then the new description", async () => {
    const html = await readExport("projects/index.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const descriptions = [
        "I built a GPU model-serving setup and an asynchronous benchmarking framework to study how configuration choices affect latency and throughput. I experiment with concurrency, token budgets, and KV cache reuse, and analyze the results with server metrics and GPU profiling.",
        "I made a cosmetic mod for Lethal Company that replaces the Bracken with Gojo Satoru. When the Bracken enters aggro, Gojo plays a Japanese voice line over looping music. As the Bracken gets angrier, the music gets louder and Gojo’s aura grows stronger.",
        "I designed and built this site to bring my faith, work, writing, and photos together in one place. It’s a static Next.js site on Vercel that pulls my latest Medium posts every day and sends messages through Formspree.",
    ];

    assert.equal(entries.length, 3);
    entries.forEach((entry, index) => {
        assert.ok(entry.indexOf("<h2") < entry.indexOf("<img"), `title before photo in entry ${index}`);
        assert.ok(entry.lastIndexOf("<img") < entry.indexOf(`<p>${descriptions[index]}</p>`), `photo before description in entry ${index}`);
    });
});

test("each project links out with logo links, Thunderstore before GitHub for GojoBracken", async () => {
    const html = await readExport("projects/index.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const linkLabels = (entry) => [...entry.matchAll(/<a href="([^"]+)"[^>]*><svg[^>]*class="link-icon link-icon-([a-z]+)"[\s\S]*?<\/svg>([^<]+)<\/a>/g)]
        .map((match) => [match[1], match[2], match[3]]);

    assert.deepEqual(linkLabels(entries[0]), [["https://github.com/malcolmshi123/llm-inference-optimization-lab", "github", "GitHub"]]);
    assert.deepEqual(linkLabels(entries[1]), [
        ["https://thunderstore.io/c/lethal-company/p/FreakyFriday/GojoBracken", "thunderstore", "Thunderstore"],
        ["https://github.com/malcolmshi123/GojoBracken", "github", "GitHub"],
    ]);
    assert.deepEqual(linkLabels(entries[2]), [["https://github.com/malcolmshi123/personal-website", "github", "GitHub"]]);
    assert.doesNotMatch(html, /View on GitHub/);
});

test("Personal Website has its own theme toggle beside the title, without the hint", async () => {
    const html = await readExport("projects/index.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const website = entries[2];
    const toggle = website.indexOf('class="theme-toggle');

    assert.match(website, /<div class="project-heading"><h2 class="project-name">Personal Website<\/h2><button class="theme-toggle/);
    assert.ok(toggle > -1 && toggle < website.indexOf("<img"), "toggle sits between the title and the screenshot");
    assert.doesNotMatch(website, /theme-toggle-hint/);
    assert.ok(entries.slice(0, 2).every((entry) => !entry.includes("theme-toggle")));
});

test("every id on the projects page is unique", async () => {
    const html = await readExport("projects/index.html");
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

    assert.equal(new Set(ids).size, ids.length, ids.join(", "));
});

test("projectsDescription lists the first three project labels", () => {
    const labelled = (...labels) => labels.map((label) => ({ label }));

    assert.equal(projectsDescription(labelled("a game")), "What I’ve built: a game.");
    assert.equal(projectsDescription(labelled("a game", "an app")), "What I’ve built: a game and an app.");
    assert.equal(projectsDescription(labelled("a game", "an app", "a site", "a bot")), "What I’ve built: a game, an app, and a site.");
});

test("the projects page description comes from the project list and fits in a search snippet", async () => {
    const html = await readExport("projects/index.html");
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];

    assert.equal(description, "What I’ve built: LLM inference benchmarks, a Lethal Company mod, and this site.");
    assert.ok(description.length <= 155, `${description.length} characters`);
    assert.match(html, new RegExp(`<meta property="og:description" content="${description.replace(/\./g, "\\.")}"`));
});

test("each project shows a 16:9 picture with alt text that exists in public", async () => {
    const html = await readExport("projects/index.html");
    const images = [...html.matchAll(/<img([^>]*)>/g)].map((match) => match[1]);
    const sources = images.map((attributes) => attributes.match(/src="([^"]+)"/)[1]);

    assert.deepEqual(sources, ["/projects/llm-inference-optimization-lab.webp", "/projects/gojobracken.webp", "/projects/personal-website-dark.webp", "/projects/personal-website.webp"]);
    assert.match(images[2], /class="project-image shows-in-light-theme"/);
    assert.match(images[3], /class="project-image shows-in-dark-theme"/);
    for (const attributes of images) {
        assert.match(attributes, /class="project-image/);
        assert.match(attributes, /width="1280"/);
        assert.match(attributes, /height="720"/);
        assert.match(attributes, /alt="[^"]{10,}"/);
    }
    // Both theme screenshots load up front so the swap never shows an empty frame.
    assert.deepEqual(images.map((attributes) => attributes.match(/loading="([a-z]+)"/)[1]), ["lazy", "lazy", "eager", "eager"]);
    for (const source of sources) {
        await readExport(source.slice(1));
    }
});

test("project image borders fade with the theme instead of jumping", async () => {
    const cssDirectory = new URL("../out/_next/static/chunks/", import.meta.url);
    const cssFiles = (await readdir(cssDirectory)).filter((name) => name.endsWith(".css"));
    const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, cssDirectory), "utf8")))).join("");

    assert.match(css, /\.project-image\{[^}]*transition:border-color var\(--theme-fade\), ?background-color var\(--theme-fade\)/);
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
    assert.match(await readExport("projects/index.html"), /class="introduction">What I’ve built\.</);
    assert.match(await readExport("blog/index.html"), /class="introduction">What I&#x27;ve written\.</);
    assert.match(await readExport("photos/index.html"), /class="introduction">What I&#x27;ve tasted and seen\.</);
    assert.match(await readExport("contact/index.html"), /class="introduction">Let’s get in touch!</);
});

test("the projects, blog, and gallery pages never call their contents things", async () => {
    for (const page of ["projects/index.html", "blog/index.html", "photos/index.html"]) {
        assert.doesNotMatch(await readExport(page), /things I/i, page);
    }
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

test("the contact form posts to Formspree with a spam trap and a status line", async () => {
    const html = await readExport("contact/index.html");
    const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));

    assert.match(form, /action="https:\/\/formspree\.io\/f\/xzeebqoe"/);
    assert.match(form, /method="POST"/);
    assert.match(form, /<input(?=[^>]*name="_gotcha")(?=[^>]*tabindex="-1")[^>]*>/);
    assert.match(form, /<p class="contact-status" role="status" aria-live="polite"><\/p>/);
    assert.doesNotMatch(form, /disabled=""/);
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
