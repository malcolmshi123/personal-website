"use client";

import { useEffect, useState } from "react";
import { nextTheme, readStoredTheme, saveThemeChoice, type Theme } from "@/lib/theme";

const darkQuery = "(prefers-color-scheme: dark)";

function getLocalStorage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function currentTheme(): Theme {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        setTheme(currentTheme());

        const storage = getLocalStorage();
        const media = window.matchMedia(darkQuery);

        function followSystem(event: MediaQueryListEvent) {
            if (storage && readStoredTheme(storage)) {
                return;
            }

            const systemTheme: Theme = event.matches ? "dark" : "light";
            document.documentElement.dataset.theme = systemTheme;
            setTheme(systemTheme);
        }

        media.addEventListener("change", followSystem);
        return () => media.removeEventListener("change", followSystem);
    }, []);

    function switchTheme() {
        const chosen = nextTheme(currentTheme());
        const root = document.documentElement;
        root.dataset.theme = chosen;
        root.dataset.themeToggled = "true";

        const storage = getLocalStorage();
        if (storage) {
            saveThemeChoice(storage, chosen);
        }

        setTheme(chosen);
    }

    let label = "Switch theme";
    if (theme) {
        label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }

    return (
        <button className="theme-toggle" type="button" aria-label={label} onClick={switchTheme}>
            <span className="theme-toggle-hint" aria-hidden="true">click me</span>
            <svg className="theme-toggle-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
                <defs>
                    <mask id="moon-cut">
                        <rect width="32" height="32" fill="white" />
                        <circle cx="20" cy="11" r="7" fill="black" />
                    </mask>
                </defs>
                <g className="theme-toggle-sun">
                    <circle cx="16" cy="16" r="8" />
                </g>
                <g className="theme-toggle-moon">
                    <circle cx="15" cy="15" r="8" mask="url(#moon-cut)" />
                    <circle cx="26" cy="6" r="1" />
                    <circle cx="27" cy="20" r="0.8" />
                    <circle cx="6" cy="7" r="0.9" />
                </g>
            </svg>
        </button>
    );
}
