import type { MetadataRoute } from "next";
import { siteNavigation } from "@/content/site";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    // A URL object always ends the bare domain with a slash, so the homepage uses the origin.
    return ["/", ...siteNavigation.map((link) => link.href)].map((path) => ({
        url: path === "/" ? siteUrl.origin : new URL(path, siteUrl).href,
    }));
}
