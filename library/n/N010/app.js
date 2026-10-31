/* N010 Rootline Citrus - one app for index.html (desktop) and m.html (phone).
   Oct 31 refresh: the fruit is real photography (Wikimedia Commons: Evan-Amos lemon PD + lime CC0, Batholith satsuma PD),
   whole and cut open, on a plate of the fruit's own colour. Pick a fruit: the photo slides in and the page floods with its paper.
   Phone = PC: the same photos, the same slide, flood and copy. Only layout differs. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
import { reveals, splitAll, press } from '../../_kit/fx/index.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
splitAll(); reveals(); press('[data-press]');
const live = $('#live');
const say = (t) => { if (live) live.textContent = t; };

/* ---------- the three fruits (copy is plain and general; no invented numbers) ---------- */
const FRUIT = {
  lemon:    { name: 'Lemon',    latin: 'Citrus limon',          paper: '#FFF8DC', accent: '#FFE45C', segs: 9,  seeds: 5,
              peel: 'Thick, oily, bright', taste: 'Sharp, clean acid', season: 'Winter into spring', segText: '8 to 10',
              credit: 'Photo: Evan-Amos, public domain', cutAlt: 'A real lemon cut in half: 8 to 10 segments and a few seeds', cutWH: [900, 953],
              line: 'The loud one. Zest it before you squeeze it; the oil in the peel carries most of the smell.',
              uses: ['Dressings and curd', 'A squeeze over grilled fish', 'Zest in shortbread'] },
  lime:     { name: 'Lime',     latin: 'Citrus × latifolia',    paper: '#F1F8E4', accent: '#8BC34A', segs: 10, seeds: 0,
              peel: 'Thin, glossy, deep green', taste: 'Sour, floral, quick', season: 'High summer', segText: 'About 10',
              credit: 'Photo: Evan-Amos, CC0', cutAlt: 'A real lime cut in half: about 10 segments, seedless', cutWH: [900, 853],
              line: 'Seedless and thin skinned. Roll it under your palm before cutting and it gives up twice as easily.',
              uses: ['Tacos and ceviche', 'Cocktails and soda', 'Green curry'] },
  mandarin: { name: 'Mandarin', latin: 'Citrus reticulata',     paper: '#FFF1E6', accent: '#FF8A3D', segs: 11, seeds: 0,
              peel: 'Loose, zips off by hand', taste: 'Sweet, low acid', season: 'Late autumn to winter', segText: '10 to 12',
              credit: 'Photo: Batholith, public domain', cutAlt: 'A real satsuma mandarin cut in half: 10 to 12 segments, seedless', cutWH: [900, 689],
              line: 'The easy one. The peel lifts away in one piece and the segments come apart without a knife.',
              uses: ['Lunch boxes', 'Winter salads', 'Eaten whole, standing up'] }
};
const ORDER = ['lemon', 'lime', 'mandarin'];
let current = 'lime';

/* ---------- colour flood: the new paper opens as a circle from the fruit ---------- */
const root = document.documentElement;
const flood = document.createElement('div'); flood.className = 'flood'; flood.setAttribute('aria-hidden', 'true'); document.body.prepend(flood);
root.style.setProperty('--floor', FRUIT[current].paper);
function setPaper(hex, origin) {
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = hex;
  if (reduced || !origin) { root.style.setProperty('--c1', hex); root.style.setProperty('--floor', hex); return; }
  flood.style.background = hex;
  flood.style.setProperty('--fx', origin.x + 'px'); flood.style.setProperty('--fy', origin.y + 'px');
  flood.classList.remove('is-on'); void flood.offsetWidth; flood.classList.add('is-on');
  root.style.setProperty('--c1', hex);              /* tints, hairlines and tags follow over the same 700 ms (@property) */
  clearTimeout(setPaper.t);
  setPaper.t = setTimeout(() => { root.style.setProperty('--floor', hex); flood.classList.remove('is-on'); }, 760);
}

/* ---------- copy that follows the fruit ---------- */
function setCopy(key) {
  const f = FRUIT[key];
  $$('[data-f]').forEach((el) => {
    const k = el.dataset.f; let v = f[k];
    if (k === 'segs') v = f.segText;
    if (k === 'uses') { el.innerHTML = f.uses.map((u) => `<li>${u}</li>`).join(''); return; }
    if (v == null) return;
    if (reduced) { el.textContent = v; return; }
    el.classList.add('is-swap'); setTimeout(() => { el.textContent = v; el.classList.remove('is-swap'); }, 180);
  });
  $$('[data-fruit-radio]').forEach((r) => { r.checked = r.value === key; });
  const crate = $('#f-crate'); if (crate && crate.value !== 'mix') crate.value = key;
  $$('.sw').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fruit === key)));
  document.body.dataset.fruit = key;
}

