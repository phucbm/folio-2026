# phucbm-folio-2026

[![Astro](https://img.shields.io/badge/Astro-6-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![TinaCMS](https://img.shields.io/badge/TinaCMS-3-EC4815?style=for-the-badge&logo=tinacms&logoColor=white)](https://tina.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-84cc16?style=for-the-badge)](./LICENSE)

**Live:** [phucbm.com](https://phucbm.com) · **Repo:** [github.com/phucbm/folio-2026](https://github.com/phucbm/folio-2026)

Portfolio starter combining Astro 6, TinaCMS visual editor, and Cloudflare Pages deployment. Content is edited live in the browser via TinaCMS and committed back to Git — no database required.

## Stack

| Layer | Tech |
|---|---|
| Framework | Astro 6 (SSR, Cloudflare adapter) |
| CMS | TinaCMS (Git-backed, visual editor) |
| Styles | Tailwind CSS 4 via Vite plugin |
| Font | Manrope variable |
| Hosting | Cloudflare Pages + Workers |

## Features

- Visual CMS editing via TinaCMS (`/admin`)
- Git-backed content — no database, no API keys for content
- Block-based pages (Hero, Editorial, Snapshot, Experience, Pill List, Project Cards)
- Work/projects collection with case study pages
- Site-wide config (name, nav, social links, OG image) via CMS
- Light/dark mode with `localStorage` persistence
- Cookie consent system with per-category opt-in
- SEO: canonical URLs, Open Graph, Twitter cards, sitemap, `robots.txt`, JSON-LD
- MDX support
- Cloudflare Pages adapter with image passthrough

## Getting Started

### 1. Clone

```bash
git clone https://github.com/phucbm/folio-2026.git
cd folio-2026
pnpm install
```

### 2. Set env vars

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_TINA_CLIENT_ID=   # from tina.io dashboard
TINA_TOKEN=                   # from tina.io dashboard
SITE_URL=https://your-domain.com
```

`SITE_URL` (or `PUBLIC_SITE_URL`) controls canonical URLs, sitemap, and `robots.txt`. Skip it and the default `phucbm.com` URL is used — set it before deploying.

### 3. Dev server

```bash
pnpm dev
```

Opens Astro dev server with TinaCMS local mode. Visit `/admin` to edit content.

### 4. Build

```bash
pnpm build
```

### 5. Preview

```bash
pnpm preview
```

## TinaCMS Setup

TinaCMS runs in two modes:

| Mode | Command | Data source |
|---|---|---|
| Local | `pnpm dev` | Local filesystem |
| Cloud | production | tina.io cloud (Git sync) |

To enable cloud editing (needed for non-dev deployments):

1. Create a project at [tina.io](https://tina.io)
2. Copy `Client ID` and `Token`
3. Add as env vars (see above)

Schema lives in [`tina/config.ts`](./tina/config.ts).

## Content Structure

```
content/
├── site/         # Global site config (name, nav, social links)
├── pages/        # Block-based pages (home, about, resume, etc.)
├── projects/     # Work case studies
├── posts/        # Blog posts (optional)
```

Edit content:
- **Dev:** `/admin` with local filesystem
- **Production:** `/admin` with tina.io cloud

## Cloudflare Pages Deployment

```bash
pnpm deploy   # runs build + wrangler deploy
```

Or connect the repo to Cloudflare Pages with:

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Node version:** `>=22.12.0`

Add env vars in the Cloudflare Pages dashboard.

## Customization

### Site identity

Edit [`src/config/site.ts`](./src/config/site.ts) for local defaults, or update via TinaCMS at `content/site/config.md`.

Key fields: `name`, `title`, `description`, `email`, `authorName`, `authorRole`, `navLinks`, `socialLinks`.

### Pages and blocks

Pages live in `content/pages/`. Each page is a stack of blocks:

- **Hero** — eyebrow, h1, body, note
- **Editorial** — kicker label + rich text
- **Snapshot** — location, focus, availability, contact
- **Experience** — job list (role, company, dates, description)
- **Pill List** — labeled tag group
- **Project Cards / Project List** — pulls from `content/projects/`

### Work projects

Add a file to `content/projects/`. Set `slug` → creates `/work/{slug}` route automatically.

### Colors and typography

Tailwind config lives inline in [`src/styles/`](./src/styles/). Font is Manrope variable via `@fontsource-variable/manrope`.

## Env Vars Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Cloud only | TinaCMS project client ID |
| `TINA_TOKEN` | Cloud only | TinaCMS read token |
| `SITE_URL` | Recommended | Production URL for SEO metadata |
| `PUBLIC_SITE_URL` | Alternative | Same as `SITE_URL` (public prefix) |

## Cookie Consent

Built-in consent system (no third-party library):

- Bottom banner on first visit
- Per-category opt-in (essential / analytics / marketing)
- Saved to `localStorage` under `maria-cookie-consent`
- Footer button to reopen preferences

Browser API:

```js
window.mariaCookieConsent.getConsent()
window.mariaCookieConsent.canUse('analytics')
window.mariaCookieConsent.openPreferences()

window.addEventListener('maria:cookieConsentChanged', (e) => {
  if (e.detail.analytics) { /* load analytics */ }
})
```

## License

MIT — see [LICENSE](./LICENSE).

---

## Credits

Based on [Maria](https://github.com/andreialba/maria) by [Andrei Alba](https://github.com/andreialba), licensed MIT.

Additions in this fork:
- TinaCMS integration (visual editor, Git-backed content)
- Cloudflare Pages deployment (`@astrojs/cloudflare` adapter, `wrangler`)
- Block-based page system via TinaCMS schema
- Dynamic `[slug].astro` routing for CMS-managed pages
- Nav links sourced from TinaCMS site config
