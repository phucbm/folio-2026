# TinaCMS Setup Report

## Current Status (2026-07-01)

- **Build**: passes locally and on CF Pages ✓
- **Click-to-edit highlights**: visible in admin iframe ✓
- **Sidebar fields on click**: working ✓
- **Live iframe content reload on keystroke**: working ✓

---

## Final Architecture

```
output: 'server'             CF Pages + @astrojs/cloudflare adapter (SSR)
adapter: cloudflare()        @astrojs/cloudflare@13.7.0
nodejs_compat                Set in CF Pages dashboard → Settings → Functions → Compatibility flags
                             DO NOT add wrangler.toml — CF Pages redirects it to dist/server/wrangler.json
                             which fails validation (cannot have both "main" and "pages_build_output_dir")
TinaIsland on pages          Wraps editable content sections
data-tina-field              On all editable elements
requestWithMetadata()        On all SSR page queries
src/lib/islands.ts           IslandRegistry for live reload route
src/pages/tina-island/       SSR route: experimental_createIslandRoute
@tailwindcss/postcss         Via postcss.config.mjs (not vite plugin)
npx tinacms build            Generates schema/client before astro build
```

**Key constraint:** TinaCMS sidebar injection is gated in middleware:
```ts
if (context.isPrerendered) {
  context.locals.tinaEdit = false;
  return next(); // no form divs injected → sidebar empty
}
```
All content pages must be SSR (`prerender` removed) for sidebar to work.

---

## Problem History

### Real CF Pages build errors (2026-06-30)

**Build 1 (c3a5d28):** `ERR_PNPM_OUTDATED_LOCKFILE` — lockfile had `@astrojs/node`, package.json didn't.

**Build 2 (d764e5d):**
```
ERROR: Branch 'main' is not on TinaCloud
errorCode: 'ERR_CLOUD_CHECK_FAILED'
```
`npx tinacms build` requires `main` branch indexed in TinaCloud dashboard.

### Local build errors (2026-07-01)

**Error 1:**
```
[@tailwindcss/vite:generate:build] Missing field `tsconfigPaths`
```
`@tailwindcss/vite@4.3.2` incompatible with Vite 8 (bundled in astro@6.4.8).
Fix: replaced with `@tailwindcss/postcss` via `postcss.config.mjs`.

**Error 2:**
```
Error: No such module "node:fs"
```
`src/lib/content.ts` used `node:fs` with `readFileSync` — not available in CF Workers prerender sandbox (miniflare).
Fix: inlined site config values in `src/config/site.ts`, migrated `work/page/[page].astro` to Tina client queries. Added `nodejs_compat` to `wrangler.toml`.

**Error 3:**
```
Error: no such file or directory, readAll '/bundle/content/site/config.md'
```
miniflare bundles worker into `/bundle/` — `process.cwd()` resolves wrong path.
Fix: already covered by inlining site config (no more `readFileSync`).

**Root cause of empty sidebar:**
Middleware skips form injection on prerendered pages. All content pages had `export const prerender = true` → `data-tina-form` divs never injected into `<head>` → bridge found no forms → sidebar empty.
Fix: removed `prerender = true` from all content pages. Legal/404/robots keep prerender.

---

## Changes Made (chronological)

### Session 1 — visual editing setup
- Added `TinaIsland`, `data-tina-field`, `requestWithMetadata()` to all pages
- Added `src/pages/tina-island/[name].ts` (SSR island route)
- Added `src/lib/islands.ts` (IslandRegistry)
- `astro.config.mjs`: `output: 'server'`, `@astrojs/cloudflare` adapter

### Session 2 — removed plumbing (wrong diagnosis)
- Deleted island route, registry, island components
- Switched to `output: 'static'`, removed adapter

### Session 3 — fixed Tailwind/Vite error
- Replaced `@tailwindcss/vite` → `@tailwindcss/postcss`
- Added `postcss.config.mjs`

### Session 4 — restored SSR + fixed all build errors
- Restored `islands.ts`, `tina-island/[name].ts`
- Re-added `@astrojs/cloudflare@13.7.0`, `output: 'server'`
- Inlined site config in `src/config/site.ts` (removed `node:fs` dep)
- Migrated `work/page/[page].astro` to Tina client queries
- Fixed `islands.ts` project fetch: `params.get('relativePath')` not `params.get('slug')`
- Removed `export const prerender = true` from all content pages → sidebar now works
- Set `nodejs_compat` in CF Pages dashboard (not via wrangler.toml)

### Session 5 — fixed CF Pages deployment
- Root cause: `wrangler.toml` present → CF Pages redirects to `dist/server/wrangler.json` → validation fails
- `dist/server/wrangler.json` is a Worker config (`main`, `rules`) — CF Pages Pages validator rejects it when `pages_build_output_dir` added, and rejects ASSETS binding as reserved name
- Fix: delete `wrangler.toml` entirely. CF Pages auto-detects Worker from adapter output.
- `nodejs_compat` must be set in CF Pages dashboard, not via `wrangler.toml`

---

## Pages: SSR vs Prerendered

| Page | Mode | Reason |
|------|------|--------|
| `/` | SSR | TinaCMS editable |
| `/about` | SSR | TinaCMS editable |
| `/resume` | SSR | TinaCMS editable |
| `/work` | SSR | TinaCMS editable |
| `/work/[slug]` | SSR | TinaCMS editable |
| `/work/page/[page]` | SSR | TinaCMS editable |
| `/404` | prerender | static |
| `/robots.txt` | prerender | static |
| `/privacy`, `/terms`, `/cookies` | prerender | static |

---

## Dev Commands

```bash
pnpm dev      # tinacms dev -c "astro dev"
pnpm build    # npx tinacms build && astro build
```

## Required Env Vars (CF Pages dashboard)

- `TINA_TOKEN`
- `NEXT_PUBLIC_TINA_CLIENT_ID`
- `GITHUB_BRANCH` (optional, defaults to `main`)
- `SITE_URL` or `PUBLIC_SITE_URL`