/* ---------- the photo stage: real fruit, whole and cut, slides in from the side it was picked ---------- */
const stageEl = $('[data-stage]');
const photos = {}; $$('[data-photo]', stageEl || document).forEach((el) => { photos[el.dataset.photo] = el; });
const cutImg = $('[data-cut]');
function fruitScreenPoint() {
  const rect = (stageEl || document.body).getBoundingClientRect();
  return { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 };
}
function swapPhoto(prev, key) {
  const dir = ORDER.indexOf(key) > ORDER.indexOf(prev) ? 1 : -1;
  const out = photos[prev], inn = photos[key];
  if (inn) { inn.loading = 'eager'; inn.style.setProperty('--d', String(dir)); inn.classList.remove('is-out'); inn.classList.add('is-pre'); void inn.offsetWidth; inn.classList.remove('is-pre'); inn.classList.add('is-on'); }
  if (out && out !== inn) { out.style.setProperty('--d', String(dir)); out.classList.remove('is-on'); out.classList.add('is-out'); }
}
function swapCut(key) {
  if (!cutImg) return; const f = FRUIT[key];
  const set = () => { cutImg.src = `img/${key}-cut.webp`; cutImg.width = f.cutWH[0]; cutImg.height = f.cutWH[1]; cutImg.alt = f.cutAlt; };
  if (reduced) { set(); return; }
  cutImg.classList.add('is-swap'); setTimeout(() => { set(); const done = () => cutImg.classList.remove('is-swap'); if (cutImg.complete) requestAnimationFrame(done); else cutImg.addEventListener('load', done, { once: true }); }, 200);
}
function choose(key, { fromUser = true } = {}) {
  if (!FRUIT[key] || (key === current && fromUser)) return;
  const prev = current; current = key;
  root.style.setProperty('--c3', FRUIT[key].accent);
  setPaper(FRUIT[key].paper, fruitScreenPoint());
  setCopy(key); swapPhoto(prev, key); swapCut(key);
  say(`${FRUIT[key].name} selected. The page turns ${key === 'lime' ? 'lime green' : key === 'lemon' ? 'pale lemon' : 'mandarin cream'}.`);
}
/* warm the other photos once the page is idle */
(window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => { ORDER.forEach((k) => { const i = new Image(); i.src = `img/${k}-cut.webp`; if (photos[k]) photos[k].loading = 'eager'; }); });

/* switcher, keyboard 1/2/3, crate rows */
$$('.sw').forEach((b) => {
  b.addEventListener('click', () => choose(b.dataset.fruit));
  b.addEventListener('keydown', (e) => {
    const i = ORDER.indexOf(b.dataset.fruit);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const k = ORDER[(i + 1) % 3]; choose(k); $(`.sw[data-fruit=${k}]`).focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const k = ORDER[(i + 2) % 3]; choose(k); $(`.sw[data-fruit=${k}]`).focus(); }
  });
});
$$('.sw').forEach((b) => { b.tabIndex = b.dataset.fruit === current ? 0 : -1; });
const syncTab = () => $$('.sw').forEach((b) => { b.tabIndex = b.dataset.fruit === current ? 0 : -1; });
addEventListener('keydown', (e) => {
  if (e.target.closest('input,select,textarea,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = { 1: 'lemon', 2: 'lime', 3: 'mandarin' }[e.key]; if (k) { choose(k); syncTab(); }
});
document.addEventListener('click', () => syncTab());
$$('[data-fruit-radio]').forEach((r) => r.addEventListener('change', () => { if (r.checked) choose(r.value); }));
$$('[data-crate]').forEach((b) => b.addEventListener('click', () => {
  const sel = $('#f-crate'); if (sel) sel.value = b.dataset.crate;
  if (b.dataset.fruit) choose(b.dataset.fruit);
  const target = $('#reserve'); if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), reduced ? 0 : 700);
}));



/* ---------- phone menu ---------- */
const menuBtn = $('.menu-btn'), menu = $('#menu');
if (menuBtn && menu) {
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu'; if (open) menu.querySelector('a')?.focus(); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
}

/* ---------- nav: mark the section in view ---------- */
const navLinks = $$('.nav a[href^="#"]');
if (navLinks.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
}

/* ---------- reserve form: validate, loading, honest success ---------- */
const form = $('.form');
if (form) {
  const submit = form.querySelector('.submit'), done = form.querySelector('.done'), label = submit.querySelector('.b-label');
  const rules = {
    name: (v) => v.trim().length >= 2 || 'Add the name for the crate label.',
    email: (v) => (!v.trim() ? 'Add an email for the crate note.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email looks incomplete.'),
    ok: (_, el) => el.checked || 'Tick this so we both know nothing is sent.'
  };
  const check = (el) => {
    const r = rules[el.name]; if (!r) return true;
    const res = r(el.value, el), msg = $('#e-' + el.name);
    if (res === true) { el.removeAttribute('aria-invalid'); if (msg) msg.textContent = ''; return true; }
    el.setAttribute('aria-invalid', 'true'); if (msg) msg.textContent = res; return false;
  };
  form.querySelectorAll('input[name=name],input[name=email],input[name=ok]').forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') check(el); });
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) check(el); });
    el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) check(el); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[name=name],input[name=email],input[name=ok]')];
    const bad = fields.filter((el) => !check(el));
    if (bad.length) { bad[0].focus(); say('Please fix the highlighted fields.'); return; }
    submit.setAttribute('aria-busy', 'true'); submit.disabled = true; label.textContent = 'Packing';
    setTimeout(() => {
      submit.removeAttribute('aria-busy'); submit.disabled = false; label.textContent = 'Reserve a crate';
      const crate = $('#f-crate'); const what = crate ? crate.options[crate.selectedIndex].text : 'crate';
      const d = done.querySelector('[data-done-what]'); if (d) d.textContent = what;
      done.hidden = false; submit.hidden = true; done.querySelector('button').focus();
      say('Concept, not sent. Nothing left this page.');
    }, reduced ? 0 : 750);
  });
  form.querySelector('[data-action=reset]').addEventListener('click', () => {
    form.reset(); done.hidden = true; submit.hidden = false; form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    form.querySelectorAll('.err').forEach((x) => (x.textContent = '')); setCopy(current); $('#f-name').focus();
  });
}


/* first paint: copy for the default fruit, no animation */
setCopy(current);
