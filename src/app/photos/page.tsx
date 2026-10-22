import type { Metadata } from "next";
import PageShell from "@/components/page-shell";

export const metadata: Metadata = {
    title: "Photos",
    description: "Photos from trips, meals, and everyday life.",
};

export default function Photos() {
    return <PageShell title="Photos" introduction="Photos from trips, meals, and everyday life. I’ll organize them into albums here." />;
}
