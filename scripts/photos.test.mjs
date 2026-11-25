import assert from "node:assert/strict";
import test from "node:test";
import { captionFromFilename, duplicatePhotoIds, photoId, readsAsPhoto } from "./photos.mjs";

test("captions come from filenames with dashes as spaces", () => {
    assert.equal(captionFromFilename("ichiran-ramen.jpg"), "ichiran ramen");
    assert.equal(captionFromFilename("jokbal-kimchi-bibimbap.JPG"), "jokbal kimchi bibimbap");
    assert.equal(captionFromFilename("!mount-fuji.png"), "mount fuji");
    assert.equal(captionFromFilename("Kichi-Kichi-omurice.webp"), "Kichi Kichi omurice");
    assert.equal(captionFromFilename("a5_wagyu.jpg"), "a5_wagyu");
    assert.equal(captionFromFilename("mozy's-charcoal-chicken.jpg"), "mozy’s charcoal chicken");
});

test("photo ids are lowercase, folder-prefixed, and safe for URLs", () => {
    assert.equal(photoId("food", "Ichiran-Ramen.JPG"), "food-ichiran-ramen");
    assert.equal(photoId("misc", "degree.JPG"), "misc-degree");
    assert.equal(photoId("places", "!mount fuji.jpg"), "places-mount-fuji");
    assert.equal(photoId("", "selfie.jpg"), "selfie");
});

test("only image files are treated as photos", () => {
    assert.ok(readsAsPhoto("a.jpg"));
    assert.ok(readsAsPhoto("b.JPEG"));
    assert.ok(readsAsPhoto("c.png"));
    assert.ok(readsAsPhoto("d.webp"));
    assert.ok(readsAsPhoto("e.heic"));
    assert.ok(!readsAsPhoto("notes.txt"));
    assert.ok(!readsAsPhoto(".DS_Store"));
});

test("filenames that would share a photo id are grouped so the build can name them", () => {
    const duplicates = duplicatePhotoIds([
        { id: "food-chicken-parm", source: "food/chicken-parm.jpg" },
        { id: "places-mount-fuji", source: "places/mount-fuji.jpg" },
        { id: "food-chicken-parm", source: "food/Chicken_Parm.png" },
    ]);
    assert.deepEqual(duplicates, [["food/chicken-parm.jpg", "food/Chicken_Parm.png"]]);
    assert.deepEqual(duplicatePhotoIds([{ id: "a", source: "a.jpg" }]), []);
});
