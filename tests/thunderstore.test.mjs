import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadDownloads, metricsUrl, thunderstoreHrefs, thunderstoreKey } from "../scripts/thunderstore.mjs";
import { downloadsLabel } from "../src/content/projects.ts";
import { liveDownloadsPath, newerDownloads } from "../src/lib/thunderstore.ts";
import { handleThunderstoreRequest } from "../api/thunderstore.mjs";

const gojo = "https://thunderstore.io/c/lethal-company/p/FreakyFriday/GojoBracken";

test("thunderstoreHrefs finds every Thunderstore link in the project list", async () => {
    const source = await readFile(new URL("../src/content/projects.ts", import.meta.url), "utf8");

    assert.deepEqual(thunderstoreHrefs(source), [gojo]);
});

test("thunderstoreKey reads the team and package name from a mod page link", () => {
    assert.equal(thunderstoreKey(gojo), "FreakyFriday/GojoBracken");
});

test("metricsUrl points at Thunderstore's package metrics API", () => {
    assert.equal(metricsUrl("FreakyFriday/GojoBracken"), "https://thunderstore.io/api/v1/package-metrics/FreakyFriday/GojoBracken/");
});

test("downloadsLabel groups thousands and handles one download", () => {
    assert.equal(downloadsLabel(1282), "1,282 downloads");
    assert.equal(downloadsLabel(1), "1 download");
});

test("loadDownloads keeps each package's count from the API", async () => {
    const downloads = await loadDownloads({
        hrefs: [gojo],
        fetchJson: async (url) => {
            assert.equal(url, metricsUrl("FreakyFriday/GojoBracken"));
            return { downloads: 1500, rating_score: 0, latest_version: "0.3.3" };
        },
        fallback: { [gojo]: 1282 },
    });

    assert.deepEqual(downloads, { [gojo]: 1500 });
});

test("loadDownloads uses the saved count when the API fails or answers oddly", async () => {
    const fallback = { [gojo]: 1282 };
    const failing = await loadDownloads({ hrefs: [gojo], fetchJson: async () => { throw new Error("offline"); }, fallback });
    const odd = await loadDownloads({ hrefs: [gojo], fetchJson: async () => ({ downloads: "lots" }), fallback });

    assert.deepEqual(failing, fallback);
    assert.deepEqual(odd, fallback);
});

test("loadDownloads leaves out a package with no count anywhere", async () => {
    const downloads = await loadDownloads({ hrefs: [gojo], fetchJson: async () => { throw new Error("offline"); }, fallback: {} });

    assert.deepEqual(downloads, {});
});

test("liveDownloadsPath points at this site's Thunderstore function", () => {
    assert.equal(liveDownloadsPath(gojo), "/api/thunderstore?package=FreakyFriday/GojoBracken");
});

test("newerDownloads only replaces the build count with a higher whole number", () => {
    assert.equal(newerDownloads(1282, { downloads: 1300 }), 1300);
    assert.equal(newerDownloads(1282, { downloads: 1200 }), 1282);
    assert.equal(newerDownloads(1282, { downloads: "lots" }), 1282);
    assert.equal(newerDownloads(1282, null), 1282);
});

test("the Thunderstore function returns a package's downloads and lets Vercel cache them", async () => {
    const response = await handleThunderstoreRequest(
        new Request("https://malcolmshi.ca/api/thunderstore?package=FreakyFriday/GojoBracken"),
        async (url) => {
            assert.equal(url, metricsUrl("FreakyFriday/GojoBracken"));
            return Response.json({ downloads: 1300, rating_score: 0, latest_version: "0.3.3" });
        },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { downloads: 1300 });
    assert.match(response.headers.get("cache-control"), /s-maxage=300/);
});

test("the Thunderstore function refuses anything that isn't a team/package name", async () => {
    let fetched = false;
    const fetchMetrics = async () => {
        fetched = true;
        return Response.json({ downloads: 1 });
    };
    for (const name of ["", "FreakyFriday", "../../admin/x", "a/b/c", "a?b/c"]) {
        const response = await handleThunderstoreRequest(new Request(`https://malcolmshi.ca/api/thunderstore?package=${encodeURIComponent(name)}`), fetchMetrics);
        assert.equal(response.status, 400, name);
    }
    assert.equal(fetched, false);
});

test("the Thunderstore function reports a bad gateway when Thunderstore fails or answers oddly", async () => {
    const request = () => new Request("https://malcolmshi.ca/api/thunderstore?package=FreakyFriday/GojoBracken");
    const down = await handleThunderstoreRequest(request(), async () => new Response("nope", { status: 503 }));
    const odd = await handleThunderstoreRequest(request(), async () => Response.json({ downloads: "lots" }));
    const offline = await handleThunderstoreRequest(request(), async () => { throw new Error("offline"); });

    assert.deepEqual([down.status, odd.status, offline.status], [502, 502, 502]);
});
