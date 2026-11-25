import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { projectsDescription } from "../../src/content/projects.ts";
import { canonicalValue, loadBuiltStyles } from "./built-css.mjs";

// Checks a declaration's meaning: a string must equal the built value once both are spelled the same way, and a
// regular expression is matched against that canonical spelling.
function assertDeclaration(styles, selector, property, expected, within = "") {
    const value = styles.value(selector, property, within);
    const label = `${within} ${selector} { ${property} }`.trim();
    if (expected instanceof RegExp) {
        assert.match(value ?? "", expected, label);
    } else {
        assert.equal(value, canonicalValue(expected), label);
    }
}

function declares(styles, test) {
    return styles.declarations.some(test);
}

async function readExport(path) {
    const html = await readFile(new URL(`../../out/${path}`, import.meta.url), "utf8");

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
    assert.match(description[1], /<a href="\/blog">blogs<\/a>/);
    assert.match(description[1], /<a href="\/photos">photos<\/a>/);
});

const pages = ["index.html", "blog.html", "contact.html", "gospel.html", "photos.html", "projects.html", "work.html"];

test("the blog lists Medium posts newest first with Medium titles, short months, and read times", async () => {
    const page = await readExport("blog.html");
    const html = page.slice(page.indexOf('class="article-list"'), page.indexOf("</ul>", page.indexOf('class="article-list"')));
    const text = html.replace(/<[^>]+>/g, "\n");
    const titles = [...html.matchAll(/<h2><a href="https:\/\/medium\.com\/@malcolmshi123\/[^"]+" target="_blank" rel="noopener">([^<]+)<\/a><\/h2>/g)].map((match) => match[1]);

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
    const page = await readExport("blog.html");
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
    const page = await readExport("blog.html");
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
    const styles = await loadBuiltStyles();

    assertDeclaration(styles, ".article-with-image .article-image", "transition", "border-color var(--theme-fade), background-color var(--theme-fade)");
});

test("the projects page lists the three projects in order, with tech, status, and GitHub links but no dates", async () => {
    const html = await readExport("projects.html");
    const text = html.replace(/<[^>]+>/g, "\n");
    const names = [...html.matchAll(/<h2[^>]*>(?:<a[^>]*>)?([^<]+)</g)].map((match) => match[1]);

    assert.match(html, /<title>Projects \| Malcolm Shi<\/title>/);
    assert.deepEqual(names, ["LLM Inference Optimization Lab", "GojoBracken", "malcolmshi.ca"]);
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
    const html = await readExport("projects.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const descriptions = [
        "I set up a dedicated GPU server and an asynchronous benchmarking framework to study how configuration choices affect latency and throughput. I experiment with concurrency, token budgets, and KV cache reuse, and analyze the results with server metrics and GPU profiling.",
        "I made a cosmetic mod for Lethal Company that replaces the Bracken with Gojo Satoru. When the Bracken enters aggro, Gojo plays a Japanese voice line over looping music. As the Bracken gets angrier, the music gets louder and Gojo’s aura grows stronger.",
        "I built this site to bring my faith, work, writing, and photos together in one place!",
    ];

    assert.equal(entries.length, 3);
    entries.forEach((entry, index) => {
        assert.ok(entry.indexOf("<h2") < entry.indexOf("<img"), `title before photo in entry ${index}`);
        assert.ok(entry.lastIndexOf("<img") < entry.indexOf(`<p>${descriptions[index]}</p>`), `photo before description in entry ${index}`);
    });
});

test("each project's GitHub logo link sits below its skills line, not in the title row", async () => {
    const html = await readExport("projects.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const repos = ["llm-inference-optimization-lab", "GojoBracken", "personal-website"];

    assert.equal(entries.length, 3);
    entries.forEach((entry, index) => {
        const heading = entry.match(/<div class="project-heading">([\s\S]*?)<\/div>/)[1];
        assert.doesNotMatch(heading, /github\.com/);
        assert.match(entry, new RegExp(`<p class="work-meta">[^<]*</p><div class="project-links"><a href="https://github.com/malcolmshi123/${repos[index]}"[^>]*><svg[^>]*class="link-icon link-icon-github"[\\s\\S]*?</svg>GitHub</a></div>$`));
    });
    assert.doesNotMatch(html, /link-icon-thunderstore|View on GitHub/);
});

test("GojoBracken's download count beside the title links to Thunderstore", async () => {
    const html = await readExport("projects.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);

    assert.match(entries[1], /<h2 class="project-name">GojoBracken<a class="project-downloads" href="https:\/\/thunderstore.io\/c\/lethal-company\/p\/FreakyFriday\/GojoBracken"[^>]*aria-label="\d{1,3}(,\d{3})* downloads? on Thunderstore"><svg[^>]*class="link-icon link-icon-download"[\s\S]*?<\/svg>\d{1,3}(,\d{3})*<\/a><\/h2>/);
    assert.ok([entries[0], entries[2]].every((entry) => !entry.includes("project-downloads")));
});

test("malcolmshi.ca links home from its title and has its own theme toggle beside it, with the hint pointing back from its right", async () => {
    const html = await readExport("projects.html");
    const entries = [...html.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const website = entries[2];
    const toggle = website.indexOf('class="theme-toggle');

    assert.match(website, /<div class="project-heading"><h2 class="project-name"><a class="project-name-link" href="\/">malcolmshi\.ca<\/a><\/h2><button class="theme-toggle/);
    assert.ok(toggle > -1 && toggle < website.indexOf("<img"), "toggle sits between the title and the screenshot");
    assert.match(website, /<button class="theme-toggle[^>]*><svg class="theme-toggle-icon"[\s\S]*?<\/svg><span class="theme-toggle-hint" aria-hidden="true">← click me!<\/span><\/button>/);
    assert.ok(entries.slice(0, 2).every((entry) => !entry.includes("theme-toggle")));
});

test("the header theme toggle has no hint, and the project hint hides once the visitor has toggled the theme", async () => {
    const styles = await loadBuiltStyles();
    const pages = (await readdir(new URL("../../out/", import.meta.url))).filter((name) => name.endsWith(".html"));

    for (const page of pages) {
        const html = await readExport(page);
        const header = html.slice(html.indexOf('<header class="site-header"'), html.indexOf("</header>"));
        assert.doesNotMatch(header, /theme-toggle-hint/, page);
    }
    assertDeclaration(styles, ":root[data-theme-toggled] .theme-toggle-hint", "display", "none");
});

test("every id on the projects page is unique", async () => {
    const html = await readExport("projects.html");
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
    const html = await readExport("projects.html");
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];

    assert.equal(description, "What I’ve built: LLM inference benchmarks, a Lethal Company mod, and this site.");
    assert.ok(description.length <= 155, `${description.length} characters`);
    assert.match(html, new RegExp(`<meta property="og:description" content="${description.replace(/\./g, "\\.")}"`));
});

test("each project shows a 16:9 picture with alt text that exists in public", async () => {
    const html = await readExport("projects.html");
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
    const styles = await loadBuiltStyles();

    assertDeclaration(styles, ".project-image", "transition", "border-color var(--theme-fade), background-color var(--theme-fade)");
});

test("the projects page sits after Work in the navigation, and Work no longer lists projects", async () => {
    const html = await readExport("work.html");
    const nav = [...html.matchAll(/<a[^>]*href="(\/[a-z]+)"[^>]*>(The Good News|Experience|Projects|Blog|Gallery|Contact)<\/a>/g)].map((match) => match[2]);

    assert.deepEqual(nav.slice(0, 6), ["The Good News", "Experience", "Projects", "Blog", "Gallery", "Contact"]);
    assert.doesNotMatch(html, /id="projects"/);
    assert.doesNotMatch(html, /View on GitHub/);
});

test("the experience page lists roles without a subheading, team names, or long months", async () => {
    const page = await readExport("work.html");
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
    assert.match(main, /<p>Coursework in high-performance computing, machine learning, and distributed systems\. Graduated with distinction\.<\/p>/);
});

test("each experience entry has a location under the date and a skills line, with no 'On the' opener", async () => {
    const page = await readExport("work.html");
    const main = page.slice(page.indexOf("<main"), page.indexOf("</main>"));
    const entries = [...main.matchAll(/<li class="work-entry">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    const expected = [
        ["Markham, ON", "Performance Optimization, GPU Programming, Computer Graphics"],
        ["Toronto, ON", "Full-Stack Development, Security &amp; Compliance, Wealth Management"],
        ["Waterloo, ON", "QA &amp; Automation, Content Management"],
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

    await assert.rejects(readFile(new URL("../../out/about/index.html", import.meta.url)));
    assert.doesNotMatch(html, /href="\/about\/"/);
});

test("page introductions use the new wording", async () => {
    assert.match(await readExport("projects.html"), /class="introduction">LLM inference benchmarks, a Lethal Company mod, and this site\.</);
    assert.match(await readExport("blog.html"), /class="introduction">I post on Medium!</);
    assert.match(await readExport("contact.html"), /class="introduction">Let’s get in touch!</);
});

test("the projects, blog, and gallery pages never call their contents things", async () => {
    for (const page of ["projects.html", "blog.html", "photos.html"]) {
        assert.doesNotMatch(await readExport(page), /things I/i, page);
    }
});

test("the photos page is called Gallery in its heading and the navigation", async () => {
    const html = await readExport("photos.html");

    assert.match(html, /<h1>Gallery<\/h1>/);
    assert.match(html, /<title>Gallery \| Malcolm Shi<\/title>/);
    assert.match(html, /<a[^>]*href="\/photos"[^>]*>Gallery<\/a>/);
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

    assert.match(html, /href="\/work">See more<span class="visually-hidden"> of my experience<\/span><\/a>/);
});

test("the gospel testimony uses the updated wording and references", async () => {
    const page = await readExport("gospel.html");
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
    const html = await readExport("contact.html");
    const links = [...html.matchAll(/<div class="related-links contact-links">([\s\S]*?)<\/div>/g)][0][1];

    assert.match(links, /<a href="https:\/\/linkedin\.com\/in\/malcolm-shi" target="_blank" rel="noopener"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>LinkedIn<\/a>/);
    assert.match(links, /<a href="https:\/\/github\.com\/malcolmshi123" target="_blank" rel="noopener"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>GitHub<\/a>/);
    assert.match(links, /<a href="\/resume\.pdf" target="_blank" rel="noopener"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>Resume<\/a>/);
});

test("the contact form posts to Formspree with a spam trap and a status line", async () => {
    const html = await readExport("contact.html");
    const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));

    assert.match(form, /action="https:\/\/formspree\.io\/f\/xzeebqoe"/);
    assert.match(form, /method="POST"/);
    assert.match(form, /<input(?=[^>]*name="_gotcha")(?=[^>]*tabindex="-1")[^>]*>/);
    assert.match(form, /<p class="contact-status" role="status" aria-live="polite"><\/p>/);
    assert.doesNotMatch(form, /disabled=""/);
});

test("the work page resume link shows the resume icon", async () => {
    const html = await readExport("work.html");

    assert.match(html, /<a class="resume-download" href="\/resume\.pdf" target="_blank" rel="noopener"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>View resume \(PDF\)<\/a>/);
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
    assert.match(hero.replace(/<[^>]+>/g, ""), /tasted/);
    assert.doesNotMatch(hero, /class="hero-photo"/);
});

test("the homepage greeting has the portrait photo beside it, outside the heading", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<div class="greeting-row"><h1[^>]*class="greeting"[^>]*>[\s\S]*?<\/h1><div class="greeting-portrait"><img[^>]*src="\/photos\/portrait\.webp"[^>]*><\/div><\/div>/);
    assert.match(html, /<img[^>]*alt="Malcolm smiling in a suit outdoors"/);
    assert.doesNotMatch(html, /portrait coming soon/);
    await readFile(new URL("../../out/photos/portrait.webp", import.meta.url));
});

test("the homepage greeting is split into two lines that can rise in", async () => {
    const html = await readExport("index.html");

    assert.match(html, /<h1[^>]*class="greeting"[^>]*><span class="greeting-line"><span>Hi, I’m <\/span><\/span><span class="greeting-line"><span class="greeting-accent">Malcolm!<\/span><\/span><\/h1>/);
});

test("motion only runs during the intro and stops for reduced motion", async () => {
    const styles = await loadBuiltStyles();

    assert.ok(styles.rules.some((rule) => rule.selector.startsWith(":root[data-intro=play] .greeting-line")));
    assert.ok(styles.hasKeyframes("greeting-rise"));
    assert.ok(styles.hasKeyframes("hill-breathe"));
    assertDeclaration(styles, "*", "animation", "none !important", "@media (prefers-reduced-motion: reduce)");
});

test("the photo stack hint is hidden when JavaScript never runs", async () => {
    const styles = await loadBuiltStyles();

    assertDeclaration(styles, ":root:not([data-theme]) .photo-stack-hint", "display", "none");
});

test("a project's theme toggle and download count line up with its title", async () => {
    const styles = await loadBuiltStyles();

    assertDeclaration(styles, ".project-heading", "align-items", "baseline");
    assertDeclaration(styles, ".prose .project-downloads", "position", "relative");
    assertDeclaration(styles, ".prose .project-downloads", "top", /^calc\(/);
    // -10px leaves the toggle 24px tall in layout, under the smallest title row (27.5px on phones).
    assertDeclaration(styles, ".project-heading .theme-toggle", "margin-block", "-10px");
    assert.ok(!styles.rules.some((rule) => rule.selector.endsWith(".project-link")));
});

test("the homepage hero has no icon links of its own", async () => {
    const html = await readExport("index.html");
    const hero = html.slice(html.indexOf('class="home-hero"'), html.indexOf('class="home-ground'));

    assert.doesNotMatch(hero, /<svg/);
});

test("the theme toggle is hidden when JavaScript never sets a theme", async () => {
    const styles = await loadBuiltStyles();

    assertDeclaration(styles, ":root:not([data-theme]) .theme-toggle", "display", "none");
});

test("every page links the M. favicon and the iPhone home screen icon", async () => {
    for (const page of pages) {
        const html = await readExport(page);
        const head = html.slice(0, html.indexOf("</head>"));

        assert.match(head, /<link rel="icon" href="\/icon\.svg[^"]*"[^>]*type="image\/svg\+xml"/, page);
        assert.match(head, /<link rel="apple-touch-icon" href="\/apple-icon\.png[^"]*"/, page);
    }

    const svg = await readFile(new URL("../../out/icon.svg", import.meta.url), "utf8");

    assert.match(svg, /fill="#e9dcc5"/);
    assert.match(svg, /fill="#1b1712"/);
    assert.match(svg, /fill="#944124"/);

    const darkSvg = await readFile(new URL("../../out/icon-dark.svg", import.meta.url), "utf8");

    assert.match(darkSvg, /fill="#1b1712"/);
    assert.match(darkSvg, /fill="#df937a"/);
    await readFile(new URL("../../out/apple-icon.png", import.meta.url));
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

    assert.match(html, /<a class="home-link" href="\/contact">Contact me<\/a>/);
});

test("the good news entry says read more and names its destination for screen readers", async () => {
    const html = await readExport("index.html");

    assert.match(html, /href="\/gospel">Read more<span class="visually-hidden"> about the good news<\/span><\/a>/);
});

test("no link on any page ends in a slash, apart from the home link and ESV verses", async () => {
    for (const page of pages) {
        const html = await readExport(page);
        const urls = [
            ...[...html.matchAll(/<a[^>]*\shref="([^"]+)"/g)].map((match) => match[1]),
            ...[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((match) => match[1]),
            ...[...html.matchAll(/<meta property="og:url" content="([^"]+)"/g)].map((match) => match[1]),
        ];
        const slashed = urls.filter((url) => url.endsWith("/") && url !== "/" && !url.startsWith("https://www.esv.org/"));

        assert.ok(urls.length > 0, page);
        assert.deepEqual(slashed, [], page);
    }
});

test("the sitemap lists the homepage and every page in the navigation", async () => {
    const xml = await readFile(new URL("../../out/sitemap.xml", import.meta.url), "utf8");
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    assert.deepEqual(urls.sort(), [
        "https://malcolmshi.ca",
        "https://malcolmshi.ca/blog",
        "https://malcolmshi.ca/contact",
        "https://malcolmshi.ca/gospel",
        "https://malcolmshi.ca/photos",
        "https://malcolmshi.ca/projects",
        "https://malcolmshi.ca/work",
    ]);
});

test("the gospel page shows its reading time", async () => {
    const html = await readExport("gospel.html");

    assert.match(html, /<p class="page-meta">About 3 minutes<\/p>/);
});

test("the sin section names its effects and cites only Romans 3 and 6", async () => {
    const html = await readExport("gospel.html");

    assert.match(html, /harms our communities, relationships, and even ourselves/);
    assert.match(html, /We see its effects in greed, exploitation, and the suffering we cause one another\./);
    assert.doesNotMatch(html, /injustice/);
    assert.doesNotMatch(html, /Romans 1:/);
    assert.match(html, /Romans 3:23[\s\S]*?Romans 6:23/);
});

test("Living as His people is one paragraph that includes loving our neighbors", async () => {
    const html = await readExport("gospel.html");
    const section = html.slice(html.indexOf('id="living-in-his-kingdom"'), html.indexOf('id="my-story"'));

    assert.equal([...section.matchAll(/<p>/g)].length, 1);
    assert.match(section, /We are called to love our neighbors and share the gospel through our words and actions so that others may come to know Him\./);
    assert.doesNotMatch(section, /suffering/);
});

test("the gospel introduction is one sentence above the first section", async () => {
    const html = await readExport("gospel.html");

    assert.match(html, /<p class="introduction">The gospel is the good news of God’s kingdom\.<\/p>/);
});

test("the gospel invitation links to the contact page", async () => {
    const html = await readExport("gospel.html");

    assert.match(html, /<p>You don’t need to have every question answered before taking this step\. If you have any, find a local church or ask me <a href="\/contact">here<\/a>!<\/p>/);
    assert.match(html, /receive the life He offers\.<\/p>/);
    assert.doesNotMatch(html, /Come to Jesus, grow in His love/);
});

test("gospel reference labels keep the capitals in each heading", async () => {
    const html = await readExport("gospel.html");

    assert.match(html, /aria-label="Bible passages for God’s kingdom"/);
    assert.match(html, /aria-label="Bible passages for Alive in Christ"/);
    assert.doesNotMatch(html, /aria-label="Bible passages for [^"]*\b(god|christ|his)\b/);
});

test("links that leave the site, and the resume PDF, open in a new tab while page links stay put", async () => {
    const pages = (await readdir(new URL("../../out/", import.meta.url))).filter((name) => name.endsWith(".html"));
    let outbound = 0;

    for (const page of pages) {
        const html = await readExport(page);
        for (const [tag, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/g)) {
            if (/^https?:|\.pdf$/.test(href)) {
                outbound += 1;
                assert.match(tag, /\btarget="_blank"/, `${page}: ${href}`);
                assert.match(tag, /\brel="noopener"/, `${page}: ${href}`);
            } else {
                assert.doesNotMatch(tag, /\btarget=/, `${page}: ${href}`);
            }
        }
    }
    assert.ok(outbound > 20, `found only ${outbound} outbound links`);
});

test("nav, theme toggle, and touch hovers follow the motion polish rules", async () => {
    const styles = await loadBuiltStyles();

    // One underline for both nav states: no border, the current page's line is the same ::after held open.
    assert.ok(!declares(styles, (item) => item.selector === ".site-navigation a" && item.property.startsWith("border-bottom")));
    assertDeclaration(styles, ".site-navigation a[aria-current=page]::after", "opacity", "1");
    // Hovering the toggle lifts the icon, never the sun, so clicking while hovered still sets the sun.
    assert.ok(!styles.rules.some((rule) => rule.selector.includes(".theme-toggle:hover .theme-toggle-sun")));
    // Text colors fade with the sky while the theme switches.
    assert.ok(styles.rules.some((rule) => rule.selector.includes("[data-theme-switching]")));
    // Fanned photo stack and portrait tilt only for a real pointer.
    assert.ok(styles.hasRule(".photo-stack-button:hover .photo-stack-card[data-slot=0]", "@media (hover: hover) and (pointer: fine)"));
    assert.ok(styles.value(":root", "--field-border"));
});

test("the header tabs in the order it reads, and buttons and the phone menu give motion feedback", async () => {
    const header = (await readExport("index.html")).match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
    const positions = ['class="wordmark"', 'class="menu-toggle"', 'class="site-navigation"', 'class="theme-toggle'].map((marker) => header.indexOf(marker));
    assert.ok(positions.every((position) => position >= 0), positions.join());
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);

    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".theme-toggle:active", "transform", "scale(0.97)");
    assertDeclaration(styles, ".menu-toggle:active", "transform", "scale(0.97)");
    assertDeclaration(styles, ".contact-form button:active:not(:disabled)", "transform", "scale(0.97)");
    assertDeclaration(styles, ".site-navigation[data-open=true]", "opacity", "0", "@media (max-width: 760px) @starting-style");
    assert.ok(!declares(styles, (item) => item.property === "--sun-disc" || item.value.includes("--sun-disc")));
    assertDeclaration(styles, ".theme-toggle-sun", "fill", "var(--sun)");
});

test("links and the hint carry their own color so they fade with the theme instead of jumping", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".prose .project-name-link", "color", "var(--heading)");
    assertDeclaration(styles, ".theme-toggle-hint", "color", "var(--ink-soft)");
    assertDeclaration(styles, ".theme-toggle", "transition", /(^|,)color var\(--theme-fade\)/);
});

test("the light theme keeps the dark theme's soft horizon and a sun that stands out", async () => {
    const styles = await loadBuiltStyles();
    const token = (name) => styles.value(":root", `--${name}`);
    const luminance = (hex) => {
        const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
            .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const contrast = (a, b) => {
        const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (high + 0.05) / (low + 0.05);
    };
    // The ground sits close to the sky, like the night ground does, instead of a dark slab.
    assert.ok(contrast(token("sky"), token("ground")) < 1.6, `sky/ground ${contrast(token("sky"), token("ground"))}`);
    assert.ok(contrast(token("ground-ink"), token("ground")) >= 4.5);
    assert.ok(contrast(token("ground-soft"), token("ground")) >= 4.5);
    assert.ok(contrast(token("ground-link"), token("ground")) >= 4.5);
    assert.ok(contrast(token("sun"), token("sky")) >= 3, `sun ${contrast(token("sun"), token("sky"))}`);
    assertDeclaration(styles, "::selection", "background", "var(--highlight)");
});

test("the homepage band lists Projects to the right of Experience", async () => {
    const html = await readExport("index.html");
    const titles = [...html.matchAll(/<li class="home-entry"><h3>([^<]+)<\/h3>/g)].map((match) => match[1]);
    assert.deepEqual(titles, ["The Good News", "Experience", "Projects"]);
    assert.match(html, /href="\/projects">Check them out<span class="visually-hidden"> of my projects<\/span><\/a>/);

    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".home-entries", "grid-template-columns", "repeat(3, minmax(0, 1fr))");
});

test("homepage entries reuse each page's own intro, and only Projects mentions LLM inference", async () => {
    const home = await readExport("index.html");
    const experience = "GPU performance and graphics at Huawei, plus earlier work in web apps, security, and testing.";
    assert.match(await readExport("work.html"), new RegExp(`class="introduction">${experience}<`));
    assert.match(home, new RegExp(`<h3>Experience</h3><p>${experience}</p>`));
    assert.match(home, /<h3>Projects<\/h3><p>LLM inference benchmarks, a Lethal Company mod, and this site\.<\/p>/);
    assert.equal(home.split("<h3>").filter((entry) => entry.includes("LLM inference")).length, 1);
});

test("the light theme mirrors the original night", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ":root", "--sky", "#e9dcc5");
    assertDeclaration(styles, ":root", "--heading", "#1b1712");
    assertDeclaration(styles, ":root[data-theme=dark]", "--sky", "#1b1712");
    assertDeclaration(styles, ":root[data-theme=dark]", "--heading", "#fbf4e8");
    assertDeclaration(styles, ":root[data-theme=dark]", "--ink", "#e9dcc5");
    assertDeclaration(styles, ":root", "--sun", "#c66216");
});

