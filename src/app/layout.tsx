import type { Metadata } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import { contactLinks } from "@/content/contact";
import { createPageMetadata, siteDescription, siteUrl } from "@/lib/site-metadata";
import "./globals.css";

const bodyFont = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
    display: "swap",
});

const headingFont = Young_Serif({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-young-serif",
    display: "swap",
});

export const metadata: Metadata = {
    ...createPageMetadata("Malcolm Shi", siteDescription, "/"),
    metadataBase: siteUrl,
    title: {
        default: "Malcolm Shi",
        template: "%s | Malcolm Shi",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
            <body>
                <a className="skip-link" href="#main-content">Skip to content</a>
                <div className="site-shell">
                    <SiteHeader />
                    <main id="main-content" className="main-content" tabIndex={-1}>
                        {children}
                    </main>
                </div>
                <footer className="site-footer">
                    <div className="site-footer-inner">
                        <span className="site-footer-name">Malcolm Shi</span>
                        <ul className="site-footer-links">
                            {contactLinks.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </footer>
            </body>
        </html>
    );
}
