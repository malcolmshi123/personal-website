type BlogArticle = {
    title: string;
    summary: string;
    publishedAt: string;
    readingTimeMinutes: number;
    href: string;
};

export const articles: BlogArticle[] = [
    {
        title: "my testimony!",
        summary: "the extended version.",
        publishedAt: "2024-11-26",
        readingTimeMinutes: 7,
        href: "https://medium.com/@malcolmshi123/my-testimony-2b6bc05feb73",
    },
];
