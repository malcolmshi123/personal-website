import type { Metadata } from "next";
import PageShell from "@/components/page-shell";

export const metadata: Metadata = {
    title: "Blog",
    description: "Links to my writing on Medium.",
};

export default function Blog() {
    return <PageShell title="Blog" introduction="I’ll collect links to my writing on Medium here." />;
}
