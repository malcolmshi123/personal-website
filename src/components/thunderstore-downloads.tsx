"use client";

import { useEffect, useState } from "react";
import { downloadsLabel } from "@/content/projects";
import { liveDownloadsPath, newerDownloads } from "@/lib/thunderstore";

type ThunderstoreDownloadsProps = { thunderstoreHref: string; buildCount: number };

export default function ThunderstoreDownloads({ thunderstoreHref, buildCount }: ThunderstoreDownloadsProps) {
    const [count, setCount] = useState(buildCount);

    useEffect(() => {
        const controller = new AbortController();
        fetch(liveDownloadsPath(thunderstoreHref), { signal: controller.signal })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => setCount((current) => newerDownloads(current, data)))
            // The build count stays when Thunderstore can't be reached, including in local dev.
            .catch(() => undefined);
        return () => controller.abort();
    }, [thunderstoreHref]);

    return (
        <a className="project-downloads" href={thunderstoreHref} aria-label={`${downloadsLabel(count)} on Thunderstore`}>
            {downloadsLabel(count)}
        </a>
    );
}
