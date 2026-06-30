# TinaCMS Visual Editor Plan

## What "visual editor" means
Side-by-side: left = TinaCMS form, right = live iframe of actual site page. Click element on page → jumps to that field in form.

## Prerequisites
Run once to generate typed client:
```bash
pnpm exec tinacms build
# generates tina/__generated__/client.ts + types.ts
```

---

## Step 1 — Add `ui.router` to every collection in `tina/config.ts`

Tells TinaCMS which URL to iframe when you open a document.

```ts
// hero collection
ui: {
  allowedActions: { create: false, delete: false },
  router: () => '/',
}

// about collection
ui: {
  allowedActions: { create: false, delete: false },
  router: () => '/about',
}

// resume collection
ui: {
  allowedActions: { create: false, delete: false },
  router: () => '/resume',
}

// siteConfig collection
ui: {
  allowedActions: { create: false, delete: false },
  router: () => '/',
}

// projects collection
ui: {
  router: ({ document }) => `/work/${document._sys.filename}`,
  filename: { ... } // keep existing
}
```

---

## Step 2 — Create island components

Each island = stripped Astro component that receives Tina data as props + has `data-tina-field` on every editable element.

### `src/components/islands/HeroIsland.astro`
Props: `data` (hero query result)
Fields: `headline`, `subtext`, `note`

### `src/components/islands/AboutIsland.astro`
Props: `data` (about query result)
Fields: `heroTitle`, `heroText`, `sections[].kicker`, `sections[].body`

### `src/components/islands/ResumeIsland.astro`
Props: `data` (resume query result)
Fields: `heroTitle`, `heroText`, `location`, `focus`, `availability`, `contact`, `experience[].*`, `stack[]`, `clients[]`

### `src/components/islands/ProjectIsland.astro`
Props: `data` (projects query result)
Fields: `name`, `title`, `description`, `caseTitle`, `caseText`, `metaClient`, `metaIndustry`, `metaRegion`, `image`

Example pattern:
```astro
---
import { tinaField } from '@tinacms/astro/tina-field';
const { data } = Astro.props;
---
<h1 data-tina-field={tinaField(data, 'headline')}>{data.headline}</h1>
<p data-tina-field={tinaField(data, 'subtext')}>{data.subtext}</p>
```

---

## Step 3 — Create `src/lib/data.ts`

Replaces current `src/lib/content.ts` (fs-based) with Tina generated client queries for visual editor context. Keep `content.ts` for static build; `data.ts` for island fetches.

```ts
import client from '../../tina/__generated__/client';

export const getHeroData = (relativePath = 'index.md') =>
  client.queries.hero({ relativePath });

export const getAboutData = (relativePath = 'index.md') =>
  client.queries.about({ relativePath });

export const getResumeData = (relativePath = 'index.md') =>
  client.queries.resume({ relativePath });

export const getProjectData = (relativePath: string) =>
  client.queries.projects({ relativePath });
```

---

## Step 4 — Create `src/lib/islands.ts`

Registry mapping name → { fetch, component, wrapper, propsFromData }.

```ts
import type { IslandRegistry } from '@tinacms/astro/experimental';
import HeroIsland from '../components/islands/HeroIsland.astro';
import AboutIsland from '../components/islands/AboutIsland.astro';
import ResumeIsland from '../components/islands/ResumeIsland.astro';
import ProjectIsland from '../components/islands/ProjectIsland.astro';
import { getHeroData, getAboutData, getResumeData, getProjectData } from './data';

export const islands: IslandRegistry = {
  hero: {
    fetch: () => getHeroData(),
    component: HeroIsland,
    wrapper: { tag: 'section' },
    propsFromData: (data) => ({ data: data.data?.hero }),
  },
  about: {
    fetch: () => getAboutData(),
    component: AboutIsland,
    wrapper: { tag: 'main' },
    propsFromData: (data) => ({ data: data.data?.about }),
  },
  resume: {
    fetch: () => getResumeData(),
    component: ResumeIsland,
    wrapper: { tag: 'main' },
    propsFromData: (data) => ({ data: data.data?.resume }),
  },
  project: {
    fetch: (_req, params) => getProjectData(params.get('slug') + '.md'),
    component: ProjectIsland,
    wrapper: { tag: 'main' },
    propsFromData: (data) => ({ data: data.data?.projects }),
  },
};
```

---

## Step 5 — Wrap pages with `<TinaIsland>`

Each page imports its island + wraps content.

### `src/pages/index.astro`
```astro
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import HeroIsland from '../components/islands/HeroIsland.astro';
import { islands } from '../lib/islands';
// ...
<TinaIsland name="hero" wrapper={islands.hero.wrapper} params={{}} primary>
  <HeroIsland data={hero} />
</TinaIsland>
```

Same pattern for `about.astro`, `resume.astro`, `work/[slug].astro`.

---

## Step 6 — Register islands with tina() integration

In `astro.config.mjs`:

```js
import tina from '@tinacms/astro/integration';
import { islands } from './src/lib/islands';

tina({ islands })
```

---

## File checklist

| File | Action |
|------|--------|
| `tina/config.ts` | Add `ui.router` to all 5 collections |
| `tina/__generated__/*` | Auto-generated — run `tinacms build` |
| `src/lib/data.ts` | NEW — Tina client query wrappers |
| `src/lib/islands.ts` | NEW — island registry |
| `src/components/islands/HeroIsland.astro` | NEW |
| `src/components/islands/AboutIsland.astro` | NEW |
| `src/components/islands/ResumeIsland.astro` | NEW |
| `src/components/islands/ProjectIsland.astro` | NEW |
| `src/pages/index.astro` | Wrap with TinaIsland |
| `src/pages/about.astro` | Wrap with TinaIsland |
| `src/pages/resume.astro` | Wrap with TinaIsland |
| `src/pages/work/[slug].astro` | Wrap with TinaIsland |
| `astro.config.mjs` | Pass islands to tina() |

---

## Order of execution

1. `pnpm exec tinacms build` → generates client
2. Implement Steps 1–6 above
3. `pnpm dev` → go to `/admin` → open any collection → visual editor loads with iframe

## Risk

- `tina/__generated__/client` needs TinaCloud `clientId` + `token` for prod build. For local dev only, can run with empty credentials (local mode).
- Island data fetch runs on every admin iframe reload — keep queries lean.
