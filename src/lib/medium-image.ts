// 220 suits the thumbnail on a standard screen, so the browser rarely shrinks a much larger image.
const thumbnailWidths = [220, 440, 880];

function resized(imageId: string, width: number): string {
    return `https://miro.medium.com/v2/resize:fit:${width}/${imageId}`;
}

// Medium resizes images on its CDN, which looks smoother than shrinking the 1024px original in the browser.
export function mediumImageSet(url: string): { src: string; srcSet: string } {
    const imageId = url.split("/").pop() ?? "";
    return {
        src: resized(imageId, 440),
        srcSet: thumbnailWidths.map((width) => `${resized(imageId, width)} ${width}w`).join(", "),
    };
}
