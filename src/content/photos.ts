import processedPhotos from "./gallery.json";

// Written by `npm run photos` from photo-inbox/; the folder only decides which homepage card a photo can appear on.
export type GalleryPhoto = {
    id: string;
    caption: string;
    folder: string;
    width: number;
    height: number;
    color: string;
};

export const galleryPhotos: GalleryPhoto[] = processedPhotos;

export const tastedPhotos = galleryPhotos.filter((photo) => photo.folder === "food");
export const seenPhotos = galleryPhotos.filter((photo) => photo.folder === "places");

export function photoSource(photo: GalleryPhoto, width: 640 | 1280): string {
    return `/photos/board/${photo.id}-${width}.webp`;
}

export function photoSourceSet(photo: GalleryPhoto): string {
    return `${photoSource(photo, 640)} 640w, ${photoSource(photo, 1280)} 1280w`;
}

export function shuffled<T>(list: readonly T[]): T[] {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
}
