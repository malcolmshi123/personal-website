import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Vercel builds through npm so the Medium fetch and export fixes run", async () => {
    const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

    assert.equal(config.buildCommand, "npm run build");
});

test("Vercel serves pages without a trailing slash and redirects old slash links", async () => {
    const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

    assert.equal(config.cleanUrls, true);
    assert.equal(config.trailingSlash, false);
});
