# TinaCMS Setup Report

## Current Status (2026-07-01)

- **Build**: passes locally and on CF Pages ✓
- **Click-to-edit highlights**: visible in admin iframe ✓
- **Sidebar fields on click**: empty — not working ✗
- **Live iframe content reload**: not implemented ✗

---

## Problem History

### What we thought was the problem (wrong)
Generated report (not from real logs) claimed `@astrojs/cloudflare@14` introduced `@cloudflare/vite-plugin` which set `ssr: true` causing `rollupOptions.input should not be an html file` error. This was inference, not from actual build output.

### What the real CF Pages build logs showed (2026-06-30)
**Build 1 (c3a5d28):** `ERR_PNPM_OUTDATED_LOCKFILE` — lockfile had `@astrojs/node`, package.json didn't. Lockfile sync issue only.

**Build 2 (d764e5d):**
```
ERROR: Branch 'main' is not on TinaCloud
errorCode: 'ERR_CLOUD_CHECK_FAILED'
```
`npx tinacms build` failed because TinaCloud hadn't indexed `main`. Unrelated to adapter or vite.

### What the actual local build error was (2026-07-01)
```
[@tailwindcss/vite:generate:build] Missing field `tsconfigPaths` on BindingViteResolvePluginConfig.resolveOptions
```
`@tailwindcss/vite@4.3.2` incompatible with `vite@8.1.1` (bundled in `astro@6.4.8`). Documented in [withastro/astro#16542](https://github.com/withastro/astro/issues/16542).

---

## Changes Made (chronological)

### Session 1 — attempted visual editing setup
- Added `TinaIsland`, `data-tina-field`, `requestWithMetadata()` to all pages
- Added `src/pages/tina-island/[name].ts` (SSR island route, `prerender = false`)
- Added `src/lib/islands.ts` + `src/components/islands/` (custom registry)
- `astro.config.mjs`: `output: 'server'`, `@astrojs/cloudflare` adapter

### Session 2 — removed experimental plumbing (based on wrong diagnosis)
- Deleted `src/pages/tina-island/[name].ts`
- Deleted `src/lib/islands.ts`
- Deleted `src/components/islands/` (5 files)
- `astro.config.mjs`: `output: 'static'`, removed adapter
- `package.json`: removed `@astrojs/cloudflare`

### Session 3 — fixed actual build error (2026-07-01)
- Replaced `@tailwindcss/vite` → `@tailwindcss/postcss`
- Added `postcss.config.mjs`
- Removed `tailwindcss()` from `astro.config.mjs` vite plugins
- **Build now passes**

---

## Current Architecture

```
output: 'static'           CF Pages serves dist/ natively, no adapter
TinaIsland on pages        Wraps content sections
data-tina-field            On all editable elements
requestWithMetadata()      On all page queries
npx tinacms build          Generates schema/client before astro build
@tailwindcss/postcss       Via postcss.config.mjs (not vite plugin)
```

---

## Open Problem: Sidebar Empty on Click

### What works
Click-to-edit highlights appear (CSS/DOM via `data-tina-field`) — these need no server.

### What doesn't work
Clicking a highlight doesn't populate the sidebar form. Sidebar stays empty.

### What the docs say is required
From `tina.io/docs/frameworks/astro`: clicking a `tinaField()` element triggers the bridge → calls `src/pages/tina-island/[name].ts` → hydrates sidebar form from schema.

### Why it's broken
We deleted `src/pages/tina-island/[name].ts` in Session 2. That route is required for sidebar population. It needs `prerender = false` (SSR). Current `output: 'static'` cannot serve SSR routes.

### The actual constraint
`output: 'static'` on CF Pages = no SSR routes = no sidebar. This was the correct diagnosis we reached during investigation, but we only got there after making the wrong changes first.

---

## Unresolved Decision

To get sidebar working, need one of:
1. SSR capable platform (the island route must be served dynamically)
2. Keep `output: 'static'` + accept highlights-only (no sidebar)

The original build errors (lockfile, TinaCloud branch not indexed, Tailwind/Vite mismatch) were **all separate from the SSR question**. Now that build passes, the SSR decision is the only remaining blocker for full visual editing.

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
