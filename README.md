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

The site currently includes the welcome page and page shells for About, Work,
Blog, Photos, and Contact, with shared navigation and a mobile menu. Full page
content will be added in later increments.

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
