// Kinetic grid background — drifting grid with cursor-reactive glow and light pulses
const canvas = document.getElementById('kinetic-grid');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['34, 211, 238', '168, 85, 247', '236, 72, 153'];
  const SPACING = 76;
  const RADIUS = 230;

  let w = 0;
  let h = 0;
  let mx = -9999;
  let my = -9999;
  let tx = -9999;
  let ty = -9999;
  let t = 0;
  let offX = 0;
  let offY = 0;
  let rafId = null;
  let running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) drawStatic();
  }

  // Traveling light pulses along random grid lines
  const pulses = [];
  function spawnPulse() {
    if (pulses.length >= 3) return;
    const vertical = Math.random() > 0.5;
    pulses.push({
      vertical,
      pos: Math.random() * (vertical ? h : w),
      travel: -150,
      speed: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }
  setInterval(() => {
    if (running) spawnPulse();
  }, 2600);

  function drawGridLines(offsetX, offsetY) {
    ctx.beginPath();
    for (let x = offsetX; x < w; x += SPACING) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = offsetY; y < h; y += SPACING) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  function frame() {
    t += 0.016;
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    offX = (offX + 0.12) % SPACING;
    offY = (offY + 0.08) % SPACING;

    const breath = 0.5 + 0.5 * Math.sin(t * 0.45);

    ctx.clearRect(0, 0, w, h);

    // Base grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 255, 255, ${(0.04 + breath * 0.02).toFixed(4)})`;
    drawGridLines(offX, offY);

    // Intersection nodes
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.05 + breath * 0.04).toFixed(4)})`;
    for (let x = offX; x < w; x += SPACING) {
      for (let y = offY; y < h; y += SPACING) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // Cursor-reactive accent glow (clipped circle around pointer)
    if (mx > -100) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, RADIUS, 0, Math.PI * 2);
      ctx.clip();

      const px = ((mx - w / 2) / w) * 12;
      const py = ((my - h / 2) / h) * 12;
      const colorIdx = Math.floor(t * 0.15) % COLORS.length;

      const g = ctx.createRadialGradient(mx, my, 0, mx, my, RADIUS);
      g.addColorStop(0, `rgba(${COLORS[colorIdx]}, 0.5)`);
      g.addColorStop(1, `rgba(${COLORS[colorIdx]}, 0)`);

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = g;
      drawGridLines(offX + px, offY + py);
      ctx.restore();
    }

    // Pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.travel += p.speed;
      const limit = p.vertical ? h : w;
      if (p.travel - 200 > limit) {
        pulses.splice(i, 1);
        continue;
      }

      const grad = p.vertical
        ? ctx.createLinearGradient(0, p.travel - 180, 0, p.travel + 20)
        : ctx.createLinearGradient(p.travel - 180, 0, p.travel + 20, 0);
      grad.addColorStop(0, `rgba(${p.color}, 0)`);
      grad.addColorStop(0.8, `rgba(${p.color}, 0.35)`);
      grad.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      if (p.vertical) {
        const lineX = offX + Math.round((p.pos - offX) / SPACING) * SPACING;
        ctx.moveTo(lineX, p.travel - 180);
        ctx.lineTo(lineX, p.travel + 20);
      } else {
        const lineY = offY + Math.round((p.pos - offY) / SPACING) * SPACING;
        ctx.moveTo(p.travel - 180, lineY);
        ctx.lineTo(p.travel + 20, lineY);
      }
      ctx.stroke();
    }

    rafId = requestAnimationFrame(frame);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    drawGridLines(0, 0);
  }

  function start() {
    if (!running && !reduced) {
      running = true;
      rafId = requestAnimationFrame(frame);
    }
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'mousemove',
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (mx === -9999) {
        mx = tx;
        my = ty;
      }
    },
    { passive: true }
  );
  document.addEventListener('mouseleave', () => {
    tx = -9999;
    ty = -9999;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (reduced) drawStatic();
  else start();
}
