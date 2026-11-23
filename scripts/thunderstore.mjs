// Build scripts run on plain Node, so this reads Thunderstore links out of projects.ts as text instead of importing TypeScript.
export function thunderstoreHrefs(projectsSource) {
    return [...projectsSource.matchAll(/thunderstoreHref:\s*"([^"]+)"/g)].map((match) => match[1]);
}

// A mod page link ends in /p/<team>/<package>; that pair is how Thunderstore names the package.
export function thunderstoreKey(href) {
    return new URL(href).pathname.split("/").filter(Boolean).slice(-2).join("/");
}

// Thunderstore's public package metrics API; the trailing slash avoids a redirect.
export function metricsUrl(key) {
    return `https://thunderstore.io/api/v1/package-metrics/${key}/`;
}

export async function loadDownloads({ hrefs, fetchJson, fallback }) {
    const downloads = {};

    for (const href of hrefs) {
        let count = null;
        try {
            const metrics = await fetchJson(metricsUrl(thunderstoreKey(href)));
            count = Number.isInteger(metrics?.downloads) ? metrics.downloads : null;
        } catch {
            count = null;
        }

        count ??= fallback[href] ?? null;
        if (count !== null) {
            downloads[href] = count;
        }
    }

    return downloads;
}
