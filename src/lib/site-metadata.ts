import type { Metadata } from "next";

export const siteUrl = new URL("https://malcolmshi.ca");
export const siteDescription = "A bit about my faith, my work, and the things I enjoy.";

export function createPageMetadata(title: string, description: string, path: string): Metadata {
    const sharingTitle = path === "/" ? title : `${title} | Malcolm Shi`;
    const image = {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Malcolm Shi. Faith, engineering, writing, and photography.",
    };

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            siteName: "Malcolm Shi",
            title: sharingTitle,
            description,
            url: path,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: sharingTitle,
            description,
            images: [image],
        },
    };
}
