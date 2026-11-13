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
        href: "/gospel/",
    },
    {
        title: "Work",
        description: "GPU performance and LLM inference, plus earlier work in graphics, web apps, and testing.",
        action: "See my work",
        href: "/work/",
    },
];
