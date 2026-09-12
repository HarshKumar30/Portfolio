// Live GitHub data → curated Work cards.
// Matches config.projects by repo name, fills in live stars / push date /
// language, and lazy-loads a screenshot per card. Static cards stay on failure.
import { profiles, projects } from '../config';
import { fetchCached, escapeHtml } from '../lib/api';

interface GhRepo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
}

const list = document.querySelector<HTMLElement>('.project-list');
if (list) {
  // Static cards render immediately; live data enhances them in place.

  /** Repo links must stay on github.com — never render another scheme. */
  const safeUrl = (u: string) => (u.startsWith('https://github.com/') ? u : profiles.githubUrl);
  /** Screenshot target: explicit site, else repo homepage, else repo page. */
  const shotTarget = (site: string | undefined, r: GhRepo) => {
    const cands = [site, r.homepage, r.html_url];
    for (const c of cands) {
      if (c && /^https?:\/\//i.test(c)) return c;
    }
    return r.html_url;
  };
  const shotUrl = (target: string) =>
    `https://api.microlink.io?url=${encodeURIComponent(target)}&screenshot=true&meta=false&embed=screenshot.url`;

  /** Lazy-load each card's screenshot only when it scrolls into view. */
  const lazyShots = () => {
    const cards = Array.from(list.querySelectorAll<HTMLElement>('.proj-card[data-shot]'));
    if (cards.length === 0) return;
    const show = (card: HTMLElement) => {
      if (card.dataset.shotDone) return;
      card.dataset.shotDone = '1';
      const url = card.dataset.shot || '';
      const frame = card.querySelector('.shot');
      if (!url || !frame) return;
      const img = document.createElement('img');
      img.className = 'shot-img';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      const timer = window.setTimeout(() => img.remove(), 15000);
      img.addEventListener('load', () => {
        window.clearTimeout(timer);
        frame.prepend(img);
        requestAnimationFrame(() => frame.classList.add('shot-live'));
      });
      img.addEventListener('error', () => {
        window.clearTimeout(timer);
        img.remove(); // fallback art underneath stays visible
      });
      img.src = url;
    };
    if (!('IntersectionObserver' in window)) {
      cards.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '200px' },
    );
    cards.forEach((c) => io.observe(c));
  };

  fetchCached<GhRepo[]>('hk-gh-repos', `https://api.github.com/users/${profiles.githubUser}/repos?per_page=100`)
    .then((repos) => {
      if (!repos || repos.length === 0) throw new Error('empty');
      const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
      let matched = 0;
      projects.forEach((p) => {
        const r = byName.get(p.repo.toLowerCase());
        const card = list.querySelector<HTMLElement>(`.proj-card[data-repo="${CSS.escape(p.repo)}"]`);
        if (!r || !card) return;
        matched += 1;
        // Live stars + push date.
        const note = card.querySelector('.pnote');
        if (note) {
          const updated = new Date(r.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          note.textContent = `★ ${r.stargazers_count} · ${updated}`;
        }
        const link = card.querySelector<HTMLAnchorElement>('.pj-foot a');
        if (link) link.href = safeUrl(r.html_url);
        const titleLink = card.querySelector<HTMLAnchorElement>('.proj-body h3 a, h3 a');
        if (titleLink) titleLink.href = safeUrl(r.html_url);
        // Screenshot target for lazy loading.
        card.dataset.shot = shotUrl(shotTarget(p.site, r));
      });
      if (matched === 0) throw new Error('empty');
      lazyShots();
      window.dispatchEvent(new Event('resize'));
    })
    .catch(() => {
      // API failed — curated static cards (with fallback art) stay as-is.
      window.dispatchEvent(new Event('resize'));
    });

  // Static fallback also gets screenshots if the fetch failed late? No —
  // keep it simple: screenshots only enhance successfully matched cards.
}
