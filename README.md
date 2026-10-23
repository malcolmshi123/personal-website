# Personal Website

Malcolm Shi

## Development

Requires Node.js 22 LTS or newer supported LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 to view the site.

```sh
npm run typecheck
npm run build
```

The production build exports static HTML, CSS, and JavaScript to `out/`. Deploy
that directory to a static host; a Next.js server is not required. Typography uses
system fonts, so builds do not need to download fonts.

The build also fixes nested prefetch filenames produced by Next.js on Windows.
This keeps page navigation working on static hosts. On exports with correct
filenames, this step makes no changes. Run `npm run test:export` to check it.

The site currently includes the welcome, About, Gospel, Blog, Work, Photos, and
Contact pages. Page wording and the curated article list
live in `src/content/`. Add future Medium articles to `src/content/blog.ts`.
Work experience and projects live in `src/content/work.ts`.
Planned photo albums live in `src/content/photos.ts`. Their covers are labeled
placeholders until photographs are supplied; the albums do not open yet.
Contact profile links live in `src/content/contact.ts`. The contact form posts to
Formspree and opens its response page. The receiving email is managed in the
Formspree dashboard and is not included in the site source.
The Work page links to `public/resume.pdf`, compiled from `resume/main.tex` with
phone and email removed. Recompile that source and replace the PDF when updating
it. Preserve the private original and check the PDF text and link annotations as
well as its appearance.
See `CONTENT_REVIEW.md` for draft wording to review before launch.

Production metadata uses `https://malcolmshi.ca` in `src/lib/site-metadata.ts`.
The static export includes `sitemap.xml`, `robots.txt`, and a shared social card
at `public/social-card.png`. Its editable source is `assets/social-card.svg`.

## Planned implementation

- Next.js, TypeScript, and the App Router, with static export.
- Warm editorial design with a photo-led welcome.
- About, Work, Blog, and Photos navigation, plus Contact.
- A separate Gospel page linked from About.
- Photography albums by trip or theme, including Food.
- Curated links to Medium articles.
- A downloadable resume without phone or email.
- A Formspree contact form, with LinkedIn and GitHub links.
- Custom-domain selection before launch.
