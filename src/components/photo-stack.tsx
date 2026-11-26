"use client";

import { useEffect, useRef, useState } from "react";
import { photoSource, photoSourceSet, seenPhotos, shuffled, tastedPhotos, type GalleryPhoto } from "@/content/photos";
import { createDealer, tossFrontCard, type DealtCard } from "@/lib/photo-layout";

const piles = [
    { label: "tasted", photos: tastedPhotos },
    { label: "seen", photos: seenPhotos },
].filter((pile) => pile.photos.length > 0);

// The front card's widest: about 121px on a phone and 216px on a large screen.
const stackSizes = "(max-width: 760px) 121px, 216px";

// Slot 0 is the card in front, 1 and 2 are spread behind it, and 3 waits hidden so its photo is loaded before it shows.
const slotCount = 4;
// Outlasts the leaving card's 260ms transition in styles/photo-stack.css, then removes it.
const tossMs = 300;

type Card = DealtCard<GalleryPhoto>;

export default function PhotoStack() {
    const deal = useRef<((slot: number) => Card) | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [hasTurned, setHasTurned] = useState(false);

    // Deal in the browser, so every visit opens on a different photo.
    useEffect(() => {
        deal.current = createDealer(piles, shuffled);
        const dealNext = deal.current;
        setCards(Array.from({ length: slotCount }, (_, slot) => dealNext(slot)));
    }, []);

    if (piles.length === 0) {
        return null;
    }

    const front = cards.find((card) => card.slot === 0);

    // Cards keep their DOM order by key, so each one transitions between slots instead of remounting.
    function toss() {
        if (!deal.current) {
            return;
        }
        const tossed = front?.key;
        // Deal outside the state update, which React may run twice.
        const incoming = deal.current(slotCount - 1);
        setCards((current) => tossFrontCard(current, incoming));
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
                {/* CSS shows "tap" on touch screens and "click" with a mouse, so only one word is ever read out. */}
                {!hasTurned && (
                    <span className="photo-stack-hint">
                        <span className="photo-stack-hint-touch">tap</span>
                        <span className="photo-stack-hint-pointer">click</span> for another
                    </span>
                )}
            </figcaption>
        </figure>
    );
}
