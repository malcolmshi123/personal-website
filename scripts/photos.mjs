import path from "node:path";

const photoExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);

function baseName(filename) {
    return path.parse(filename).name.replace(/^!+/, "");
}

export function readsAsPhoto(filename) {
    return photoExtensions.has(path.extname(filename).toLowerCase());
}

// Dashes become spaces, and a typed apostrophe becomes the curly one the rest of the site uses.
export function captionFromFilename(filename) {
    return baseName(filename).replace(/-+/g, " ").replace(/'/g, "’").trim();
}

// Groups the source files whose names reduce to the same id, since they'd overwrite each other's web copies.
export function duplicatePhotoIds(entries) {
    const sourcesById = new Map();
    for (const { id, source } of entries) {
        sourcesById.set(id, [...(sourcesById.get(id) ?? []), source]);
    }
    return [...sourcesById.values()].filter((sources) => sources.length > 1);
}

export function photoId(folder, filename) {
    const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return [folder, baseName(filename)].filter(Boolean).map(slug).join("-");
}
