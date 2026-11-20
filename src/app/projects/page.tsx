import { createPageMetadata } from "@/lib/site-metadata";
import { projects, projectsIntroduction } from "@/content/projects";

export const metadata = createPageMetadata(
    "Projects",
    "Things I’ve built: LLM inference benchmarks, a Teamfight Tactics review app, a Lethal Company mod, and this site.",
    "/projects/",
);

export default function Projects() {
    return (
        <article className="page-content reading-page">
            <h1>Projects</h1>
            <p className="introduction">{projectsIntroduction}</p>
            <div className="prose">
                <ul className="work-list project-list">
                    {projects.map((project) => (
                        <li className="work-entry" key={project.href}>
                            <h2 className="project-name">
                                {project.name}
                                {project.status && <span className="project-status">{project.status}</span>}
                            </h2>
                            <p>{project.description}</p>
                            <p className="work-meta">{project.technologies}</p>
                            <a href={project.href} aria-label={`View ${project.name} on GitHub`}>View on GitHub</a>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}
