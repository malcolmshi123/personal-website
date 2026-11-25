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

export function photoId(folder, filename) {
    const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return [folder, baseName(filename)].filter(Boolean).map(slug).join("-");
}
