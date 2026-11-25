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

function withoutTrailingSlash(path: string): string {
    return path.replace(/\/$/, "");
}

function HeaderNavigation({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const currentPath = withoutTrailingSlash(pathname);

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
            {/* Page order matches reading order: on desktop the nav comes before the toggle, and on phones the menu opens right after its button. */}
            <Link className="wordmark" href="/" aria-label="Malcolm Shi, home">
                Malcolm Shi.
            </Link>
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
                    {siteNavigation.map(({ href, label }) => {
                        const isCurrent = withoutTrailingSlash(href) === currentPath;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={isCurrent ? "page" : undefined}
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Following a link to this same page doesn't navigate, so focus returns to the menu button.
                                        if (isOpen && isCurrent) {
                                            menuButton.current?.focus();
                                        }
                                    }}
                                >
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <ThemeToggle />
        </header>
    );
}
