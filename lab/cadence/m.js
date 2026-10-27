/* TALUS Ridge C1 - phone: touch-first. The live 3D (bike-m.js: same model, materials and HDRI as desktop) loads lazily;
   the webp stills below are only posters while it loads (or if WebGL is unavailable). */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function reveals() {
  const els = [...document.querySelectorAll('[data-rv]')];
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const o = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('rv-in'); o.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  els.forEach((e) => o.observe(e));
}
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const body = document.body, A = '../../assets/lab/cadence/';
const WAYS = {
  glacier: { img: 'still-g0.webp', name: 'Glacier', sub: 'Cold blue-grey under four coats of clear. Looks wet at the trailhead, looks wet after it.' },
  oxide:   { img: 'still-o0.webp', name: 'Oxide', sub: 'The colour of the rock the bike was named after. Iron in the pigment, warm in low sun.' },
  chalk:   { img: 'still-c0.webp', name: 'Chalk', sub: 'Satin over bone white. Shows the dust, wears it well.' },
};
const ORDER = ['glacier', 'oxide', 'chalk'];
// warm the other colourway stills once the paint section is near
const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { ['still-o0.webp', 'still-c0.webp', 'still-d0.webp'].forEach((f) => { const i = new Image(); i.src = A + f; }); near.disconnect(); } }), { rootMargin: '400px' });
near.observe($('#paint'));
function swap(img, src) {
  if (img.getAttribute('src') === src) return;
  if (reduced) { img.src = src; return; }
  img.style.opacity = 0; setTimeout(() => { img.src = src; img.onload = () => { img.style.opacity = 1; }; if (img.complete) img.style.opacity = 1; }, 180);
}
function applyWay(id) {
  const w = WAYS[id]; body.dataset.way = id;
  $$('.way').forEach((b) => { const on = b.dataset.way === id; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  $('#wayName').textContent = w.name; $('#waySub').textContent = w.sub; swap($('#wayImg'), A + w.img);
  if (body.dataset.mode !== 'dusk') swap($('#duskImg'), A + w.img);
}
$$('.way').forEach((b) => b.addEventListener('click', () => applyWay(b.dataset.way)));
$('.ways').addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault();
  const n = (ORDER.indexOf(body.dataset.way) + (e.key === 'ArrowRight' ? 1 : 2)) % 3; applyWay(ORDER[n]); $(`.way[data-way="${ORDER[n]}"]`).focus();
});
// teardown slider: crossfade three baked frames
const r = $('#tearR'), t = [$('.t0'), $('.t1'), $('.t2')], steps = $$('#tearSteps li');
function tear() {
  const v = r.value / 50; // 0..2
  const k = Math.round(v); t.forEach((im, i) => { im.style.opacity = i === k ? 1 : 0; }); steps.forEach((s, i) => s.classList.toggle('on', i === k));
  r.setAttribute('aria-valuetext', steps[k].textContent);
}
r.addEventListener('input', tear); tear();
// studio / dusk
$$('.mode-b').forEach((b) => b.addEventListener('click', () => {
  const m = b.dataset.mode; body.dataset.mode = m;
  $$('.mode-b').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  swap($('#duskImg'), A + (m === 'dusk' ? 'still-d0.webp' : WAYS[body.dataset.way].img));
  $('#duskImg').alt = m === 'dusk' ? 'TALUS Ridge C1 in low dusk light' : 'TALUS Ridge C1 under studio light';
  $('meta[name="theme-color"]').setAttribute('content', m === 'dusk' ? '#2E1A13' : '#ECE6DC');
}));
// spec number roll
const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return; io.unobserve(en.target);
  const el = en.target, to = +el.dataset.to, dec = +(el.dataset.dec || 0);
  if (reduced) { el.textContent = to.toFixed(dec); return; }
  const t0 = performance.now(); const step = (now) => { const p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 4); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
}), { threshold: .6 });
$$('.roll').forEach((el) => io.observe(el));
$('#ctaBtn').addEventListener('click', (e) => { e.preventDefault(); $('#toast').textContent = 'Concept only: there is no bike to book. Thanks for riding along.'; });
reveals();
// live 3D: same model and quality as desktop, loaded after first paint, only renders while a bike figure is on screen
const figs = { hero: $('.hero-bike'), tear: $('.tear'), paint: $('.paint-bike'), dusk: $('.dusk-bike') };
const state = () => ({ way: body.dataset.way, mode: body.dataset.mode, ex: r.value / 100 });
function boot3d() {
  let ok = false; try { const c = document.createElement('canvas'); ok = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { ok = false; }
  if (!ok) return;
  import('./bike-m.js').then((m) => m.start({ figs, state, reduced })).catch(() => {});
}
const go = () => ('requestIdleCallback' in window ? requestIdleCallback(boot3d, { timeout: 900 }) : setTimeout(boot3d, 300));
if (document.readyState === 'complete') go(); else addEventListener('load', go);
