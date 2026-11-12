# Site revamp design (v2)

Date: 2026-11-12
Baseline: `db98d46` (`revamp v1`), live at https://malcolmshi.ca/

## Intent

Malcolm wants his personal site to feel like his own: warm, earthy ("granola"), free-flowing, and personal, the way his friends' sites (enochwei.com, faywu.ca, david-jiang.com) feel personal. It must not look AI-generated or like Claude.

Success: a visitor's first sight is a big greeting, they get a real sense of who Malcolm is, and the site has one or two memorable touches without feeling like a template.

### What Malcolm said

- v1's layout pattern reads as AI-generated (split hero, arched blob, pastel cards, four-link row).
- Young Serif headings look too much like Claude. Body text looked too small and basic.
- The first thing people see is a greeting. Keep the description short.
- Free-flowing, not a notebook or field-journal theme.
- Light and dark themes. Default to the visitor's system preference, but the site offers only light and dark, no "system" option.
- Two gimmicks: a sunset theme toggle and a streamed greeting.
- Sun and moon toggle tucked in the corner with a small "click me" label.
- A photo placeholder on the homepage, beside the greeting.
- Palette: tan, brown, brick red, and green ("Canyon"). In dark mode the sky is brown and the ground stays green.
- Large headings are near-black in light mode and near-white in dark mode on every page.
- All text colors follow the theme.
- Footer verse: 1 Corinthians 16:14.

### Confirmed copy

- Verse (NIV): "Do everything in love." 1 Corinthians 16:14.
- Homepage description: "Computer engineering grad from Waterloo. My faith, my work, and a few things I enjoy."

## Constraints (unchanged)

- Static Next.js export, App Router, TypeScript. No server features.
- Copy rules from `AGENTS.md`: Malcolm's voice, no en or em dashes in prose (work date ranges excepted), "neighbor", no phone numbers or emails, approved gospel and testimony wording preserved.
- Photos stay labeled placeholders until Malcolm supplies them.
- Contact form behavior (native POST to Formspree) unchanged.
- Malcolm stages, commits, and pushes.

## Visual system

### Color tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--sky` | `#E8D9BF` | `#1B1712` | Page background |
| `--heading` | `#1F150E` | `#FBF4E8` | Large headings (h1, h2) |
| `--ink` | `#33241A` | `#E9DCC5` | Body text, h3 |
| `--ink-soft` | `#644C3B` | `#B4A891` | Secondary text, metadata |
| `--brick` | `#9A3324` | `#E58A76` | Links, greeting name accent |
| `--olive` | `#4D5E34` | `#A7B884` | Primary action text/fill |
| `--ground` | `#4D5E34` | `#2C3523` | Hill wave and footer band |
| `--ground-ink` | `#F1E6D2` | `#E9DCC5` | Text on the ground band |
| `--ground-soft` | `#DCD3BC` | `#C9BEA6` | Secondary text on the band |
| `--ground-link` | `#F1C7A4` | `#E58A76` | Links on the band |
| `--placeholder` | `#DCC9A8` | `#2A221B` | Photo placeholders |
| `--rule` | `#CDB995` | `#3A3027` | Hairline dividers |
| `--field` | `#F1E6D2` | `#241E18` | Form fields |
| `--sun` | `#E3B562` | n/a | Sun |
| `--moon` | n/a | `#E9DCC5` | Moon and stars |

All text pairs were checked for WCAG AA. The lowest are brick on sky at 5.3:1 (light) and brick on ground at 5.0:1 (dark).

### Typography

- Headings: Fraunces (variable, `SOFT` 100, `WONK` 1, weight 600), loaded with `next/font/google`.
- Body: Hanken Grotesk 400 and 500, base size 18px, line height about 1.6, measure about 65ch. Chosen over ABC Monument Grotesk (paid, common on AI startup sites).
- Greeting: Fraunces at about `clamp(56px, 9vw, 112px)`.
- Removed: Young Serif and Figtree.

### Shape and motion

- No cards, pills, or boxed tiles. Sections separate with space and hairline rules.
- Photo placeholders use soft irregular rounded shapes (asymmetric border radii), labeled "photo coming soon" or "photos coming".
- A hill-wave SVG flows into the ground band at the bottom of every page.
- Theme transitions crossfade colors for about 0.8s. All motion is disabled under `prefers-reduced-motion`.

