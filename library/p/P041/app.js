/* P041 Hotcoal Kitchen, best-4 flagship (Oct 30 2026): app.js, shared by index.html (desktop) and m.html (phone).
   One scroll engine: a single requestAnimationFrame loop reads each pinned section's progress from getBoundingClientRect()
   (CSS position: sticky, no scroll library, no scroll-jacking), lerped 0.12 per frame. Canvases draw only while on screen.
   Beats: intro poster -> hero pizza turning on the peel -> dough stretches into the base -> build (drag / tap / keyboard)
   -> the oven: scroll is the clock, 00 to 90 s, your exact pieces bake one handful at a time -> menu rows load onto the board
   -> pickup form that ends in "Concept: not sent". Reduced motion: every pinned section shows its end state as a still. */
import { ING, ORDER, makeModel, addHandful, count, PieView, warmAll, onImage, sstep, easeOut } from './pizza.js';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isM = document.documentElement.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const BASE = 9, MAX = 3, fmt = (v) => v.toFixed(2);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
const FLOUR = '#F4EDE1', TOMATO = '#A93A23';

/* ---------- reveals ---------- */
const rv = $$('[data-rv]');
if (reduced || !('IntersectionObserver' in window)) rv.forEach((e) => e.classList.add('in'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  rv.forEach((e) => { const sib = [...e.parentElement.children].filter((c) => c.hasAttribute('data-rv')); e.style.setProperty('--i', Math.min(sib.indexOf(e), 6)); io.observe(e); }); }

/* ---------- views ---------- */
let heroGo = false;
const views = [];
const vis = new Map();
const seen = new IntersectionObserver((es) => es.forEach((e) => { vis.set(e.target, e.isIntersecting); if (e.isIntersecting) dirtyAll(); }), { rootMargin: '200px 0px' });
function view(cv, model, opt) { const v = new PieView(cv, model, { small: isM, dprMax: 2, ...opt }); v.el = cv; v.dirty = true; views.push(v); seen.observe(cv); return v; }
const dirtyAll = () => views.forEach((v) => (v.dirty = true));
onImage(dirtyAll);

/* hero: a finished pizza on the peel, cut in eight, turning 4 deg/s (phone 2 deg/s) */
const heroModel = makeModel();
['mozzarella', 'mozzarella', 'tomato', 'pepperoni', 'basil'].forEach((t) => addHandful(heroModel, t, { now: -1e6, preload: false }));
const hero = view($('#hero-cv'), heroModel, { small: true }); /* 1024 px bases: the hero pizza is at most ~1040 device px wide */ hero.uniform = 1; hero.slice = 1;
const heroSec = $('#hero');

/* builder + oven share one model: the oven bakes exactly the pieces you dropped */
const model = makeModel();
const build = view($('#build-cv'), model);
const fireCv = $('#fire-cv');
const marg = makeModel(); ['mozzarella', 'tomato', 'basil'].forEach((t) => addHandful(marg, t, { now: -1e6, preload: false }));
const fire = view(fireCv, model); fire.clock = 0;

/* ---------- hours (sample) ---------- */
(() => { const d = new Date().getDay(), rows = $$('#hours tr'); let row = rows.find((r) => r.dataset.d.split(',').includes(String(d)));
  if (row) row.classList.add('today'); const chip = $('#hours-chip span'); const t = row ? row.querySelector('td').textContent : '';
  if (/closed/i.test(t)) { chip.textContent = 'Closed today, open Tuesday at 11'; $('#hours-chip').classList.add('closed'); } else if (t) chip.textContent = `Open today ${t}`; })();

/* ---------- ticket ---------- */
const lines = $('#t-lines'), totalEl = $('#t-total'), empty = $('#t-empty'), clearBtn = $('#t-clear'), flashEl = $('#b-flash'), mbTotal = $('#mb-total');
const total = () => BASE + ORDER.reduce((t, k) => t + model.portions[k].length * ING[k].price, 0);
function describe() { const on = ORDER.filter((k) => model.portions[k].length); return on.length ? on.map((k) => ING[k].name.toLowerCase() + (model.portions[k].length > 1 ? ` x${model.portions[k].length}` : '')).join(', ') : ''; }
let shown = BASE, tick = 0;
function sync() {
  lines.innerHTML = '<li class="t-line"><span>Marinara base</span><span class="mono">$9.00</span><span></span></li>' + ORDER.filter((k) => model.portions[k].length).map((k) => {
    const n = model.portions[k].length; return `<li class="t-line"><span>${ING[k].name}${n > 1 ? ` <span class="mono">x${n}</span>` : ''}</span><span class="mono">$${fmt(n * ING[k].price)}</span><button class="x" type="button" data-rm="${k}" aria-label="Remove one handful of ${ING[k].name.toLowerCase()}">&minus;</button></li>`; }).join('');
  const n = count(model); empty.hidden = n > 0; clearBtn.disabled = !n;
  $$('.bowl').forEach((b) => { const c = model.portions[b.dataset.type].length; b.querySelector('.b-n').textContent = c ? `${c} of 3` : ''; b.classList.toggle('full', c >= MAX); });
  const to = total(), from = shown; cancelAnimationFrame(tick);
  const t0 = performance.now(), go = (now) => { const k = reduced ? 1 : clamp((now - t0) / 420); shown = from + (to - from) * easeOut(k); totalEl.textContent = fmt(shown); if (mbTotal) mbTotal.textContent = fmt(shown); if (k < 1) tick = requestAnimationFrame(go); };
  tick = requestAnimationFrame(go);
  const d = describe(); build.el.setAttribute('aria-label', `Your pizza: marinara base${d ? ' with ' + d : ''}`);
  $('#od-sum').textContent = `Your pizza: marinara base${d ? ' with ' + d : ''}, $${fmt(to)}.`;
  fire.model = n ? model : marg; $('#f-note').textContent = n ? 'This is the pizza you built, piece for piece.' : 'Your board is empty, so the oven shows a plain margherita.';
  dirtyAll();
}
let flashT = 0; const flash = (m) => { flashEl.textContent = m; clearTimeout(flashT); flashT = setTimeout(() => (flashEl.textContent = ''), 2600); };
function add(type, opt = {}) {
  if (model.portions[type].length >= MAX) { flash(`Three handfuls of ${ING[type].name.toLowerCase()} is the most we put on.`); return false; }
  addHandful(model, type, opt); sync(); return true;
}
lines.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (!b) return; model.portions[b.dataset.rm].pop(); sync(); });
clearBtn.addEventListener('click', () => { ORDER.forEach((k) => (model.portions[k] = [])); sync(); flash('Board cleared.'); });

