import assert from "node:assert/strict";
import test from "node:test";
import { canonicalSelector, canonicalValue, readStyles } from "./built-site/built-css.mjs";

test("values match however the minifier spells times, numbers, colors, and spacing", () => {
    assert.equal(canonicalValue("opacity .15s var(--ease-out), filter 150ms var(--ease-out)"), "opacity 150ms var(--ease-out),filter 150ms var(--ease-out)");
    assert.equal(canonicalValue("scale(.97)"), canonicalValue("scale(0.97)"));
    assert.equal(canonicalValue("translateX(-15%)"), canonicalValue("translate(-15%)"));
    assert.equal(canonicalValue("#FFF"), canonicalValue("#ffffff"));
    assert.equal(canonicalValue("repeat(3, minmax(0, 1fr))"), "repeat(3,minmax(0,1fr))");
    assert.equal(canonicalValue("5 / 7"), "5/7");
    assert.equal(canonicalValue("1.50"), "1.5");
    assert.equal(canonicalValue("0px"), "0");
    assert.equal(canonicalValue("none ! important"), "none!important");
    assert.equal(canonicalValue("-.5s"), "-500ms");
});

test("values keep what changes their meaning", () => {
    assert.notEqual(canonicalValue("1.05"), canonicalValue("1.5"));
    assert.notEqual(canonicalValue("10px"), canonicalValue("1px"));
    assert.equal(canonicalValue("clamp(14px, 3svh, 28px)"), "clamp(14px,3svh,28px)");
});

test("selectors match with or without attribute quotes, combinator spaces, and double colons", () => {
    assert.equal(canonicalSelector('.photo-stack-card[data-slot="1"] img'), canonicalSelector(".photo-stack-card[data-slot=1] img"));
    assert.equal(canonicalSelector(".project-image-pair > .project-image"), ".project-image-pair>.project-image");
    assert.equal(canonicalSelector("a:after"), canonicalSelector("a::after"));
    assert.equal(canonicalSelector("from"), "0%");
    assert.equal(canonicalSelector("to"), "100%");
});

test("a declaration is found by selector, property, and the at-rules around it", () => {
    const styles = readStyles(`
        .card{opacity:1;transform:translateX(-15%)}
        .card,.other{opacity:.5}
        @media (hover:hover) and (pointer:fine){.card:hover{transform:translateY(-4%)}}
        @keyframes rise{from{opacity:0}to{opacity:1}}
        @starting-style{.card{opacity:0}}
    `);
    assert.equal(styles.value(".card", "opacity"), "0.5");
    assert.equal(styles.value(".other", "opacity"), "0.5");
    assert.equal(styles.value(".card", "transform"), "translate(-15%)");
    assert.equal(styles.value(".card:hover", "transform"), undefined);
    assert.equal(styles.value(".card:hover", "transform", "@media (hover: hover) and (pointer: fine)"), "translateY(-4%)");
    assert.equal(styles.value(".card", "opacity", "@starting-style"), "0");
    assert.equal(styles.value("0%", "opacity", "@keyframes rise"), "0");
    assert.ok(styles.hasKeyframes("rise"));
    assert.ok(!styles.hasKeyframes("fall"));
    assert.ok(styles.hasRule(".card:hover", "@media (hover:hover) and (pointer:fine)"));
    assert.ok(!styles.hasRule(".missing"));
});

test("semicolons and braces inside strings and urls don't split declarations", () => {
    const styles = readStyles(`.icon{background:url("data:image/svg+xml;utf8,<svg>{}</svg>");content:"a;b}";color:red}`);
    assert.equal(styles.value(".icon", "content"), '"a;b}"');
    assert.equal(styles.value(".icon", "color"), "red");
});
