// Shared by the Projects page and scripts/fetch-thunderstore.mjs, which loads this file directly with Node.

// A mod page link ends in /p/<team>/<package>; that pair is how Thunderstore names the package.
export function thunderstoreKey(href: string): string {
    return new URL(href).pathname.split("/").filter(Boolean).slice(-2).join("/");
}

// Thunderstore's public package metrics API; the trailing slash avoids a redirect.
export function metricsUrl(key: string): string {
    return `https://thunderstore.io/api/v1/package-metrics/${key}/`;
}

// Served by api/thunderstore.mjs, since browsers can't call Thunderstore's API from this site.
export function liveDownloadsPath(thunderstoreHref: string): string {
    return `/api/thunderstore?package=${thunderstoreKey(thunderstoreHref)}`;
}

export function newerDownloads(current: number, response: unknown): number {
    const downloads = (response as { downloads?: unknown } | null)?.downloads;
    return Number.isInteger(downloads) && (downloads as number) > current ? (downloads as number) : current;
}