/* ---------- drag / tap / keyboard ---------- */
const board = $('#board'), ring = $('#ring');
const pieRect = () => build.el.getBoundingClientRect();
const toPie = (x, y) => { const r = pieRect(); return { x: ((x - r.left) / r.width) * 2 - 1, y: ((y - r.top) / r.height) * 2 - 1 }; };
const onPie = (p) => Math.hypot(p.x, p.y) < 0.98;
function showRing(p) { const r = pieRect(), b = board.getBoundingClientRect(); ring.style.left = `${r.left - b.left + (p.x + 1) / 2 * r.width}px`; ring.style.top = `${r.top - b.top + (p.y + 1) / 2 * r.height}px`; ring.classList.add('on'); }
const hideRing = () => ring.classList.remove('on');
let ghost = null, drag = null;
$$('.bowl').forEach((b) => {
  const type = b.dataset.type;
  b.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; drag = { b, type, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId }; });
  b.addEventListener('click', () => { if (b._dragged) { b._dragged = false; return; } if (performance.now() - (b._kbd || -1e9) < 600) return; add(type); });
  b.addEventListener('keydown', (e) => {
    const k = e.key, st = b._kp || { x: 0, y: 0 };
    if (k.startsWith('Arrow')) { e.preventDefault(); const d = 0.12; if (k === 'ArrowLeft') st.x -= d; if (k === 'ArrowRight') st.x += d; if (k === 'ArrowUp') st.y -= d; if (k === 'ArrowDown') st.y += d;
      const m = Math.hypot(st.x, st.y); if (m > 0.7) { st.x *= 0.7 / m; st.y *= 0.7 / m; } b._kp = st; showRing(st); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); b._kbd = performance.now(); add(type, b._kp ? { near: { ...b._kp } } : {}); }
  });
  b.addEventListener('blur', () => { b._kp = null; hideRing(); });
});
addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
  if (!drag.moved) { drag.moved = true; ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.append(drag.b.querySelector('.dish').cloneNode(true)); document.body.append(ghost); document.documentElement.classList.add('dragging'); }
  ghost.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  const p = toPie(e.clientX, e.clientY); if (onPie(p)) showRing(p); else hideRing();
}, { passive: true });
const endDrag = (e) => {
  if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag; drag = null;
  if (!d.moved) return; d.b._dragged = true; setTimeout(() => (d.b._dragged = false), 50);
  ghost?.remove(); ghost = null; document.documentElement.classList.remove('dragging'); hideRing();
  if (e && e.type === 'pointerup') { const p = toPie(e.clientX, e.clientY); if (onPie(p)) add(d.type, { near: { x: p.x * 0.9, y: p.y * 0.9 } }); else flash('Drop it on the base.'); }
};
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

