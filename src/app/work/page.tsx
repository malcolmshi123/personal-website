import { createPageMetadata } from "@/lib/site-metadata";
import LinkIcon from "@/components/link-icon";
import { experience, work } from "@/content/work";

export const metadata = createPageMetadata(
    "Experience",
    "My engineering experience and education.",
    "/work/",
);

export default function Experience() {
    return (
        <article className="page-content reading-page">
            <h1>Experience</h1>
            <p className="introduction">{work.introduction}</p>
            <a className="resume-download" href="/resume.pdf">
                <LinkIcon name="resume" />
                View resume (PDF)
            </a>
            <div className="prose">
                <ul className="work-list">
                    {experience.map((position) => (
                        <li className="work-entry" key={position.company}>
                            <div className="entry-row-head">
                                <h2>{position.company}</h2>
                                <p className="entry-date">{position.dates}</p>
                            </div>
                            <div className="entry-row-sub">
                                <p className="work-role">{position.role}</p>
                                <p className="entry-location">{position.location}</p>
                            </div>
                            <p>{position.description}</p>
                            <p className="work-meta">{position.skills}</p>
                        </li>
                    ))}
                </ul>
                <section aria-labelledby="education">
                    <h2 id="education">Education</h2>
                    <div className="work-entry">
                        <div className="entry-row-head">
                            <h3>{work.education.school}</h3>
                            <p className="entry-date">{work.education.date}</p>
                        </div>
                        <div className="entry-row-sub">
                            <p className="work-role">{work.education.degree}</p>
                            <p className="entry-location">{work.education.location}</p>
                        </div>
                        <p>{work.education.detail}</p>
                    </div>
                </section>
            </div>
        </article>
    );
}
