import { createPageMetadata } from "@/lib/site-metadata";
import { gospelIntroduction, gospelSections } from "@/content/gospel";

export const metadata = createPageMetadata(
    "The Gospel",
    "The good news of God’s kingdom, what Jesus has done, and how He calls us to live.",
    "/gospel/",
);

export default function Gospel() {
    const words = [
        gospelIntroduction,
        ...gospelSections.flatMap(({ paragraphs, quote, afterQuote }) => [
            ...paragraphs,
            quote?.text ?? "",
            ...(afterQuote ?? []),
        ]),
    ].join(" ").split(/\s+/).length;
    const readingMinutes = Math.ceil(words / 225);

    return (
        <article className="page-content reading-page">
            <h1>The Gospel</h1>
            <p className="reading-time">About {readingMinutes} minutes</p>
            <p className="introduction">{gospelIntroduction}</p>
            <div className="prose">
                {gospelSections.map(({ id, heading, paragraphs, quote, afterQuote, references }) => (
                    <section key={id} aria-labelledby={id}>
                        <h2 id={id}>{heading}</h2>
                        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        {quote && (
                            <figure className="gospel-quote">
                                <blockquote cite={quote.href}>
                                    <p>“{quote.text}”</p>
                                </blockquote>
                                <figcaption>
                                    {quote.author}, <cite><a href={quote.href}>{quote.source}</a></cite>
                                </figcaption>
                            </figure>
                        )}
                        {afterQuote?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        {references.length > 0 && (
                            <ul className="scripture-links" aria-label={`Bible passages for ${heading.toLowerCase()}`}>
                                {references.map(({ label, href }) => (
                                    <li key={href}><a href={href}>{label}</a></li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </article>
    );
}
