import assert from "node:assert/strict";
import test from "node:test";
import { columnsForWidth, createDealer, placeInColumns, tossFrontCard } from "../src/lib/photo-layout.ts";

const tall = (id) => ({ id, width: 600, height: 800 });
const wide = (id) => ({ id, width: 800, height: 600 });
const ids = (columns) => columns.map((column) => column.map((photo) => photo.id));
// Keeps the pile order so the dealer's sequence is predictable.
const inOrder = (photos) => [...photos];

// Board

test("the board uses two columns on phones, three on laptops, and four on wide screens", () => {
    assert.equal(columnsForWidth(375), 2);
    assert.equal(columnsForWidth(760), 2);
    assert.equal(columnsForWidth(761), 3);
    assert.equal(columnsForWidth(1100), 3);
    assert.equal(columnsForWidth(1101), 4);
});

test("each photo drops into the shortest column, filling left to right on ties", () => {
    const columns = placeInColumns([tall("a"), wide("b"), wide("c"), wide("d")], 3);
    // a, b, c fill the three empty columns; d goes under b, the first of the two shorter wide columns.
    assert.deepEqual(ids(columns), [["a"], ["b", "d"], ["c"]]);
});

test("every photo is placed exactly once, in order within its column", () => {
    const photos = Array.from({ length: 23 }, (_, index) => (index % 3 ? wide(`p${index}`) : tall(`p${index}`)));
    const columns = placeInColumns(photos, 4);
    assert.deepEqual(columns.flat().map((photo) => photo.id).sort(), photos.map((photo) => photo.id).sort());
    for (const column of columns) {
        const positions = column.map((photo) => photos.indexOf(photo));
        assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    }
});

test("showing more never moves a photo that was already on the board", () => {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const photos = Array.from({ length: 48 }, (_, index) => ({ id: `p${index}`, width: 600, height: 400 + Math.round(random() * 600) }));
    for (const columnCount of [2, 3, 4]) {
        const batch = columnCount * 6;
        const before = ids(placeInColumns(photos.slice(0, batch), columnCount));
        const after = ids(placeInColumns(photos.slice(0, batch * 2), columnCount));
        before.forEach((column, index) => assert.deepEqual(after[index].slice(0, column.length), column, `${columnCount} columns, column ${index}`));
    }
});

test("the columns stay balanced: none ends more than one photo taller than the shortest", () => {
    const photos = Array.from({ length: 30 }, (_, index) => (index % 2 ? tall(`p${index}`) : wide(`p${index}`)));
    const heights = placeInColumns(photos, 3).map((column) => column.reduce((sum, photo) => sum + photo.height / photo.width, 0));
    const tallestPhoto = 800 / 600;
    assert.ok(Math.max(...heights) - Math.min(...heights) <= tallestPhoto, heights.join(", "));
});

// Homepage stack

const piles = [
    { label: "tasted", photos: [tall("ramen"), tall("katsu"), tall("soup")] },
    { label: "seen", photos: [wide("fuji"), wide("lake")] },
];

test("the deck alternates tasted and seen", () => {
    const deal = createDealer(piles, inOrder);
    assert.deepEqual(Array.from({ length: 6 }, (_, slot) => deal(slot).label), ["tasted", "seen", "tasted", "seen", "tasted", "seen"]);
});

test("no photo repeats until its pile has been fully shown, then the pile starts again", () => {
    const deal = createDealer(piles, inOrder);
    const tasted = Array.from({ length: 12 }, (_, slot) => deal(slot)).filter((card) => card.label === "tasted").map((card) => card.photo.id);
    assert.equal(new Set(tasted.slice(0, 3)).size, 3);
    assert.deepEqual(tasted.slice(3, 6).sort(), ["katsu", "ramen", "soup"]);
});

test("each pile is reshuffled when it runs out", () => {
    let shuffles = 0;
    const deal = createDealer(piles, (photos) => {
        shuffles += 1;
        return [...photos];
    });
    Array.from({ length: 10 }, (_, slot) => deal(slot));
    // 5 tasted cards use the 3-photo pile twice, and 5 seen cards use the 2-photo pile three times.
    assert.equal(shuffles, 2 + 3);
});

test("with only one pile, every card comes from it", () => {
    const deal = createDealer([piles[0]], inOrder);
    assert.deepEqual(Array.from({ length: 4 }, (_, slot) => deal(slot).label), ["tasted", "tasted", "tasted", "tasted"]);
});

test("every dealt card has a unique key and the slot it was dealt into", () => {
    const deal = createDealer(piles, inOrder);
    const cards = Array.from({ length: 8 }, (_, slot) => deal(slot % 4));
    assert.equal(new Set(cards.map((card) => card.key)).size, 8);
    assert.deepEqual(cards.map((card) => card.slot), [0, 1, 2, 3, 0, 1, 2, 3]);
});

test("tossing the front card sends it away, moves the rest up one slot, and adds the new card at the back", () => {
    const deal = createDealer(piles, inOrder);
    const cards = Array.from({ length: 4 }, (_, slot) => deal(slot));
    const incoming = deal(3);
    const next = tossFrontCard(cards, incoming);
    assert.deepEqual(next.map((card) => [card.key, card.slot]), [[1, -1], [2, 0], [3, 1], [4, 2], [5, 3]]);
});

test("a card already on its way out is dropped by the next toss", () => {
    const deal = createDealer(piles, inOrder);
    let cards = Array.from({ length: 4 }, (_, slot) => deal(slot));
    cards = tossFrontCard(cards, deal(3));
    cards = tossFrontCard(cards, deal(3));
    assert.deepEqual(cards.map((card) => [card.key, card.slot]), [[2, -1], [3, 0], [4, 1], [5, 2], [6, 3]]);
});
