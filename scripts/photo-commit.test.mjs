import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chooseFold, parseOptions, stagedOutsidePhotos } from "./photo-commit.mjs";

const history = [
    { hash: "aaa", subject: "update gallery" },
    { hash: "bbb", subject: "update landing page photos" },
    { hash: "ccc", subject: "update gallery design" },
];

test("a new commit is made when no commit has the message yet", () => {
    assert.deepEqual(chooseFold(history.slice(1), "update gallery"), { action: "new" });
});

test("the latest commit is amended when it has the message", () => {
    assert.deepEqual(chooseFold(history, "update gallery"), { action: "amend", target: "aaa" });
});

test("an older commit with the message is folded into with a fixup", () => {
    const later = [{ hash: "zzz", subject: "update blog page" }, ...history];
    assert.deepEqual(chooseFold(later, "update gallery"), { action: "fixup", target: "aaa" });
});

test("the message must match the whole subject, not part of it", () => {
    assert.deepEqual(chooseFold([{ hash: "ccc", subject: "update gallery design" }], "update gallery"), { action: "new" });
});

test("options default to the update gallery message without pushing", () => {
    assert.deepEqual(parseOptions([]), { message: "update gallery", push: false, skipPhotos: false });
    assert.deepEqual(parseOptions(["--push", "-m", "add travel photos"]), { message: "add travel photos", push: true, skipPhotos: false });
    assert.deepEqual(parseOptions(["--message=add food", "--skip-photos"]), { message: "add food", push: false, skipPhotos: true });
});

test("files staged outside the photo outputs are reported", () => {
    const staged = ["public/photos/board/food-kajiken-640.webp", "src/content/gallery.json", "src/app/globals.css"];
    assert.deepEqual(stagedOutsidePhotos(staged), ["src/app/globals.css"]);
    assert.deepEqual(stagedOutsidePhotos(staged.slice(0, 2)), []);
});

const script = fileURLToPath(new URL("./photo-commit.mjs", import.meta.url));

function git(cwd, ...args) {
    const result = spawnSync("git", args, { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, `git ${args.join(" ")}: ${result.stderr}`);
    return result.stdout.trim();
}

function write(cwd, file, text) {
    mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
    writeFileSync(path.join(cwd, file), text);
}

// A repo where "update gallery" is followed by a commit that doesn't touch photos, like the real history.
function repoWithLaterCommit() {
    const cwd = mkdtempSync(path.join(tmpdir(), "photo-commit-"));
    git(cwd, "init", "-q", "-b", "main");
    git(cwd, "config", "user.email", "test@example.com");
    git(cwd, "config", "user.name", "Test");
    git(cwd, "config", "commit.gpgsign", "false");
    write(cwd, "src/app.ts", "app");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "change gallery design");
    write(cwd, "public/photos/board/food-kajiken-640.webp", "kajiken");
    write(cwd, "src/content/gallery.json", "[\"kajiken\"]");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "update gallery");
    write(cwd, "scripts/tool.mjs", "tool");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "add photo commit script");
    return cwd;
}

function runScript(cwd, ...args) {
    return spawnSync(process.execPath, [script, "--skip-photos", ...args], { cwd, encoding: "utf8" });
}

test("new untracked photos fold into an older commit without touching the commits after it", () => {
    const cwd = repoWithLaterCommit();
    write(cwd, "public/photos/board/places-lake-louise-640.webp", "lake");
    write(cwd, "src/content/gallery.json", "[\"kajiken\",\"lake\"]");
    write(cwd, "notes.txt", "unrelated edit");

    const result = runScript(cwd);
    assert.equal(result.status, 0, result.stderr + result.stdout);

    assert.equal(git(cwd, "log", "--format=%s", "-3"), "add photo commit script\nupdate gallery\nchange gallery design");
    assert.match(git(cwd, "show", "--name-only", "--format=", "HEAD~1"), /places-lake-louise-640\.webp/);
    assert.equal(git(cwd, "show", "HEAD~1:src/content/gallery.json"), "[\"kajiken\",\"lake\"]");
    assert.doesNotMatch(git(cwd, "show", "--name-only", "--format=", "HEAD"), /photos|gallery/);
    assert.equal(git(cwd, "status", "--porcelain"), "?? notes.txt");
    assert.ok(!existsSync(path.join(cwd, ".git", "rebase-merge")));
    rmSync(cwd, { recursive: true, force: true });
});

test("it stops before changing anything when a later commit also changes the photos", () => {
    const cwd = repoWithLaterCommit();
    write(cwd, "src/content/gallery.json", "[\"kajiken\",\"brunch\"]");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "add brunch");
    const before = git(cwd, "rev-parse", "HEAD");
    write(cwd, "src/content/gallery.json", "[\"kajiken\",\"brunch\",\"cat\"]");

    const result = runScript(cwd);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /add brunch/);
    assert.equal(git(cwd, "rev-parse", "HEAD"), before);
    assert.equal(git(cwd, "status", "--porcelain"), "M  src/content/gallery.json");
    rmSync(cwd, { recursive: true, force: true });
});
