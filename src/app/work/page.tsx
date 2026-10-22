import type { Metadata } from "next";
import PageShell from "@/components/page-shell";

export const metadata: Metadata = {
    title: "Work",
    description: "My engineering projects and experience.",
};

export default function Work() {
    return <PageShell title="Work" introduction="Some of the engineering projects I’ve worked on and what I learned along the way." />;
}
