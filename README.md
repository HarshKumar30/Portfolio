# Harsh Kumar — Portfolio

Personal portfolio of **Harsh Kumar**, full-stack software engineer from Prayagraj, India.
Inspired by [iverson.inc](https://iverson.inc/): Swiss-editorial rhythm, oversized grotesk type,
black + mint system, hairline rules — with live GitHub projects, live coding stats, and a
rotating dot-matrix globe in the hero.

## Sections (in order)

Hero (globe + rotating quotes) → Stats → About → Education → Highlights →
Coding Profiles → Work → Services → Contact.

## Features

- **iverson-style art direction** — Space Grotesk display at weight 400 with tight leading, Geist Mono captions, `#060606` black, `#f7f7f7` text, single mint `#3ecf8e` accent, numbered kickers (`01–07`), work index rows (`01//06`), services rows, award-table highlights.
- **Rotating globe** — zero-dependency canvas dot-matrix sphere behind the hero (and About, previously): fibonacci lattice, orthographic projection, depth-faded dots, DPR-aware, pauses offscreen and on hidden tabs, static frame under reduced motion.
- **Quote rotator** — dev one-liners crossfading every 4.5s (pauses on hover/hidden tab).
- **Live GitHub projects** — top non-fork repos by stars (tie-break: most recently pushed), rendered client-side with skeletons and curated static fallback; pinned 01/06 index rebinds after render.
- **Coding profiles** — live LeetCode totals by difficulty, acceptance, rank, plus a responsive 52-week submission heatmap with grid-aligned month labels; GeeksforGeeks totals + difficulty bars.
- **GitHub commits map** — trailing-90-day daily heatmap aggregated from public push events.
- **Motion** — Lenis smooth scroll, masked hero intro, rise-and-fade reveals, magnetic CTAs, scrollspy nav, fullscreen menu. Content is visible by default; everything is progressive enhancement with `prefers-reduced-motion` support.
- **Hardened static output** — no secrets, no backend, escaped API rendering, `https://github.com/` URL assertion, CSP-safe (no inline handlers), `public/_headers` with CSP + hardening headers for Netlify/Cloudflare.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (static output) |
| Motion | [GSAP ScrollTrigger](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) smooth scroll |
| Language | TypeScript (strict) |
| Styling | Single global stylesheet (`src/styles/global.css`), no framework |
| Fonts | Space Grotesk + Geist Mono via Google Fonts |
| Icons | [Devicon](https://devicon.dev) SVGs via jsDelivr CDN (grayscale, CSP-safe) |

## Getting started

```bash
npm install
npm run dev      # local dev server (http://localhost:4321)
npm run build    # static build into dist/
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

Social links (LinkedIn, X, email, phone) live in `src/layouts/Base.astro` (menu + footer),
`src/components/Hero.astro`, and `src/components/Contact.astro`.

## Live data sources

| Section | Endpoint | Notes |
|---|---|---|
| Work | `api.github.com/users/{you}/repos?per_page=100` | Filters forks + profile repo; 6h `localStorage` cache; static fallback rows |
| Commits map | `api.github.com/users/{you}/events/public?per_page=100` | PushEvent commits per day, trailing 90 days; block hides on failure |
| LeetCode | `leetcode-stats.tashif.codes/{user}` | Totals, difficulty split, rank, acceptance, submission calendar |
| GeeksforGeeks | `gfg-stats.tashif.codes/{user}/solved-problems` | Totals + difficulty split + topics (no daily calendar exists, so heatmaps are LeetCode/GitHub only) |

Every live section renders verified static fallback content first, then upgrades in the browser —
the page is never empty if an API is down or rate-limited.

## Deployment

The build outputs static files to `dist/`. Any static host works:

- **Netlify / Cloudflare Pages:** build command `npm run build`, publish directory `dist` (`public/_headers` is picked up automatically).
- **Vercel:** same build settings (port the CSP values from `public/_headers` into `vercel.json`).
- **GitHub Pages:** build locally or via workflow (`npm ci && npm run build`), deploy `dist/`.

## Project structure

```
src/
├── config.ts            # profile usernames + live-data settings
├── pages/index.astro    # section order
├── layouts/Base.astro   # head/SEO, loader, nav + scrollspy, menu, footer
├── components/          # Hero (globe+quotes), Stats, About, Education, …
├── lib/api.ts           # cached fetch helpers
├── lib/pin.ts           # pinned work index (re-runnable)
├── lib/heatmap.ts       # shared responsive calendar-heatmap renderer
├── scripts/             # site motion, globe, quotes, live GitHub/coding stats
├── styles/global.css    # full design system (single file)
public/
├── _headers             # CSP + security headers (Netlify/Cloudflare)
```
