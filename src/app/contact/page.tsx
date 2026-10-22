import type { Metadata } from "next";
import PageShell from "@/components/page-shell";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with Malcolm Shi.",
};

export default function Contact() {
    return <PageShell title="Contact" introduction="Want to get in touch? I’ll add a contact form and links to my profiles here." />;
}
