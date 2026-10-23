import type { Metadata } from "next";
import { articles } from "@/content/blog";

export const metadata: Metadata = {
    title: "Blog",
    description: "Links to my writing on Medium.",
};

export default function Blog() {
    return (
        <div className="page-content reading-page">
            <h1>Blog</h1>
            <p className="introduction">Some things I've written.</p>
            <ul className="article-list" aria-label="Articles">
                {articles.map((article) => (
                    <li key={article.href}>
                        <article>
                            <div className="article-meta">
                                <time dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        timeZone: "UTC",
                                    })}
                                </time>
                                <span>{article.readingTimeMinutes} min read</span>
                            </div>
                            <h2><a href={article.href}>{article.title}</a></h2>
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
