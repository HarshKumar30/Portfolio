// Shared calendar-heatmap renderer (LeetCode + GitHub).
// Grid-aligned month labels: months use the same column template as the
// cells, so labels can never drift. Cell size fits the container.
export type DayCounts = Map<string, number>; // key: `${y}-${m}-${d}` (local)

export interface HeatOptions {
  grid: HTMLElement;
  months: HTMLElement;
  meta?: HTMLElement | null;
  counts: DayCounts;
  /** Trailing days to render (heatmap ends today). */
  totalDays: number;
  formatTitle: (date: Date, count: number) => string;
  metaText: (activeDays: number) => string;
  minCell?: number;
  maxCell?: number;
}

export function levelCount(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function renderHeatmap(o: HeatOptions): void {
  const { grid, months } = o;
  const minCell = o.minCell ?? 6;
  const maxCell = o.maxCell ?? 14;

  const dayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today.getTime() - (o.totalDays - 1) * dayMs);
  const start = new Date(lastDay);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday
  const cols = Math.ceil((today.getTime() - start.getTime()) / dayMs / 7) + 1;

  // Fit cells to the scroll container width.
  const wrap = grid.closest('.heatmap-scroll') as HTMLElement | null;
  const avail = wrap ? wrap.clientWidth : cols * (maxCell + 3);
  const size = Math.max(minCell, Math.min(maxCell, Math.floor((avail - (cols - 1) * 3) / cols)));

  grid.style.setProperty('--hm-cols', String(cols));
  grid.style.setProperty('--hm-cell', `${size}px`);
  months.style.setProperty('--hm-cols', String(cols));
  months.style.setProperty('--hm-cell', `${size}px`);

  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const frag = document.createDocumentFragment();
  const labels: { name: string; start: number; span: number }[] = [];
  let activeDays = 0;
  const cursor = new Date(start);

  for (let col = 0; col < cols; col++) {
    const name = MONTHS[cursor.getMonth()];
    const prev = labels[labels.length - 1];
    if (col === 0 || !prev || prev.name !== name) labels.push({ name, start: col, span: 1 });
    else prev.span += 1;
    for (let row = 0; row < 7; row++) {
      const count = cursor > today ? -1 : o.counts.get(keyOf(cursor)) || 0;
      if (count > 0) activeDays += 1;
      const cell = document.createElement('span');
      if (count < 0) {
        cell.className = 'hm-cell future';
      } else {
        cell.className = `hm-cell lv${levelCount(count)}`;
        cell.title = o.formatTitle(new Date(cursor), count);
      }
      frag.appendChild(cell);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  grid.innerHTML = '';
  grid.appendChild(frag);
  months.innerHTML = labels
    .map((l) => `<span style="grid-column:${l.start + 1} / span ${l.span}">${l.name}</span>`)
    .join('');

  if (o.meta) o.meta.textContent = o.metaText(activeDays);
}

/** Re-render on container resize (debounced). Returns a cleanup fn. */
export function autoFitHeatmap(render: () => void): () => void {
  let t = 0;
  const onResize = () => {
    window.clearTimeout(t);
    t = window.setTimeout(render, 200);
  };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}
