import { createPageMetadata } from "@/lib/site-metadata";
import { albums } from "@/content/photos";

export const metadata = createPageMetadata(
    "Gallery",
    "Some photos I’ve taken.",
    "/photos/",
);

export default function Gallery() {
    return (
        <div className="page-content photos-page">
            <h1>Gallery</h1>
            <p className="introduction">Some photos I've taken.</p>
            <ul className="album-grid" aria-label="Photo albums">
                {albums.map((album) => (
                    <li key={album.id}>
                        <figure className="album">
                            <div className="soft-photo album-photo">
                                <span>photos coming soon</span>
                            </div>
                            <figcaption>
                                <h2>{album.title}</h2>
                                {album.description && <p>{album.description}</p>}
                            </figcaption>
                        </figure>
                    </li>
                ))}
            </ul>
        </div>
    );
}
