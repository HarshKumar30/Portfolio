// Rotating dot-matrix globe → hero backdrop.
// Zero-dependency canvas: fibonacci sphere, orthographic projection,
// continuous rotation around a tilted axis. Depth fades dots front→back.
// Pauses offscreen / on hidden tab; static frame for reduced motion.
(() => {
  const el = document.getElementById('globe');
  if (!(el instanceof HTMLCanvasElement)) return;
  const canvas: HTMLCanvasElement = el;
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MINT = '62,207,142';

  interface Pt {
    x: number;
    y: number;
    z: number;
  }

  // Evenly distributed sphere points (fibonacci lattice).
  const N = 750;
  const pts: Pt[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }

  const tilt = 0.42; // axial tilt (radians)
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let radius = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Sphere sits right-of-center on desktop, centered on small screens.
    const small = w < 700;
    cx = small ? w * 0.5 : w * 0.72;
    cy = small ? h * 0.42 : h * 0.4;
    radius = Math.min(w, h) * (small ? 0.34 : 0.36);
  }

  let angle = 0.6;
  const speed = 0.0016;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    // Farthest first so near dots paint over far ones.
    const order = pts
      .map((p) => {
        // spin around Y, then tilt around X
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y1 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;
        return { x: x1, y: y1, z: z2 };
      })
      .sort((a, b) => a.z - b.z);
    for (const p of order) {
      const depth = (p.z + 1) / 2; // 0 = far, 1 = near
      if (depth < 0.12) continue; // hide far-side clutter
      const r = 0.8 + depth * 1.7;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${MINT},${(0.16 + depth * 0.6).toFixed(3)})`;
      ctx.arc(cx + p.x * radius, cy + p.y * radius, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let running = true;
  let raf = 0;
  function frame() {
    if (!running) return;
    angle += speed;
    draw();
    raf = requestAnimationFrame(frame);
  }

  if (reduced) {
    resize();
    draw(); // single static frame
    return;
  }

  resize();
  window.addEventListener('resize', resize);

  // Pause when the hero scrolls out of view or the tab hides.
  const host = canvas.closest('.hero');
  if (host && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !running) {
          running = true;
          frame();
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    ).observe(host);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      frame();
    }
  });

  frame();
})();
