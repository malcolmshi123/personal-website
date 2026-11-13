export type Theme = "light" | "dark";

export const themeStorageKey = "theme";
export const toggleSeenKey = "theme-toggled";
export const darkFaviconHref = "/icon-dark.svg";

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

export function shouldFollowSystem(stored: Theme | null, toggledThisVisit: boolean): boolean {
    return stored === null && !toggledThisVisit;
}

export function faviconHrefFor(theme: Theme, lightHref: string): string {
    return theme === "dark" ? darkFaviconHref : lightHref;
}

type IconLink = {
    dataset: { lightHref?: string };
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
};

export function syncFaviconLinks(links: Iterable<IconLink>, theme: Theme): void {
    for (const link of links) {
        // Remember each light icon the first time, since its URL carries a build hash.
        link.dataset.lightHref ??= link.getAttribute("href") ?? "";
        link.setAttribute("href", faviconHrefFor(theme, link.dataset.lightHref));
    }
}
