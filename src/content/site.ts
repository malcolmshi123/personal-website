type NavigationLink = {
    href: string;
    label: string;
};

type Verse = {
    text: string;
    reference: string;
};

export const siteNavigation: NavigationLink[] = [
    { href: "/gospel/", label: "The Good News" },
    { href: "/work/", label: "Work" },
    { href: "/blog/", label: "Blog" },
    { href: "/photos/", label: "Photos" },
    { href: "/contact/", label: "Contact" },
];

export const footerVerse: Verse = {
    text: "Do everything in love.",
    reference: "1 Corinthians 16:14",
};
