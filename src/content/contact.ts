import type { LinkIconName } from "@/components/link-icon";

type ContactLink = {
    label: string;
    iconLabel: string;
    href: string;
    icon: LinkIconName;
    download?: string;
};

export const resumeDownloadName = "Malcolm-Shi-Resume.pdf";

export const contactLinks: ContactLink[] = [
    {
        label: "LinkedIn",
        iconLabel: "LinkedIn",
        href: "https://linkedin.com/in/malcolm-shi",
        icon: "linkedin",
    },
    {
        label: "GitHub",
        iconLabel: "GitHub",
        href: "https://github.com/malcolmshi123",
        icon: "github",
    },
    {
        label: "Resume",
        iconLabel: "Resume (PDF)",
        href: "/resume.pdf",
        icon: "resume",
        download: resumeDownloadName,
    },
];
