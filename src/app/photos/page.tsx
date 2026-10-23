import { createPageMetadata } from "@/lib/site-metadata";
import { albums } from "@/content/photos";

export const metadata = createPageMetadata(
    "Photos",
    "Photos from my church, fellowship, and grad trip to Japan and Korea.",
    "/photos/",
);

export default function Photos() {
    return (
        <div className="page-content photos-page">
            <h1>Photos</h1>
            <p className="introduction">Some of my most cherished memories.</p>
            <ul className="album-grid" aria-label="Photo albums">
                {albums.map((album) => (
                    <li key={album.id}>
                        <figure className="album">
                            <div className="album-placeholder">
                                <span>Photos coming soon</span>
                            </div>
                            <figcaption>
                                <h2>{album.title}</h2>
                                <p>{album.description}</p>
                            </figcaption>
                        </figure>
                    </li>
                ))}
            </ul>
        </div>
    );
}
