import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const script = fileURLToPath(new URL("./build-photos.mjs", import.meta.url));

// A project folder that already has published photos, like a real checkout.
function projectWithPublishedPhotos() {
    const cwd = mkdtempSync(path.join(tmpdir(), "build-photos-"));
    mkdirSync(path.join(cwd, "public/photos/board"), { recursive: true });
    mkdirSync(path.join(cwd, "src/content"), { recursive: true });
    writeFileSync(path.join(cwd, "public/photos/board/food-kajiken-640.webp"), "published");
    writeFileSync(path.join(cwd, "src/content/gallery.json"), "[{\"id\":\"food-kajiken\"}]\n");
    return cwd;
}

function run(cwd, ...args) {
    return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

function publishedUntouched(cwd) {
    assert.deepEqual(readdirSync(path.join(cwd, "public/photos/board")), ["food-kajiken-640.webp"]);
    assert.equal(readFileSync(path.join(cwd, "src/content/gallery.json"), "utf8"), "[{\"id\":\"food-kajiken\"}]\n");
}

async function photo(cwd, relativePath, color) {
    mkdirSync(path.dirname(path.join(cwd, relativePath)), { recursive: true });
    await sharp({ create: { width: 40, height: 30, channels: 3, background: color } }).jpeg().toFile(path.join(cwd, relativePath));
}

test("a missing photo-inbox leaves the published photos alone", () => {
    const cwd = projectWithPublishedPhotos();
    const result = run(cwd);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /photo-inbox/);
    publishedUntouched(cwd);
    rmSync(cwd, { recursive: true, force: true });
});

test("an empty photo-inbox leaves the published photos alone unless --allow-empty is passed", () => {
    const cwd = projectWithPublishedPhotos();
    mkdirSync(path.join(cwd, "photo-inbox"));
    const refused = run(cwd);
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /--allow-empty/);
    publishedUntouched(cwd);

    const allowed = run(cwd, "--allow-empty");
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.deepEqual(readdirSync(path.join(cwd, "public/photos/board")), []);
    assert.equal(readFileSync(path.join(cwd, "src/content/gallery.json"), "utf8"), "[]\n");
    rmSync(cwd, { recursive: true, force: true });
});

test("two filenames that make the same photo id stop the build and name both files", async () => {
    const cwd = projectWithPublishedPhotos();
    await photo(cwd, "photo-inbox/food/chicken-parm.jpg", "#c00");
    await photo(cwd, "photo-inbox/food/Chicken_Parm.jpg", "#00c");
    const result = run(cwd);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /chicken-parm\.jpg/);
    assert.match(result.stderr, /Chicken_Parm\.jpg/);
    publishedUntouched(cwd);
    rmSync(cwd, { recursive: true, force: true });
});

test("a normal inbox replaces the published photos", async () => {
    const cwd = projectWithPublishedPhotos();
    await photo(cwd, "photo-inbox/places/mount-fuji.jpg", "#36c");
    const result = run(cwd);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readdirSync(path.join(cwd, "public/photos/board")).sort(), ["places-mount-fuji-1280.webp", "places-mount-fuji-640.webp"]);
    const gallery = JSON.parse(readFileSync(path.join(cwd, "src/content/gallery.json"), "utf8"));
    assert.deepEqual(gallery.map((entry) => [entry.id, entry.caption]), [["places-mount-fuji", "mount fuji"]]);
    assert.ok(!existsSync(path.join(cwd, "public/photos/board/food-kajiken-640.webp")));
    rmSync(cwd, { recursive: true, force: true });
});
