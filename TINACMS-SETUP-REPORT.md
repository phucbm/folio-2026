# TinaCMS + Astro + Cloudflare Workers — Setup Guide

## Stack

```
TinaCMS        Content + visual editor (TinaCloud hosted)
Astro          SSR via @astrojs/cloudflare@13.7.0 (NOT v14+)
CF Workers     Deploy target (NOT CF Pages)
GitHub Actions CI/CD — build + wrangler deploy on push to main
```

---

## Architecture

```
output: 'server'                    SSR required for TinaCMS sidebar injection
adapter: cloudflare()               @astrojs/cloudflare@13.7.0
deploy target: CF Workers           wrangler deploy
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
pnpm exec wrangler deploy           Deploys Worker + static assets together
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
Island HTML fragments are injected via DOM swap — Astro scoped styles (`data-astro-cid-*`) don't apply to swapped elements. Tailwind utility classes are global and survive the swap. No `is:global` needed.

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

## wrangler.toml

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

## Dev Commands

```bash
pnpm dev              # tinacms dev -c "astro dev"
pnpm build            # npx tinacms build && astro build
pnpm exec wrangler deploy   # deploy to CF Workers (manual)
```

---

## Required Env Vars

### CF Workers secrets (wrangler dashboard or `wrangler secret put`)

- `TINA_TOKEN`
- `NEXT_PUBLIC_TINA_CLIENT_ID`
- `GITHUB_BRANCH` (optional, defaults to `main`)

### GitHub Actions secrets (repo Settings → Secrets)

- `CLOUDFLARE_API_TOKEN` — CF token with Workers deploy permissions
- `NEXT_PUBLIC_TINA_CLIENT_ID` — same as above
- `TINA_TOKEN` — same as above

---

## CI/CD: GitHub Actions

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
    paths-ignore:
      - 'content/**'
      - 'public/**'
      - '*.md'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Deploy to Cloudflare Workers
        run: pnpm run build && pnpm exec wrangler deploy
        env:
          NODE_OPTIONS: --max_old_space_size=4096
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          NEXT_PUBLIC_TINA_CLIENT_ID: ${{ secrets.NEXT_PUBLIC_TINA_CLIENT_ID }}
          TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
```

**Why `paths-ignore`:** TinaCMS edits commit to `content/**`. Site is SSR — content fetched at request time from TinaCloud API, no redeploy needed for content changes.

**Why `NODE_OPTIONS: --max_old_space_size=4096`:** Known TinaCMS bug ([#5689](https://github.com/tinacms/tinacms/issues/5689)) — `tinacms build` spikes past Node's default ~1.5GB heap on GH Actions runners. Locally fine because V8 auto-sizes heap to available RAM (Mac 16–32GB → ~4–8GB heap). CI runner has ~7GB total → V8 defaults to ~1.5GB → OOM.

**Why `pnpm exec wrangler`:** `wrangler` is a devDependency. Bare `wrangler` command not in PATH on CI runners; `pnpm exec` resolves from `node_modules/.bin`.

**Why `version: 10` on pnpm/action-setup:** Without it, action errors: `No pnpm version is specified`. Must set via `version` key or `packageManager` field in `package.json`.

---

## Visual Editor Setup

### Step 1 — Add `ui.router` to every collection in `tina/config.ts`

```ts
// hero collection
ui: { allowedActions: { create: false, delete: false }, router: () => '/' }

// about collection
ui: { allowedActions: { create: false, delete: false }, router: () => '/about' }

// resume collection
ui: { allowedActions: { create: false, delete: false }, router: () => '/resume' }

// siteConfig collection
ui: { allowedActions: { create: false, delete: false }, router: () => '/' }

// projects collection
ui: { router: ({ document }) => `/work/${document._sys.filename}` }
```

### Step 2 — Island components

`src/components/islands/` — one Astro component per page. Pure Tailwind only (no scoped `<style>`).

```astro
---
import { tinaField } from '@tinacms/astro/tina-field';
const { data } = Astro.props;
---
<h1 data-tina-field={tinaField(data, 'headline')}>{data.headline}</h1>
<p data-tina-field={tinaField(data, 'subtext')}>{data.subtext}</p>
```

Islands: `HeroIsland`, `AboutIsland`, `ResumeIsland`, `ProjectIsland`, `WorkIsland`, `FooterIsland`

### Step 3 — Island registry (`src/lib/islands.ts`)

```ts
import type { IslandRegistry } from '@tinacms/astro/experimental';
import HeroIsland from '../components/islands/HeroIsland.astro';
// ... other imports

export const islands: IslandRegistry = {
  hero: {
    fetch: () => client.queries.hero({ relativePath: 'index.md' }),
    component: HeroIsland,
    wrapper: { tag: 'section' },
    propsFromData: (data) => ({ data: data.data?.hero }),
  },
  // ... other islands
};
```

### Step 4 — Island route (`src/pages/tina-island/[name].ts`)

```ts
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/islands';
export const { GET, POST } = experimental_createIslandRoute(islands);
```

### Step 5 — Wrap pages with `<TinaIsland>`

```astro
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import HeroIsland from '../components/islands/HeroIsland.astro';

<TinaIsland name="hero" wrapper={islands.hero.wrapper} params={{}} primary>
  <HeroIsland data={hero} />
</TinaIsland>
```

### Step 6 — Register islands in `astro.config.mjs`

```js
import tina from '@tinacms/astro/integration';
import { islands } from './src/lib/islands';

tina({ islands })
```

---

## Known Constraints

### @astrojs/cloudflare version lock at 13.7.0

v14 introduced `@cloudflare/vite-plugin` as prerenderer. Sets `ssr: true` on Vite build config → throws:
```
rollupOptions.input should not be an html file when building for SSR.
```
Fires when prerendered HTML pages coexist with any SSR route (which TinaCMS island endpoint requires). Stay on v13.7.0.

### CF Pages incompatible

- CF Pages rejects `ASSETS` binding as reserved name
- CF Pages rejects config with both `main` and `pages_build_output_dir`
- Without `wrangler.toml`, `nodejs_compat` not applied → `node:async_hooks` error
- No clean path on CF Pages with this adapter. Use CF Workers only.

### @tailwindcss/vite incompatible

`@tailwindcss/vite@4.3.2` incompatible with Vite 8 (bundled in astro@6.4.8):
```
[@tailwindcss/vite:generate:build] Missing field `tsconfigPaths`
```
Fix: use `@tailwindcss/postcss` via `postcss.config.mjs`.

### node:fs unavailable in CF Workers prerender sandbox

Files read via `node:fs` / `readFileSync` fail in miniflare. Use Tina client queries instead.

### TinaCMS OOM in CI (open bug #5689)

Memory spike after sourcemap regression. Workaround: `NODE_OPTIONS=--max_old_space_size=4096`. Not fixed upstream as of 2026-07-02.
