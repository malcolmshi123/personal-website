type PhotoAlbum = {
    id: string;
    title: string;
    description?: string;
};

export const albums: PhotoAlbum[] = [
    { id: "food", title: "Food" },
    { id: "nature", title: "Nature" },
    { id: "places", title: "Places" },
];

type GearItem = {
    name: string;
    note: string;
};

export const gear: GearItem[] = [
    { name: "Canon EOS Rebel SL3", note: "With a Canon EF-S 18-55mm f/4-5.6 IS STM kit lens. Beginner-friendly DSLR." },
    { name: "Google Pixel 11", note: "New phone. Gemini integration and 30x zoom are so nice." },
    { name: "Samsung Galaxy S24", note: "Old phone. Loved the vibrant color tones." },
];
