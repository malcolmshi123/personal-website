export const feedUrl = "https://medium.com/feed/@malcolmshi123";

const wordsPerMinute = 265;

// Medium shows dates in the reader's time zone; Malcolm publishes from Toronto.
const publishTimeZone = "America/Toronto";

function decodeEntities(text) {
    return text
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&quot;/g, "\"")
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/ /g, " ");
}

function tagText(item, tag) {
    const match = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
    return match ? match[1].trim() : "";
}

function toLocalDate(pubDate) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: publishTimeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(pubDate));
    const part = (type) => parts.find((entry) => entry.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}

export function parseFeed(xml) {
    return xml.split("<item>").slice(1).map((item) => {
        const content = tagText(item, "content:encoded");
        const subtitle = content.match(/^\s*<h[34]>([\s\S]*?)<\/h[34]>/);
        const plain = decodeEntities(content.replace(/<[^>]+>/g, " ")).trim();

        return {
            title: decodeEntities(tagText(item, "title")),
            href: tagText(item, "link").split("?")[0],
            publishedAt: toLocalDate(tagText(item, "pubDate")),
            summary: subtitle ? decodeEntities(subtitle[1].replace(/<[^>]+>/g, "")).trim() : "",
            wordCount: plain ? plain.split(/\s+/).length : 0,
            imageCount: (content.match(/<img\b/g) ?? []).length,
        };
    });
}

export function readingMinutesFromArticle(html) {
    const match = html.match(/"readingTime":([0-9.]+)/);
    return match ? Math.max(1, Math.ceil(Number(match[1]))) : null;
}

export function estimateReadingMinutes(wordCount, imageCount) {
    let imageSeconds = 0;
    for (let index = 0; index < imageCount; index += 1) {
        imageSeconds += Math.max(12 - index, 3);
    }
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute + imageSeconds / 60));
}

export async function loadArticles({ fetchText, fallback }) {
    let parsed;
    try {
        parsed = parseFeed(await fetchText(feedUrl));
    } catch {
        return fallback;
    }

    if (parsed.length === 0) {
        return fallback;
    }

    const articles = await Promise.all(parsed.map(async (article) => {
        let minutes = null;
        try {
            minutes = readingMinutesFromArticle(await fetchText(article.href));
        } catch {
            minutes = null;
        }

        return {
            title: article.title,
            href: article.href,
            publishedAt: article.publishedAt,
            summary: article.summary,
            readingTimeMinutes: minutes ?? estimateReadingMinutes(article.wordCount, article.imageCount),
        };
    }));

    return articles.sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
}
