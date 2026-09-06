import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Pinned work index — the sticky panel counts rows as they pass.
// Re-runnable: github.ts calls setupPinIndex() after live repos render.
gsap.registerPlugin(ScrollTrigger);

let pinTriggers: ScrollTrigger[] = [];

export function setupPinIndex(): void {
  pinTriggers.forEach((t) => t.kill());
  pinTriggers = [];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pinCurrent = document.getElementById('pinCurrent');
  const pinProgress = document.getElementById('pinProgress');
  const pinTotal = document.querySelector('.pin-left small');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-project-index]'));
  if (rows.length === 0) return;

  const total = rows.length;
  if (pinTotal) pinTotal.textContent = ` / ${String(total).padStart(2, '0')}`;
  rows.forEach((row) => {
    const idx = Number(row.dataset.projectIndex || 0);
    pinTriggers.push(
      ScrollTrigger.create({
        trigger: row,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: (self) => {
          if (!self.isActive) return;
          if (pinCurrent) pinCurrent.textContent = String(idx + 1).padStart(2, '0');
          if (pinProgress && !reduced) {
            gsap.to(pinProgress, { width: `${((idx + 1) / total) * 100}%`, duration: 0.5, ease: 'power2.out' });
          } else if (pinProgress) {
            pinProgress.style.width = `${((idx + 1) / total) * 100}%`;
          }
        },
      }),
    );
  });
}
