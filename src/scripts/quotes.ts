// Rotating quotes → hero quote panel.
// Fades between lines on a timer; pauses offscreen, on hover, and on
// hidden tabs. First quote is static under reduced motion.
(() => {
  const quotes = [
    'Ship early, refactor without fear.',
    'Clean code is a feature, not a luxury.',
    'Done is better than perfect — then make it better.',
    'Every expert was once a beginner who kept pushing.',
  ];
  const panel = document.getElementById('quotePanel');
  const text = document.getElementById('quoteText');
  const idx = document.getElementById('quoteIdx');
  if (!panel || !text || !idx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = quotes.length;
  let i = 0;
  let timer = 0;

  const show = (n: number) => {
    i = (n + total) % total;
    panel.classList.add('quote-fade');
    window.setTimeout(() => {
      text.textContent = quotes[i] ?? '';
      idx.textContent = String(i + 1).padStart(2, '0');
      panel.classList.remove('quote-fade');
    }, reduced ? 0 : 350);
  };

  if (reduced) return; // static first quote

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(i + 1), 4500);
  };
  panel.addEventListener('mouseenter', () => window.clearInterval(timer));
  panel.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else start();
  });
  start();
})();
