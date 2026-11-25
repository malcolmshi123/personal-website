import { readFileSync, writeFileSync } from "node:fs";
import { projects } from "../src/content/projects.ts";
import { thunderstoreKey } from "../src/lib/thunderstore.ts";
import { loadDownloads } from "./thunderstore.mjs";

const fallbackFile = new URL("../src/content/thunderstore-fallback.json", import.meta.url);
const outputFile = new URL("../src/content/thunderstore.generated.json", import.meta.url);

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; malcolmshi.ca build)" },
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
    }
    return response.json();
}

const hrefs = projects.flatMap((project) => (project.thunderstoreHref ? [project.thunderstoreHref] : []));
const fallback = JSON.parse(readFileSync(fallbackFile, "utf8"));
const downloads = await loadDownloads({ hrefs, fetchJson, fallback });
writeFileSync(outputFile, `${JSON.stringify(downloads, null, 4)}\n`);

const summary = Object.entries(downloads).map(([href, count]) => `${thunderstoreKey(href)} ${count}`).join(", ");
console.log(`Thunderstore: ${summary || "no packages"}.`);
