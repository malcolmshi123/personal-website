import { createPageMetadata } from "@/lib/site-metadata";
import LinkIcon from "@/components/link-icon";
import ThemeToggle from "@/components/theme-toggle";
import { projects, projectsDescription, projectsIntroduction } from "@/content/projects";

export const metadata = createPageMetadata(
    "Projects",
    projectsDescription(projects),
    "/projects/",
);

type ProjectImageProps = { className: string; src: string; alt: string; loading: "lazy" | "eager" };

function ProjectImage({ className, src, alt, loading }: ProjectImageProps) {
    return <img className={className} src={src} alt={alt} width={1280} height={720} loading={loading} decoding="async" />;
}

export default function Projects() {
    return (
        <article className="page-content reading-page">
            <h1>Projects</h1>
            <p className="introduction">{projectsIntroduction}</p>
            <div className="prose">
                <ul className="work-list project-list">
                    {projects.map((project) => (
                        <li className="work-entry" key={project.href}>
                            <div className="project-heading">
                                <h2 className="project-name">
                                    {project.name}
                                    {project.status && <span className="project-status">{project.status}</span>}
                                </h2>
                                {/* Lets visitors flip the theme right here and watch the screenshot change. */}
                                {project.image.srcInLightTheme && <ThemeToggle hint={false} />}
                            </div>
                            {project.image.srcInLightTheme && (
                                <ProjectImage
                                    className="project-image shows-in-light-theme"
                                    src={project.image.srcInLightTheme}
                                    alt={project.image.alt}
                                    loading="eager"
                                />
                            )}
                            {/* A themed pair loads up front so switching themes never shows an empty frame. */}
                            <ProjectImage
                                className={project.image.srcInLightTheme ? "project-image shows-in-dark-theme" : "project-image"}
                                src={project.image.src}
                                alt={project.image.alt}
                                loading={project.image.srcInLightTheme ? "eager" : "lazy"}
                            />
                            <p>{project.description}</p>
                            <p className="work-meta">{project.technologies}</p>
                            <div className="project-links">
                                {project.thunderstoreHref && (
                                    <a href={project.thunderstoreHref} aria-label={`${project.name} on Thunderstore`}>
                                        <LinkIcon name="thunderstore" />
                                        Thunderstore
                                    </a>
                                )}
                                <a href={project.href} aria-label={`${project.name} on GitHub`}>
                                    <LinkIcon name="github" />
                                    GitHub
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}
