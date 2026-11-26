import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileForPath } from "../scripts/build-site-screenshots.mjs";

function exportedSite() {
    const root = mkdtempSync(path.join(tmpdir(), "site-"));
    mkdirSync(path.join(root, "_next/static"), { recursive: true });
    writeFileSync(path.join(root, "index.html"), "home");
    writeFileSync(path.join(root, "projects.html"), "projects");
    writeFileSync(path.join(root, "_next/static/app.css"), "css");
    return root;
}

test("the screenshot server finds pages and assets the way Vercel's clean URLs do", () => {
    const root = exportedSite();
    assert.equal(fileForPath(root, "/"), path.join(root, "index.html"));
    assert.equal(fileForPath(root, "/projects"), path.join(root, "projects.html"));
    assert.equal(fileForPath(root, "/_next/static/app.css?v=1"), path.join(root, "_next/static/app.css"));
    assert.equal(fileForPath(root, "/missing"), null);
    rmSync(root, { recursive: true, force: true });
});

test("the screenshot server never serves files outside the export", () => {
    // A real file just outside the export, so a request that escapes would find something.
    const parent = mkdtempSync(path.join(tmpdir(), "site-parent-"));
    const root = path.join(parent, "out");
    mkdirSync(root);
    writeFileSync(path.join(parent, "secret.txt"), "outside");
    assert.equal(fileForPath(root, "/../secret.txt"), null);
    assert.equal(fileForPath(root, "/%2e%2e/secret.txt"), null);
    // An encoded slash survives URL parsing and only becomes "../" once decoded.
    assert.equal(fileForPath(root, "/%2e%2e%2fsecret.txt"), null);
    rmSync(parent, { recursive: true, force: true });
});

test("a malformed address is a missing file, not a crash", () => {
    const root = exportedSite();
    assert.equal(fileForPath(root, "/%E0%A4%A"), null);
    rmSync(root, { recursive: true, force: true });
});
