// Makes smaller copies of the homepage portrait and the Projects images, so the browser can pick one close to the
// size it's shown at. Shrinking a much larger file in the browser looks soft. Run `npm run image-sizes` after
// replacing any of these images; `npm run site-screenshots` already runs it for this site's screenshots.
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

export const portrait = { source: "public/photos/portrait.webp", widths: [160, 320] };
export const projectWidths = [800];

// "public/projects/gojobracken.webp" at 800 becomes "public/projects/gojobracken-800.webp".
export function sizedPath(source, width) {
    return source.replace(/\.webp$/, `-${width}.webp`);
}

export function projectSources(directory = "public/projects") {
    return readdirSync(directory)
        .filter((name) => /^[a-z-]+\.webp$/.test(name) && !/-\d+\.webp$/.test(name))
        .map((name) => path.join(directory, name).replaceAll("\\", "/"));
}

export async function writeSizes(source, widths) {
    for (const width of widths) {
        const output = sizedPath(source, width);
        await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
        console.log(`Wrote ${output}.`);
    }
}

async function main() {
    await writeSizes(portrait.source, portrait.widths);
    for (const source of projectSources()) {
        await writeSizes(source, projectWidths);
    }
}

// Only when run directly; importing the file (tests, other scripts, `node -e`) just loads its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
}
