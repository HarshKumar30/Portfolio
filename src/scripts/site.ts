import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupPinIndex } from '../lib/pin';

// HK portfolio — Elementis-style motion: smooth scroll, masked reveals,
// parallax blobs, pinned project index. Content is visible by default;
// all animation is progressive enhancement.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
      .from('.hero-top-row', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.7')
      .from('.hero-left', { y: 40, autoAlpha: 0, duration: 0.9 }, '-=0.7')
      .from('.profile-card', { y: 60, autoAlpha: 0, rotate: 4, duration: 1 }, '-=0.75')
      .from('.hero-banner', { y: 30, autoAlpha: 0, duration: 0.8 }, '-=0.7');
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

  // Scroll reveals (Elementis-style rise + fade)
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

    // Hero blob parallax
    gsap.utils.toArray<HTMLElement>('.hero-blob').forEach((blob, i) => {
      gsap.to(blob, {
        yPercent: i % 2 === 0 ? 24 : -20,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
  }

  // Pinned project index — sticky panel counts cards as they pass
  // (rebuilt by github.ts after live repos render)
  setupPinIndex();

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

  // Contact form -> mailto
  const form = document.getElementById('contactForm') as HTMLFormElement | null;
  if (form)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = (document.getElementById('cfName') as HTMLInputElement).value.trim();
      const em = (document.getElementById('cfEmail') as HTMLInputElement).value.trim();
      const m = (document.getElementById('cfMsg') as HTMLTextAreaElement).value.trim();
      const note = document.getElementById('cfNote');
      const subject = encodeURIComponent(`Hello Harsh — message from ${n}`);
      const body = encodeURIComponent(`Name: ${n}\nEmail: ${em}\n\n${m}`);
      window.location.href = `mailto:hk40048900@email.com?subject=${subject}&body=${body}`;
      if (note) note.textContent = `Opening your mail app… talk soon, ${n || 'friend'} ✓`;
    });
})();
