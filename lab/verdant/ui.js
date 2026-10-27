/* Verdant - shared UI (no three.js here, so the phone build stays light). */
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isM = document.documentElement.dataset.build === 'm';
const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function revealsLite() {
  const els = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/* organic flower mask: 6 rounded petals that breathe, rotate and open to a circle */
function flowerPath(cx, cy, R, n, depth, rot, t, N) {
  let d = '';
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 1 - depth * (1 - Math.pow(Math.abs(Math.cos((n * (a + rot)) / 2)), 0.7));
    const wob = 1 + 0.025 * Math.sin(3 * a + t * 1.1) * (depth > 0.01 ? 1 : 0);
    const r = R * k * wob;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
}
const mask = { sec: null, stick: null, photo: null, img: null, copy: null };
function maskFrame(t) {
  const b = mask.sec.getBoundingClientRect(), H = innerHeight;
  if (b.bottom < -50 || b.top > H + 50) return;
  const W = mask.stick.clientWidth, SH = mask.stick.clientHeight;
  const p = clamp(-b.top / (b.height - SH));
  const g = eio(clamp(p / 0.7));
  const depth = 0.36 * (1 - g) * (0.88 + 0.12 * Math.sin(t * 1.3));
  const Rmin = Math.min(W, SH) * (isM ? 0.16 : 0.1), Rmax = Math.hypot(W, SH) / 2 * 1.08;
  const R = lerp(Rmin, Rmax, g) / (1 - depth * 0.5);
  const rot = p * 1.8 + t * 0.06;
  mask.photo.style.clipPath = `path('${flowerPath(W / 2, SH * 0.55, R, 6, depth, rot, t, isM ? 90 : 140)}')`;
  mask.img.style.transform = `scale(${1.4 - 0.4 * g}) rotate(${(1 - g) * -8}deg)`;
  const c = ss(0.74, 0.9, p);
  mask.copy.style.opacity = c; mask.copy.style.transform = `translateY(${(1 - c) * 30}px)`;
}

const CARE = [
  { t: 'How much light?', s: 'Most of our plants love a bright room without harsh midday sun on the leaves.', v: [3, 2, 1, 2], x: ['Bright, indirect', 'Medium shade', 'Low light is fine', 'Soft, filtered'] },
  { t: 'How often to water?', s: 'Push a finger into the soil. If the top two centimetres are dry, it is time.', v: [3, 4, 1, 4], x: ['Every 7 to 10 days', 'Keep lightly moist', 'Every 3 weeks', 'Never let it dry out'] },
  { t: 'How humid?', s: 'Group plants together or set them on a tray of wet pebbles to raise the moisture around the leaves.', v: [3, 5, 1, 5], x: ['50% or more', '60%+, mist often', 'Any room works', 'Bathroom happy'] },
];
function initCare() {
  const tabs = $$('.tabs [role="tab"]'), panel = $('#care-panel'), arts = $$('.art'), rows = $$('#meters li');
  let cur = -1;
  const show = (k, focus) => {
    if (k === cur) return; cur = k;
    tabs.forEach((b, j) => { b.setAttribute('aria-selected', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[k].id);
    arts.forEach((a, j) => a.classList.toggle('on', j === k));
    if (focus) tabs[k].focus();
    panel.classList.add('fade');
    setTimeout(() => {
      const C = CARE[k]; $('#cp-title').textContent = C.t; $('#cp-sub').textContent = C.s;
      rows.forEach((r, i) => {
        r.querySelector('.mt').textContent = C.x[i];
        [...r.querySelectorAll('.mbar i')].forEach((bar, j) => setTimeout(() => bar.classList.toggle('on', j < C.v[i]), reduced ? 0 : i * 70 + j * 45));
      });
      panel.classList.remove('fade');
    }, reduced ? 0 : 260);
  };
  tabs.forEach((b, j) => {
    b.addEventListener('click', () => show(j));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show((j + (e.key === 'ArrowRight' ? 1 : 2)) % 3, true); }
    });
  });
  show(0);
  return rows;
}

