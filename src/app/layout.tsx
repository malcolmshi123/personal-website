import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Malcolm Shi",
        template: "%s | Malcolm Shi",
    },
    description: "A bit about my faith, my work, and the things I enjoy.",
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
