import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fixExportPaths } from "./fix-export-paths.mjs";

test("flattens Windows segment paths and preserves existing exports", async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "website-export-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const page = join(directory, "photos", "food");
    const nested = join(page, "__next.photos", "food");
    await mkdir(nested, { recursive: true });
    await writeFile(join(nested, "__PAGE__.txt"), "page payload");
    await writeFile(join(page, "index.html"), "page HTML");
    await writeFile(join(page, "__next._tree.txt"), "tree payload");
    await writeFile(join(directory, "__next.__PAGE__.txt"), "home payload");

    assert.equal(await fixExportPaths(directory), 1);
    assert.equal(await readFile(join(page, "__next.photos.food.__PAGE__.txt"), "utf8"), "page payload");
    assert.equal(await readFile(join(page, "index.html"), "utf8"), "page HTML");
    assert.equal(await readFile(join(page, "__next._tree.txt"), "utf8"), "tree payload");
    assert.equal(await readFile(join(directory, "__next.__PAGE__.txt"), "utf8"), "home payload");
    assert.equal((await readdir(page)).includes("__next.photos"), false);
    assert.equal(await fixExportPaths(directory), 0);
});

test("refuses to overwrite an existing segment file", async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "website-export-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const nested = join(directory, "__next.gospel");
    await mkdir(nested);
    await writeFile(join(nested, "__PAGE__.txt"), "nested payload");
    await writeFile(join(directory, "__next.gospel.__PAGE__.txt"), "existing payload");

    await assert.rejects(fixExportPaths(directory), { code: "EEXIST" });
    assert.equal(await readFile(join(directory, "__next.gospel.__PAGE__.txt"), "utf8"), "existing payload");
    assert.equal(await readFile(join(nested, "__PAGE__.txt"), "utf8"), "nested payload");
});