test("inner pages end close to the hill, and the short blog page fits one screen", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".page-content", "padding-block", "clamp(40px, 6vw, 88px) 0");
    assertDeclaration(styles, ".site-footer", "margin-top", "clamp(40px, 6vw, 72px)");
    assert.match(await readExport("blog.html"), /class="page-content reading-page fit-screen"/);
    assertDeclaration(styles, "body:has(.fit-screen) .site-footer", "margin-top", "0");
    assertDeclaration(styles, ".fit-screen h1", "font-size", /^min\(/);
});

test("the gallery is one Pinterest-style board fed by every processed photo", async () => {
    const html = await readExport("photos.html");
    assert.match(html, /class="introduction">Pinterest core!</);
    assert.match(html, /class="photo-board"/);
    assert.doesNotMatch(html, /album-grid|class="gear"|coming soon/);

    const photos = JSON.parse(await readFile(new URL("../../src/content/gallery.json", import.meta.url), "utf8"));
    assert.ok(photos.length > 0);
    for (const photo of photos) {
        assert.match(photo.id, /^[a-z0-9-]+$/);
        assert.ok(photo.caption && !/[-_]/.test(photo.caption), photo.id);
        for (const width of [640, 1280]) {
            const file = await readFile(new URL(`../../out/photos/board/${photo.id}-${width}.webp`, import.meta.url));
            // No EXIF block means no GPS location or camera details ship with the photo.
            assert.ok(!file.includes("EXIF") && !file.includes("Exif"), `${photo.id}-${width} still has metadata`);
        }
    }
    assert.ok(photos.some((photo) => photo.folder === "food"));
    assert.ok(photos.some((photo) => photo.folder === "places"));
});

