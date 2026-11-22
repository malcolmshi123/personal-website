import { createPageMetadata } from "@/lib/site-metadata";
import { articles } from "@/content/blog";
import { mediumImageSet } from "@/lib/medium-image";

export const metadata = createPageMetadata(
    "Blog",
    "Links to my writing on Medium.",
    "/blog",
);

export default function Blog() {
    return (
        <div className="page-content reading-page">
            <h1>Blog</h1>
            <p className="introduction">What I've written.</p>
            <ul className="article-list" aria-label="Articles">
                {articles.map((article) => (
                    <li key={article.href}>
                        <article className={article.image ? "article-with-image" : undefined}>
                            {article.image && (
                                <img
                                    className="article-image"
                                    {...mediumImageSet(article.image)}
                                    sizes="(max-width: 600px) 100vw, 220px"
                                    alt=""
                                    width={1024}
                                    height={683}
                                    loading="lazy"
                                    decoding="async"
                                />
                            )}
                            <div className="entry-row-head">
                                <h2><a href={article.href}>{article.title}</a></h2>
                                <time className="entry-date" dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        timeZone: "UTC",
                                    })}
                                </time>
                            </div>
                            <p className="article-meta">
                                {article.summary ? `${article.summary} · ${article.readingTimeMinutes} min` : `${article.readingTimeMinutes} min`}
                            </p>
                            <a className="article-link" href={article.href} aria-label={`Read ${article.title}`}>
                                Read <span aria-hidden="true">↗</span>
                            </a>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}
