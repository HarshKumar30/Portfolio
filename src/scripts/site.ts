import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupPinIndex } from '../lib/pin';

// HK portfolio — iverson.inc inspired: smooth scroll, masked display reveals,
// rise-and-fade sections, magnetic CTAs. Content is visible by default;
// all animation is progressive enhancement.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Broken skill icons: drop <img data-icon> that fail to load.
  // Listener-based (no inline handlers) so a strict CSP stays viable.
  document.querySelectorAll<HTMLImageElement>('img[data-icon]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.remove();
    else img.addEventListener('error', () => img.remove(), { once: true });
  });

  // Copy-email buttons with clipboard fallback.
  document.querySelectorAll<HTMLButtonElement>('.copy-mail').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          ok = document.execCommand('copy');
          ta.remove();
        } catch {
          ok = false;
        }
      }
      if (ok) {
        const label = btn.getAttribute('aria-label') || 'Copy';
        btn.classList.add('done');
        btn.setAttribute('aria-label', 'Copied!');
        btn.title = 'Copied!';
        window.setTimeout(() => {
          btn.classList.remove('done');
          btn.setAttribute('aria-label', label);
          btn.title = label;
        }, 1600);
      }
    });
  });

  // Smooth scroll (skipped for reduced motion)
  let lenis: Lenis | null = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor navigation through Lenis (with fixed-header offset)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -84, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // Nav hide on scroll
  const nav = document.getElementById('nav');
  let lastY = 0;
  const onScrollY = (yNow: number) => {
    if (nav) {
      if (yNow > 140 && yNow > lastY) nav.classList.add('hide');
      else nav.classList.remove('hide');
    }
    lastY = yNow;
  };
  if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => onScrollY(scroll));
  else window.addEventListener('scroll', () => onScrollY(window.scrollY), { passive: true });

  // Fullscreen menu
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const menuLinks = menu ? Array.from(menu.querySelectorAll('nav a')) : [];
  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    if (!reduced) {
      gsap.fromTo(
        menuLinks,
        { y: 44, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: 'power3.out', overwrite: true },
      );
    }
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    document.body.style.overflow = '';
    lenis?.start();
  }
  if (menuBtn)
    menuBtn.addEventListener('click', () => (menu?.classList.contains('open') ? closeMenu() : openMenu()));

  // Loader
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');
  const pct = document.getElementById('loader-pct');
  const big = document.getElementById('loader-big');
  const words = ['HARSH KUMAR', 'BUILD', 'SHIP', 'DEPLOY'];
  let heroPlayed = false;

  function playHeroIntro() {
    if (heroPlayed || reduced) return;
    heroPlayed = true;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('[data-hero-line] > span', { yPercent: 115, duration: 1.1, stagger: 0.12 })
      .from('.hero-eyebrow', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.7')
      .from('.hero-sub > div', { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');
    ScrollTrigger.refresh();
  }

  function finishLoad() {
    if (loader) loader.classList.add('done');
    document.body.style.overflow = '';
    playHeroIntro();
  }

  if (reduced) {
    finishLoad();
  } else {
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    let p = 0;
    let wi = 0;
    const wordTimer = window.setInterval(() => {
      wi = (wi + 1) % words.length;
      if (big) big.textContent = words[wi];
    }, 350);
    const loadTimer = window.setInterval(() => {
      p += Math.random() * 22 + 8;
      if (p >= 100) {
        p = 100;
        window.clearInterval(loadTimer);
        window.clearInterval(wordTimer);
        window.setTimeout(() => {
          finishLoad();
          lenis?.start();
        }, 250);
      }
      if (fill) fill.style.width = `${p}%`;
      if (pct) pct.textContent = String(Math.floor(p)).padStart(2, '0');
    }, 140);
    // Safety: never trap the user
    window.setTimeout(() => {
      if (loader && !loader.classList.contains('done')) {
        window.clearInterval(loadTimer);
        window.clearInterval(wordTimer);
        finishLoad();
        lenis?.start();
      }
    }, 4000);
  }

  // Scroll reveals (rise + fade)
  if (!reduced) {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      // Skip hero pieces handled by the intro timeline
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 44,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  // Pinned work index (rebuilt by github.ts after live repos render)
  setupPinIndex();

  // Scrollspy — highlight the nav link of the section in view.
  const navAnchors = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.length > 1) navAnchors.set(href.slice(1), a);
  });
  if (navAnchors.size > 0) {
    const setActive = (id: string | null) => {
      navAnchors.forEach((a, key) => {
        const on = key === id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    navAnchors.forEach((_, id) => {
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setActive(id);
        },
      });
    });
  }

  // Animated counters
  document.querySelectorAll<HTMLElement>('.count').forEach((el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    if (reduced) {
      el.textContent = String(target);
      return;
    }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = String(Math.floor(obj.v));
          },
        });
      },
    });
  });

  // Subtle magnetic buttons (fine pointers only)
  if (finePointer && !reduced) {
    document.querySelectorAll<HTMLElement>('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.15, y: y * 0.2, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' }));
    });
  }
})();
