"use client";

import { useEffect, useId, useState } from "react";
import { nextTheme, readStoredTheme, saveThemeChoice, shouldFollowSystem, syncFaviconLinks, type Theme } from "@/lib/theme";

const darkQuery = "(prefers-color-scheme: dark)";

function getLocalStorage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

const iconSelector = "link[rel~=\"icon\"]";

function syncFavicon(theme: Theme) {
    syncFaviconLinks(document.querySelectorAll<HTMLLinkElement>(iconSelector), theme);
}

function addsIconLink(mutations: MutationRecord[]): boolean {
    return mutations.some((mutation) => [...mutation.addedNodes].some(
        (node) => node instanceof HTMLLinkElement && node.matches(iconSelector),
    ));
}

function currentTheme(): Theme {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function systemTheme(prefersDark: boolean): Theme {
    return prefersDark ? "dark" : "light";
}

// The system decides the theme until the visitor picks one, whether saved or just for this visit.
function followsSystem(storage: Storage | null): boolean {
    const stored = storage ? readStoredTheme(storage) : null;
    return shouldFollowSystem(stored, document.documentElement.dataset.themeToggled === "true");
}

// The page can show more than one toggle; each tells the others when the theme changes.
const themeChangeEvent = "theme-toggle-change";

// Matches --theme-fade in styles/foundation.css; text colors fade with the sky only while this flag is set.
const themeFadeMs = 800;
let themeSwitchTimer: number | undefined;

function markThemeSwitching(root: HTMLElement) {
    root.dataset.themeSwitching = "";
    window.clearTimeout(themeSwitchTimer);
    themeSwitchTimer = window.setTimeout(() => delete root.dataset.themeSwitching, themeFadeMs);
}

// The hint sits to the right of the icon and points back at it.
export default function ThemeToggle({ hint = false }: { hint?: boolean }) {
    const [theme, setTheme] = useState<Theme | null>(null);
    const maskId = `moon-cut-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    useEffect(() => {
        function followOtherToggle(event: Event) {
            setTheme((event as CustomEvent<Theme>).detail);
        }

        window.addEventListener(themeChangeEvent, followOtherToggle);
        return () => window.removeEventListener(themeChangeEvent, followOtherToggle);
    }, []);

    useEffect(() => {
        const storage = getLocalStorage();
        const media = window.matchMedia(darkQuery);
        const root = document.documentElement;

        // The system theme can change between the boot script and hydration.
        if (followsSystem(storage)) {
            root.dataset.theme = systemTheme(media.matches);
        }

        setTheme(currentTheme());

        function followSystem(event: MediaQueryListEvent) {
            if (!followsSystem(storage)) {
                return;
            }

            const fromSystem = systemTheme(event.matches);
            root.dataset.theme = fromSystem;
            setTheme(fromSystem);
        }

        media.addEventListener("change", followSystem);
        return () => media.removeEventListener("change", followSystem);
    }, []);

    useEffect(() => {
        if (!theme) {
            return;
        }

        syncFavicon(theme);

        // Next adds its own icon link after hydration and on navigation; keep it on the current theme.
        const observer = new MutationObserver((mutations) => {
            if (addsIconLink(mutations)) {
                syncFavicon(theme);
            }
        });
        observer.observe(document.head, { childList: true });
        return () => observer.disconnect();
    }, [theme]);

    function switchTheme() {
        const chosen = nextTheme(currentTheme());
        const root = document.documentElement;
        markThemeSwitching(root);
        root.dataset.theme = chosen;
        root.dataset.themeToggled = "true";

        const storage = getLocalStorage();
        if (storage) {
            saveThemeChoice(storage, chosen);
        }

        setTheme(chosen);
        window.dispatchEvent(new CustomEvent<Theme>(themeChangeEvent, { detail: chosen }));
    }

    let label = "Switch theme";
    if (theme) {
        label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }

    return (
        <button className="theme-toggle" type="button" aria-label={label} onClick={switchTheme}>
            <svg className="theme-toggle-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
                <defs>
                    <mask id={maskId}>
                        <rect width="32" height="32" fill="white" />
                        <circle cx="20" cy="11" r="7" fill="black" />
                    </mask>
                </defs>
                <g className="theme-toggle-sun">
                    <circle cx="16" cy="16" r="8" />
                </g>
                <g className="theme-toggle-moon">
                    <circle cx="15" cy="15" r="8" mask={`url(#${maskId})`} />
                    <circle className="theme-toggle-star" cx="26" cy="6" r="1" />
                    <circle className="theme-toggle-star" cx="27" cy="20" r="0.8" />
                    <circle className="theme-toggle-star" cx="6" cy="7" r="0.9" />
                </g>
            </svg>
            {hint && <span className="theme-toggle-hint" aria-hidden="true">← click me!</span>}
        </button>
    );
}
