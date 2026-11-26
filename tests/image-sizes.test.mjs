import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { projectSources, sizedPath } from "../scripts/build-image-sizes.mjs";

test("a smaller copy sits next to its image with the width in its name", () => {
    assert.equal(sizedPath("public/projects/gojobracken.webp", 800), "public/projects/gojobracken-800.webp");
    assert.equal(sizedPath("public/photos/portrait.webp", 160), "public/photos/portrait-160.webp");
});

test("only the full-size Projects images get copies, never the copies themselves", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "projects-"));
    for (const name of ["gojobracken.webp", "gojobracken-800.webp", "notes.txt", "personal-website-dark.webp"]) {
        writeFileSync(path.join(directory, name), "");
    }
    const sources = projectSources(directory).map((source) => path.basename(source)).sort();
    assert.deepEqual(sources, ["gojobracken.webp", "personal-website-dark.webp"]);
    rmSync(directory, { recursive: true, force: true });
});
