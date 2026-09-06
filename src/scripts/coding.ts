// Live LeetCode + GFG stats → Coding Profiles section.
// Static fallback numbers ship in the HTML; this upgrades them live.
import { profiles } from '../config';
import { fetchCached } from '../lib/api';

interface LcStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  submissionCalendar: Record<string, number>;
}

interface GfgStats {
  totalProblemsSolved: number;
  problemsByDifficulty: { school: number; basic: number; easy: number; medium: number; hard: number };
  data?: { byDifficulty: { school: number; basic: number; easy: number; medium: number; hard: number } };
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id: string) => document.getElementById(id);

function countUp(el: HTMLElement | null, to: number, suffix = '') {
  if (!el) return;
  if (reduced) {
    el.textContent = `${to}${suffix}`;
    return;
  }
  const from = parseInt(el.textContent || '0', 10) || 0;
  if (from === to) return;
  const t0 = performance.now();
  const dur = 900;
  const step = (t: number) => {
    const k = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = `${Math.round(from + (to - from) * eased)}${suffix}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const fmtRank = (r: number) =>
  r >= 1_000_000 ? `${(r / 1_000_000).toFixed(2)}M` : r >= 1000 ? `${(r / 1000).toFixed(1)}K` : `${r}`;

/* ---------- heatmap ---------- */
function level(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function renderHeatmap(calendar: Record<string, number>) {
  const grid = $('heatmap');
  const months = $('hmMonths');
  if (!grid || !months) return;

  const dayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start on the Sunday 52 weeks ago so columns always align Sun–Sat.
  const end = new Date(today.getTime() + ((6 - today.getDay()) % 7) * dayMs);
  const start = new Date(end.getTime() - (52 * 7 - 1) * dayMs);
  start.setDate(start.getDate() - start.getDay());

  const byDay = new Map<string, number>();
  Object.entries(calendar).forEach(([ts, c]) => {
    const d = new Date(Number(ts) * 1000);
    byDay.set(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, c);
  });

  const frag = document.createDocumentFragment();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels: { name: string; span: number }[] = [];
  let activeDays = 0;
  const cursor = new Date(start);

  for (let col = 0; col < 53; col++) {
    const colMonth = monthNames[cursor.getMonth()];
    if (col === 0 || labels[labels.length - 1].name !== colMonth) labels.push({ name: colMonth, span: 1 });
    else labels[labels.length - 1].span += 1;
    for (let row = 0; row < 7; row++) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      const count = cursor > today ? -1 : byDay.get(key) || 0;
      if (count > 0) activeDays += 1;
      const cell = document.createElement('span');
      if (count < 0) {
        cell.className = 'hm-cell future';
      } else {
        cell.className = `hm-cell lv${level(count)}`;
        cell.title = `${count} submission${count === 1 ? '' : 's'} on ${cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      frag.appendChild(cell);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  grid.innerHTML = '';
  grid.appendChild(frag);
  months.innerHTML = labels.map((l) => `<span style="flex:${l.span}">${l.name}</span>`).join('');

  const meta = $('hmMeta');
  if (meta) meta.textContent = `${activeDays} active days in the last 12 months · refreshed live from LeetCode`;
}

/* ---------- fetch + render ---------- */
Promise.all([
  fetchCached<LcStats>('hk-lc-stats', `https://leetcode-stats.tashif.codes/${profiles.leetcodeUser}`),
  fetchCached<GfgStats>('hk-gfg-stats', `https://gfg-stats.tashif.codes/${profiles.gfgUser}/solved-problems`),
]).then(([lc, gfg]) => {
  if (lc) {
    countUp($('lcTotal'), lc.totalSolved);
    const max = Math.max(lc.easySolved, lc.mediumSolved, lc.hardSolved, 1);
    const set = (id: string, bar: string, v: number) => {
      const n = $(id);
      if (n) n.textContent = String(v);
      const b = $(bar) as HTMLElement | null;
      if (b) b.style.width = `${Math.max(Math.round((v / max) * 100), v > 0 ? 4 : 0)}%`;
    };
    set('lcEasy', 'lcEasyBar', lc.easySolved);
    set('lcMed', 'lcMedBar', lc.mediumSolved);
    set('lcHard', 'lcHardBar', lc.hardSolved);
    const acc = $('lcAccept');
    if (acc) acc.textContent = `${Math.round(lc.acceptanceRate)}%`;
    const rank = $('lcRank');
    if (rank) rank.textContent = fmtRank(lc.ranking);
    if (lc.submissionCalendar) renderHeatmap(lc.submissionCalendar);
  }
  if (gfg) {
    const d = gfg.problemsByDifficulty || gfg.data?.byDifficulty;
    if (d && typeof gfg.totalProblemsSolved === 'number') {
      countUp($('gfgTotal'), gfg.totalProblemsSolved);
      const rows = $('gfgDiffs');
      if (rows) {
        const order: Array<[string, string, number]> = [
          ['School', 'school', d.school],
          ['Basic', 'basic', d.basic],
          ['Easy', 'easy', d.easy],
          ['Medium', 'med', d.medium],
          ['Hard', 'hard', d.hard],
        ];
        const peak = Math.max(...order.map(([, , v]) => v), 1);
        rows.innerHTML = order
          .map(
            ([label, cls, v]) =>
              `<div class="diff-row"><span class="diff-label ${cls}">${label}</span><div class="diff-track"><div class="diff-fill ${cls}" style="width:${Math.max(Math.round((v / peak) * 100), v > 0 ? 4 : 0)}%"></div></div><b>${v}</b></div>`,
          )
          .join('');
      }
    }
  }
  const lcTotal = lc?.totalSolved;
  const gfgTotal = gfg?.totalProblemsSolved;
  if (typeof lcTotal === 'number' || typeof gfgTotal === 'number') {
    countUp($('codingCombined'), (lcTotal || 0) + (gfgTotal || 0));
  }
  window.dispatchEvent(new Event('resize'));
});
