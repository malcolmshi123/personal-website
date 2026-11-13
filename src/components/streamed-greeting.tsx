"use client";

import { useEffect, useState } from "react";
import { formatStreamReadout, greetingAccentFrom, greetingFlagAfterUnmount, greetingTokens, initialReadout } from "@/lib/greeting";
import { greetingPlayedKey } from "@/lib/theme";

function markGreetingPlayed() {
    try {
        window.sessionStorage.setItem(greetingPlayedKey, "true");
    } catch {
        // Blocked storage only means the greeting may stream again on the next visit.
    }
}

function randomTokenDelay(): number {
    return 90 + Math.random() * 90;
}

export default function StreamedGreeting({ id }: { id: string }) {
    const [shown, setShown] = useState(0);
    const [readout, setReadout] = useState("");

    useEffect(() => {
        const root = document.documentElement;
        if (root.dataset.greeting !== "stream") {
            setReadout(initialReadout(root.dataset.greeting));
            return;
        }

        markGreetingPlayed();
        const startedAt = performance.now();
        let count = 0;
        let timer = 0;

        function revealNext() {
            count += 1;
            setShown(count);
            setReadout(formatStreamReadout(count, greetingTokens.length, performance.now() - startedAt));

            if (count < greetingTokens.length) {
                timer = window.setTimeout(revealNext, randomTokenDelay());
            } else {
                root.dataset.greeting = "done";
            }
        }

        timer = window.setTimeout(revealNext, randomTokenDelay());

        return () => {
            window.clearTimeout(timer);
            root.dataset.greeting = greetingFlagAfterUnmount(count);
        };
    }, []);

    return (
        <div className="greeting-block">
            <h1 id={id} className="greeting">
                {greetingTokens.map((token, index) => {
                    const classes = ["greeting-token"];
                    if (index >= greetingAccentFrom) {
                        classes.push("greeting-accent");
                    }
                    if (index < shown) {
                        classes.push("is-shown");
                    }

                    return (
                        <span key={index} className={classes.join(" ")}>
                            {token}
                        </span>
                    );
                })}
            </h1>
            <p className="greeting-readout" aria-hidden="true">{readout}</p>
        </div>
    );
}
