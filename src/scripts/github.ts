// Live GitHub repos → Work index.
// Replaces the static fallback rows with the top non-fork repos by stars
// (tie-break: most recently pushed). Static rows stay if the API fails.
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
  topics?: string[];
}

const list = document.querySelector<HTMLElement>('.project-list');
if (list) {
  const fallbackHTML = list.innerHTML;
  const total = liveConfig.repoCount;

  // Skeleton while loading.
  list.innerHTML =
    `<article class="work-row" aria-hidden="true"><div></div><div class="skel"></div><div></div></article>`.repeat(2);

  const prettyName = (name: string) => name.replace(/[-_]+/g, ' ');

  /** Repo links must stay on github.com — never render another scheme. */
  const safeUrl = (u: string) => (u.startsWith('https://github.com/') ? u : profiles.githubUrl);

  const row = (r: GhRepo, i: number) => {
    const year = new Date(r.pushed_at).getFullYear();
    const desc =
      r.description?.trim() ||
      (r.language
        ? `An open-source ${escapeHtml(r.language)} project from my GitHub.`
        : 'An open-source project from my GitHub.');
    const tags = [
      r.language ? `<span class="tag">${escapeHtml(r.language)}</span>` : '',
      ...(r.topics || []).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t)}</span>`),
    ].join('');
    return `<article class="work-row live-in" data-project-index="${i}">
      <div class="work-idx">${String(i + 1).padStart(2, '0')}<b>//${String(total).padStart(2, '0')}</b></div>
      <div>
        <h3 class="work-title"><a href="${safeUrl(r.html_url)}" target="_blank" rel="noopener">${escapeHtml(prettyName(r.name))}</a></h3>
        <p class="work-brief">${escapeHtml(desc)}</p>
        <div class="work-tags">${tags}</div>
      </div>
      <div class="work-side">
        <span class="work-meta">${year} // ★ ${r.stargazers_count}</span>
        <a class="work-link" href="${safeUrl(r.html_url)}" target="_blank" rel="noopener">View code ↗</a>
      </div>
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
        .slice(0, total);
      if (mine.length === 0) throw new Error('empty');
      list.innerHTML = mine.map((r, i) => row(r, i)).join('');
      setupPinIndex();
      window.dispatchEvent(new Event('resize'));
    })
    .catch(() => {
      // API failed — restore the curated static rows.
      list.innerHTML = fallbackHTML;
      setupPinIndex();
      window.dispatchEvent(new Event('resize'));
    });
}
