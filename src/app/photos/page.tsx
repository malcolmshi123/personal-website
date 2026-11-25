import { createPageMetadata } from "@/lib/site-metadata";
import PhotoBoard from "@/components/photo-board";
import { galleryPhotos } from "@/content/photos";

export const metadata = createPageMetadata(
    "Gallery",
    "What I’ve tasted and seen.",
    "/photos",
);

export default function Gallery() {
    return (
        <div className="page-content photos-page">
            <h1>Gallery</h1>
            <p className="introduction">Pinterest core!</p>
            <PhotoBoard photos={galleryPhotos} />
        </div>
    );
}
