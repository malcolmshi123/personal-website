# Personal website

Malcolm Shi's personal site, live at https://malcolmshi.ca. It's a Next.js App
Router site in TypeScript, exported as static pages and hosted on Vercel.

## Development

Requires Node.js 22.18 or newer and npm (the unit tests and the Thunderstore build
step load TypeScript directly, which needs 22.18).

```sh
npm ci
npm run dev
```

Open http://localhost:3000 to view the site.

Before pushing, run:

```sh
npm run typecheck
npm test
npm run build
npm run test:html
```

`npm test` runs the unit tests in `tests/`. `npm run test:html` runs
`tests/built-site/`, which checks the built pages in `out/`, so run it after
`npm run build`. Build and maintenance tools live in `scripts/`.

## How it's built

The build exports static HTML, CSS, and JavaScript to `out/`, and Vercel serves
that folder (`vercel.json` runs `npm run build`). Headings use Lora and body text
uses Hanken Grotesk, both loaded with `next/font`, which downloads them at build
time and serves them from the site itself.

The build also fixes nested prefetch filenames that Next.js produces on Windows,
so page navigation keeps working once deployed. On exports with correct filenames
this step changes nothing. Run `npm run test:export` to check it.

The site has one server-side piece: `api/thunderstore.mjs`, a Vercel Function that
fetches the GojoBracken download count for the Projects page, since Thunderstore
doesn't let browsers on other sites call its API. The build also saves a count
with `scripts/fetch-thunderstore.mjs`, and `src/content/thunderstore-fallback.json`
covers the case where Thunderstore is unreachable.

## Pages and content

Page wording lives in `src/content/`:

| Page | Path | Content |
| --- | --- | --- |
| Home | `/` | `home.ts` |
| The Good News | `/gospel` | `gospel.ts` |
| Experience | `/work` | `work.ts` |
| Projects | `/projects` | `projects.ts` |
| Blog | `/blog` | Medium feed, see below |
| Gallery | `/photos` | `gallery.json`, see Photos |
| Contact | `/contact` | `contact.ts` |

The navigation and the footer verse are in `site.ts`.

Blog posts come from the Medium feed at build time (`npm run blog:fetch`), with
`src/content/blog-fallback.json` as the offline fallback. A GitHub Action
(`.github/workflows/refresh-blog.yml`) triggers a Vercel rebuild every day at
13:00 UTC through the `VERCEL_DEPLOY_HOOK` secret, so new posts appear on their
own.

The contact form posts to Formspree and opens its response page. The receiving
email is managed in the Formspree dashboard and isn't in the site source.

The resume at `public/resume.pdf` is linked from the Experience page, the Contact
page, and every footer. It's compiled from `resume/main.tex` with phone and email
removed. Recompile that source and replace the PDF when updating it, keep the
private original, and check the PDF's text and link annotations as well as how it
looks.

## Photos

Drop originals into `photo-inbox/`, which git ignores. Photos in `food/` can
appear on the homepage "tasted" card and photos in `places/` on the "seen" card;
every photo, from any folder, appears on the Gallery board. The filename is the
caption, with dashes as spaces (`ichiran-ramen.jpg` becomes "ichiran ramen").

After adding, renaming, or deleting photos, run:

```bash
npm run photos:commit            # rebuild photos, then commit them as "update gallery"
npm run photos:commit -- --push  # same, then push (force-with-lease only when history was rewritten)
npm run photos:commit -- -m "add travel photos"  # fold into a commit with a different message
```

It strips location data, writes 640px and 1280px WebP copies to
`public/photos/board/`, and writes captions to `src/content/gallery.json`. It only
ever stages those two paths. If the latest commit is "update gallery" it amends
it. If that commit is further back, it folds the photos into it and keeps the
commits after it, without checking anything out. Otherwise it makes a new commit.
It stops without changing anything if other files are staged, a rebase is in
progress, or a later commit also changed the photos. `npm run photos` alone
rebuilds the photos without committing.

## Link previews

Production metadata uses `https://malcolmshi.ca` in `src/lib/site-metadata.ts`.
The export includes `sitemap.xml`, `robots.txt`, and the link preview card at
`public/social-card.png`. Its editable source is `assets/social-card.html`; run
`npm run social-card` to re-render it with a local Chrome or Edge.
