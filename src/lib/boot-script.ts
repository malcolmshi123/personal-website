type BootStorage = {
    getItem(key: string): string | null;
};

export type BootWindow = {
    localStorage: BootStorage;
    sessionStorage: BootStorage;
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

    const greetingPlayed = read(() => win.sessionStorage, "greeting-played") === "true";
    const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!greetingPlayed && !reducedMotion) {
        dataset.greeting = "stream";
    }
}

export const bootScript = `(${bootDocument.toString()})(window)`;
