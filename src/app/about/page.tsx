import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/content/about";

export const metadata: Metadata = {
    title: "About",
    description: "A bit about me and my faith.",
};

export default function About() {
    return (
        <article className="page-content reading-page">
            <h1>About</h1>
            <p className="introduction">{about.introduction}</p>
            <div className="prose">
                <section aria-labelledby="my-faith">
                    <h2 id="my-faith">My faith</h2>
                    <p>{about.faith}</p>
                    <Link href="/gospel/">Read about the gospel</Link>
                </section>
                <section aria-labelledby="my-work">
                    <h2 id="my-work">My work</h2>
                    <p>{about.work}</p>
                    <Link href="/work/">See my work</Link>
                </section>
                <section aria-labelledby="other-interests">
                    <h2 id="other-interests">Other interests</h2>
                    <p>{about.interests}</p>
                    <div className="related-links">
                        <Link href="/blog/">Blog</Link>
                        <Link href="/photos/">Photos</Link>
                    </div>
                </section>
            </div>
        </article>
    );
}
