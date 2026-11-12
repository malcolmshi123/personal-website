import assert from "node:assert/strict";
import test from "node:test";
import { bootDocument, bootScript } from "../src/lib/boot-script.ts";
import { nextTheme, resolveTheme } from "../src/lib/theme.ts";

function createStorage(entries = {}) {
    const values = new Map(Object.entries(entries));

    return {
        getItem: (key) => (values.has(key) ? values.get(key) : null),
        setItem: (key, value) => values.set(key, String(value)),
    };
}

function createThrowingStorage() {
    const fail = () => {
        throw new Error("storage blocked");
    };

    return { getItem: fail, setItem: fail };
}

function createWindow({ local = createStorage(), session = createStorage(), prefersDark = false, reducedMotion = false } = {}) {
    return {
        localStorage: local,
        sessionStorage: session,
        matchMedia: (query) => ({
            matches: query.includes("prefers-color-scheme: dark") ? prefersDark : query.includes("prefers-reduced-motion: reduce") ? reducedMotion : false,
        }),
        document: { documentElement: { dataset: {} } },
    };
}

test("resolveTheme uses a stored light or dark choice", () => {
    assert.equal(resolveTheme("dark", false), "dark");
    assert.equal(resolveTheme("light", true), "light");
});

test("resolveTheme falls back to the system preference when nothing is stored", () => {
    assert.equal(resolveTheme(null, true), "dark");
    assert.equal(resolveTheme(null, false), "light");
});

test("resolveTheme ignores invalid stored values", () => {
    assert.equal(resolveTheme("system", true), "dark");
    assert.equal(resolveTheme("garbage", false), "light");
});

test("nextTheme flips between light and dark", () => {
    assert.equal(nextTheme("light"), "dark");
    assert.equal(nextTheme("dark"), "light");
});

test("bootDocument applies the stored theme, toggle flag, and greeting flag", () => {
    const win = createWindow({ local: createStorage({ theme: "dark", "theme-toggled": "true" }) });

    bootDocument(win);

    assert.equal(win.document.documentElement.dataset.theme, "dark");
    assert.equal(win.document.documentElement.dataset.themeToggled, "true");
    assert.equal(win.document.documentElement.dataset.greeting, "stream");
});

test("bootDocument skips the greeting stream when it already played this session", () => {
    const win = createWindow({ session: createStorage({ "greeting-played": "true" }) });

    bootDocument(win);

    assert.equal(win.document.documentElement.dataset.greeting, undefined);
});

test("bootDocument skips the greeting stream under reduced motion", () => {
    const win = createWindow({ reducedMotion: true });

    bootDocument(win);

    assert.equal(win.document.documentElement.dataset.greeting, undefined);
});

test("bootDocument survives blocked storage and follows the system theme", () => {
    const win = createWindow({ local: createThrowingStorage(), session: createThrowingStorage(), prefersDark: true });

    assert.doesNotThrow(() => bootDocument(win));
    assert.equal(win.document.documentElement.dataset.theme, "dark");
    assert.equal(win.document.documentElement.dataset.themeToggled, undefined);
    assert.equal(win.document.documentElement.dataset.greeting, "stream");
});

test("bootScript runs on its own against a window global", () => {
    const win = createWindow({ prefersDark: true });

    new Function("window", bootScript)(win);

    assert.equal(win.document.documentElement.dataset.theme, "dark");
});
