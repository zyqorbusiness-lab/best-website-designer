// example app: the same code runs on index.html (desktop) and m.html (phone); both load models/flight-helmet.glb
import { createViewer } from './loader.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const MODEL = 'models/flight-helmet.glb';

// ---------- reveal on scroll (opacity + 20px rise, 480 ms expo-out; none with reduced motion) ----------
const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach((el, i) => { el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms'; rio.observe(el); });

// ---------- 3D stage ----------
const stage = $('[data-stage]');
const VIEWS = {
  start:   { theta: 0.55, phi: 1.3, r: 1 },
  full:    { theta: 0.55, phi: 1.3, r: 1 },
  goggles: { at: [0.03, 0.27, 0.13], theta: 0.3, phi: 1.4, r: 0.27 },
  leather: { at: [0.02, 0.24, -0.06], theta: 2.45, phi: 1.2, r: 0.3 },
  stand:   { at: [0.04, -0.28, 0.06], theta: 0.95, phi: 1.4, r: 0.36 },
};
const phone = document.body.classList.contains('is-phone');
// portrait phones see less width, so close-ups step back a little (same model, same file)
if (phone) for (const k of ['goggles', 'leather', 'stand']) VIEWS[k] = { ...VIEWS[k], r: VIEWS[k].r * 1.45 };
const viewer = createViewer({
  el: stage, model: MODEL, hdr: 'studio_1k.hdr', views: VIEWS, fit: phone ? 1.08 : 1.18,
  decoders: { draco: 'vendor/three/examples/jsm/libs/draco/gltf/', basis: 'vendor/three/examples/jsm/libs/basis/' },
  poster: 'img/poster.webp', posterAlt: 'The flight helmet on its wooden stand',
  autoRotate: 0.1, maxDpr: 2,
  onProgress: (p) => { const b = $('[data-bar]'); if (b) b.style.width = Math.round(p * 100) + '%'; },
});
viewer.ready.then((v) => {
  stage.classList.add('is-loaded');
  const ent = performance.getEntriesByName(new URL(MODEL, location.href).href)[0];
  const ms = v.stats.loadMs ?? (ent ? ent.duration : null);
  const el = $('[data-load]');
  if (el && ms != null) el.firstChild.nodeValue = (ms / 1000).toFixed(1) + ' s';
  const st = $('[data-status]');
  if (v.fallback) st.textContent = 'Showing a still: 3D is not available on this device.';
  else st.remove();   // loaded: the status line leaves the page (no invisible text left behind)
});
// view chips: one pressed at a time; auto-rotate stops while looking at a detail
$$('[data-view]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const name = b.dataset.view;
  viewer.pivot && (viewer.pivot.rotation.y = 0);
  viewer.goTo(name, 900);
  stage.querySelector('.hint') && (stage.querySelector('.hint').style.opacity = name === 'full' ? '1' : '0');
}));

// ---------- compare slider ----------
const DATA = { metrics: null };
fetch('img/metrics.json').then((r) => r.json()).then((m) => { DATA.metrics = m; paint(); }).catch(() => {});
let variant = 'skill', cview = 'leather';
const slider = $('[data-slider]'), range = slider.querySelector('input');
const setX = (v) => slider.style.setProperty('--x', v + '%');
range.addEventListener('input', () => setX(range.value));
const LABEL = { skill: 'This skill', v3: 'Round-2 recipe', r1: 'Round-1 recipe' };
function paint() {
  const after = $('[data-after]'), before = $('[data-before]');
  const src = `img/${cview}_${variant}.webp`;
  if (!after.src.endsWith(src)) {
    const img = new Image(); img.src = src; after.classList.add('swap');
    img.decode().catch(() => {}).then(() => { after.src = src; before.src = `img/${cview}_original.webp`; after.classList.remove('swap'); });
  }
  after.alt = `${LABEL[variant]}, ${cview} close-up`; before.alt = `Original model, ${cview} close-up`;
  $('[data-rlab]').textContent = LABEL[variant];
  const m = DATA.metrics?.[variant]?.per_view?.[cview];
  if (m) {
    $('[data-psnr]').textContent = m.psnr + ' dB'; $('[data-chg]').textContent = m.changed_pct + '%';
    const ok = DATA.metrics[variant].worst.psnr >= 38 && DATA.metrics[variant].worst.changed_pct <= 1;
    const v = $('[data-verdict]'); v.className = 'verdict rv in ' + (ok ? 'ok' : 'bad');
    v.innerHTML = (ok ? CHECK : WARN) + `<span>${ok ? 'Identical' : 'Visible change'}</span>`;
  }
}
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>';
$$('[data-v]').forEach((b) => b.addEventListener('click', () => { variant = b.dataset.v; $$('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); paint(); }));
$$('[data-cv]').forEach((b) => b.addEventListener('click', () => { cview = b.dataset.cv; $$('[data-cv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); paint(); }));
// a gentle first sweep so people see it is a slider (skipped with reduced motion)
const sio = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; sio.disconnect(); if (reduced.matches) return;
  const t0 = performance.now(); const ease = (t) => 1 - Math.pow(2, -10 * t);
  (function step(now) { const t = Math.min(1, (now - t0) / 1400); const v = 50 + Math.sin(ease(t) * Math.PI * 2) * 18 * (1 - t); setX(v); range.value = v; if (t < 1) requestAnimationFrame(step); })(t0);
}, { threshold: 0.6 });
sio.observe(slider);

// ---------- copy buttons ----------
$$('.copy').forEach((b) => b.addEventListener('click', async () => {
  const txt = b.parentElement.querySelector('code').textContent;
  try { await navigator.clipboard.writeText(txt); } catch { const r = document.createRange(); r.selectNodeContents(b.parentElement.querySelector('code')); getSelection().removeAllRanges(); getSelection().addRange(r); }
  b.classList.add('done'); b.setAttribute('aria-label', 'Copied'); setTimeout(() => { b.classList.remove('done'); b.setAttribute('aria-label', 'Copy command'); }, 1600);
}));
window.__viewer = viewer;
