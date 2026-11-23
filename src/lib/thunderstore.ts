// Served by api/thunderstore.mjs, since browsers can't call Thunderstore's API from this site.
export function liveDownloadsPath(thunderstoreHref: string): string {
    const [team, name] = new URL(thunderstoreHref).pathname.split("/").filter(Boolean).slice(-2);
    return `/api/thunderstore?package=${team}/${name}`;
}

export function newerDownloads(current: number, response: unknown): number {
    const downloads = (response as { downloads?: unknown } | null)?.downloads;
    return Number.isInteger(downloads) && (downloads as number) > current ? (downloads as number) : current;
}
