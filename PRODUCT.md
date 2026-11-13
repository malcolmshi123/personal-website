# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People curious about Malcolm: friends, people from church and fellowship, recruiters and engineers, and anyone he shares the link with. They arrive from a direct link, a résumé, LinkedIn, or GitHub, and they want to know who he is.

## Product Purpose

Malcolm's personal site brings together his Christian faith, engineering work, writing, and photography. Success is a visitor leaving the homepage with a real sense of who Malcolm is as a person.

## Positioning

One site that holds both a serious engineering record (GPU performance, LLM inference, rendering) and a sincere, long-form account of his faith and testimony, written in his own voice. Neither side is hidden and neither is pushed on the visitor.

## Operating Context

- Static Next.js (App Router) and TypeScript site, exported to `out/`, hosted on Vercel at https://malcolmshi.ca/.
- Pages: The Good News (`/gospel/`), Work, Blog, Gallery (`/photos/`), Contact. The About page was folded into the homepage on 2026-11-12.
- Contact uses a native HTML form posting to Formspree.
- Blog entries live in `src/content/blog.ts` and currently link to Medium.

## Capabilities and Constraints

- Malcolm handles staging, commits, and pushes. Work proceeds in commit-sized increments with review between them.
- No phone numbers or email addresses in published content or the downloadable résumé.
- No en or em dashes in prose, except work date ranges. American spelling of "neighbor."
- Photos are on hold until Malcolm supplies them. Use labeled placeholders until then.

## Brand Commitments

- Copy is conversational and sounds like Malcolm talking to a visitor. No slogans, vague metaphors, or promotional filler.
- Approved gospel and testimony wording is preserved unless Malcolm asks for a change.
- Visual direction (v2, 2026-11-12): free-flowing personal site with a greeting first, Canyon palette (tan sky, espresso ink, brick, olive ground; brown night sky over moss ground in dark mode), Lora headings and Hanken Grotesk body, sienna brick accents, and a sunset light/dark toggle. Must not look AI-generated or like Claude: no split-hero card templates, pills, Young Serif, or cream-and-terracotta. Spec: docs/superpowers/specs/2026-11-12-site-revamp-design.md.

## Evidence on Hand

- Gospel and testimony copy: `src/content/gospel.ts`.
- Work history, project, and education: `src/content/work.ts`; résumé at `public/resume.pdf`.
- One blog post on Medium ("my testimony!").
- No photographs yet, including no headshot. Do not generate or present imagery as Malcolm's own photos.
- No invented biography, article titles, or professional claims.

## Product Principles

1. Show the whole person. Faith, work, and interests sit together as one life.
2. Balance. Faith is never hidden or downplayed, and never preachy or pushed.
3. Personal over template. Nothing should read like a generic developer portfolio.
4. Calm, finished craft. Restraint in motion, but no plain or unfinished corners.
5. Malcolm's words lead. Design serves his writing.
