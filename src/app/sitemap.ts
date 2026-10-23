import type { MetadataRoute } from "next";
import { homeLinks } from "@/content/home";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    return ["/", ...homeLinks.map((link) => link.href)].map((path) => ({
        url: new URL(path, siteUrl).href,
    }));
}
