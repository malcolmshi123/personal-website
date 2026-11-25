import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { inlineAssets } from "./build-social-card.mjs";

test("card fonts and photos are inlined as data URLs", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "card-"));
    writeFileSync(path.join(directory, "a.woff2"), "font");
    writeFileSync(path.join(directory, "b.webp"), "photo");
    const html = inlineAssets('url("{{font:a.woff2}}") <img src="{{image:b.webp}}">', directory);
    assert.equal(html, `url("data:font/woff2;base64,${Buffer.from("font").toString("base64")}") <img src="data:image/webp;base64,${Buffer.from("photo").toString("base64")}">`);
    rmSync(directory, { recursive: true, force: true });
});

test("an unknown asset type is an error, not a broken card", () => {
    assert.throws(() => inlineAssets("{{image:card.gif}}", "."), /Unknown asset type/);
});
