// Renders assets/social-card.html to public/social-card.png (1200×630) with a local Chrome or Edge.
// Run with `npm run social-card` after editing the card.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const source = "assets/social-card.html";
const output = "public/social-card.png";
const mimeTypes = { ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg" };

const browsers = [
    process.env.CARD_BROWSER,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
].filter(Boolean);

// Fonts and photos are inlined so the headless browser never has to load local files.
export function inlineAssets(html, baseDirectory) {
    return html.replace(/\{\{(?:font|image):([^}]+)\}\}/g, (_, relativePath) => {
        const file = path.resolve(baseDirectory, relativePath);
        const type = mimeTypes[path.extname(file).toLowerCase()];
        if (!type) {
            throw new Error(`Unknown asset type: ${relativePath}`);
        }
        return `data:${type};base64,${readFileSync(file).toString("base64")}`;
    });
}

function main() {
    const browser = browsers.find((candidate) => existsSync(candidate));
    if (!browser) {
        throw new Error("No Chrome or Edge found. Set CARD_BROWSER to a Chromium browser's path.");
    }
    const workDirectory = mkdtempSync(path.join(tmpdir(), "social-card-"));
    try {
        const page = path.join(workDirectory, "card.html");
        writeFileSync(page, inlineAssets(readFileSync(source, "utf8"), path.dirname(source)));
        const result = spawnSync(browser, [
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            "--window-size=1200,630",
            "--virtual-time-budget=2000",
            `--user-data-dir=${path.join(workDirectory, "profile")}`,
            `--screenshot=${path.resolve(output)}`,
            pathToFileURL(page).href,
        ], { encoding: "utf8" });
        if (result.status !== 0 || !existsSync(output)) {
            throw new Error(`The browser couldn't render the card.\n${result.stderr}`);
        }
        console.log(`Wrote ${output}.`);
    } finally {
        rmSync(workDirectory, { recursive: true, force: true });
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
