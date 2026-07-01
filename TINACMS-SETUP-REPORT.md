# TinaCMS Setup Report

## Outcome

TinaCMS visual editing enabled. Build passes. Deploys as fully static site on Cloudflare Pages.

## What Works

- **Click-to-edit highlights** — click any field in the TinaCMS admin preview to jump to it in sidebar
- **`data-tina-field` attributes** — wired on all editable fields across all pages
- **`TinaIsland` wrapper** — on all content pages (`index`, `about`, `resume`, `work/index`, `work/[slug]`)
- **TinaCMS admin** — available at `/admin/` (local: via `tinacms dev`, production: Tina Cloud)
- **Static build** — `pnpm build` completes clean, outputs to `dist/`

## What Doesn't Work

- **Live iframe content reload** — edits in the sidebar don't instantly rerender the page preview without a refresh. This requires the SSR island route (`experimental_createIslandRoute`) which caused the build conflict. The official `tina-astro-starter` also does not have this feature. Page must be refreshed in the admin preview iframe to see saved content.

## What Changed

### Removed (experimental / non-standard)
- `src/pages/tina-island/[name].ts` — SSR island route (`prerender = false`), root cause of build failure
- `src/lib/islands.ts` — custom `IslandRegistry` + `experimental_createIslandRoute` wiring
- `src/components/islands/` — 5 island fragment components (only used by the deleted registry)

### Updated
- `astro.config.mjs` — `output: 'server'` → `output: 'static'`, removed `adapter: cloudflare()` and its import
- `package.json` — removed `@astrojs/cloudflare` dependency
- `pnpm-lock.yaml` — synced

## Architecture (final)

```
output: 'static'          No adapter needed — CF Pages serves dist/ natively
TinaIsland on pages       Wraps content, activates sidebar click-to-edit
data-tina-field           On all editable elements
requestWithMetadata()     On all page queries (required for TinaIsland)
tinacms dev               Runs local TinaCMS + Astro dev server
npx tinacms build         Generates schema before Astro build (required)
```

## Dev Commands

```bash
pnpm dev      # tinacms dev -c "astro dev" — local editing at localhost:4321/admin/
pnpm build    # npx tinacms build && astro build — production build
```

## Deployment

Push to `main` → Cloudflare Pages picks up `dist/`. No adapter, no Workers, no special config.

Set these env vars in CF Pages dashboard:
- `TINA_TOKEN` — Tina Cloud read token
- `NEXT_PUBLIC_TINA_CLIENT_ID` — Tina Cloud client ID
- `GITHUB_BRANCH` — branch to read content from (optional, defaults to `main`)
- `SITE_URL` or `PUBLIC_SITE_URL` — production URL for SEO/sitemap
