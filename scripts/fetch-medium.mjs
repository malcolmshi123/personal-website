import { readFileSync, writeFileSync } from "node:fs";
import { loadArticles } from "./medium.mjs";

const fallbackFile = new URL("../src/content/blog-fallback.json", import.meta.url);
const outputFile = new URL("../src/content/blog-feed.generated.json", import.meta.url);

async function fetchText(url) {
    const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; malcolmshi.ca build)" },
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
    }
    return response.text();
}

const fallback = JSON.parse(readFileSync(fallbackFile, "utf8"));
const articles = await loadArticles({ fetchText, fallback });
writeFileSync(outputFile, `${JSON.stringify(articles, null, 4)}\n`);

const source = articles === fallback ? "saved fallback list" : "Medium feed";
console.log(`Blog: ${articles.length} posts from the ${source}.`);
