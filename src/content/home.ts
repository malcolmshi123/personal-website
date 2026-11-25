import { projectsIntroduction } from "@/content/projects";
import { work } from "@/content/work";

type HomeLink = {
    title: string;
    description: string;
    href: string;
};

type FeaturedLink = HomeLink & {
    action: string;
    actionContext?: string;
};

export const featuredLinks: FeaturedLink[] = [
    {
        title: "The Good News",
        description: "What I believe about Jesus and why it matters to me.",
        action: "Read more",
        actionContext: " about the good news",
        href: "/gospel",
    },
    {
        title: "Experience",
        description: work.introduction,
        action: "See more",
        actionContext: " of my experience",
        href: "/work",
    },
    {
        title: "Projects",
        description: projectsIntroduction,
        action: "Check them out",
        actionContext: " of my projects",
        href: "/projects",
    },
];
