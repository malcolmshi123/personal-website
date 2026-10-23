import type { Metadata } from "next";
import { experience, projects, work } from "@/content/work";

export const metadata: Metadata = {
    title: "Work",
    description: "My engineering projects and experience.",
};

export default function Work() {
    return (
        <article className="page-content reading-page">
            <h1>Work</h1>
            <p className="introduction">{work.introduction}</p>
            <a className="resume-download" href="/resume.pdf" download="Malcolm-Shi-Resume.pdf">
                Download resume (PDF)
            </a>
            <div className="prose">
                <section aria-labelledby="projects">
                    <h2 id="projects">Projects</h2>
                    <ul className="work-list">
                        {projects.map((project) => (
                            <li className="work-entry" key={project.href}>
                                <h3>{project.name}</h3>
                                <p className="work-meta">{project.date}</p>
                                <p>{project.description}</p>
                                <p className="work-meta">{project.technologies}</p>
                                <a href={project.href} aria-label={`View ${project.name} on GitHub`}>View on GitHub</a>
                            </li>
                        ))}
                    </ul>
                </section>
                <section aria-labelledby="experience">
                    <h2 id="experience">Experience</h2>
                    <ul className="work-list">
                        {experience.map((position) => (
                            <li className="work-entry" key={position.company}>
                                <h3>{position.company}</h3>
                                <p className="work-role">{position.role} · {position.team}</p>
                                <p className="work-meta">{position.dates}</p>
                                <p>{position.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>
                <section aria-labelledby="education">
                    <h2 id="education">Education</h2>
                    <div className="work-entry">
                        <h3>{work.education.school}</h3>
                        <p className="work-role">{work.education.degree}</p>
                        <p className="work-meta">{work.education.date}</p>
                        <p>{work.education.detail}</p>
                    </div>
                </section>
            </div>
        </article>
    );
}
