import generated from "./blog-feed.generated.json";

type BlogArticle = {
    title: string;
    summary: string;
    publishedAt: string;
    readingTimeMinutes: number;
    href: string;
};

// Written at build time from the Medium feed by scripts/fetch-medium.mjs.
export const articles: BlogArticle[] = generated;
