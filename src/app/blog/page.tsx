import { createPageMetadata } from "@/lib/site-metadata";
import { articles } from "@/content/blog";
import { mediumImageSet } from "@/lib/medium-image";
import { newTabProps } from "@/lib/links";

export const metadata = createPageMetadata(
    "Blog",
    "Links to my writing on Medium.",
    "/blog",
);

export default function Blog() {
    return (
        <div className="page-content reading-page fit-screen">
            <h1>Blog</h1>
            <p className="introduction">I post on Medium!</p>
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
                                    decoding="async"
                                />
                            )}
                            {/* The title is the post's only link; CSS stretches it over the whole post. */}
                            <div className="entry-row-head">
                                <h2><a href={article.href} {...newTabProps(article.href)}>{article.title}</a></h2>
                            </div>
                            <p className="article-meta">
                                {article.summary ? `${article.summary} · ` : ""}
                                {article.readingTimeMinutes} min
                            </p>
                            <p className="article-date">
                                <time dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        timeZone: "UTC",
                                    })}
                                </time>
                            </p>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}
