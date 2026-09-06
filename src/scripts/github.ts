// Live GitHub repos → Projects section.
// Replaces the static fallback cards with the top non-fork repos by stars
// (tie-break: most recently pushed). Static cards stay if the API fails.
import { profiles, liveConfig } from '../config';
import { fetchCached, escapeHtml } from '../lib/api';
import { setupPinIndex } from '../lib/pin';

interface GhRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
}

const list = document.querySelector<HTMLElement>('.project-list');
if (list) {
  const fallbackHTML = list.innerHTML;

  // Skeleton while loading.
  list.innerHTML =
    `<article class="project-card featured" aria-hidden="true"><div class="skel skel-line"></div><div class="skel skel-title"></div><div class="skel skel-text"></div><div class="skel skel-text short"></div></article>` +
    `<article class="project-card" aria-hidden="true"><div class="skel skel-line"></div><div class="skel skel-title"></div><div class="skel skel-text"></div></article>`;

  const prettyName = (name: string) => name.replace(/[-_]+/g, ' ');

  const card = (r: GhRepo, i: number, featured: boolean) => {
    const year = new Date(r.pushed_at).getFullYear();
    const desc = r.description?.trim() ||
      (r.language ? `An open-source ${escapeHtml(r.language)} project from my GitHub.` : 'An open-source project from my GitHub.');
    const updated = new Date(r.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const tags = [
      r.language ? `<span>${escapeHtml(r.language)}</span>` : '',
      `<span>★ ${r.stargazers_count}</span>`,
    ].join('');
    return `<article class="project-card${featured ? ' featured' : ''} live-in" data-project-index="${i}">
      <div class="pj-top"><span class="pnum">${String(i + 1).padStart(2, '0')}${featured ? ' — FEATURED' : ''}</span><span class="pyear">GITHUB // ${year}</span></div>
      <h3>${escapeHtml(prettyName(r.name))}</h3>
      <p class="pj-desc">${escapeHtml(desc)}</p>
      <div class="tags">${tags}</div>
      <div class="pj-foot">
        <a href="${r.html_url}" target="_blank" rel="noopener">View Code ↗</a>
        <span class="pnote">★ ${r.stargazers_count} · ⑂ ${r.forks_count} · ${escapeHtml(updated)}</span>
      </div>
    </article>`;
  };

  const mini = (r: GhRepo, i: number) => {
    const year = new Date(r.pushed_at).getFullYear();
    const desc = r.description?.trim() ||
      (r.language ? `An open-source ${escapeHtml(r.language)} project from my GitHub.` : 'An open-source project from my GitHub.');
    return `<article class="project-card mini live-in" data-project-index="${i}">
      <div class="pj-top"><span class="pnum">${String(i + 1).padStart(2, '0')}</span><span class="pyear">${year} // ${escapeHtml((r.language || 'CODE').toUpperCase())}</span></div>
      <h3>${escapeHtml(prettyName(r.name))}</h3>
      <p>${escapeHtml(desc)}</p>
      <div class="tags"><span>★ ${r.stargazers_count}</span><span><a href="${r.html_url}" target="_blank" rel="noopener" style="font:inherit">View Code ↗</a></span></div>
    </article>`;
  };

  fetchCached<GhRepo[]>('hk-gh-repos', `https://api.github.com/users/${profiles.githubUser}/repos?per_page=100`)
    .then((repos) => {
      if (!repos || repos.length === 0) throw new Error('empty');
      const mine = repos
        .filter((r) => !r.fork && r.name.toLowerCase() !== profiles.githubUser.toLowerCase())
        .sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
        )
        .slice(0, liveConfig.repoCount);
      if (mine.length === 0) throw new Error('empty');

      const [first, second, ...rest] = mine;
      if (!first) throw new Error('empty');
      let html = card(first, 0, true);
      if (second) html += card(second, 1, false);
      const minis = rest.map((r, k) => mini(r, k + 2)).join('');
      if (minis) html += `<div class="project-grid">${minis}</div>`;
      list.innerHTML = html;

      // Rebind the pinned index + reveals to the live cards.
      setupPinIndex();
      window.dispatchEvent(new Event('resize'));
    })
    .catch(() => {
      // API failed — restore the curated static cards.
      list.innerHTML = fallbackHTML;
      setupPinIndex();
      window.dispatchEvent(new Event('resize'));
    });
}
