"use client";

import { useEffect } from "react";

// Clears the intro flag once it has played, so returning to the homepage in the same visit does not replay it.
export default function IntroEnd() {
    useEffect(() => {
        const timer = window.setTimeout(() => {
            delete document.documentElement.dataset.intro;
        }, 1600);
        return () => window.clearTimeout(timer);
    }, []);

    return null;
}
