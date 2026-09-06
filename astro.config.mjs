import { defineConfig } from 'astro/config';

// Static output — deployable to GitHub Pages, Netlify, or Vercel as-is.
// For GitHub Pages project sites, set `site` + `base` (e.g. base: '/repo-name').
export default defineConfig({
  output: 'static',
  // site: 'https://<user>.github.io',
  // base: '/<repo>',
});