test("the original photos never reach git", async () => {
    const ignore = await readFile(new URL("../../.gitignore", import.meta.url), "utf8");
    assert.match(ignore, /^photo-inbox\/$/m);
});

test("the board fades into a Show more button and the viewer can close", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".photo-board[data-more]", "mask-image", /^linear-gradient\(/);
    assert.ok(styles.hasRule(".photo-board-more"));
    assert.ok(styles.hasRule(".photo-viewer::backdrop"));
    assertDeclaration(styles, ".photo-pin-caption", "opacity", "0");
});

test("the homepage stack never spins on a tap, and the board shows no photo count", async () => {
    const styles = await loadBuiltStyles();
    assert.ok(!styles.hasKeyframes("photo-stack-in"));
    assert.ok(!styles.rules.some((rule) => rule.selector === ".photo-board-more p"));
});

test("the stack is a held fan of playing cards, and only the leaving card tilts away", async () => {
    const styles = await loadBuiltStyles();
    // Standard playing card proportions, spread flat in a horizontal row to the left.
    assertDeclaration(styles, ".photo-stack-button", "aspect-ratio", "5 / 7");
    assertDeclaration(styles, ".photo-stack-card[data-slot=1]", "transform", "translateX(-15%)");
    assert.ok(!declares(styles, (item) => /\.photo-stack-card\[data-slot=[123]\]/.test(item.selector) && /rotate/.test(`${item.property}:${item.value}`)));
    assert.ok(!declares(styles, (item) => (item.property === "rotate" && item.value.startsWith("y")) || (item.property === "perspective" && item.value === "900px")));
    // The portrait is cropped to the same 5:7 card, keeping its width so the photo never looks squeezed.
    assertDeclaration(styles, ".greeting-portrait", "aspect-ratio", "5 / 7");
    assertDeclaration(styles, ".greeting-portrait", "border-radius", "6% / 4.3%");
    // It spans from the top of the "H" in "Hi" to the baseline of "Malcolm!".
    assertDeclaration(styles, ".greeting-portrait", "height", "calc(var(--greeting-size) * 1.7)");
    assertDeclaration(styles, ".photo-stack-card[data-leaving]", "opacity", "0");
    // Both queued cards share one blur.
    assertDeclaration(styles, ".photo-stack-card[data-slot=1] img", "filter", /^blur\(/);
    assert.equal(styles.value(".photo-stack-card[data-slot=2] img", "filter"), styles.value(".photo-stack-card[data-slot=1] img", "filter"));
    assert.ok(!styles.hasKeyframes("photo-stack-swap"));
});

test("the homepage band text scales with the screen height so three columns still fit one screen", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".home-entry p", "font-size", /^clamp\(.*svh/);
    assertDeclaration(styles, ".home-entry p", "line-height", "1.5");
});

