// Reactive dot-grid page background.
// Fixed full-viewport canvas: faint dot lattice; dots near the cursor glow
// mint with distance falloff and ease back when the cursor leaves (trails).
// Loop sleeps when settled; static frame for reduced motion / touch.
(() => {
  const canvasEl = document.getElementById('grid-bg');
  if (!(canvasEl instanceof HTMLCanvasElement)) return;
  const canvas: HTMLCanvasElement = canvasEl;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MINT = '62,207,142';
  const GAP = 28;
  const RADIUS = 220;

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let glow = new Float32Array(0);
  let mx = -9999;
  let my = -9999;
  let mouseSeen = false;
  let running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / GAP) + 1;
    rows = Math.ceil(h / GAP) + 1;
    glow = new Float32Array(cols * rows);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    let energy = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = c * GAP;
        const y = r * GAP;
        let target = 0.16; // faint base grid
        if (mouseSeen) {
          const dx = x - mx;
          const dy = y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < RADIUS) {
            const t = 1 - d / RADIUS;
            target = 0.16 + t * t * 0.84;
          }
        }
        const g = glow[i] ?? 0;
        const next = g + (target - g) * 0.18; // ease → trailing fade
        glow[i] = next;
        if (next < 0.005) continue;
        energy += next;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${MINT},${next.toFixed(3)})`;
        ctx.arc(x, y, 1.2 + next * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Sleep once settled and the mouse is gone.
    if (!mouseSeen && energy <= 0.5) running = false;
  }

  function step() {
    if (!running) return;
    draw();
    if (running) requestAnimationFrame(step);
  }

  function kick() {
    if (running || reduced) return;
    running = true;
    requestAnimationFrame(step);
  }

  window.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      mouseSeen = true;
      kick();
    },
    { passive: true },
  );
  window.addEventListener('resize', () => {
    resize();
    if (reduced) draw();
    else kick();
  });
  // Mouse left the page → let trails fade, then sleep.
  document.addEventListener('mouseleave', () => {
    mouseSeen = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) draw();
  });

  resize();
  draw(); // first paint (also the static frame for reduced motion)
})();
