import type { Metadata } from "next";
import PageShell from "@/components/page-shell";

export const metadata: Metadata = {
    title: "About",
    description: "A bit about me and my faith.",
};

export default function About() {
    return <PageShell title="About" introduction="A bit about me, my faith, and the things I enjoy." />;
}