test("hovering the deck lifts only the front card; the queued cards stay put", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".photo-stack-button:hover .photo-stack-card[data-slot=0]", "transform", /translateY\(-4%\)/, "@media (hover: hover) and (pointer: fine)");
    assert.ok(!styles.rules.some((rule) => /\.photo-stack-button:hover \.photo-stack-card\[data-slot=[12]\]/.test(rule.selector)));
});

test("the cards keep a steady gap after the greeting text, and the portrait lifts instead of tilting", async () => {
    const styles = await loadBuiltStyles();
    // The stack sits right after the text column instead of centering in leftover space.
    assertDeclaration(styles, ".home-hero", "grid-template-columns", "minmax(0, max-content) max-content");
    assertDeclaration(styles, ".home-hero", "column-gap", "calc(var(--greeting-size) * 0.9)");
    // The portrait hover is a small lift with a deeper shadow: no tilt, and the photo inside never zooms.
    assert.ok(!declares(styles, (item) => item.selector === ".greeting-portrait:hover" && /rotate/.test(`${item.property}:${item.value}`)));
    assertDeclaration(styles, ".greeting-portrait:hover", "transform", "translateY(-4px)", "@media (hover: hover) and (pointer: fine)");
    assert.ok(!styles.rules.some((rule) => rule.selector.includes(".greeting-portrait:hover img")));
});

