// GitHub commits heatmap → Work section.
// Aggregates PushEvent commits per day over the trailing 90 days.
// The block stays hidden if the API fails.
import { profiles } from '../config';
import { fetchCached } from '../lib/api';
import { renderHeatmap, autoFitHeatmap, type DayCounts } from '../lib/heatmap';

interface GhEvent {
  type: string;
  created_at: string;
  payload?: { commits?: Array<{ sha?: string }>; size?: number };
}

const grid = document.getElementById('ghHeatmap');
const months = document.getElementById('ghMonths');
const meta = document.getElementById('ghMeta');
const block = document.getElementById('ghActivity');

if (grid && months && block) {
  fetchCached<GhEvent[]>('hk-gh-events', `https://api.github.com/users/${profiles.githubUser}/events/public?per_page=100`)
    .then((events) => {
      if (!events || events.length === 0) throw new Error('empty');
      const counts: DayCounts = new Map();
      let total = 0;
      const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      events.forEach((e) => {
        if (e.type !== 'PushEvent') return;
        const arr = e.payload?.commits?.length ?? 0;
        const n = arr > 0 ? arr : e.payload?.size || 1;
        const k = keyOf(new Date(e.created_at));
        counts.set(k, (counts.get(k) || 0) + n);
        total += n;
      });
      if (total === 0) throw new Error('empty');
      const render = () =>
        renderHeatmap({
          grid,
          months,
          meta,
          counts,
          totalDays: 90,
          formatTitle: (date, c) =>
            `${c} commit${c === 1 ? '' : 's'} on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          metaText: () => `${total} commits · last 90 days · refreshed live from GitHub`,
        });
      block.hidden = false;
      render();
      autoFitHeatmap(render);
      window.dispatchEvent(new Event('resize'));
    })
    .catch(() => {
      // API failed — block stays hidden, static rows unaffected.
    });
}
