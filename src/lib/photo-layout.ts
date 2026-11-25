// The Gallery board's column layout and the homepage deck's dealing, kept free of React and the photo data
// so tests/photo-layout.test.mjs can test them directly.

type Sized = { width: number; height: number };

export type Pile<T> = { label: string; photos: T[] };

// Slot 0 is the front card, 1 and 2 are spread behind it, 3 waits hidden, and -1 is the card being tossed away.
export type DealtCard<T> = { key: number; photo: T; label: string; slot: number };

export function columnsForWidth(width: number): number {
    if (width <= 760) {
        return 2;
    }
    return width <= 1100 ? 3 : 4;
}

// Each photo drops into the shortest column so far, so the board fills left to right like a pinboard.
// The placement only depends on earlier photos, so showing more never moves photos already on screen.
export function placeInColumns<T extends Sized>(photos: T[], count: number): T[][] {
    const columns = Array.from({ length: count }, () => ({ photos: [] as T[], height: 0 }));
    for (const photo of photos) {
        const shortest = columns.reduce((low, column) => (column.height < low.height ? column : low));
        shortest.photos.push(photo);
        shortest.height += photo.height / photo.width;
    }
    return columns.map((column) => column.photos);
}

// Cards alternate between the piles. Each pile deals from its own shuffled copy, so no photo repeats until the
// whole pile has been shown, then that pile is shuffled again.
export function createDealer<T>(piles: Pile<T>[], shuffle: (photos: readonly T[]) => T[]): (slot: number) => DealtCard<T> {
    const remaining = piles.map(() => [] as T[]);
    let dealt = 0;
    return (slot: number): DealtCard<T> => {
        const pileIndex = dealt % piles.length;
        if (remaining[pileIndex].length === 0) {
            remaining[pileIndex] = shuffle(piles[pileIndex].photos);
        }
        dealt += 1;
        return { key: dealt, photo: remaining[pileIndex].pop()!, label: piles[pileIndex].label, slot };
    };
}

// The front card goes to slot -1 to be tossed away, every other card moves up one slot, and `incoming` joins at the
// back. A card already on its way out from an earlier toss is dropped.
export function tossFrontCard<T>(cards: DealtCard<T>[], incoming: DealtCard<T>): DealtCard<T>[] {
    return [...cards.filter((card) => card.slot >= 0).map((card) => ({ ...card, slot: card.slot - 1 })), incoming];
}