test("the homepage photo cards sit still when idle", async () => {
    const styles = await loadBuiltStyles();
    assert.ok(!styles.hasKeyframes("card-drift") && !declares(styles, (item) => item.value.includes("card-drift")));
    assert.ok(!declares(styles, (item) => item.selector.includes(".photo-stack-card") && item.value.includes("infinite")));
});

test("link previews use the current card and describe it", async () => {
    const html = await readExport("index.html");
    assert.match(html, /<meta property="og:image:alt" content="Malcolm Shi, with a line about his faith, his work, and what he enjoys, beside his portrait\."/);
    assert.doesNotMatch(html, /Faith, engineering, writing, and photography/);
    const card = await readFile(new URL("../../out/social-card.png", import.meta.url));
    assert.equal(card.readUInt32BE(16), 1200);
    assert.equal(card.readUInt32BE(20), 630);
});

test("the themed project screenshots crossfade, the photo viewer fades both ways, and status and hint ease", async () => {
    const projects = await readExport("projects.html");
    // The light and dark screenshots share one frame so they can crossfade with the theme.
    assert.match(projects, /<div class="project-image-pair"><img[^>]*class="project-image shows-in-light-theme"[^>]*><img[^>]*class="project-image shows-in-dark-theme"[^>]*><\/div>/);

    const styles = await loadBuiltStyles();
    assert.ok(!declares(styles, (item) => item.selector.endsWith(".shows-in-dark-theme") && item.property === "display" && item.value === "none"));
    assertDeclaration(styles, ".project-image-pair > .project-image", "transition", /^opacity var\(--theme-fade\)/);
    assertDeclaration(styles, ":root[data-theme-switching] .project-image-pair > .project-image", "transition", /opacity var\(--theme-fade\).*!important$/);

    // The viewer and its backdrop fade in (220ms) and out (150ms) instead of popping.
    assertDeclaration(styles, ".photo-viewer", "transition", /(^|,)overlay 150ms [^,]*allow-discrete/);
    assertDeclaration(styles, ".photo-viewer[open]", "opacity", "0", "@starting-style");
    assert.ok(declares(styles, (item) => item.selector === ".photo-viewer[open]::backdrop" && item.within === "" && item.property.startsWith("background")));
    assert.ok(!styles.hasKeyframes("viewer-in"));

    // The contact status eases in, and the theme hint fades out instead of vanishing.
    assertDeclaration(styles, ".contact-status-message", "animation", /^status-in /);
    assert.ok(styles.hasKeyframes("status-in"));
    assertDeclaration(styles, ".theme-toggle-hint", "transition", /(^|,)display 200ms [^,]*allow-discrete/);
});

test("the enlarged photo fades and sharpens in over its placeholder instead of popping", async () => {
    const styles = await loadBuiltStyles();
    assertDeclaration(styles, ".photo-viewer-frame img", "opacity", "0");
    assertDeclaration(styles, ".photo-viewer-frame img", "transition", "opacity 240ms var(--ease-out), filter 240ms var(--ease-out)");
    assertDeclaration(styles, ".photo-viewer-frame img[data-loaded]", "opacity", "1");
    // The frame is sized from the photo's shape, so the placeholder shows before the full photo loads.
    assertDeclaration(styles, ".photo-viewer-frame", "aspect-ratio", "var(--photo-ratio)");
});
