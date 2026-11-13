export type Theme = "light" | "dark";

export const themeStorageKey = "theme";
export const toggleSeenKey = "theme-toggled";
export const greetingPlayedKey = "greeting-played";

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
    if (stored === "light" || stored === "dark") {
        return stored;
    }

    return prefersDark ? "dark" : "light";
}

export function nextTheme(current: Theme): Theme {
    return current === "dark" ? "light" : "dark";
}

type ThemeStorage = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};

export function readStoredTheme(storage: ThemeStorage): Theme | null {
    try {
        const stored = storage.getItem(themeStorageKey);
        return stored === "light" || stored === "dark" ? stored : null;
    } catch {
        return null;
    }
}

export function saveThemeChoice(storage: ThemeStorage, theme: Theme): void {
    try {
        storage.setItem(themeStorageKey, theme);
        storage.setItem(toggleSeenKey, "true");
    } catch {
        // Storage can be blocked in private browsing; the choice then lasts for this page only.
    }
}
