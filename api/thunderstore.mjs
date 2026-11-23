// A Vercel Function, because Thunderstore's API doesn't allow browsers on other sites to call it
// and it redirects requests that Vercel rewrites on this site's behalf.
// It's .mjs because Vercel loads compiled .ts here as CommonJS, which can't run ES module syntax.

const packageName = /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/;

function fetchFromThunderstore(url) {
    return fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; malcolmshi.ca)" },
        signal: AbortSignal.timeout(5000),
    });
}

export async function handleThunderstoreRequest(request, fetchMetrics = fetchFromThunderstore) {
    const key = new URL(request.url).searchParams.get("package") ?? "";
    if (!packageName.test(key)) {
        return Response.json({ error: "Expected ?package=team/name" }, { status: 400 });
    }
    try {
        const upstream = await fetchMetrics(`https://thunderstore.io/api/v1/package-metrics/${key}/`);
        const downloads = upstream.ok ? (await upstream.json()).downloads : undefined;
        if (!Number.isInteger(downloads)) {
            return Response.json({ error: "Thunderstore had no count" }, { status: 502 });
        }
        // Vercel's cache answers repeat visits for five minutes, so Thunderstore sees few requests.
        return Response.json({ downloads }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" } });
    } catch {
        return Response.json({ error: "Thunderstore could not be reached" }, { status: 502 });
    }
}

export function GET(request) {
    return handleThunderstoreRequest(request);
}
