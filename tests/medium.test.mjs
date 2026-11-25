import assert from "node:assert/strict";
import test from "node:test";
import { estimateReadingMinutes, loadArticles, parseFeed, readingMinutesFromArticle } from "../scripts/medium.mjs";
import { mediumImageSet } from "../src/lib/medium-image.ts";

const feed = `<?xml version="1.0" encoding="UTF-8"?><rss><channel>
<item><title><![CDATA[Running Thoughts]]></title><link>https://medium.com/@malcolmshi123/running-thoughts-01769b844cdf?source=rss-b1fd0797ae9f------2</link><pubDate>Thu, 19 Nov 2026 04:12:55 GMT</pubDate><content:encoded><![CDATA[<h4>A Short Devo</h4><figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/1*a.jpeg" /></figure><p>one two three &amp; four</p><img src="https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=01769b844cdf" width="1" height="1" alt="">]]></content:encoded></item>
<item><title><![CDATA[my testimony]]></title><link>https://medium.com/@malcolmshi123/my-testimony-2b6bc05feb73?source=rss</link><pubDate>Tue, 26 Nov 2024 20:10:04 GMT</pubDate><content:encoded><![CDATA[<h4>the extended version</h4><p>words here</p>]]></content:encoded></item>
</channel></rss>`;

test("parseFeed reads titles, links, dates, subtitles, and word counts", () => {
    const articles = parseFeed(feed);

    assert.equal(articles.length, 2);
    assert.deepEqual(articles[0], {
        title: "Running Thoughts",
        href: "https://medium.com/@malcolmshi123/running-thoughts-01769b844cdf",
        publishedAt: "2026-11-18",
        summary: "A Short Devo",
        wordCount: 8,
        imageCount: 1,
        image: "https://cdn-images-1.medium.com/max/1024/1*a.jpeg",
    });
    assert.equal(articles[1].title, "my testimony");
    assert.equal(articles[1].summary, "the extended version");
    assert.equal(articles[1].image, "");
});

test("loadArticles keeps each article's preview image", async () => {
    const articles = await loadArticles({
        fetchText: async (url) => (url.endsWith("@malcolmshi123") ? feed : '"readingTime":2'),
        fallback: [],
    });

    assert.deepEqual(articles.map((article) => article.image), ["https://cdn-images-1.medium.com/max/1024/1*a.jpeg", ""]);
});

test("parseFeed turns Medium's non-breaking spaces into normal spaces", () => {
    const [article] = parseFeed(`<item><title><![CDATA[My Post]]></title><link>https://medium.com/x</link><pubDate>Tue, 26 Nov 2024 20:10:04 GMT</pubDate><content:encoded><![CDATA[<h4>the extended version</h4><p>a&nbsp;b</p>]]></content:encoded></item>`);

    assert.equal(article.title, "My Post");
    assert.equal(article.summary, "the extended version");
    assert.equal(article.wordCount, 5);
});

test("readingMinutesFromArticle rounds Medium's own read time up", () => {
    assert.equal(readingMinutesFromArticle('..."readingTime":5.573584905660377,...'), 6);
    assert.equal(readingMinutesFromArticle("<p>no data</p>"), null);
});

test("estimateReadingMinutes follows Medium's word and image timing", () => {
    assert.equal(estimateReadingMinutes(1094, 0), 5);
    assert.equal(estimateReadingMinutes(1060, 2), 5);
    assert.equal(estimateReadingMinutes(10, 0), 1);
});

test("loadArticles uses Medium's read time, newest first", async () => {
    const pages = {
        "https://medium.com/feed/@malcolmshi123": feed,
        "https://medium.com/@malcolmshi123/running-thoughts-01769b844cdf": '"readingTime":4.33',
        "https://medium.com/@malcolmshi123/my-testimony-2b6bc05feb73": '"readingTime":5.57',
    };
    const articles = await loadArticles({ fetchText: async (url) => pages[url], fallback: [] });

    assert.deepEqual(articles.map((article) => [article.title, article.readingTimeMinutes]), [["Running Thoughts", 5], ["my testimony", 6]]);
});

test("loadArticles estimates the read time when an article page fails", async () => {
    const articles = await loadArticles({
        fetchText: async (url) => {
            if (url.endsWith("@malcolmshi123")) {
                return feed;
            }
            throw new Error("blocked");
        },
        fallback: [],
    });

    assert.equal(articles[0].readingTimeMinutes, 1);
});

test("loadArticles falls back to the saved list when the feed fails", async () => {
    const fallback = [{ title: "saved", href: "https://medium.com/x", publishedAt: "2024-01-01", summary: "", readingTimeMinutes: 3 }];
    const articles = await loadArticles({
        fetchText: async () => {
            throw new Error("offline");
        },
        fallback,
    });

    assert.deepEqual(articles, fallback);
});

test("mediumImageSet asks Medium for thumbnails near their display size", () => {
    assert.deepEqual(mediumImageSet("https://cdn-images-1.medium.com/max/1024/1*hQIx25wo_LdDxfxABl1I3w.jpeg"), {
        src: "https://miro.medium.com/v2/resize:fit:440/1*hQIx25wo_LdDxfxABl1I3w.jpeg",
        srcSet: "https://miro.medium.com/v2/resize:fit:440/1*hQIx25wo_LdDxfxABl1I3w.jpeg 440w, https://miro.medium.com/v2/resize:fit:880/1*hQIx25wo_LdDxfxABl1I3w.jpeg 880w",
    });
});

test("mediumImageSet also accepts Medium's newer image links", () => {
    assert.equal(mediumImageSet("https://miro.medium.com/v2/resize:fit:1024/1*abc.png").src, "https://miro.medium.com/v2/resize:fit:440/1*abc.png");
});
