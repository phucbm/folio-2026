# TinaCMS Visual Editing — Blocker Report

## Goal
Enable click-to-edit / visual editing for all pages via `@tinacms/astro`.

## Root Cause
`@astrojs/cloudflare@14` introduced `@cloudflare/vite-plugin` as its prerenderer. This plugin sets `ssr: true` on the Vite build config, which causes Vite to throw:

```
rollupOptions.input should not be an html file when building for SSR.
Please specify a dedicated SSR entry.
```

This fires whenever prerendered (HTML) pages coexist with any SSR route — including the `prerender = false` island endpoint that TinaCMS requires. The error is in Vite internals (`config.js:33532`), not in user code.

## Why `output: 'server'` doesn't fix it
Even with `output: 'server'` + `export const prerender = true` on all content pages, the cloudflare v14 build pipeline still hits the same error when it tries to bundle the prerendered HTML pages alongside the SSR island route.

## What's already implemented (works, just can't build)
- `TinaIsland` wrapper on all pages (`index`, `about`, `resume`, `work/index`, `work/[slug]`)
- `data-tina-field` + `tinaField()` on all editable fields
- `requestWithMetadata()` on all page queries
- `src/lib/islands.ts` — full island registry (home, about, resume, work, project)
- `src/components/islands/` — all 5 island components
- `src/pages/tina-island/[name].ts` — island route with `prerender = false`
- `astro.config.mjs` — `output: 'server'`, cloudflare adapter, `tina()` integration

## Paths forward

### Option A — Downgrade cloudflare adapter to v13 (quickest)
```bash
pnpm add @astrojs/cloudflare@13.7.0
```
v13 uses the old build pipeline without `@cloudflare/vite-plugin`. Likely works. Risk: missing v14 features (Cloudflare Images, KV sessions).

### Option B — Switch to Vercel adapter (official TinaCMS starter uses this)
The `tina-astro-starter` uses `@astrojs/vercel`. Requires migrating deployment from Cloudflare Pages to Vercel. Full TinaCMS support guaranteed.

### Option C — Wait for cloudflare adapter fix
File issue at `withastro/astro` or `cloudflare/workers-sdk`. No ETA.

### Option D — Skip island live-rerender, keep click-to-highlight only
Remove `src/pages/tina-island/[name].ts`. Build passes. Click-to-highlight and field focusing work in Tina admin. Content doesn't live-update in iframe after edits (requires page refresh). All the `data-tina-field` + `TinaIsland` code stays.

## Current repo state
- `astro.config.mjs`: `output: 'server'`, `@astrojs/cloudflare` (downgraded to v13 during investigation — may need reverting)
- All content pages: `export const prerender = true`
- `robots.txt.ts`: `export const prerender = true`
- `src/pages/tina-island/[name].ts`: exists, `prerender = false`
- Everything compiles — only the Astro build step fails

## Recommended next step
Try **Option A** (cloudflare v13) first — one command, reversible. If v13 build passes, full visual editing works. If Cloudflare Pages deployment then breaks, fall back to Option D.
