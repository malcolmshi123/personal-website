// Turns the originals in photo-inbox/ into web copies for the gallery board and homepage stack.
// Run with `npm run photos`; commit public/photos/board/ and src/content/gallery.json, never photo-inbox/.
// Every check runs before the published photos are touched, so a missing or empty inbox can't wipe them.
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { captionFromFilename, duplicatePhotoIds, photoId, readsAsPhoto } from "./photos.mjs";

const inbox = "photo-inbox";
const outputDirectory = "public/photos/board";
const listFile = "src/content/gallery.json";
const widths = [640, 1280];
const allowEmpty = process.argv.includes("--allow-empty");

async function listPhotos(directory, folder = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    const found = [];
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            found.push(...await listPhotos(fullPath, folder ? `${folder}-${entry.name}` : entry.name));
        } else if (readsAsPhoto(entry.name)) {
            found.push({ fullPath, folder, filename: entry.name, id: photoId(folder, entry.name), source: path.join(folder, entry.name) });
        }
    }
    return found;
}

function toHex({ r, g, b }) {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

// sharp drops EXIF, GPS, and other metadata unless asked to keep it; rotate() bakes in the camera orientation first.
async function processPhoto({ fullPath, folder, filename, id }) {
    const source = sharp(fullPath).rotate();
    let width = 0;
    let height = 0;
    for (const size of widths) {
        const info = await source.clone()
            .resize({ width: size, withoutEnlargement: true })
            .webp({ quality: size > 640 ? 78 : 72 })
            .toFile(path.join(outputDirectory, `${id}-${size}.webp`));
        width = info.width;
        height = info.height;
    }
    const { dominant } = await source.clone().stats();
    return { id, caption: captionFromFilename(filename), folder, width, height, color: toHex(dominant) };
}

function stop(message) {
    console.error(`\n${message}\nNothing was changed.`);
    process.exit(1);
}

if (!existsSync(inbox)) {
    stop(`There's no ${inbox}/ folder here. It's git-ignored, so it only exists on the computer that has your original photos.`);
}

const found = await listPhotos(inbox);
if (found.length === 0 && !allowEmpty) {
    stop(`${inbox}/ has no photos, so this would empty the gallery. Run with --allow-empty if that's what you want.`);
}

const duplicates = duplicatePhotoIds(found);
if (duplicates.length > 0) {
    stop([
        "These files would get the same photo id and overwrite each other. Rename one in each group:",
        ...duplicates.map((sources) => `  ${sources.join("  and  ")}`),
    ].join("\n"));
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const photos = [];
const skipped = [];
for (const photo of found) {
    try {
        photos.push(await processPhoto(photo));
    } catch (error) {
        skipped.push(`${photo.source} (${error.message.split("\n")[0]})`);
    }
}

photos.sort((a, b) => a.id.localeCompare(b.id));
await writeFile(listFile, `${JSON.stringify(photos, null, 4)}\n`);

console.log(`Wrote ${photos.length} photos to ${outputDirectory} and ${listFile}.`);
if (skipped.length) {
    console.warn(`Skipped ${skipped.length} that could not be read (HEIC photos need re-exporting as JPG):\n  ${skipped.join("\n  ")}`);
}
