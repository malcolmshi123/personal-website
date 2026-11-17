type BootStorage = {
    getItem(key: string): string | null;
};

type BootSessionStorage = BootStorage & {
    setItem(key: string, value: string): void;
};

export type BootWindow = {
    localStorage: BootStorage;
    sessionStorage: BootSessionStorage;
    location: { pathname: string };
    matchMedia(query: string): { matches: boolean };
    document: { documentElement: { dataset: Record<string, string | undefined> } };
};

// Serialized into an inline script, so it must not reference anything outside its own body.
export function bootDocument(win: BootWindow): void {
    const dataset = win.document.documentElement.dataset;

    function read(storage: () => BootStorage, key: string): string | null {
        try {
            return storage().getItem(key);
        } catch {
            return null;
        }
    }

    const stored = read(() => win.localStorage, "theme");
    const prefersDark = win.matchMedia("(prefers-color-scheme: dark)").matches;
    dataset.theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";

    if (read(() => win.localStorage, "theme-toggled") === "true") {
        dataset.themeToggled = "true";
    }

    // The homepage intro plays once per visit; blocked storage skips it rather than replaying it.
    if (win.location.pathname === "/" && !win.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        try {
            if (win.sessionStorage.getItem("intro-seen") === null) {
                win.sessionStorage.setItem("intro-seen", "true");
                dataset.intro = "play";
            }
        } catch {
            // No intro without storage.
        }
    }
}

export const bootScript = `(${bootDocument.toString()})(window)`;
