import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const resume = await readFile(new URL("../resume/main.tex", import.meta.url), "utf8");
const header = resume.slice(resume.indexOf("\\begin{center}"), resume.indexOf("\\end{center}"));

test("the resume source has no email address or phone number", () => {
    assert.doesNotMatch(resume, /mailto:|[\w.+-]+@[\w-]+\.[\w.]+/);
    assert.doesNotMatch(resume, /\d{3}[-. ]\d{3}[-. ]\d{4}/);
    assert.doesNotMatch(resume, /\\faEnvelope|\\faPhone/);
});

test("the resume header links LinkedIn and GitHub but not my site", () => {
    assert.doesNotMatch(header, /malcolmshi\.ca/);
    assert.match(header, /\\href\{https:\/\/linkedin\.com\/in\/malcolm-shi\}/);
    assert.match(header, /\\href\{https:\/\/github\.com\/malcolmshi123\}/);
});
