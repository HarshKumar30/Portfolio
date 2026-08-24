import gsap from 'gsap';

// Anchor links: native smooth scrolling via CSS (scroll-behavior: smooth)

// Nav hide on scroll down, show on scroll up
const nav = document.querySelector('[data-nav]');
let lastScroll = 0;

window.addEventListener(
  'scroll',
  () => {
    const scrollY = window.scrollY;
    if (nav) {
      if (scrollY > lastScroll && scrollY > 150) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
      lastScroll = scrollY;
    }
  },
  { passive: true }
);

// Utility: split text into chars for hero reveal animation
document.querySelectorAll('[data-split]').forEach((el) => {
  const lines = el.querySelectorAll('[data-line]');
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = '';
    const chars = text.split('');
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(110%)';
      span.style.transition = 'transform 0.9s cubic-bezier(0.77, 0, 0.175, 1)';
      span.textContent = char === ' ' ? '\u00A0' : char;
      line.appendChild(span);
    });
  });
});

// Hero load animations
const heroTitle = document.querySelector('[data-split]');
if (heroTitle) {
  const chars = heroTitle.querySelectorAll('.char');
  gsap.to(chars, {
    y: 0,
    duration: 0.9,
    stagger: 0.02,
    ease: 'power4.out',
    delay: 0.2,
  });
}

// Hero reveal elements
document.querySelectorAll('.hero [data-reveal]').forEach((el, i) => {
  gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.6 + i * 0.15,
      ease: 'power3.out',
    }
  );
});

// Hero stats counter reveal
document.querySelectorAll('[data-stat]').forEach((el, i) => {
  gsap.fromTo(
    el,
    { opacity: 0, x: 40 },
    {
      opacity: 1,
      x: 0,
      duration: 1,
      delay: 1 + i * 0.15,
      ease: 'power3.out',
    }
  );
});

// Scroll progress bar (native scroll)
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Custom cursor
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('cursor--hover');
    cursorDot.classList.add('cursor-dot--hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('cursor--hover');
    cursorDot.classList.remove('cursor-dot--hover');
  });
});

// Cursor color cycles on click
const cursorColors = ['#22d3ee', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#f97316'];
let cursorColorIndex = 0;

document.addEventListener('click', () => {
  cursorColorIndex = (cursorColorIndex + 1) % cursorColors.length;
  const color = cursorColors[cursorColorIndex];
  document.documentElement.style.setProperty('--cursor-border', color);
  document.documentElement.style.setProperty('--cursor-dot', color);
});

// Letter-by-letter hover effect (Lando-style text bounce)
function wrapHoverText(el) {
  const inner = el.querySelector('.nav__cta-text') || el.querySelector('.hero__scroll span:first-child') || null;
  if (!inner) return;
  const text = inner.textContent;
  inner.textContent = '';
  const letters = text.split('');
  letters.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'hover-letter';
    span.style.display = 'inline-block';
    span.style.transitionDelay = `${i * 25}ms`;
    span.textContent = char === ' ' ? '\u00A0' : char;
    inner.appendChild(span);
  });
}

document.querySelectorAll('[data-hover]').forEach(wrapHoverText);
