// Finds a local Chrome or Edge for the scripts that render pages headlessly (the social card and site screenshots).
import { existsSync } from "node:fs";

const browsers = [
    process.env.CARD_BROWSER,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
].filter(Boolean);

export function findBrowser() {
    const browser = browsers.find((candidate) => existsSync(candidate));
    if (!browser) {
        throw new Error("No Chrome or Edge found. Set CARD_BROWSER to a Chromium browser's path.");
    }
    return browser;
}
