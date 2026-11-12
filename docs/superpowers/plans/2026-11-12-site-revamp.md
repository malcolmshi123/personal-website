# Site Revamp v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v1 look with the Canyon light/dark design, the sunset theme toggle, the streamed greeting, and free-flowing page layouts from the spec.

**Architecture:** One `data-theme` attribute on `<html>` drives CSS tokens. An inline boot script in `<head>` sets theme, toggle-seen, and greeting flags before paint, and small client components (toggle, greeting) update them. Pure logic lives in `src/lib/*.ts` and is unit-tested with `node --test`. Page markup changes per page, and styles stay in the single `src/app/globals.css`, following the existing pattern.

**Tech Stack:** Next.js 16 App Router (static export), React 19, TypeScript 5.9, `next/font/google`, `node:test` (Node 22.18+ or 23.6+ strips TS types natively; local is 23.10).

**Spec:** `docs/superpowers/specs/2026-11-12-site-revamp-design.md`

## Global Constraints

- Static export only. No server features.
- `AGENTS.md` workflow: each task is one increment. Stop for Malcolm's review at the end of each task. Malcolm runs `git add`, `git commit`, and `git push`; never run them.
- Code style: one blank line between functions, no docstrings or block comments as function docs, clear names, explicit types where useful.
- Copy: no en or em dashes in prose (work date ranges excepted), "neighbor", no phone numbers or emails, gospel and testimony wording unchanged.
- Headings: Fraunces, `font-variation-settings: "SOFT" 100, "WONK" 1`, weight 600. Body: Hanken Grotesk 400/500, 18px, line height 1.6, measure about 65ch.
- Color tokens exactly as in the spec table (`--sky`, `--heading`, `--ink`, `--ink-soft`, `--brick`, `--olive`, `--ground`, `--ground-ink`, `--ground-soft`, `--ground-link`, `--placeholder`, `--rule`, `--field`, `--sun`, `--moon`).
- Verse: "Do everything in love." 1 Corinthians 16:14 (NIV).
- Homepage description: "Computer engineering grad from Waterloo. My faith, my work, and a few things I enjoy."
- Every animation is off under `prefers-reduced-motion: reduce`.
- Photos stay labeled placeholders.

## Review Focus

