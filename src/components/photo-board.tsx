"use client";

import { useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import { photoSource, photoSourceSet, shuffled, type GalleryPhoto } from "@/content/photos";
import { columnsForWidth, placeInColumns } from "@/lib/photo-layout";

const rowsPerBatch = 6;
const boardSizes = "(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 320px";

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

type PhotoPinProps = {
    photo: GalleryPhoto;
    // Photos that just arrived fade up one after another; photos already on the board have no delay.
    delayMs?: number;
    pinRef?: Ref<HTMLButtonElement>;
    onOpen: () => void;
};

function PhotoPin({ photo, delayMs, pinRef, onOpen }: PhotoPinProps) {
    return (
        <button
            ref={pinRef}
            type="button"
            className="photo-pin"
            style={{
                aspectRatio: `${photo.width} / ${photo.height}`,
                backgroundColor: photo.color,
                animationDelay: delayMs === undefined ? undefined : `${delayMs}ms`,
            }}
            onClick={onOpen}
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
                            // How far this photo comes after the first one the last Show more added; negative if it was already here.
                            const sinceFirstNew = visible.indexOf(photo) - previouslyShown.current;
                            return (
                                <PhotoPin
                                    key={photo.id}
                                    photo={photo}
                                    delayMs={sinceFirstNew >= 0 ? Math.min(sinceFirstNew * 30, 600) : undefined}
                                    pinRef={previouslyShown.current > 0 && sinceFirstNew === 0 ? firstNewPin : undefined}
                                    onOpen={() => setOpened({ photo, count: (opened?.count ?? 0) + 1 })}
                                />
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