/* ---------- menu: "Load it" flies the toppings onto the board ---------- */
$$('[data-load]').forEach((btn) => btn.addEventListener('click', () => {
  ORDER.forEach((k) => (model.portions[k] = [])); sync();
  $('#build').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  const types = btn.dataset.load.split(','); const wait = reduced ? 0 : 650, now = performance.now();
  types.forEach((t, i) => addHandful(model, t, { fly: reduced ? null : { x: 0, y: -260 }, delay: wait + i * 160, now }));
  sync(); flash(`${btn.dataset.name} is on your board. Change anything you like.`);
}));

/* ---------- the scroll engine ---------- */
const END = { dough: 1, fire: 0.9 }; /* reduced motion: each pinned section's end state (the oven's is the finished pizza, still inside) */
const pins = $$('.pin').map((el) => ({ el, id: el.id, p: reduced ? END[el.id] : 0, t: 0 }));
const dough = { ball: $('.dough-ball'), base: $('.dough-base'), labels: $$('.d-labels li') };
const F = { sec: $('#fire'), pie: $('#f-pie'), clock: $('#clock'), k: $('#clock-k'), order: $('#f-order'), stage: $('#fire-stage'), oven: $('.oven'), steam: $('.steam') };
const progress = (el) => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span) : (r.top < innerHeight * 0.5 ? 1 : 0); };
const ioS = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2; };
function applyDough(p) {
  const s = sstep(0.15, 0.7, p);
  dough.ball.style.setProperty('--ds', (0.3 + 0.75 * s).toFixed(4));
  dough.ball.style.setProperty('--da', (1 - sstep(0.55, 0.75, p)).toFixed(3));
  dough.base.style.setProperty('--mask', `${(sstep(0.3, 0.72, p) * 50).toFixed(2)}%`);
  dough.base.style.setProperty('--bo', sstep(0.3, 0.45, p).toFixed(3));
  [0.30, 0.48, 0.66].forEach((a, i) => dough.labels[i].style.setProperty('--o', clamp((p - a) / 0.06).toFixed(3)));
}
const KS = [[0, 'Into the oven'], [1, 'Baking'], [30, 'The cheese melts'], [55, 'Pepperoni cups'], [72, 'Leopard spots'], [90, 'Done. Ninety seconds.']];
let lastClock = -1;
function applyFire(p) {
  const w = F.oven.getBoundingClientRect().width;
  const inn = ioS(0, 0.2, p), out = ioS(0.9, 1, p);
  const fx = (-(0.62) * (1 - inn) - 0.62 * out) * w;
  F.pie.style.setProperty('--fx', fx.toFixed(1));
  const c = Math.round(clamp((p - 0.2) / 0.7) * 90); fire.clock = clamp((p - 0.2) / 0.7) * 90;
  if (c !== lastClock) { lastClock = c; F.clock.textContent = String(c).padStart(2, '0'); F.k.textContent = KS.filter(([s]) => c >= s).pop()[1]; }
  const step = c >= 67 ? 0.08 : c >= 45 ? 0.05 : c >= 22 ? 0.03 : 0;
  F.sec.style.setProperty('--band', mix(FLOUR, TOMATO, step));
  F.oven.style.setProperty('--mouth', mix(FLOUR, TOMATO, 0.08 + step * 1.6));
  F.steam.style.setProperty('--st', clamp((p - 0.78) / 0.08).toFixed(3));
  F.order.classList.toggle('on', p >= 0.9); F.order.tabIndex = p >= 0.9 ? 0 : -1;
  fire.dirty = true;
}
let t0 = performance.now(), last = t0, pointerL = 0, lightT = 0;
if (fine && !reduced) heroSec.addEventListener('pointermove', (e) => { const r = heroSec.getBoundingClientRect(); lightT = ((e.clientX - r.left) / r.width - 0.5) * 2 * (6 * Math.PI / 180); }, { passive: true });
function loop(now) {
  const dt = Math.min(64, now - last); last = now;
  for (const P of pins) {
    P.t = reduced ? END[P.id] : progress(P.el);
    const np = reduced ? P.t : P.p + (P.t - P.p) * (1 - Math.pow(1 - 0.12, dt / 16.7));
    if (Math.abs(np - P.p) > 1e-4 || !P.init) { P.p = Math.abs(P.t - np) < 1e-4 ? P.t : np; P.init = true; if (P.id === 'dough') applyDough(P.p); else applyFire(P.p); }
  }
  if (heroGo && vis.get(hero.el)) {
    if (!reduced) { hero.rot += (isM ? 2 : 4) * Math.PI / 180 * dt / 1000; pointerL += (lightT - pointerL) * 0.08; hero.light = pointerL; hero.dirty = true; }
  }
  for (const v of views) {
    if (!vis.get(v.el) || !v.dirty || (v === hero && !heroGo)) continue;
    v.dirty = false; if (v.draw(now)) v.dirty = true;
  }
  if (!heroSec.classList.contains('live') && heroLoaded()) { hero.dirty = true; hero.draw(now); heroSec.classList.add('live'); }
  requestAnimationFrame(loop);
}
const heroLoaded = () => heroGo && hero.base.baked.ok && hero.base.cheese.ok;
requestAnimationFrame(loop);
/* first screen = poster + board + type; the live hero canvas and the ingredient photos load after the page has settled */
const idle = (f, t) => ('requestIdleCallback' in window) ? requestIdleCallback(f, { timeout: t }) : setTimeout(f, 300);
const go = () => idle(() => { heroGo = true; hero.dirty = true; }, 900);
document.readyState === 'complete' ? go() : addEventListener('load', go, { once: true });
const warmIO = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { warmIO.disconnect(); idle(warmAll, 1500); } }, { rootMargin: '600px 0px' });
warmIO.observe($('#dough'));
/* below-the-fold photos (data-src) are swapped in only when their section is near, so they never compete with the first screen */
const lazyIO = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; $$('img[data-src]', e.target).forEach((i) => { i.src = i.dataset.src; i.removeAttribute('data-src'); }); lazyIO.unobserve(e.target); }), { rootMargin: '400px 0px' });
$$('.pin, .build').forEach((s) => lazyIO.observe(s));

