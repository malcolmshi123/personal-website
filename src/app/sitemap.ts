import type { MetadataRoute } from "next";
import { siteNavigation } from "@/content/site";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    return ["/", ...siteNavigation.map((link) => link.href)].map((path) => ({
        url: new URL(path, siteUrl).href,
    }));
}
