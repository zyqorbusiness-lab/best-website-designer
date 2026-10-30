/* P041 Hotcoal Kitchen - shared app for index.html (desktop) and m.html (phone).
   Signature: a build-your-own pizza made of real photographs. The base is a real marinara pizza (Wikimedia Commons,
   "Pizza marinara (Napoli)" by Ruthven, CC0) rectified to a top-down view; every topping piece is cut out of a real photo
   (pepperoni: Daderot, CC0; cherry tomato: Evan-Amos, CC0; basil: Khoney21, CC0; mozzarella: Dezidor, CC BY 3.0).
   Desktop: drag a bowl onto the pizza (pointer events, a snap ring when you are over it) or click / Enter on a bowl.
   Phone: tap a bowl; the pieces fly from the bowl to the pizza. Pieces land at spaced random spots (no clumps), each
   ingredient on its own layer (cheese under tomato under pepperoni under basil). "Fire it" turns the pizza once on the
   peel while the crust darkens, the cheese melts and the pepperoni crisps, with a 90 s oven clock run fast.
   Hand-made details: (1) every handful lands with a short stagger and a drop shadow that tightens as it settles,
   (2) the order ticket counts up with an odometer and the Fire button explains why it is disabled,
   (3) the ticket's line items are the exact pieces on the pizza, and "remove" lifts the last handful back off.
   Inspired by a pizza-builder site shown in a reel by @online.by.annie (Instagram); nothing of theirs is used. */
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const isM = document.documentElement.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

const ING = {
  mozzarella: { name: 'Fior di latte', price: 2.5, n: 7, size: [0.095, 0.125], imgs: ['mozzarella-1', 'mozzarella-2', 'mozzarella-3', 'mozzarella-4', 'mozzarella-5'], spin: true },
  tomato:     { name: 'Cherry tomato', price: 2.0, n: 6, size: [0.085, 0.1], imgs: ['tomato'], spin: true },
  pepperoni:  { name: 'Pepperoni',     price: 3.0, n: 7, size: [0.12, 0.14], imgs: ['pepperoni-1', 'pepperoni-2', 'pepperoni-3', 'pepperoni-4'], spin: true },
  basil:      { name: 'Basil',         price: 1.0, n: 5, size: [0.1, 0.125], imgs: ['basil'], spin: true, tall: true }
};
const BASE = 9, MAX = 3;
const board = $('#board'), pie = $('#pie'), lines = $('#t-lines'), totalEl = $('#t-total'), fireBtn = $('#fire'), why = $('#fire-why');
const mbTotal = $('#mb-total'), mbFire = $('#mb-fire'), meter = $('#fire-meter');
const state = { portions: { mozzarella: [], tomato: [], pepperoni: [], basil: [] }, fired: false, busy: false };
const fmt = (v) => v.toFixed(2);

/* seeded random so a session feels hand-placed but stable */
let seed = (Date.now() % 100000) + 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ---------- placement: spaced random points inside the sauce (r < 0.72) ---------- */
function placeSpots(type, count) {
  const all = Object.values(state.portions).flat().flat();
  const same = state.portions[type].flat();
  const spots = []; let tries = 0;
  while (spots.length < count && tries < 900) {
    tries++;
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.70;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const minSame = 0.21 - tries / 9000, minAny = 0.1 - tries / 18000;
    if (spots.some((s) => Math.hypot(s.x - x, s.y - y) < minSame)) continue;
    if (same.some((p) => Math.hypot(p.x - x, p.y - y) < minSame * 0.9)) continue;
    if (all.some((p) => Math.hypot(p.x - x, p.y - y) < minAny)) continue;
    spots.push({ x, y });
  }
  return spots;
}

