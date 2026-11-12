type HomeLink = {
    title: string;
    description: string;
    href: string;
};

type FeaturedLink = HomeLink & {
    detail: string;
    action: string;
    tone: "clay" | "moss";
};

export const featuredLinks: FeaturedLink[] = [
    {
        title: "The Good News",
        description: "What I believe about Jesus and why it matters to me.",
        detail: "About 5 minutes",
        action: "Read the good news",
        href: "/gospel/",
        tone: "clay",
    },
    {
        title: "Work",
        description: "My recent work focuses on GPU performance and LLM inference. I’ve also worked on graphics and rendering, web applications, and test automation.",
        detail: "Latest: LLM Inference Optimization Lab",
        action: "See my work",
        href: "/work/",
        tone: "moss",
    },
];

export const homeLinks: HomeLink[] = [
    {
        title: "About",
        description: "A bit about me and the things I care about.",
        href: "/about/",
    },
    {
        title: "Blog",
        description: "Things I’ve written.",
        href: "/blog/",
    },
    {
        title: "Photos",
        description: "People, places, and moments.",
        href: "/photos/",
    },
    {
        title: "Contact",
        description: "A few ways to get in touch.",
        href: "/contact/",
    },
];
