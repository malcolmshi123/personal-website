import { createPageMetadata } from "@/lib/site-metadata";
import { albums, gear } from "@/content/photos";

export const metadata = createPageMetadata(
    "Gallery",
    "What I’ve tasted and seen.",
    "/photos",
);

export default function Gallery() {
    return (
        <div className="page-content photos-page">
            <h1>Gallery</h1>
            <p className="introduction">I put my cameras to work!</p>
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
            <section className="gear" aria-labelledby="gear-heading">
                <h2 id="gear-heading">Gear</h2>
                <ul className="gear-list">
                    {gear.map((item) => (
                        <li key={item.name}>
                            <h3>{item.name}</h3>
                            <p>{item.note}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
