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
    { href: "/photos/", label: "Gallery" },
    { href: "/contact/", label: "Contact" },
];

export const footerVerse: Verse = {
    text: "Oh, taste and see that the LORD is good!",
    reference: "Psalm 34:8",
};