export function initUI(opts = {}) {
  const lenis = () => opts.lenis && opts.lenis();
  const go = (el) => {
    const L = lenis();
    if (L) L.scrollTo(el || 0, { duration: 1.5 });
    else if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1); if (!id || id === 'main') return;
    e.preventDefault(); if (a.id === 'cta') return; go(id === 'top' ? null : document.getElementById(id));
  }));
  $('#cta').addEventListener('click', () => { $('#toast').textContent = 'Concept only: Verdant is a fictional studio, so there are no visits to book.'; });
  const rows = initCare();
  $$('.c-go').forEach((b) => b.addEventListener('click', () => {
    const r = rows[+b.dataset.plant]; go(document.getElementById('care'));
    r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash');
  }));
  // magnetic pills (fine pointer only)
  if (hover && !reduced) {
    $$('.mag').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const b = el.getBoundingClientRect(); const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        el.style.transition = 'transform .15s'; el.style.transform = `translate(${dx * 0.22}px,${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
    });
  }
  // mask reveal loop
  Object.assign(mask, { sec: $('#mask'), stick: $('.m-stick'), photo: $('#mphoto'), img: $('#mphoto img'), copy: $('.m-copy') });
  if (!reduced) {
    let t = 0, last = performance.now();
    const loop = (now) => { t += Math.min(0.05, (now - last) / 1000); last = now; maskFrame(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  makeFlies($('.flies.hf'), isM ? 7 : 12, 11); makeFlies($('.flies.af'), 9, 23);
  const mode = initMode({ onChange: opts.onMode });
  const start = () => document.body.classList.add('ready');
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(start));
  setTimeout(start, 1500);
  return { mode };
}

/* ---------- fireflies (DOM, cheap; paused while it is daytime) ---------- */
export function makeFlies(el, n, seed = 7) {
  if (!el) return;
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let html = '';
  for (let i = 0; i < n; i++) {
    const st = [
      `--x:${(4 + rnd() * 92).toFixed(1)}%`, `--y:${(8 + rnd() * 84).toFixed(1)}%`, `--s:${(3 + rnd() * 3.5).toFixed(1)}px`,
      `--dx:${((rnd() - 0.5) * 120).toFixed(0)}px`, `--dy:${((rnd() - 0.5) * 90).toFixed(0)}px`,
      `--d:${(5 + rnd() * 6).toFixed(1)}s`, `--b:${(2.2 + rnd() * 2.6).toFixed(1)}s`, `--dl:${(-rnd() * 8).toFixed(1)}s`,
    ].join(';');
    html += `<i style="${st}"></i>`;
  }
  el.innerHTML = html;
}

/* ---------- Sunlit / Dusk: one switch that re-lights the whole page ----------
   The new state is revealed by a circular wipe that grows out of the switch itself (View Transitions),
   while the window keeps playing its own sequence: the sun arcs down, a gold wash, dusk, moon, stars. */
const THEME = ['#EEF0E4', '#18301F'];
export function initMode(opts = {}) {
  const root = document.documentElement, btns = $$('.mode-b'), sky = $('.sky'), h1 = $('#h1'), tc = $('#tc');
  const tws = $$('.tw'); tws.forEach((t) => { t.dataset.day = t.textContent; });
  let cur = 0, busy = false;
  const apply = (on) => {
    root.classList.toggle('dusk', !!on);
    btns.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.m === on)));
    tws.forEach((t) => { t.textContent = on ? t.dataset.dusk : t.dataset.day; });
    if (h1) h1.setAttribute('aria-label', on ? 'Plants that unwind with you.' : 'Plants that breathe with you.');
    if (tc) tc.content = THEME[on];
    if (sky && !reduced) { sky.parentElement.classList.remove('flip'); void sky.offsetWidth; sky.parentElement.classList.add('flip'); }
    opts.onChange && opts.onChange(on);
  };
  const set = (on, from) => {
    on = on ? 1 : 0; if (on === cur || busy) return; cur = on;
    if (reduced) { root.classList.add('rm-instant'); apply(on); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('rm-instant'))); return; }
    const b = (from || btns[on]).getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.04;
    if (!document.startViewTransition) {
      root.classList.add('mode-anim'); apply(on); setTimeout(() => root.classList.remove('mode-anim'), 1000); return;
    }
    busy = true;
    const vt = document.startViewTransition(() => apply(on));
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 1150, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    vt.finished.finally(() => { busy = false; });
  };
  btns.forEach((b) => {
    b.addEventListener('click', () => set(+b.dataset.m, b));
    b.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); const n = cur ? 0 : 1; set(n, btns[n]); btns[n].focus(); }
    });
  });
  return { set, get: () => cur };
}
