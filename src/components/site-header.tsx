"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const navigation = [
    { href: "/gospel/", label: "The Good News" },
    { href: "/about/", label: "About" },
    { href: "/work/", label: "Work" },
    { href: "/blog/", label: "Blog" },
    { href: "/photos/", label: "Photos" },
    { href: "/contact/", label: "Contact" },
];

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
                Malcolm Shi<span aria-hidden="true">.</span>
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
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <nav id="site-navigation" className="site-navigation" aria-label="Main" data-open={isOpen}>
                <ul>
                    {navigation.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={pathname.replace(/\/$/, "") === href.replace(/\/$/, "") ? "page" : undefined}
                                onClick={() => setIsOpen(false)}
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
