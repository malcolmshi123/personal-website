import { createPageMetadata } from "@/lib/site-metadata";
import { articles } from "@/content/blog";

export const metadata = createPageMetadata(
    "Blog",
    "Links to my writing on Medium.",
    "/blog/",
);

export default function Blog() {
    return (
        <div className="page-content reading-page">
            <h1>Blog</h1>
            <p className="introduction">Some things I've written.</p>
            <ul className="article-list" aria-label="Articles">
                {articles.map((article) => (
                    <li key={article.href}>
                        <article>
                            <div className="entry-row-head">
                                <h2><a href={article.href}>{article.title}</a></h2>
                                <time className="entry-date" dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        timeZone: "UTC",
                                    })}
                                </time>
                            </div>
                            <p className="article-meta">Medium · {article.readingTimeMinutes} min read</p>
                            <p>{article.summary}</p>
                            <a className="article-link" href={article.href} aria-label={`Read ${article.title} on Medium`}>
                                Read on Medium <span aria-hidden="true">↗</span>
                            </a>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}
