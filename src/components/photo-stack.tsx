"use client";

import { useEffect, useRef, useState } from "react";
import { photoSource, photoSourceSet, seenPhotos, shuffled, tastedPhotos, type GalleryPhoto } from "@/content/photos";

const piles = [
    { label: "tasted", photos: tastedPhotos },
    { label: "seen", photos: seenPhotos },
].filter((pile) => pile.photos.length > 0);

const stackSizes = "(max-width: 760px) 60vw, 380px";

// Slot 0 is the card in front, 1 and 2 are fanned behind it, and 3 waits hidden so its photo is loaded before it shows.
const slotCount = 4;
// Matches the leaving card's transition in globals.css.
const tossMs = 300;

type Card = { key: number; photo: GalleryPhoto; label: string; slot: number };

// Each label deals from its own shuffled pile, so no photo repeats until the whole pile has been shown.
function dealer() {
    const shuffledPiles = piles.map(() => [] as GalleryPhoto[]);
    let dealt = 0;
    return (slot: number): Card => {
        const pileIndex = dealt % piles.length;
        if (shuffledPiles[pileIndex].length === 0) {
            shuffledPiles[pileIndex] = shuffled(piles[pileIndex].photos);
        }
        dealt += 1;
        return { key: dealt, photo: shuffledPiles[pileIndex].pop()!, label: piles[pileIndex].label, slot };
    };
}

export default function PhotoStack() {
    const deal = useRef<ReturnType<typeof dealer> | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [hasTurned, setHasTurned] = useState(false);

    // Deal in the browser, so every visit opens on a different photo.
    useEffect(() => {
        deal.current = dealer();
        const dealNext = deal.current;
        setCards(Array.from({ length: slotCount }, (_, slot) => dealNext(slot)));
    }, []);

    if (piles.length === 0) {
        return null;
    }

    const front = cards.find((card) => card.slot === 0);

    // The front card is tossed aside (slot -1) while every other card moves up one slot.
    // Cards keep their DOM order by key, so each one transitions between slots instead of remounting.
    function toss() {
        if (!deal.current) {
            return;
        }
        const tossed = front?.key;
        // Deal outside the state update, which React may run twice.
        const incoming = deal.current(slotCount - 1);
        setCards((current) => [
            ...current.filter((card) => card.slot >= 0).map((card) => ({ ...card, slot: card.slot - 1 })),
            incoming,
        ]);
        setHasTurned(true);
        window.setTimeout(() => setCards((current) => current.filter((card) => card.key !== tossed)), tossMs);
    }

    return (
        <figure className="photo-stack">
            <button type="button" className="photo-stack-button" aria-label="Show another photo" onClick={toss}>
                {cards.length === 0 && <span className="photo-stack-card" data-slot="0" aria-hidden="true" />}
                {cards.map((card) => (
                    <span
                        key={card.key}
                        className="photo-stack-card"
                        data-slot={card.slot >= 0 ? card.slot : undefined}
                        data-leaving={card.slot < 0 || undefined}
                        aria-hidden={card.slot !== 0 || undefined}
                        style={{ backgroundColor: card.photo.color }}
                    >
                        <img
                            src={photoSource(card.photo, 640)}
                            srcSet={photoSourceSet(card.photo)}
                            sizes={stackSizes}
                            alt={card.slot === 0 ? card.photo.caption : ""}
                            width={card.photo.width}
                            height={card.photo.height}
                        />
                    </span>
                ))}
            </button>
            <figcaption className="photo-stack-caption" aria-live="polite">
                <span className="photo-stack-label">{front?.label ?? piles[0].label}</span>
                {front && <span className="photo-stack-name"> · {front.photo.caption}</span>}
                {!hasTurned && <span className="photo-stack-hint"> · tap for another</span>}
            </figcaption>
        </figure>
    );
}
