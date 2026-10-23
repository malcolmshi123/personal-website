import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import { createPageMetadata, siteDescription, siteUrl } from "@/lib/site-metadata";
import "./globals.css";

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
        <html lang="en">
            <body>
                <a className="skip-link" href="#main-content">Skip to content</a>
                <div className="site-shell">
                    <SiteHeader />
                    <main id="main-content" className="main-content" tabIndex={-1}>
                        {children}
                    </main>
                    <footer className="site-footer">
                        <span>Malcolm Shi</span>
                    </footer>
                </div>
            </body>
        </html>
    );
}
