/* page-transition.js: Zyqor Components (MIT). No dependencies.
   - Between pages: a circle grows from the exact point you clicked and reveals the next page.
     Uses the browser's own cross-document View Transitions (@view-transition in the CSS) where supported,
     and a light overlay fallback everywhere else, so every browser gets a transition and a working link.
   - On one page: themeReveal(button) switches a theme with the same circle from the click point
     (document.startViewTransition), instant where unsupported.
   - Reduced motion: plain navigation and an instant theme switch.
   Mark links with [data-pt] (or put them inside [data-pt-scope]). External links, new tabs, downloads,
   modified clicks (Ctrl/Cmd/Shift) and hash links are left alone. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const KEY = 'pt-origin';
const crossDocVT = () => 'onpagereveal' in window && CSS.supports('view-transition-name', 'none');
const radius = (x, y) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

function cover() { let c = document.querySelector('.pt-cover'); if (!c) { c = document.createElement('div'); c.className = 'pt-cover'; c.setAttribute('aria-hidden', 'true'); document.body.append(c); } return c; }

function onClick(e) {
  const a = e.target.closest('a[href]'); if (!a) return;
  if (!(a.hasAttribute('data-pt') || a.closest('[data-pt-scope]'))) return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target && a.target !== '_self') return; if (a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href); if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return;
  const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
  sessionStorage.setItem(KEY, JSON.stringify({ x: x / innerWidth, y: y / innerHeight, c: a.dataset.ptColor || '' }));
  if (reduced() || crossDocVT()) return;          // native transition (or none) handles it
  e.preventDefault();
  const c = cover(); if (a.dataset.ptColor) c.style.background = a.dataset.ptColor;
  c.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius(x, y)}px at ${x}px ${y}px)` }], { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
    .finished.then(() => { location.href = url.href; });
}

function onArrive() {
  const raw = sessionStorage.getItem(KEY); if (!raw) return; sessionStorage.removeItem(KEY);
  if (reduced()) return;
  const { x, y, c } = JSON.parse(raw); const px = x * innerWidth, py = y * innerHeight;
  if (crossDocVT()) return;  // handled in pagereveal
  const el = cover(); if (c) el.style.background = c;
  el.animate([{ clipPath: `circle(${radius(px, py)}px at ${px}px ${py}px)` }, { clipPath: `circle(0px at ${px}px ${py}px)` }], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
}

addEventListener('pagereveal', (e) => {
  if (!e.viewTransition) return;
  const raw = sessionStorage.getItem(KEY); if (!raw || reduced()) { if (reduced()) e.viewTransition.skipTransition(); return; }
  sessionStorage.removeItem(KEY);
  const { x, y } = JSON.parse(raw); const px = x * innerWidth, py = y * innerHeight;
  e.viewTransition.ready.then(() => {
    document.documentElement.animate({ clipPath: [`circle(0px at ${px}px ${py}px)`, `circle(${radius(px, py)}px at ${px}px ${py}px)`] }, { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' });
  });
});
// back/forward cache: never come back to a page still covered
addEventListener('pageshow', (e) => { if (e.persisted) document.querySelectorAll('.pt-cover').forEach((c) => c.getAnimations().forEach((a) => a.cancel())); });

export function themeReveal(btn, apply) {
  btn.addEventListener('click', (e) => {
    const r = btn.getBoundingClientRect(); const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    if (!document.startViewTransition || reduced()) { apply(); return; }
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius(x, y)}px at ${x}px ${y}px)`] }, { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }));
  });
}

document.addEventListener('click', onClick);
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onArrive) : onArrive();
