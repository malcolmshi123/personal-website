"use client";

import { useState } from "react";
import { heroPhotos } from "@/content/home";

export default function PhotoStack() {
    const [index, setIndex] = useState(0);
    const [hasTurned, setHasTurned] = useState(false);
    const photo = heroPhotos[index];

    return (
        <figure className="photo-stack">
            <button
                type="button"
                className="photo-stack-button"
                aria-label="Show another photo"
                data-turned={hasTurned || undefined}
                onClick={() => {
                    setIndex((index + 1) % heroPhotos.length);
                    setHasTurned(true);
                }}
            >
                <span className="photo-stack-card photo-stack-back" aria-hidden="true" />
                <span className="photo-stack-card photo-stack-middle" aria-hidden="true" />
                <span className="photo-stack-card photo-stack-top" key={index}>
                    {photo.placeholder}
                </span>
            </button>
            <figcaption className="photo-stack-caption" aria-live="polite">
                <span className="photo-stack-label">{photo.label}</span>
                <span className="photo-stack-hint"> · tap for another</span>
            </figcaption>
        </figure>
    );
}