## Theme behavior

- `<html data-theme="light|dark">`. CSS tokens switch on that attribute.
- An inline script in `<head>` runs before paint. It reads `localStorage` (`theme`); if no value is stored, it uses `prefers-color-scheme`. This avoids a flash of the wrong theme. `suppressHydrationWarning` goes on `<html>`.
- The toggle offers only light and dark. Choosing one stores it. With nothing stored, the site follows system changes live.
- Storage access is wrapped in try/catch. If storage fails, the site still follows system preference.

## Gimmick 1: sunset toggle (all pages)

- A small sun sits in the top-right corner of the header with an italic "click me" label beside it. The label hides once the visitor has toggled once (`localStorage` flag).
- Clicking the sun sets it: it slides down and fades, the moon and a few stars fade in, and the theme switches to dark. Clicking the moon reverses this.
- It's a real `<button>` with `aria-label` "Switch to dark theme" or "Switch to light theme", a visible focus ring, and a 44px hit area.
- Reduced motion: the icon swaps instantly.

## Gimmick 2: streamed greeting (homepage only)

- "Hi, I'm Malcolm." appears token by token (`Hi` `,` ` I` `’m` ` Mal` `colm` `.`) at about 90 to 180ms per token. A small readout below shows `N tokens · X tok/s`, then `7 tokens · done`.
- It plays once per browser session (`sessionStorage`). Later visits and reduced motion show the full greeting instantly with no readout.
- The full greeting text is in the HTML for SEO and screen readers. The animation is a visual layer only (`aria-hidden` tokens over a visually hidden real heading, or equivalent).

## Pages

### Shared shell

- Header: "Malcolm Shi" wordmark (Fraunces), nav links, the sun toggle in the corner. The current page is marked by a brick underline, not a pill. Mobile keeps the existing menu collapse, and the toggle stays visible outside the menu.
- Footer: the hill wave flows into the ground band, which holds the wordmark, LinkedIn and GitHub links, and the verse with its reference.

### Home (`/`)

- First viewport: the streamed greeting with "Malcolm." in brick, the short description, and a "See my work" link. A large irregular photo placeholder sits on the right. On mobile the photo goes below the text.
- Below, on the ground band: The Good News and Work as two loose entries (title, one line, link), then "Also: About · Blog · Photos · Contact", then the verse.

### The Good News, About, Blog

- Calm reading pages: a large title, small metadata (for example "About 5 minutes"), body at 18px within the measure, Scripture and other links in brick.
- About gets one irregular photo placeholder.
- Copy is unchanged.

### Work

- The intro and the résumé link come first.
- Projects, Experience, and Education appear as open rows separated by hairlines. Each row has the title (and role in soft text) with the date right-aligned, then the description, then the tech as plain soft text.
- No tag pills.

### Photos

- The free-flowing page. The three albums (WBC, Grad Trip, UWCCF) are large irregular placeholders at staggered heights and widths, each with a title and its existing one-line description. On mobile they stack in a single column with alternating alignment.

### Contact

- LinkedIn and GitHub links, then the Formspree form. Fields use `--field` and `--rule` with a 10px radius. The send button is an olive fill with sky-colored text.
- Behavior and endpoint unchanged.

## Housekeeping

- Update `.impeccable/surfaces/src-app-page-tsx.md` (the direction contract) and the visual direction line in `PRODUCT.md` to match this spec.
- Run the Impeccable detector on changed UI, then generate `DESIGN.md` from the shipped result.

## Testing

- `npm run typecheck`, `npm run test:export`, `npm run build` pass.
- Visual check of every page at desktop (1280) and mobile (375) in both themes.
- Theme: first load follows the system setting. The toggle persists across pages and reloads. No flash of the wrong theme on load.
- Greeting: streams on the first visit, is instant on a revisit within the same session and under reduced motion, and the heading text is present in the exported HTML.
- Keyboard: the toggle is reachable, labeled, and shows focus.
- Contrast spot-check of headings, links, and band text in both themes.

## Out of scope

- Real photos and album pages.
- Copy rewrites beyond the homepage description.
- The résumé update and Search Console.
