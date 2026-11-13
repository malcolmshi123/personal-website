type HomeLink = {
    title: string;
    description: string;
    href: string;
};

type FeaturedLink = HomeLink & {
    action: string;
};

export const homeDescription = "Computer engineering grad from Waterloo. My faith, my work, and a few things I enjoy.";

export const featuredLinks: FeaturedLink[] = [
    {
        title: "The Good News",
        description: "What I believe about Jesus and why it matters to me.",
        action: "Read the good news",
        href: "/gospel/",
    },
    {
        title: "Work",
        description: "My recent work focuses on GPU performance and LLM inference. I’ve also worked on graphics and rendering, web applications, and test automation.",
        action: "See my work",
        href: "/work/",
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
