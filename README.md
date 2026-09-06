# Harsh Kumar — Portfolio

Personal portfolio of **Harsh Kumar**, full-stack software engineer from Prayagraj, India.
Elementis-inspired motion, a vibrant **Midnight Lab** dark theme, live GitHub projects,
and live LeetCode / GeeksforGeeks stats with an activity heatmap.

**Live site:** `https://harshkumar30.github.io/Portfolio` *(after enabling GitHub Pages on `dist/` via the included workflow — see Deployment)*

## Features

- **Elementis-style motion** — Lenis buttery smooth scroll, masked hero reveals, parallax blobs, staggered fullscreen menu, pinned project index that counts 01–06 as cards pass.
- **Live GitHub projects** — top non-fork repos by stars (tie-break: most recently pushed), rendered client-side with skeleton loaders and curated static fallback.
- **Coding profiles** — live LeetCode totals by difficulty (Easy / Medium / Hard), acceptance rate, rank, plus a 52-week submission heatmap; GeeksforGeeks totals by difficulty (School / Basic / Easy / Medium / Hard).
- **Midnight Lab theme** — near-black violet base with neon coral, violet, teal, amber, and pink accents. All text pairs pass WCAG AA.
- **Zero-JS-by-default content** — all copy ships as static HTML; motion and live data are progressive enhancement with `prefers-reduced-motion` support.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (static output) |
| Motion | [GSAP ScrollTrigger](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) smooth scroll |
| Language | TypeScript (strict) |
| Styling | Single global stylesheet (`src/styles/global.css`), no framework |
| Icons | [Devicon](https://devicon.dev) SVGs via jsDelivr CDN |

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + static build into dist/
npm run preview  # preview the production build
```

Requires **Node.js 18+**.

## Configuration

All live profile handles live in one place — [`src/config.ts`](src/config.ts):

```ts
export const profiles = {
  githubUser: 'HarshKumar30',
  leetcodeUser: 'Harsh_Kumar_096',
  gfgUser: 'hk4004qt5s',
};
```

## Live data sources

| Section | Endpoint | Notes |
|---|---|---|
| Projects | `api.github.com/users/{you}/repos?per_page=100` | Filters forks + profile repo; 6h `localStorage` cache; static fallback cards |
| LeetCode | `leetcode-stats.tashif.codes/{user}` | Totals, difficulty split, rank, acceptance, submission calendar |
| GeeksforGeeks | `gfg-stats.tashif.codes/{user}/solved-problems` | Totals + difficulty split + topics (no daily calendar exists, so the heatmap is LeetCode-only) |

Every live section renders verified static fallback content first, then upgrades in the browser —
the page is never empty if an API is down or rate-limited.

## Deployment

The build outputs static files to `dist/`. Any static host works:

- **GitHub Pages:** point Pages at the `dist/` folder via a build workflow (`npm ci && npm run build`), or deploy `dist/` directly.
- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, publish directory `dist`.

## Project structure

```
src/
├── config.ts            # profile usernames + live-data settings
├── pages/index.astro    # page composition
├── layouts/Base.astro   # head/SEO, loader, nav, menu, footer
├── components/          # Hero, Projects, CodingProfiles, About, …
├── lib/api.ts           # cached fetch helpers
├── lib/pin.ts           # pinned project index (re-runnable)
├── scripts/             # site motion, live GitHub, live coding stats
└── styles/global.css    # Midnight Lab theme (single file)
```
