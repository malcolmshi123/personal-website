import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { bootScript } from "@/lib/boot-script";
import { createPageMetadata, siteDescription, siteUrl } from "@/lib/site-metadata";
import "./globals.css";

const bodyFont = Hanken_Grotesk({
    subsets: ["latin"],
    variable: "--font-hanken",
    display: "swap",
});

const headingFont = Fraunces({
    subsets: ["latin"],
    axes: ["SOFT", "WONK", "opsz"],
    variable: "--font-fraunces",
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
        <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: bootScript }} />
            </head>
            <body>
                <a className="skip-link" href="#main-content">Skip to content</a>
                <div className="site-shell">
                    <SiteHeader />
                    <main id="main-content" className="main-content" tabIndex={-1}>
                        {children}
                    </main>
                </div>
                <SiteFooter />
            </body>
        </html>
    );
}
