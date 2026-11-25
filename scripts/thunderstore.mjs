import { metricsUrl, thunderstoreKey } from "../src/lib/thunderstore.ts";

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