/* intro: 14 ember sparks drift up for 1.2 s, then stop */
if (!reduced) { const sp = $('.sparks'); $$('i', sp).forEach((i, k) => { i.style.left = `${8 + (k * 61) % 84}%`; i.style.setProperty('--dx', `${((k * 37) % 40) - 20}px`); i.style.animationDelay = `${(k % 7) * 60}ms`; }); requestAnimationFrame(() => sp.classList.add('go')); }

/* ---------- pickup form (concept: nothing is sent) ---------- */
const form = $('#order-form'), ok = $('#od-ok'), chips = $('#chips');
['As soon as possible', '6:00 pm', '6:30 pm', '7:00 pm', '7:30 pm'].forEach((t, i) => { chips.insertAdjacentHTML('beforeend', `<label><input type="radio" name="when" value="${t}"${i ? '' : ' checked'}><span>${t}</span></label>`); });
const rules = { 'od-name': (v) => v.trim().length >= 2 ? '' : 'Tell us what to call you.', 'od-phone': (v) => v.replace(/\D/g, '').length >= 7 ? '' : 'Enter a phone number we could text, at least 7 digits.' };
function check(id) { const el = $('#' + id), m = rules[id](el.value); el.setAttribute('aria-invalid', m ? 'true' : 'false'); $('#' + id + '-err').textContent = m; return !m; }
Object.keys(rules).forEach((id) => $('#' + id).addEventListener('blur', () => { if ($('#' + id).value) check(id); }));
Object.keys(rules).forEach((id) => $('#' + id).addEventListener('input', () => { if ($('#' + id).getAttribute('aria-invalid') === 'true') check(id); }));
form.addEventListener('submit', (e) => {
  e.preventDefault(); const good = Object.keys(rules).map(check); if (good.includes(false)) { $('#' + Object.keys(rules)[good.indexOf(false)]).focus(); return; }
  const btn = $('#od-send'); btn.classList.add('sending'); btn.disabled = true; $('.lbl', btn).textContent = 'Sending';
  setTimeout(() => {
    btn.classList.remove('sending'); btn.disabled = false; $('.lbl', btn).textContent = 'Place the order';
    const name = $('#od-name').value.trim(), when = form.when.value, d = describe();
    $('#od-echo').textContent = `Thanks, ${name}. Hotcoal Kitchen is a concept, so nothing left this page. A real kitchen would text ${$('#od-phone').value.trim()} when your marinara${d ? ' with ' + d : ''} ($${fmt(total())}) is out of the oven, ${when === 'As soon as possible' ? 'in about twenty minutes' : 'for ' + when}.`;
    form.hidden = true; ok.hidden = false; ok.focus();
  }, reduced ? 0 : 900);
});
$('#od-again').addEventListener('click', () => { form.reset(); form.hidden = false; ok.hidden = true; $$('.input', form).forEach((i) => i.removeAttribute('aria-invalid')); $$('.err', form).forEach((e) => (e.textContent = '')); $('#od-name').focus(); });

/* ---------- credits button opens the Library credits sheet ---------- */
$('#open-credits').addEventListener('click', () => { const b = $$('.zk-bar button, .zk-bar a').find((x) => /credit/i.test(x.textContent + (x.getAttribute('aria-label') || ''))); if (b) b.click(); else document.querySelector('.foot-cred').scrollIntoView(); });

/* ---------- phone: section sheet + sticky total bar ---------- */
if (isM) {
  const mb = $('#nav-menu'), sh = $('#nav-sheet');
  mb.addEventListener('click', () => { const o = sh.hidden; sh.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; });
  $$('a', sh).forEach((a) => a.addEventListener('click', () => { sh.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.textContent = 'Menu'; }));
  const bar = $('#m-bar'), io = new IntersectionObserver(([e]) => bar.classList.toggle('on', e.isIntersecting), { rootMargin: '-30% 0px -30% 0px' }); io.observe($('.builder'));
}
sync();
