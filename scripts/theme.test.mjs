import assert from "node:assert/strict";
import test from "node:test";
import { bootDocument, bootScript } from "../src/lib/boot-script.ts";
import { darkFaviconHref, faviconHrefFor, nextTheme, readStoredTheme, resolveTheme, saveThemeChoice, shouldFollowSystem } from "../src/lib/theme.ts";

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

test("bootDocument applies the stored theme and toggle flag", () => {
    const win = createWindow({ local: createStorage({ theme: "dark", "theme-toggled": "true" }) });

    bootDocument(win);

    assert.equal(win.document.documentElement.dataset.theme, "dark");
    assert.equal(win.document.documentElement.dataset.themeToggled, "true");
});

test("bootDocument no longer sets a greeting flag", () => {
    const win = createWindow();

    bootDocument(win);

    assert.equal(win.document.documentElement.dataset.greeting, undefined);
});

test("bootDocument survives blocked storage and follows the system theme", () => {
    const win = createWindow({ local: createThrowingStorage(), session: createThrowingStorage(), prefersDark: true });

    assert.doesNotThrow(() => bootDocument(win));
    assert.equal(win.document.documentElement.dataset.theme, "dark");
    assert.equal(win.document.documentElement.dataset.themeToggled, undefined);
});

test("bootScript runs on its own against a window global", () => {
    const win = createWindow({ prefersDark: true });

    new Function("window", bootScript)(win);

    assert.equal(win.document.documentElement.dataset.theme, "dark");
});

test("saveThemeChoice stores the theme and marks the toggle as seen", () => {
    const storage = createStorage();

    saveThemeChoice(storage, "dark");

    assert.equal(storage.getItem("theme"), "dark");
    assert.equal(storage.getItem("theme-toggled"), "true");
});

test("saveThemeChoice does not throw when storage is blocked", () => {
    assert.doesNotThrow(() => saveThemeChoice(createThrowingStorage(), "light"));
});

test("readStoredTheme returns null for blocked storage or invalid values", () => {
    assert.equal(readStoredTheme(createThrowingStorage()), null);
    assert.equal(readStoredTheme(createStorage({ theme: "system" })), null);
    assert.equal(readStoredTheme(createStorage({ theme: "dark" })), "dark");
});

test("shouldFollowSystem follows only when the visitor has not chosen a theme", () => {
    assert.equal(shouldFollowSystem(null, false), true);
    assert.equal(shouldFollowSystem("dark", false), false);
});

test("shouldFollowSystem respects a choice made this visit even when storage is blocked", () => {
    assert.equal(shouldFollowSystem(null, true), false);
});

test("bootDocument survives a localStorage getter that throws", () => {
    const win = createWindow({ prefersDark: true });
    Object.defineProperty(win, "localStorage", {
        get() {
            throw new Error("storage blocked");
        },
    });

    assert.doesNotThrow(() => bootDocument(win));
    assert.equal(win.document.documentElement.dataset.theme, "dark");
});

test("the favicon uses the dark icon in dark mode and the original icon in light mode", () => {
    const lightHref = "/icon.svg?icon.abc123.svg";

    assert.equal(faviconHrefFor("dark", lightHref), darkFaviconHref);
    assert.equal(darkFaviconHref, "/icon-dark.svg");
    assert.equal(faviconHrefFor("light", lightHref), lightHref);
});
