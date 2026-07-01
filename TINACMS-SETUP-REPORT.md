# TinaCMS Setup Report

## Current Status (2026-07-01) ✓ FULLY WORKING

- **Build**: passes locally and on CF Workers ✓
- **Click-to-edit highlights**: visible in admin iframe ✓
- **Sidebar fields on click**: working ✓
- **Live iframe DOM swap on keystroke**: working ✓
- **Deployed site**: https://phucbm-com-2026.bmp.workers.dev ✓

---

## Final Architecture

```
output: 'server'                    @astrojs/cloudflare adapter (SSR)
adapter: cloudflare()               @astrojs/cloudflare@13.7.0
deploy target: CF Workers           NOT CF Pages — adapter no longer supports CF Pages
wrangler.toml                       main = "@astrojs/cloudflare/entrypoints/server"
                                    assets.directory = "./dist"
                                    compatibility_flags = ["nodejs_compat"]
TinaIsland on pages                 Wraps editable content sections
data-tina-field                     On all editable elements
requestWithMetadata()               On all SSR page queries
src/lib/islands.ts                  IslandRegistry — component + fetch + propsFromData per island
src/components/islands/             One .astro island component per page (pure Tailwind, no scoped styles)
src/pages/tina-island/[name].ts    SSR route: experimental_createIslandRoute(islands)
@tailwindcss/postcss                Via postcss.config.mjs (not vite plugin)
npx tinacms build                   Generates schema/client before astro build
npx wrangler deploy                 Deploys Worker + static assets together
```

### How live visual editing works

1. Editor keystroke → Tina admin posts `updateData` to page iframe via `postMessage`
2. Bridge POSTs overlay data to `/tina-island/<name>`
3. `experimental_createIslandRoute` calls `island.fetch()` with overlay, passes result to `island.propsFromData()`, renders `island.component` via `AstroContainer`, returns HTML fragment
4. Bridge swaps fragment into live DOM — no full page reload

**Key constraint:** TinaCMS sidebar injection is gated in middleware:
```ts
if (context.isPrerendered) {
  context.locals.tinaEdit = false;
  return next(); // no form divs injected → sidebar empty
}
```
All content pages must be SSR (`prerender` removed) for sidebar to work.

**Why pure Tailwind in island components:**
Island HTML fragments are injected via DOM swap — Astro scoped styles (`data-astro-cid-*`) don't apply to swapped elements. Tailwind utility classes are global by definition and survive the swap. No `is:global` needed.

**Why CF Workers not CF Pages:**
`@astrojs/cloudflare` adapter docs explicitly state it no longer supports CF Pages.
CF Pages rejects the adapter-generated `dist/server/wrangler.json` (reserved ASSETS binding,
conflicting `main`/`pages_build_output_dir` fields). CF Workers deploys cleanly.

---

## Island Registry

| Island | Page | Fetches |
|--------|------|---------|
| `home` | `/` | hero + projectsConnection (parallel) |
| `about` | `/about` | about |
| `resume` | `/resume` | resume |
| `work` | `/work` | projectsConnection |
| `project` | `/work/[slug]` | projects (by relativePath param) |
| `footer` | all pages | siteConfig |

---

## wrangler.toml (final)

```toml
name = "phucbm-com-2026"
main = "@astrojs/cloudflare/entrypoints/server"
compatibility_date = "2025-05-21"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./dist"
binding = "ASSETS"
```

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
pnpm dev              # tinacms dev -c "astro dev"
pnpm build            # npx tinacms build && astro build
npx wrangler deploy   # deploy to CF Workers
```

## Required Env Vars (wrangler secrets or dashboard)

- `TINA_TOKEN`
- `NEXT_PUBLIC_TINA_CLIENT_ID`
- `GITHUB_BRANCH` (optional, defaults to `main`)
- `SITE_URL` or `PUBLIC_SITE_URL`

---

## Problem History

### Visual editing: live preview not working (2026-07-01)

**Root cause:** `component: null` in all `IslandRegistry` entries.
`experimental_createIslandRoute` calls `container.renderToString(island.component, props)` — with `null` it returns 500, bridge gets no HTML, DOM never swaps.

**Fix:**
- Created `src/components/islands/` with one Astro component per island
- Each component uses pure Tailwind (no scoped `<style>`) so styles survive DOM swap
- Updated `islands.ts` to import and wire each component
- Added missing `footer` island entry
- Fixed `home` island to fetch both hero + projects in parallel (was only fetching hero)
- Pages updated to use island components directly (DRY — same component for initial SSR and live swap)

**Earlier wrong approach:** Used `is:global` style blocks in island components → styles leaked across all pages via shared class names (`.hero-text`, `.project-card`, etc.). Solution: convert all page styles to Tailwind utilities inside island components; delete all page-level `<style>` blocks.

### CF Pages failures (2026-06-30 — 2026-07-01)

All CF Pages attempts failed due to fundamental incompatibility between adapter output and CF Pages validation:
- CF Pages rejects `ASSETS` binding as reserved name
- CF Pages rejects config with both `main` and `pages_build_output_dir`
- CF Pages skips `wrangler.toml` without `pages_build_output_dir` → no Worker deployed → SSR 404
- Without `wrangler.toml`, `nodejs_compat` not applied → `node:async_hooks` error
- No clean path exists on CF Pages with this adapter version

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
Fix: inlined site config values in `src/config/site.ts`, migrated `work/page/[page].astro` to Tina client queries.

**Root cause of empty sidebar:**
Middleware skips form injection on prerendered pages. All content pages had `export const prerender = true` → `data-tina-form` divs never injected into `<head>` → bridge found no forms → sidebar empty.
Fix: removed `prerender = true` from all content pages. Legal/404/robots keep prerender.

### CF adapter version constraint

`@astrojs/cloudflare@14` introduced `@cloudflare/vite-plugin` as its prerenderer. This plugin sets `ssr: true` on the Vite build config, causing Vite to throw:
```
rollupOptions.input should not be an html file when building for SSR.
```
This fires when prerendered HTML pages coexist with any SSR route — including the `prerender = false` island endpoint TinaCMS requires.
Fix: downgraded to `@astrojs/cloudflare@13.7.0`.
