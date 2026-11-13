"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import { siteNavigation } from "@/content/site";

export default function SiteHeader() {
    const pathname = usePathname();

    return <HeaderNavigation key={pathname} pathname={pathname} />;
}

function HeaderNavigation({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);

    return (
        <header
            className="site-header"
            onKeyDown={(event) => {
                if (event.key === "Escape" && isOpen) {
                    setIsOpen(false);
                    menuButton.current?.focus();
                }
            }}
        >
            <Link className="wordmark" href="/" aria-label="Malcolm Shi, home">
                Malcolm Shi.
            </Link>
            <ThemeToggle />
            <button
                ref={menuButton}
                className="menu-toggle"
                type="button"
                aria-expanded={isOpen}
                aria-controls="site-navigation"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "Close" : "Menu"}
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                    <path d={isOpen ? "M3 8h10" : "M3 8h10M8 3v10"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </button>
            <nav id="site-navigation" className="site-navigation" aria-label="Main" data-open={isOpen}>
                <ul>
                    {siteNavigation.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={pathname.replace(/\/$/, "") === href.replace(/\/$/, "") ? "page" : undefined}
                                onClick={() => {
                                    setIsOpen(false);
                                    if (isOpen && pathname.replace(/\/$/, "") === href.replace(/\/$/, "")) {
                                        menuButton.current?.focus();
                                    }
                                }}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
