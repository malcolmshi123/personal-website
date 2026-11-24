import Link from "next/link";
import { createPageMetadata } from "@/lib/site-metadata";
import LinkIcon from "@/components/link-icon";
import ThemeToggle from "@/components/theme-toggle";
import ThunderstoreDownloads from "@/components/thunderstore-downloads";
import { projects, projectsDescription, projectsIntroduction } from "@/content/projects";
import downloads from "@/content/thunderstore.generated.json";
import { newTabProps } from "@/lib/links";

// Written at build time by scripts/fetch-thunderstore.mjs; the page then checks for a newer count live.
const thunderstoreDownloads: Record<string, number> = downloads;

export const metadata = createPageMetadata(
    "Projects",
    projectsDescription(projects),
    "/projects",
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
                                    {project.titleHref ? <Link className="project-name-link" href={project.titleHref}>{project.name}</Link> : project.name}
                                    {project.status && <span className="project-status">{project.status}</span>}
                                    {project.thunderstoreHref && thunderstoreDownloads[project.thunderstoreHref] !== undefined && (
                                        <ThunderstoreDownloads
                                            thunderstoreHref={project.thunderstoreHref}
                                            buildCount={thunderstoreDownloads[project.thunderstoreHref]}
                                        />
                                    )}
                                </h2>
                                {/* Lets visitors flip the theme right here and watch the screenshot change. */}
                                {project.image.srcInLightTheme && <ThemeToggle hint />}
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
                                <a href={project.href} {...newTabProps(project.href)} aria-label={`${project.name} on GitHub`}>
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
