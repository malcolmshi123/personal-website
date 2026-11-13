---
name: Malcolm Shi
description: A warm, free-flowing personal site under a canyon sky, with a sunset theme toggle.
colors:
  sky: "#e8d9bf"
  heading: "#1f150e"
  ink: "#33241a"
  ink-soft: "#644c3b"
  brick: "#933f2a"
  olive: "#4d5e34"
  ground: "#4d5e34"
  ground-ink: "#f1e6d2"
  ground-soft: "#dcd3bc"
  ground-link: "#efcfaa"
  placeholder: "#dcc9a8"
  rule: "#cdb995"
  field: "#f1e6d2"
  sun: "#e3b562"
  moon: "#e9dcc5"
  sky-dark: "#1b1712"
  heading-dark: "#fbf4e8"
  ink-dark: "#e9dcc5"
  ink-soft-dark: "#b4a891"
  brick-dark: "#df937a"
  olive-dark: "#a7b884"
  ground-dark: "#2c3523"
  ground-ink-dark: "#e9dcc5"
  ground-soft-dark: "#c9bea6"
  ground-link-dark: "#df937a"
  placeholder-dark: "#2a221b"
  rule-dark: "#3a3027"
  field-dark: "#241e18"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(56px, 8.5vw, 96px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(44px, 6vw, 72px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(28px, 3vw, 36px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-row:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(22px, 2.2vw, 26px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  quote:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(22px, 2.4vw, 27px)"
    fontWeight: 400
    lineHeight: 1.45
  lead:
    fontFamily: "Hanken Grotesk, Segoe UI, sans-serif"
    fontSize: "clamp(18px, 1.6vw, 21px)"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Hanken Grotesk, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
  meta:
    fontFamily: "Hanken Grotesk, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"tnum\""
rounded:
  focus: "4px"
  control: "10px"
  organic-hero: "48% 48% 10% 36% / 40% 40% 8% 30%"
  organic-portrait: "44% 44% 12% 30% / 36% 36% 10% 26%"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  shell: "1280px"
  reading: "760px"
  measure: "65ch"
  page-block: "clamp(40px, 6vw, 88px)"
  section: "clamp(48px, 6vw, 72px)"
  footer-gap: "clamp(72px, 10vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.sky}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 28px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "8px 4px"
  nav-link-active:
    textColor: "{colors.ink}"
  link-inline:
    textColor: "{colors.brick}"
  link-ground:
    textColor: "{colors.ground-link}"
  ground-band:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ground-soft}"
  photo-placeholder:
    backgroundColor: "{colors.placeholder}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.organic-hero}"
    padding: "28px"
---

# Design System: Malcolm Shi

## Overview

**Creative North Star: "The Canyon Hillside"**

The page is a landscape. A tan sky fills the top, ink in espresso browns sits on it, and every page ends where an olive hill rolls in and flattens into a ground band that holds the footer. At night the sky turns brown and the ground goes to moss; the hill stays. The structure is the land itself, so content sits in open air on the sky, separated by space and the occasional hairline, and never boxed into cards.

Type does the talking. Lora, a calligraphic old-style serif set at 600, gives headings a hand-made warmth, and Hanken Grotesk at a generous 18px keeps the reading calm. Color is sparing: sienna brick marks things you can follow (links, the current page, the name in the greeting), olive marks the one thing you can press. Photos, until they exist, are irregular soft blobs in a slightly deeper tan, labeled plainly.

One small moment carries the personality: the sun in the header sets into a moon and stars when you switch to dark. Everything else holds still, including the homepage greeting, which is plain type. The site explicitly rejects the split-hero card template, pills, Young Serif, and cream-and-terracotta.

**Key Characteristics:**
- Sky above, ground below: a hill-wave SVG flowing into a solid ground band closes every page.
- Light and dark only, switched by `data-theme` on the root, crossfading over 800ms.
- Flat. No shadows anywhere; depth comes from the sky and ground planes.
- Open rows and space instead of cards; hairline rules where a list needs them.
- Lora 600 with negative tracking on every heading, no variation axes; Hanken Grotesk body at 18px.
- Soft, asymmetric organic shapes for every photo slot.

## Colors

An earthy canyon palette: tan, espresso, sienna, and olive by day; brown night sky, cream ink, pale clay sienna, and moss by night. Every token has a light value and a dark value (the `-dark` keys), switched on `:root[data-theme="dark"]`.

### Primary
- **Sienna Brick** (`brick`, dark: `brick-dark`): A burnt sienna by day (#933f2a, 4.8:1 on sky) and a pale clay by night (#df937a, 7.6:1 on the night sky). Links in reading content, the current-page underline in the nav, the "Malcolm!" accent in the greeting, the gospel quote mark, focus outlines, and the text caret in form fields. It is the color of anything you can follow.

### Secondary
- **Olive** (`olive`, dark: `olive-dark`): The one filled action (the contact send button), the skip link fill, and the native `accent-color`. It marks what you can press or the primary next step.

### Tertiary
- **Ground** (`ground`, dark: `ground-dark`): The hill wave and the ground band beneath it. In light mode it matches olive exactly; in dark mode it deepens to moss while olive brightens, so the band reads as land and not as a button.
- **Ground Ink, Ground Soft, Ground Link** (`ground-ink`, `ground-soft`, `ground-link` and their dark pairs): The text set for anything on the band. Headings and names in ground ink, running text in ground soft, links in ground link (pale apricot #efcfaa by day, the same clay as `brick-dark` by night).
- **Sun and Moon** (`sun`, `moon`): Only for the theme toggle glyphs. Sun also fills `::selection`, with near-black text in both themes.

### Neutral
- **Tan Sky** (`sky`, dark: `sky-dark`): The page background. Also the text color on olive fills.
- **Espresso Heading** (`heading`, dark: `heading-dark`): h1 and h2 only. Near-black by day, near-white by night.
- **Espresso Ink** (`ink`, dark: `ink-dark`): Body copy, h3, form labels and values.
- **Soft Ink** (`ink-soft`, dark: `ink-soft-dark`): Introductions, metadata, dates, nav at rest, placeholder labels.
- **Placeholder Tan** (`placeholder`, dark: `placeholder-dark`): Photo placeholder fill.
- **Hairline** (`rule`, dark: `rule-dark`): 1px row dividers, field borders, the scrollbar thumb.
- **Field** (`field`, dark: `field-dark`): Form field backgrounds.

### Named Rules
**The Follow and Press Rule.** Brick means "follow this"; olive means "press this" or "go here next". Never swap them, and never use either as a decorative fill.

**The Two-Theme Rule.** Every new color is added as a pair, light on `:root` and dark on `:root[data-theme="dark"]`. There is no system or third theme; the root attribute is always `light` or `dark`.

**The Band Has Its Own Ink Rule.** Text on the ground band uses only the `ground-*` tokens. Sky-side tokens (`ink`, `brick`) never appear on the band.

## Typography

**Display Font:** Lora (with Georgia, serif), variable weight 400 to 700, loaded through `next/font/google` as `--font-lora`; no variation axes are set
**Body Font:** Hanken Grotesk (with Segoe UI, sans-serif)

**Character:** A brushed, calligraphic old-style serif that feels written by a person, over a clean, friendly grotesk that stays out of the way. The serif carries every heading, the wordmark, the footer name, the gospel quotes, and the italic "click me".

### Hierarchy
- **Display** (600, `clamp(56px, 8.5vw, 96px)`, 1, -0.02em): The homepage greeting only, capped at 9ch.
- **Headline** (600, `clamp(44px, 6vw, 72px)` on inner pages, up to 84px by default, 1.04, -0.03em): Page titles, capped at 16ch, balanced.
- **Title** (600, `clamp(28px, 3vw, 36px)`, 1.2): Section headings in prose. Homepage band entries run larger (`clamp(28px, 3vw, 40px)`, 1.1) in ground ink; album titles sit at `clamp(24px, 2.4vw, 30px)`.
- **Title Row** (600, `clamp(22px, 2.2vw, 26px)`, 1.25): Work and article row titles, with the date right-aligned beside them.
- **Quote** (Lora 400, `clamp(22px, 2.4vw, 27px)`, 1.45): Gospel quotes in heading color, with a 72px brick opening quote mark hung in the margin.
- **Lead** (400, `clamp(18px, 1.6vw, 21px)`, 1.65): Page introductions in soft ink, max 34em. The homepage description runs at `clamp(19px, 1.7vw, 22px)`, max 30em.
- **Body** (400, 18px, 1.6; 1.75 inside prose, max 65ch): All running text.
- **Label** (500, 16px): Nav links (17px in the mobile menu), form labels, the resume link, the send button.
- **Meta** (400, 15px, tabular numerals for dates): Dates, reading time, figcaptions, scripture link lists. 14px for album placeholder labels and the footer verse, quote and reference alike.

### Named Rules
**The Lora Weight Rule.** Headings, the wordmark, and the footer name are Lora 600 with negative tracking (-0.015em to -0.03em) that grows with size; quotes are Lora 400. Lora is used as shipped, with no `font-variation-settings`.

**The Heading Color Rule.** h1 and h2 take `heading`; h3 takes `ink`. On the band, headings take `ground-ink`.

## Layout

A single centered shell, max 1280px, with fluid side gutters of `clamp(20px, 5vw, 72px)`. Reading pages (The Good News, Blog, Work) narrow to 760px with prose at 65ch; Photos widens to 1120px. Pages open with `clamp(40px, 6vw, 88px)` of vertical padding, and prose sections are spaced `clamp(48px, 6vw, 72px)` apart. The footer sits `clamp(72px, 10vw, 128px)` below content, except on the homepage, where the ground section bleeds full width and the footer band continues it seamlessly with no second hill.

Composition is loose rather than gridded. The homepage hero is a 1.3fr / 1fr split with the greeting on the left and a portrait blob on the right; the two band entries sit side by side with their titles level, and each link sits 18px under its own text. The photo albums use uneven columns (1.2fr, 1fr, 1.1fr) at staggered heights. Lists (work, articles) are open rows with a 1px hairline above each.

There is one breakpoint, 760px. Below it the hero, band entries, and albums stack into one column; albums take 85% width and alternate alignment; the nav collapses behind a Menu button while the sun toggle stays visible in the header.

## Elevation & Depth

Completely flat: there is no `box-shadow` in the system. Depth is the landscape itself, a sky plane on top and a ground plane at the bottom, joined by the hill-wave curve. Inside the sky, separation comes from space, soft-ink color, and 1px hairlines.

### Named Rules
**The Flat Land Rule.** No shadows, glows, or raised surfaces. If something needs to stand apart, give it space or move it onto the ground.

## Shapes

Two shape families. Interactive controls are gently rounded: form fields and the send button at 10px, the skip link at 8px, focus outlines drawn with a 4px radius and 4px offset. Photo slots are organic, each with its own asymmetric elliptical radius so no two look stamped from the same mold (hero `48% 48% 10% 36% / 40% 40% 8% 30%` and three different album shapes). The hill wave is a single smooth cubic curve stretched to full width at `clamp(40px, 6vw, 90px)` tall.

### Named Rules
**The No Two Alike Rule.** Every photo placeholder gets its own irregular radius and aspect ratio (4:5, 5:6, 1:1). Never reuse one shape for a set.

## Components

### Buttons
Quiet and solid, used once per page at most.
- **Shape:** gently rounded (10px), min height 48px.
- **Primary:** olive fill with sky text, padding 12px 28px, weight 500.
- **Hover / Focus:** fill mixes 18% toward ink over 200ms on the shared ease-out curve; focus draws a 2px brick outline.

### Inputs / Fields
- **Style:** field background, 1px hairline border, 10px radius, padding 12px 16px, body type, brick caret.
- **Hover:** border darkens to soft ink.
- **Focus:** border and a 2px outline both turn brick, outline offset 2px.
- **Labels:** stacked above the field, 16px weight 500 in ink, 24px between fields.

### Links
- **In the sky:** inherit color with a 1px underline offset 4px. In prose, links are brick and thicken to 2px on hover. Blog titles are heading color with no underline until hover, when they turn brick and underline.
- **On the band:** ground link color, weight 500, hover to ground ink.
- **Homepage next step:** "Contact me" links to Contact in brick, like every other link on the sky, with a 1px underline that thickens on hover.

### Navigation
- **Desktop:** wordmark (Lora 24px, weight 600, heading color) on the left; nav links in soft ink at 16px weight 500 with a 1.5px transparent bottom border. Hover lifts to ink; the current page shows ink text over a brick underline. All transitions 200ms on `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Mobile (760px and below):** wordmark 21px, a Menu / Close button with a plus or minus stroke icon, and the nav opening below as a stacked list of 17px links; the current page turns brick instead of underlined. Escape closes the menu and returns focus.

### Sunset Toggle (signature)
A 32px sun in sun yellow sits beside the nav with an italic Lora "click me" hint (15px, soft ink, brick on hover). The hint disappears for good after the first toggle. Switching to dark slides the sun down 22px and fades it while a masked crescent moon and three small stars fade in, all on the 800ms theme fade. Hit area is at least 44px square, and the label reads "Switch to dark theme" or "Switch to light theme". Under reduced motion the swap is instant.

### Greeting
"Hi, I’m Malcolm!" as a static h1 in display type, heading color, with "Malcolm!" in brick. Below it the homepage description sits in soft ink at `clamp(19px, 1.7vw, 22px)`, line height 1.55, max 30em, followed by a brick "Contact me" link. "write" and "photos" inside the description link to Blog and Photos in brick. Nothing animates here.

### Hill Wave and Ground Band (signature)
The hill-wave SVG fills with ground and sits flush on the ground band (1px overlap to avoid a seam). The band holds the footer: the Lora name (22px, weight 600, ground ink), the verse and its reference on one 14px Hanken Grotesk line (quote in ground ink, reference in ground soft), and LinkedIn and GitHub links. The verse line reads “Do everything in love.” 1 Corinthians 16:14, with the reference set apart by its smaller size and no dash, following the no-dash rule for site copy. On the homepage the band starts mid-page and holds The Good News and Work as two loose entries, then flows straight into the footer; the nav covers the other pages.

### Photo Placeholder
Placeholder tan fill, soft-ink 14 to 15px label pinned to the bottom center ("photo coming soon"), organic radius per the No Two Alike Rule. Its background follows the theme fade.

### Rows (Work and Articles)
Open rows with a 1px hairline on top and 24px above the content. The head line puts the title on the left and a 15px tabular date on the right, wrapping when narrow. Role and tech follow in soft ink at 16px and 15px. No tags or chips.

## Do's and Don'ts

### Do:
- **Do** define every color as a light and dark pair and read it through `var(--token)`, so the 800ms theme fade carries it.
- **Do** close every page with the hill wave flowing into the ground band, and use only `ground-*` tokens for text on the band.
- **Do** set Lora headings at weight 600 with negative tracking, and leave its variation settings alone.
- **Do** separate content with space and 1px `rule` hairlines.
- **Do** use brick for links and the current page, olive for the single primary action.
- **Do** give every photo slot its own irregular radius and a plain label until a real photo exists.
- **Do** keep motion to the theme fade, 200ms state changes on `cubic-bezier(0.16, 1, 0.3, 1)`, and the sunset toggle, all disabled under `prefers-reduced-motion`.
- **Do** keep a visible 2px brick focus outline and 44px minimum hit areas on header controls.

### Don't:
- **Don't** use content cards, tiles, or bordered boxes around sections; the only bordered boxes are form controls.
- **Don't** use pill shapes for links, tags, or the current-page marker.
- **Don't** add shadows, glows, or gradients.
- **Don't** build a split-hero card template, or use Young Serif or a cream-and-terracotta scheme.
- **Don't** add a third "system" theme option; the root theme is always `light` or `dark`.
- **Don't** put brick or ink text on the ground band.
- **Don't** add more animated moments; the sunset toggle is the only one.
