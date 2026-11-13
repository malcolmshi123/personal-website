import assert from "node:assert/strict";
import test from "node:test";
import { formatStreamReadout, greetingTokens, shouldStreamGreeting } from "../src/lib/greeting.ts";

test("greeting tokens spell the full greeting", () => {
    assert.equal(greetingTokens.join(""), "Hi, I’m Malcolm.");
});

test("shouldStreamGreeting streams only on a first visit without reduced motion", () => {
    assert.equal(shouldStreamGreeting(false, false), true);
    assert.equal(shouldStreamGreeting(true, false), false);
    assert.equal(shouldStreamGreeting(false, true), false);
});

test("formatStreamReadout shows count and rate while streaming", () => {
    assert.equal(formatStreamReadout(3, 7, 176), "3 tokens · 17 tok/s");
});

test("formatStreamReadout shows done when every token is shown", () => {
    assert.equal(formatStreamReadout(7, 7, 900), "7 tokens · done");
});

test("formatStreamReadout stays finite at zero elapsed time", () => {
    const readout = formatStreamReadout(1, 7, 0);

    assert.doesNotMatch(readout, /Infinity|NaN/);
});