/* ---------- add a handful ---------- */
function addPortion(type, from) {
  if (state.fired || state.busy) return;
  const P = state.portions[type]; if (P.length >= MAX) { flash(`Three handfuls of ${ING[type].name.toLowerCase()} is the most we put on.`); return; }
  const cfg = ING[type], layer = pie.querySelector(`[data-z="${type}"]`), rect = pie.getBoundingClientRect();
  const spots = placeSpots(type, cfg.n), pieces = [];
  spots.forEach((s, i) => {
    const el = document.createElement('img');
    el.src = `img/${cfg.imgs[(P.length * 3 + i) % cfg.imgs.length]}.webp`; el.alt = ''; el.draggable = false; el.className = 'piece';
    const size = cfg.size[0] + rnd() * (cfg.size[1] - cfg.size[0]), rot = rnd() * 360, flip = rnd() > 0.5 ? -1 : 1;
    el.style.cssText = `--x:${50 + s.x * 50}%;--y:${50 + s.y * 50}%;--s:${size * 100}%;--r:${rot}deg;--f:${flip}`;
    layer.append(el); pieces.push({ el, x: s.x, y: s.y });
    if (!reduced) {
      const fx = from ? from.x - (rect.left + rect.width * (0.5 + s.x / 2)) : 0, fy = from ? from.y - (rect.top + rect.height * (0.5 + s.y / 2)) : -40;
      el.animate([
        { transform: `translate(-50%,-50%) translate(${fx}px,${fy}px) rotate(${rot - 40}deg) scale(${flip * 1.25},1.25)`, opacity: 0, filter: 'drop-shadow(0 18px 14px rgba(40,30,20,.0))' },
        { opacity: 1, offset: 0.25 },
        { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${flip * 1.06},1.06)`, offset: 0.82, filter: 'drop-shadow(0 6px 6px rgba(40,30,20,.28))' },
        { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${flip},1)`, opacity: 1, filter: 'drop-shadow(0 2px 2px rgba(40,30,20,.32))' }
      ], { duration: 560 + i * 10, delay: i * 38, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    }
  });
  P.push(pieces); sync(type);
}
function removePortion(type) {
  if (state.fired) return; const P = state.portions[type]; const last = P.pop(); if (!last) return;
  last.forEach(({ el }, i) => { if (reduced) { el.remove(); return; } el.animate([{ opacity: 1 }, { opacity: 0, transform: `translate(-50%,-60%) rotate(var(--r)) scale(1.15)` }], { duration: 260, delay: i * 18, easing: 'ease-in', fill: 'forwards' }).onfinish = () => el.remove(); });
  sync(type);
}

/* ---------- ticket ---------- */
function total() { return BASE + Object.entries(state.portions).reduce((t, [k, v]) => t + v.length * ING[k].price, 0); }
let shown = BASE;
function roll(to) {
  const from = shown; shown = to; const t0 = performance.now();
  const step = (t) => { const k = reduced ? 1 : Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - k, 4), v = from + (to - from) * e; totalEl.textContent = fmt(v); if (mbTotal) mbTotal.textContent = fmt(v); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function sync(changed) {
  lines.querySelectorAll('.t-line:not(.t-base)').forEach((l) => l.remove());
  const names = ['Marinara base'];
  for (const [k, v] of Object.entries(state.portions)) {
    if (!v.length) continue; names.push(`${ING[k].name}${v.length > 1 ? ' x' + v.length : ''}`);
    const li = document.createElement('li'); li.className = 't-line' + (k === changed ? ' is-new' : '');
    li.innerHTML = `<span>${ING[k].name} <i class="mono">x${v.length}</i></span><span class="mono">$${fmt(v.length * ING[k].price)}</span>` + (state.fired ? '' : `<button class="t-rm" type="button" aria-label="Remove one handful of ${ING[k].name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>`);
    li.querySelector('.t-rm')?.addEventListener('click', () => removePortion(k));
    lines.append(li);
  }
  $$('.dish').forEach((d) => { const n = state.portions[d.dataset.ing].length; d.querySelector('.dish-n').textContent = n ? 'x' + n : ''; d.setAttribute('aria-label', `${ING[d.dataset.ing].name}, ${n} of ${MAX} handfuls. Add one`); d.classList.toggle('is-full', n >= MAX); });
  const toppings = Object.values(state.portions).reduce((t, v) => t + v.length, 0);
  [fireBtn, mbFire].forEach((b) => b && b.setAttribute('aria-disabled', String(!toppings || state.fired)));
  why.textContent = state.fired ? '' : toppings ? 'Ready when you are.' : 'Add at least one topping first.';
  roll(total());
  const summary = names.join(', ');
  board.setAttribute('aria-label', `Your pizza: ${summary.toLowerCase()}`);
  $('#od-sum').textContent = `Your pizza: ${summary}. $${fmt(total())}.`; $('#od-pizza').value = summary;
}
let flashT = 0; function flash(msg) { why.textContent = msg; clearTimeout(flashT); flashT = setTimeout(() => sync(), 2600); }

/* ---------- bowls: click / Enter / tap to add; drag on desktop ---------- */
const ghost = $('#ghost');
$$('.dish').forEach((d) => {
  const type = d.dataset.ing; let start = null, dragging = false;
  d.addEventListener('click', (e) => { if (dragging) { dragging = false; return; } const r = d.querySelector('.dish-bowl').getBoundingClientRect(); addPortion(type, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); });
  if (!fine || isM || !ghost) return;
  d.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; start = { x: e.clientX, y: e.clientY }; d.setPointerCapture(e.pointerId); });
  d.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) {
      if (state.fired || state.portions[type].length >= MAX) { start = null; return; }
      dragging = true; ghost.innerHTML = d.querySelector('.dish-bowl').innerHTML; ghost.classList.add('is-on'); document.body.classList.add('is-dragging');
    }
    if (dragging) { ghost.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; board.classList.toggle('is-over', overPie(e.clientX, e.clientY)); }
  });
  const end = (e) => {
    if (!start) return; start = null; document.body.classList.remove('is-dragging');
    if (!dragging) return;
    const hit = overPie(e.clientX, e.clientY); board.classList.remove('is-over'); ghost.classList.remove('is-on');
    if (hit) addPortion(type, { x: e.clientX, y: e.clientY }); else if (!reduced) { const r = d.getBoundingClientRect(); ghost.animate([{ transform: `translate(${e.clientX}px,${e.clientY}px)`, opacity: 1 }, { transform: `translate(${r.left + r.width / 2}px,${r.top + r.height / 2}px)`, opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    setTimeout(() => (dragging = false), 0);
  };
  d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
});
function overPie(x, y) { const r = pie.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width * 0.5; }

/* ---------- fire it ---------- */
function fire() {
  const toppings = Object.values(state.portions).reduce((t, v) => t + v.length, 0);
  if (!toppings) { flash('Add at least one topping first.'); return; }
  if (state.fired || state.busy) return;
  state.busy = true; board.classList.add('is-firing'); document.body.classList.add('is-firing');
  const D = reduced ? 0 : 2600, t0 = performance.now();
  if (!reduced) pie.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: D, easing: 'cubic-bezier(.76,0,.24,1)' });
  const tick = (t) => { const k = D ? Math.min(1, (t - t0) / D) : 1; meter.textContent = `In the oven: ${Math.round(k * 90)} s at 485\u00b0C`; if (k < 1) requestAnimationFrame(tick); else done(); };
  requestAnimationFrame(tick);
  function done() {
    state.busy = false; state.fired = true; board.classList.remove('is-firing'); board.classList.add('is-fired'); document.body.classList.remove('is-firing');
    const no = 'HC-' + String(1000 + Math.floor(rnd() * 8999)); meter.textContent = 'Fired in 90 seconds.'; $('#t-no').textContent = `Ticket ${no}. Out of the oven.`;
    $('#t-done').hidden = false; fireBtn.hidden = true; sync(); $('#t-done .btn').focus({ preventScroll: true });
    if (mbFire) { mbFire.textContent = 'Order it'; mbFire.setAttribute('aria-disabled', 'false'); }
  }
}
fireBtn.addEventListener('click', fire);
mbFire && mbFire.addEventListener('click', () => { if (state.fired) document.getElementById('order').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); else fire(); });
$('#again').addEventListener('click', () => {
  Object.keys(state.portions).forEach((k) => { state.portions[k] = []; }); $$('.piece').forEach((p) => p.remove());
  state.fired = false; board.classList.remove('is-fired'); $('#t-done').hidden = true; fireBtn.hidden = false; meter.textContent = '';
  if (mbFire) mbFire.textContent = 'Fire it'; sync(); $('.dish').focus({ preventScroll: true });
});
sync();

/* ---------- self-test hook for QA: add one of each, check layering and the ticket ---------- */
window.__p041 = { addPortion, fire, state, total };
