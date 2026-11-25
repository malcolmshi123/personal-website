"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { photoSource, photoSourceSet, shuffled, type GalleryPhoto } from "@/content/photos";

const rowsPerBatch = 6;
const boardSizes = "(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 320px";

function columnsForWidth(width: number): number {
    if (width <= 760) {
        return 2;
    }
    return width <= 1100 ? 3 : 4;
}

// Each photo drops into the shortest column so far, so the board fills left to right like a pinboard.
// The placement only depends on earlier photos, so showing more never moves photos already on screen.
function placeInColumns(photos: GalleryPhoto[], count: number): GalleryPhoto[][] {
    const columns = Array.from({ length: count }, () => ({ photos: [] as GalleryPhoto[], height: 0 }));
    for (const photo of photos) {
        const shortest = columns.reduce((low, column) => (column.height < low.height ? column : low));
        shortest.photos.push(photo);
        shortest.height += photo.height / photo.width;
    }
    return columns.map((column) => column.photos);
}

// While more photos wait, cut every column at the shortest one so the board fades out along one line.
// Photos left entirely below the cut can't be reached until Show more brings them into view.
function trimToShortestColumn(board: HTMLDivElement, hasMore: boolean) {
    const columns = [...board.querySelectorAll<HTMLDivElement>(".photo-board-column")];
    board.style.height = "";
    const cut = hasMore && columns.length > 0 ? Math.min(...columns.map((column) => column.offsetHeight)) : Infinity;
    if (Number.isFinite(cut)) {
        board.style.height = `${cut}px`;
    }
    for (const pin of board.querySelectorAll<HTMLButtonElement>(".photo-pin")) {
        pin.inert = pin.offsetTop >= cut - 1;
    }
}

// The board's already-loaded 640px copy fills the frame at once; the 1280px photo fades and sharpens in over it once loaded.
// A photo that's already cached shows immediately instead, since the layout effect runs before the first paint.
function ViewerPhoto({ photo }: { photo: GalleryPhoto }) {
    const [loaded, setLoaded] = useState(false);
    const image = useRef<HTMLImageElement>(null);

    useLayoutEffect(() => {
        if (image.current?.complete) {
            setLoaded(true);
        }
    }, []);

    return (
        <span
            className="photo-viewer-frame"
            style={{
                backgroundColor: photo.color,
                backgroundImage: `url(${photoSource(photo, 640)})`,
                ["--photo-ratio" as string]: `${photo.width / photo.height}`,
            }}
        >
            <img
                ref={image}
                src={photoSource(photo, 1280)}
                alt={photo.caption}
                width={photo.width}
                height={photo.height}
                data-loaded={loaded || undefined}
                onLoad={() => setLoaded(true)}
            />
        </span>
    );
}

export default function PhotoBoard({ photos }: { photos: GalleryPhoto[] }) {
    const [order, setOrder] = useState<GalleryPhoto[] | null>(null);
    const [columnCount, setColumnCount] = useState(4);
    const [shown, setShown] = useState(0);
    // Stays set after closing so the photo can fade out with the viewer; `count` reopens the same photo.
    const [opened, setOpened] = useState<{ photo: GalleryPhoto; count: number } | null>(null);
    const viewer = useRef<HTMLDialogElement>(null);
    const board = useRef<HTMLDivElement>(null);
    const firstNewPin = useRef<HTMLButtonElement>(null);
    const previouslyShown = useRef(0);

    // Shuffle in the browser so every visit gets a different board.
    useEffect(() => {
        const count = columnsForWidth(window.innerWidth);
        setOrder(shuffled(photos));
        setColumnCount(count);
        setShown(count * rowsPerBatch);

        function followWidth() {
            setColumnCount(columnsForWidth(window.innerWidth));
        }

        window.addEventListener("resize", followWidth);
        return () => window.removeEventListener("resize", followWidth);
    }, [photos]);

    useEffect(() => {
        if (opened && !viewer.current?.open) {
            viewer.current?.showModal();
        }
    }, [opened]);

    useEffect(() => {
        firstNewPin.current?.focus({ preventScroll: true });
    }, [shown]);

    const visible = order ? order.slice(0, shown) : [];
    const hasMore = order !== null && shown < order.length;
    const columns = placeInColumns(visible, columnCount);

    useLayoutEffect(() => {
        const element = board.current;
        if (!element) {
            return;
        }
        trimToShortestColumn(element, hasMore);
        const observer = new ResizeObserver(() => trimToShortestColumn(element, hasMore));
        element.querySelectorAll(".photo-board-column").forEach((column) => observer.observe(column));
        return () => observer.disconnect();
    }, [hasMore, shown, columnCount, order]);

    function showMore() {
        previouslyShown.current = shown;
        setShown(shown + columnCount * rowsPerBatch);
    }

    return (
        <>
            <div ref={board} className="photo-board" data-more={hasMore || undefined} aria-busy={order === null}>
                {columns.map((column, columnIndex) => (
                    <div className="photo-board-column" key={columnIndex}>
                        {column.map((photo) => {
                            const position = visible.indexOf(photo);
                            const isNew = position >= previouslyShown.current;
                            return (
                                <button
                                    key={photo.id}
                                    ref={previouslyShown.current > 0 && position === previouslyShown.current ? firstNewPin : undefined}
                                    type="button"
                                    className="photo-pin"
                                    style={{
                                        aspectRatio: `${photo.width} / ${photo.height}`,
                                        backgroundColor: photo.color,
                                        animationDelay: isNew ? `${Math.min((position - previouslyShown.current) * 30, 600)}ms` : undefined,
                                    }}
                                    onClick={() => setOpened({ photo, count: (opened?.count ?? 0) + 1 })}
                                >
                                    <img
                                        src={photoSource(photo, 640)}
                                        srcSet={photoSourceSet(photo)}
                                        sizes={boardSizes}
                                        alt={photo.caption}
                                        width={photo.width}
                                        height={photo.height}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <span className="photo-pin-caption" aria-hidden="true">{photo.caption}</span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="photo-board-more">
                    <button type="button" onClick={showMore}>
                        Show more
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                            <path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}
            <noscript>
                <div className="photo-board-static">
                    {photos.slice(0, 12).map((photo) => (
                        <img key={photo.id} src={photoSource(photo, 640)} alt={photo.caption} width={photo.width} height={photo.height} loading="lazy" />
                    ))}
                </div>
            </noscript>
            <dialog
                ref={viewer}
                className="photo-viewer"
                aria-label={opened?.photo.caption ?? "Photo"}
                onClick={(event) => {
                    if (event.target === viewer.current) {
                        viewer.current?.close();
                    }
                }}
            >
                {/* Keyed so each photo gets a fresh frame and the last photo never lingers while the next one loads. */}
                {opened && <ViewerPhoto key={opened.photo.id} photo={opened.photo} />}
                <div className="photo-viewer-bar">
                    <p>{opened?.photo.caption}</p>
                    <button type="button" onClick={() => viewer.current?.close()}>
                        Close
                    </button>
                </div>
            </dialog>
        </>
    );
}