1. Storage blocked (private mode, Safari ITP): `localStorage` and `sessionStorage` throw. The site must render, follow system theme, and show the greeting with no errors. Test: `bootDocument` with throwing storage (Task 1).
2. Invalid stored theme (for example `"system"` or garbage from an old version) falls back to system preference. Test: `resolveTheme("system", true) === "dark"` (Task 1).
3. JavaScript disabled or slow hydration: the greeting heading text and the full page content must be visible without JS. Test: exported `out/index.html` contains the greeting text and no `opacity:0` inline styles (Task 6).
4. System theme changes while the page is open and the visitor never toggled: the page follows live. Manual check in Task 2.
5. Mobile at 375px: toggle stays visible outside the collapsed menu, and the hero photo moves below the text without horizontal scroll. Manual check in Tasks 2 and 3.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/theme.ts` (create) | `Theme` type, storage keys, `resolveTheme`, `nextTheme` |
| `src/lib/boot-script.ts` (create) | `bootDocument(win)` sets pre-paint flags; `bootScript` string |
| `src/lib/greeting.ts` (create) | Greeting tokens, `shouldStreamGreeting`, `formatStreamReadout` |
| `src/components/theme-toggle.tsx` (create) | Sunset sun/moon button |
| `src/components/hill-wave.tsx` (create) | Decorative hill SVG |
| `src/components/site-footer.tsx` (create) | Ground band footer with verse |
| `src/components/streamed-greeting.tsx` (create) | Homepage greeting heading and readout |
| `src/content/site.ts` (create) | `footerVerse` |
| `scripts/theme.test.mjs`, `scripts/greeting.test.mjs`, `scripts/export-html.test.mjs` (create) | Unit and export tests |
| `src/app/layout.tsx`, `src/app/globals.css`, `src/components/site-header.tsx`, `src/app/page.tsx`, `src/content/home.ts`, `src/app/*/page.tsx` (modify) | Pages and styles |

---

### Task 1: Theme foundation (tokens, fonts, no-flash boot)

About 1.5 to 2 hours. After this task the existing layouts render in Canyon light/dark with the new fonts, following system preference. There's no toggle yet.

**Files:**
- Create: `src/lib/theme.ts`, `src/lib/boot-script.ts`, `scripts/theme.test.mjs`
- Modify: `package.json` (scripts), `src/app/layout.tsx`, `src/app/globals.css` (`:root` block, base type, `h1`-`h3`)

**Interfaces:**
- Produces:
  - `type Theme = "light" | "dark"`
  - `themeStorageKey = "theme"`, `toggleSeenKey = "theme-toggled"`, `greetingPlayedKey = "greeting-played"`
  - `resolveTheme(stored: string | null, prefersDark: boolean): Theme`
  - `nextTheme(current: Theme): Theme`
  - `bootDocument(win: BootWindow): void`. Sets `document.documentElement.dataset.theme`, sets `dataset.themeToggled = "true"` when the toggle-seen flag is stored, and sets `dataset.greeting = "stream"` when the greeting hasn't played this session and reduced motion is off.
  - `bootScript: string` = `` `(${bootDocument.toString()})(window)` ``
- `BootWindow` is the minimal shape: `{ localStorage, sessionStorage, matchMedia(q): { matches: boolean }, document: { documentElement: { dataset: Record<string, string> } } }`. `bootDocument` must not reference anything outside its own body, because it is serialized. Inline the key strings and the resolve logic inside it, and wrap each storage read in try/catch.

- [ ] **Step 1: Write failing tests in `scripts/theme.test.mjs`** (import from `../src/lib/theme.ts` and `../src/lib/boot-script.ts`)
  - `resolveTheme("dark", false) === "dark"`; `resolveTheme("light", true) === "light"`
  - `resolveTheme(null, true) === "dark"`; `resolveTheme(null, false) === "light"`
  - `resolveTheme("system", true) === "dark"`; `resolveTheme("garbage", false) === "light"`
  - `nextTheme("light") === "dark"`; `nextTheme("dark") === "light"`
  - `bootDocument` with a fake window: stored `"dark"` gives `dataset.theme === "dark"`; the toggle flag stored gives `themeToggled === "true"`; empty session storage and no reduced motion gives `greeting === "stream"`
  - `bootDocument` with reduced motion (`matchMedia` returns `matches: true` for the reduced-motion query) leaves `greeting` unset
  - `bootDocument` where every storage method throws and system is dark: no throw, `theme === "dark"`, `greeting === "stream"`
  - `new Function(bootScript)` runs against a fake `window` global without throwing (proves the serialized string is self-contained)

- [ ] **Step 2: Run and confirm failure**
  Add `"test": "node --test scripts/"` to `package.json` (keep `test:export`). Run: `npm test`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/lib/theme.ts` and `src/lib/boot-script.ts`** to the interfaces above.

- [ ] **Step 4: Run `npm test`.** Expected: all pass, including the existing `fix-export-paths` test.

- [ ] **Step 5: Wire up layout and tokens**
  - `layout.tsx`: replace Figtree and Young Serif with `Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" })` and `Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" })`. Add `suppressHydrationWarning` on `<html>`. In `<head>`, add `<script dangerouslySetInnerHTML={{ __html: bootScript }} />`.
  - `globals.css`: replace the `:root` palette with the spec's light tokens on `:root` and dark tokens on `:root[data-theme="dark"]`. Set `color-scheme` per theme. Set `body` to `background: var(--sky); color: var(--ink); font-size: 18px; line-height: 1.6` with Hanken. Set `h1, h2` to `color: var(--heading)` and `h3` to `var(--ink)`, all in Fraunces with the global variation settings. Add `transition: background-color .8s, color .8s` on `body`, disabled under reduced motion. Repoint existing v1 rules that use old variables (`--oat`, `--bark`, `--forest`, `--rust`, `--clay`, `--moss`, `--honey`) to the new tokens so nothing breaks before later tasks restyle them.

- [ ] **Step 6: Verify**
  Run: `npm run typecheck && npm test && npm run build`. Expected: all pass.
  Run `npm run dev`. With OS light and with OS dark, every page shows the Canyon colors, there's no flash on reload, and headings are near-black or near-white.

- [ ] **Step 7: Stop for Malcolm's review.** Suggested commit message: `add canyon theme tokens, fonts, and theme boot script`.

---

### Task 2: Shared shell (header toggle, footer ground band)

About 2 hours.

**Files:**
- Create: `src/components/theme-toggle.tsx`, `src/components/hill-wave.tsx`, `src/components/site-footer.tsx`, `src/content/site.ts`
- Modify: `src/components/site-header.tsx`, `src/app/layout.tsx` (use `SiteFooter`), `globals.css` (Header and Footer sections)

**Interfaces:**
- Consumes: `Theme`, `nextTheme`, `resolveTheme`, `themeStorageKey`, `toggleSeenKey` from Task 1.
- Produces:
  - `footerVerse: { text: string; reference: string }` = `{ text: "Do everything in love.", reference: "1 Corinthians 16:14" }`
  - `<ThemeToggle />` (client, default export)
  - `<HillWave className?: string />` (decorative, `aria-hidden`; one path that fills with `var(--ground)`)
  - `<SiteFooter />` (server, default export)

- [ ] **Step 1: `theme-toggle.tsx`**
  - A `<button type="button" className="theme-toggle">` containing the sun SVG, the moon SVG with three stars, and `<span className="theme-toggle-hint">click me</span>`. Fraunces italic, `--ink-soft`.
  - On mount, read `document.documentElement.dataset.theme` into state. Before mount, the `aria-label` is "Switch theme". After mount it is "Switch to dark theme" or "Switch to light theme".
  - On click: compute `nextTheme`, set the `data-theme` attribute, write `themeStorageKey` and `toggleSeenKey` (each in try/catch), and set `dataset.themeToggled = "true"`.
  - While no theme is stored, subscribe to `matchMedia("(prefers-color-scheme: dark)")` change events and update `data-theme`. Unsubscribe once the visitor toggles.
  - CSS: icons show or hide by `:root[data-theme]`. The sun translates down and fades while the moon fades in (0.8s; instant under reduced motion). `:root[data-theme-toggled] .theme-toggle-hint { display: none }`. Hit area at least 44px, with a visible `:focus-visible` ring in `--brick`.
- [ ] **Step 2: `site-header.tsx`**
  - Drop the trailing dot from the wordmark.
  - Place `<ThemeToggle />` outside the `<nav>`, so it stays visible when the mobile menu is collapsed.
  - Style the active link with a 1.5px `--brick` underline (no pill).
- [ ] **Step 3: `site-footer.tsx` and `hill-wave.tsx`**
  - Footer markup: `HillWave`, then a band with `background: var(--ground)` holding the wordmark, the `contactLinks`, and the verse as a `<p>` with the text in Fraunces 400 and the reference in body font.
  - Colors: text uses `--ground-ink`, `--ground-soft`, and `--ground-link`.
  - Replace the inline footer in `layout.tsx` with `<SiteFooter />`.
- [ ] **Step 4: Verify**
  - Run `npm run typecheck && npm test && npm run build`.
  - Dev, desktop and 375px:
    - The toggle switches theme and persists across pages and reloads.
    - The hint hides after the first click.
    - Keyboard Tab reaches the toggle, and the ring is visible.
    - With nothing stored, changing the OS theme updates the page live (Review Focus 4).
    - The toggle stays visible with the menu closed on mobile (Review Focus 5).
- [ ] **Step 5: Stop for Malcolm's review.** Suggested commit message: `add sunset theme toggle and ground band footer`.

---

### Task 3: Homepage (streamed greeting, hero, ground entries)

About 2 to 2.5 hours.

**Files:**
- Create: `src/lib/greeting.ts`, `scripts/greeting.test.mjs`, `src/components/streamed-greeting.tsx`
- Modify: `src/app/page.tsx`, `src/content/home.ts`, `globals.css` (replace the Homepage section)

**Interfaces:**
- Consumes: `greetingPlayedKey` from Task 1; the `data-greeting="stream"` flag set by `bootDocument`.
- Produces:
  - `greetingTokens: readonly string[]` = `["Hi", ",", " I", "’m", " Mal", "colm", "."]`
  - `greetingAccentFrom = 4` (tokens from this index render in `--brick`)
  - `shouldStreamGreeting(alreadyPlayed: boolean, reducedMotion: boolean): boolean`
  - `formatStreamReadout(shown: number, total: number, elapsedMs: number): string`. Returns `"3 tokens · 17 tok/s"` while streaming (rate = `Math.round(shown / max(elapsedMs, 1) * 1000)`) and `"7 tokens · done"` when `shown === total`.

- [ ] **Step 1: Write failing tests in `scripts/greeting.test.mjs`**
  - `greetingTokens.join("") === "Hi, I’m Malcolm."`
  - `shouldStreamGreeting(false, false) === true`; `(true, false) === false`; `(false, true) === false`
  - `formatStreamReadout(3, 7, 176) === "3 tokens · 17 tok/s"`
  - `formatStreamReadout(7, 7, 900) === "7 tokens · done"`
  - `formatStreamReadout(1, 7, 0)` contains no `Infinity` or `NaN`
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement `src/lib/greeting.ts`, then run `npm test`.** Expected: PASS.
- [ ] **Step 4: `streamed-greeting.tsx`** (client)
  - Renders `<h1 className="greeting">` with every token as a `<span className="greeting-token">`. Tokens from `greetingAccentFrom` on get the accent class. All are visible in server HTML.
  - Below it, `<p className="greeting-readout" aria-hidden="true">`, empty by default.
  - CSS: `:root[data-greeting="stream"] .greeting-token:not(.is-shown) { opacity: 0 }`.
  - On mount, if `dataset.greeting === "stream"`:
    - Reveal tokens one by one, with a random delay of 90 to 180ms per token.
    - Update the readout as tokens appear.
    - At the end, write `greetingPlayedKey` to `sessionStorage` (try/catch) and delete `dataset.greeting`.
  - The heading's accessible text is always the full greeting, because the spans are real text.
- [ ] **Step 5: `page.tsx` and `home.ts`**
  - `home.ts`: `homeDescription` holds the spec line. `featuredLinks` keeps the Good News and Work titles, descriptions, and actions (drop `tone` and `detail`). `homeLinks` stays as is.
  - First section: a grid of text and photo. Text: `StreamedGreeting`, the description at about 20px in `--ink-soft`, and a "See my work" link in `--olive`. Photo: `<div className="hero-photo">` with an asymmetric radius (`120px 120px 18px 90px` scaled), `background: var(--placeholder)`, and the label "photo coming soon".
  - Second section, on a `--ground` band continuous with the footer (HillWave on top): the two featured entries as loose title, line, and link (staggered by a `margin-top` on the second), then `Also: About · Blog · Photos · Contact`.
  - Delete the v1 CSS for `.featured-card`, `.welcome-photo`, `.welcome-links`, and the buttons that are now unused.
  - Mobile: one column, with the photo after the text.
  - Greeting size: `clamp(56px, 9vw, 112px)`.
- [ ] **Step 6: Verify**
  - Run `npm run typecheck && npm test && npm run build`.
  - Dev:
    - The greeting streams on the first visit and is instant on reload in the same tab.
    - With reduced motion on in the OS, it's instant with no readout.
    - At 375px there's no horizontal scroll (Review Focus 5).
- [ ] **Step 7: Stop for Malcolm's review.** Suggested commit message: `rebuild homepage with streamed greeting`.

---

### Task 4: Reading pages (Good News, About, Blog, Work)

About 1.5 hours.

**Files:**
- Modify: `src/app/gospel/page.tsx`, `src/app/about/page.tsx`, `src/app/blog/page.tsx`, `src/app/work/page.tsx`, `src/components/page-shell.tsx` if it's still used, `globals.css` (Inner pages section)

**Interfaces:**
- Consumes: tokens only.
- Produces: shared classes `.reading` (measure 65ch), `.page-title` (Fraunces, `clamp(44px, 6vw, 72px)`, `--heading`), `.page-meta` (small, `--ink-soft`), `.entry-row` (hairline top border `--rule`; title and date on one flex row with the date right-aligned; description; tech line in `--ink-soft`), and `.soft-photo` (an asymmetric-radius placeholder, reused by Photos in Task 5).

- [ ] **Step 1:** Good News: replace the reading-time pill with `.page-meta` text. Links go in `--brick`. No copy changes.
- [ ] **Step 2:** About: reading layout plus one `.soft-photo` labeled "photo coming soon".
- [ ] **Step 3:** Blog: a list of rows (title, where it's published, link).
- [ ] **Step 4:** Work: intro and résumé link, then Projects, Experience, and Education as `.entry-row`. Remove the tag pill styles.
- [ ] **Step 5: Verify.**
  - Run `npm run typecheck && npm run build`.
  - Check each page at 1280 and 375 in both themes.
  - Run `git diff --stat src/content/gospel.ts`. Expected: no changes.
- [ ] **Step 6: Stop for Malcolm's review.** Suggested commit message: `restyle reading pages`.

---

### Task 5: Photos and Contact

About 1.5 hours.

**Files:**
- Modify: `src/app/photos/page.tsx`, `src/app/contact/page.tsx`, `globals.css`

**Interfaces:**
- Consumes: `.soft-photo` and `.page-title` from Task 4.

- [ ] **Step 1:** Photos: three `.soft-photo` albums, each with a different radius set (`90px 90px 16px 60px`, `20px 80px 80px 20px`, `70px 16px 90px 90px`) and staggered `margin-top` (0, 46px, 14px), on a three-column grid. On mobile, a single column with alternating `justify-self` start and end at 85% width. Titles and descriptions come from `albums`. The label reads "photos coming soon".
- [ ] **Step 2:** Contact:
  - Fields use `background: var(--field)`, `border: 1px solid var(--rule)`, and a 10px radius, with the focus ring in `--brick`.
  - The submit button uses an `--olive` fill with `--sky` text.
  - The form's `action`, `method`, field names, and `required` attributes are unchanged.
- [ ] **Step 3: Verify.**
  - Run `npm run typecheck && npm run build`.
  - Check both pages at 1280 and 375 in both themes.
  - Run `git diff src/app/contact/page.tsx` and confirm the form attributes are untouched.
  - Do not submit the form. Delivery was verified previously, and behavior is unchanged.
- [ ] **Step 4: Stop for Malcolm's review.** Suggested commit message: `restyle photos and contact`.

---

### Task 6: Export check, design docs, and cleanup

About 1 hour.

**Files:**
- Create: `scripts/export-html.test.mjs`
- Modify: `package.json`, `.impeccable/surfaces/src-app-page-tsx.md`, `PRODUCT.md` (the visual direction line under Brand Commitments)
- Create (via the Impeccable documenter): `DESIGN.md`

- [ ] **Step 1: Write `scripts/export-html.test.mjs`.** It reads `out/index.html` and asserts:
  - The page contains `Hi`, `Malcolm`, and the homepage description.
  - The page contains `Do everything in love.` and `1 Corinthians 16:14`.
  - The boot script is present (the string `prefers-color-scheme`).
  - There are no `opacity:0` or `opacity: 0` inline styles (Review Focus 3).
  - `out/gospel/index.html` contains `About 5 minutes`.

  Add `"test:html": "node --test scripts/export-html.test.mjs"`, and change `test` to exclude this file (for example `node --test scripts/theme.test.mjs scripts/greeting.test.mjs scripts/fix-export-paths.test.mjs`).
- [ ] **Step 2:** Run `npm run build && npm run test:html`. Expected: PASS.
- [ ] **Step 3:** Remove the unused CSS left from v1 (search `globals.css` for old class names that no longer appear in `src/`), and delete `arrow-icon.tsx` if nothing imports it.
- [ ] **Step 4:** Update the surface brief's direction contract and `PRODUCT.md` to the v2 direction (Canyon palette, Fraunces and Hanken, free-flowing layout, sunset toggle, streamed greeting).
- [ ] **Step 5:** Run the Impeccable detector on the changed UI: `"<impeccable>/scripts/impeccable" detect --json src/app src/components`. Fix the material findings, then generate `DESIGN.md` with the `impeccable-documenter` agent.
- [ ] **Step 6: Verify.** Run `npm run typecheck && npm test && npm run build && npm run test:html`. All pass. Then spot-check contrast in both themes (headings, brick links, and band text) with the browser's accessibility inspector. Each must be at least 4.5:1.
- [ ] **Step 7: Stop for Malcolm's review.** Suggested commit message: `add export checks and design docs`.
