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
