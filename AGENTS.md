# AGENTS.md

This file helps future coding agents and contributors work safely in this repository.

## Project Snapshot

- Stack: Astro 6 (SSR), TinaCMS, Tailwind CSS 4, TypeScript, MDX.
- Package manager: pnpm.
- Node requirement: `>=22.12.0`.
- Output: Cloudflare Workers via `@astrojs/cloudflare` adapter.

## Common Commands

- Install dependencies: `pnpm install`
- Start local development: `pnpm dev`
- Build for production: `pnpm build`
- Preview the production build: `pnpm preview`
- Deploy to Cloudflare Workers: `pnpm deploy`

## Important Paths

- Site-wide layout and metadata: `src/layouts/Layout.astro`
- Global config: `src/config/site.ts`
- Shared components: `src/components`
- Pages and route content: `src/pages`
- Public static assets: `public`

## Working Notes

- Theme state is stored in `localStorage` under `maria-theme`.
- Cookie consent state is stored in `localStorage` under `maria-cookie-consent`.

## Change Guidelines

- Prefer small, layout-level fixes when a change should affect the whole site.
- Keep the existing visual language intact unless a task explicitly asks for redesign work.
- When editing SEO, theme, cookie, or font behavior, verify the shared layout first before changing individual pages.
- Run `npm run build` after meaningful changes to catch Astro build issues early.
