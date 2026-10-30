/* P041 Hotcoal Kitchen - shared app for index.html (desktop) and m.html (phone).
   Signature: a build-your-own pizza made of real photographs, rendered on a canvas so it reads like one photo.
   Base: the leopard-spotted crust of "Neapolitan pizza at Trappica" (CC BY 2.0) around the sauce of
   "Pizza marinara (Napoli)" by Ruthven (CC0), both rectified to a top-down view; the raw state is the same photo
   with the crust taken back to pale dough. Toppings are cut out of real pizza photos (credits.json, CREDITS.md):
   melted mozzarella patches from the Trappica pizza (raw = the same patches before they melt), baked pepperoni
   from a CC0 Luigi's pepperoni pizza, raw salami slices from a CC BY 2.0 kitchen photo, CC0 cherry tomato halves,
   basil leaves from the Trappica pizza. v3 (veggie, after Sujon's reference): golden crust (the pale-dough crust re-toned
   golden-brown, char removed), olives from "Supreme pizza" (USDA ARS, public domain), mushrooms from "Pizza veggie by Arthur"
   (CC0) and "Sliced champignons" (CC BY 2.0), artichoke hearts (Daderot, CC0), roasted pepper strips (Ryan Snyder, CC BY 2.0),
   red onion slivers (Sebastian Wallroth, public domain); a marble slab (ambientCG Marble012, CC0) with a pizza slicer
   (Evan-Amos, public domain), chili flakes (CC0) and fresh basil styled round it after the oven, and one slice pulled out.
   Realism rules (skills/interactive-product-configurator, "Realism"):
   (1) every piece casts two shadows, a soft one and a tight contact one, multiplied onto what is under it, from one
       light direction (top-left, as in the base photo); (2) random rotation, mirror and +-15 % scale, scattered
       inside the sauce, never on the crust; (3) one shared pixel scale, so a pepperoni is the size of a pepperoni;
   (4) "Fire it" crossfades every piece to its own baked photo: cheese spreads and browns, salami turns into
       cupped pepperoni, tomatoes blister, basil wilts, the crust blisters, then steam rises.
   Desktop: drag a bowl onto the pizza (pointer events, a snap ring) or click / Enter on a bowl. Phone: tap a bowl.
   Inspired by a pizza-builder site shown in a reel by @online.by.annie (Instagram); nothing of theirs is used. */
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const isM = document.documentElement.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* every sprite is stored at the base photo's pixel scale: the base is 2048 px wide, the pie disc has a 960 px radius */
const BASE_PX = 2048, SAUCE_R = 0.755; /* sauce edge as a fraction of the pie box half-width */
const list = (p, n) => Array.from({ length: n }, (_, i) => `img/${p}-${i + 1}.webp`);
const ING = {
  mozzarella: { name: 'Fior di latte', price: 2.5, n: 4, size: 1.25, oil: 'rgb(238,170,92)', raw: list('mozz-raw', 6), baked: list('mozz-baked', 6), grow: [1.0, 1.2], shadow: [0.75, 0.1], gap: 0.24 },
  tomato:     { name: 'Cherry tomato', price: 2.0, n: 6, size: 1.12, raw: list('tom-raw', 2), baked: list('tom-baked', 2), grow: [1, 0.9], shadow: [0.7, 0.55], gap: 0.17 },
  pepperoni:  { name: 'Pepperoni',     price: 3.0, n: 6, oil: 'rgb(226,118,38)', raw: list('pep-raw', 5), baked: list('pep-baked', 5), grow: [1.02, 0.92], shadow: [0.5, 0.38], gap: 0.25 },
  mushroom:   { name: 'Mushroom',      price: 2.0, n: 8, raw: list('mush-raw', 3), baked: list('mush-baked', 3), grow: [1, 0.9], shadow: [0.55, 0.42], gap: 0.2 },
  artichoke:  { name: 'Artichoke',     price: 2.5, n: 6, raw: list('arti-raw', 7), baked: list('arti-baked', 7), grow: [1, 0.95], shadow: [0.55, 0.42], gap: 0.22 },
  pepper:     { name: 'Red pepper', price: 1.5, n: 7, raw: list('pepper-raw', 5), baked: list('pepper-baked', 5), grow: [1, 0.92], shadow: [0.5, 0.4], gap: 0.2 },
  onion:      { name: 'Red onion',     price: 1.0, n: 8, raw: list('onion-raw', 4), baked: list('onion-baked', 4), grow: [1, 0.9], shadow: [0.45, 0.35], gap: 0.19 },
  olive:      { name: 'Black olive',   price: 1.5, n: 13, raw: list('olive-raw', 3), baked: list('olive-baked', 3), grow: [1, 0.97], shadow: [0.55, 0.45], gap: 0.13 },
  /* basil goes on fresh after the oven, the way a pizzaiolo finishes it: the baked state keeps the bright leaves */
  basil:      { name: 'Basil',         price: 1.0, n: 4, raw: list('basil-raw', 4), baked: list('basil-raw', 4), grow: [1, 1], shadow: [0.5, 0.45], gap: 0.22 }
};
const ORDER = ['mozzarella', 'tomato', 'pepperoni', 'mushroom', 'artichoke', 'pepper', 'onion', 'olive', 'basil'];
/* each sprite set's half-size as a fraction of the pie box half-width, for keeping pieces off the crust */
const RAD = { mozzarella: 0.15, tomato: 0.08, pepperoni: 0.135, mushroom: 0.105, artichoke: 0.115, pepper: 0.156, onion: 0.146, olive: 0.0625, basil: 0.19 };
const BASE = 9, MAX = 3;
const board = $('#board'), pie = $('#pie'), lines = $('#t-lines'), totalEl = $('#t-total'), fireBtn = $('#fire'), why = $('#fire-why');
const mbTotal = $('#mb-total'), mbFire = $('#mb-fire'), meter = $('#fire-meter');
const state = { portions: Object.fromEntries(ORDER.map((k) => [k, []])), fired: false, busy: false, bake: 0, slice: 0 };
const fmt = (v) => v.toFixed(2);
let seed = (Date.now() % 100000) + 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - t, 4);

/* ---------- images: load, decode, and make each sprite's shadow once ---------- */
const IMGS = new Map();
function img(src) {
  if (IMGS.has(src)) return IMGS.get(src);
  const rec = { el: new Image(), ok: false, soft: null, tight: null };
  rec.el.decoding = 'async'; rec.el.src = src;
  rec.el.decode().then(() => { rec.ok = true; if (!/base-/.test(src)) { rec.soft = shadowOf(rec.el, 7); rec.tight = shadowOf(rec.el, 2.2); const t = /pep-baked/.test(src) ? ING.pepperoni.oil : /mozz-baked/.test(src) ? ING.mozzarella.oil : null; if (t) rec.oil = shadowOf(rec.el, 5, t); } invalidate(); }).catch(() => {});
  IMGS.set(src, rec); return rec;
}
/* a shadow is the sprite's silhouette shrunk and scaled back up: the browser's smoothing does the blur (works in every engine) */
function shadowOf(el, blur, tint) {
  const k = 1 / blur, pad = 3, w = Math.max(2, Math.round(el.naturalWidth * k / 2)), h = Math.max(2, Math.round(el.naturalHeight * k / 2));
  const c = document.createElement('canvas'); c.width = w + pad * 2; c.height = h + pad * 2;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(el, pad, pad, w, h);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = tint || 'rgb(58,34,22)'; x.fillRect(0, 0, c.width, c.height);
  c._px = pad / w; c._py = pad / h; return c;
}
const baseRaw = img(isM ? 'img/base-raw-1024.webp' : 'img/base-raw.webp');
const baseBaked = img(isM ? 'img/base-baked-1024.webp' : 'img/base-baked.webp');
const warm = () => { for (const t of ORDER) { ING[t].raw.forEach(img); ING[t].baked.forEach(img); } };
('requestIdleCallback' in window) ? requestIdleCallback(warm, { timeout: 900 }) : setTimeout(warm, 300);

/* ---------- canvas ---------- */
const cv = document.createElement('canvas'); cv.className = 'pie-canvas'; cv.setAttribute('aria-hidden', 'true'); pie.append(cv);
const ctx = cv.getContext('2d');
const steam = document.createElement('canvas'); steam.className = 'steam'; steam.setAttribute('aria-hidden', 'true'); board.append(steam);
const sctx = steam.getContext('2d');
let W = 0, SW = 0, SH = 0, DPR = 1;
function size() {
  DPR = Math.min(window.devicePixelRatio || 1, isM ? 2.5 : 3);
  const r = pie.getBoundingClientRect(); if (!r.width) return;
  W = Math.round(r.width * DPR); if (cv.width !== W) { cv.width = W; cv.height = W; }
  const s = steam.getBoundingClientRect(); SW = Math.round(s.width * Math.min(DPR, 2)); SH = Math.round(s.height * Math.min(DPR, 2));
  if (steam.width !== SW) { steam.width = SW; steam.height = SH; }
  invalidate();
}
new ResizeObserver(size).observe(pie);

let raf = 0; function invalidate() { if (!raf) raf = requestAnimationFrame(render); }
function render(now) {
  raf = 0; if (!W) return;
  now = now || performance.now();
  let busy = false; const p = state.bake, k = W / BASE_PX;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (baseRaw.ok) ctx.drawImage(baseRaw.el, 0, 0, W, W);
  if (baseBaked.ok && p > 0) { ctx.globalAlpha = sstep(0.05, 0.9, p); ctx.drawImage(baseBaked.el, 0, 0, W, W); ctx.globalAlpha = 1; }
  for (const type of ORDER) {
    const cfg = ING[type], pieces = state.portions[type].flat().concat(gone.filter((g) => g.type === type));
    if (!pieces.length) continue;
    const grow = cfg.grow[0] + (cfg.grow[1] - cfg.grow[0]) * easeOut(p);
    const rawA = 1 - sstep(0.55, 1, p), bakedA = sstep(0.08, 0.85, p), shA = cfg.shadow[0] + (cfg.shadow[1] - cfg.shadow[0]) * p;
    /* pass 1: shadows of this layer, multiplied onto everything under it */
    ctx.globalCompositeOperation = 'multiply';
    for (const q of pieces) { const f = frame(q, now); if (f.anim) busy = true; if (cfg.oil && p > 0) drawOil(q, f, k, grow, bakedA); drawShadow(q, f, k, grow, shA); }
    ctx.globalCompositeOperation = 'source-over';
    /* pass 2: the photos themselves, raw then baked on top */
    for (const q of pieces) {
      const f = frame(q, now);
      if (rawA > 0) drawSprite(img(q.raw), q, f, k, grow, rawA * f.a);
      if (bakedA > 0) drawSprite(img(q.baked), q, f, k, grow, bakedA * f.a);
    }
  }
  /* the oven: a warm light that swells and fades while it bakes */
  if (state.busy && p > 0 && p < 1) {
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, W / 2, W * 0.47, 0, Math.PI * 2); ctx.clip();
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = Math.sin(Math.PI * p) * 0.55; ctx.fillStyle = 'rgb(255,128,36)'; ctx.fillRect(0, 0, W, W);
    ctx.restore(); busy = true;
  }
  if (p > 0) {
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, W / 2, W * 0.465, 0, Math.PI * 2); ctx.clip();
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.16 * p; ctx.fillStyle = 'rgb(255,176,96)'; ctx.fillRect(0, 0, W, W); ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (state.slice > 0) sliceOut(state.slice);
  if (stepSteam(now)) busy = true;
  for (let i = gone.length - 1; i >= 0; i--) if (now - gone[i].out > 300) gone.splice(i, 1);
  if (busy || gone.length) invalidate();
}
function frame(q, now) {
  /* landing: the handful flies in from the bowl, drops with a wide faint shadow that tightens as it settles */
  let t = reduced ? 1 : Math.min(1, Math.max(0, (now - q.t0) / q.dur)), a = 1, lift = 0, dx = 0, dy = 0, extra = 0;
  if (t < 1) { const e = easeOut(t); lift = 1 - e; dx = q.fx * lift; dy = q.fy * lift; a = Math.min(1, t * 5); }
  if (q.out) { const o = Math.min(1, (now - q.out) / 260); a = 1 - o; lift = o * 0.5; extra = o * 0.15; }
  return { anim: t < 1 || !!q.out, a, lift, dx, dy, extra, rot: q.rot - lift * 0.7 };
}
function place(q, f, k, grow) {
  const s = q.scale * grow * (1 + f.lift * 0.22 + f.extra);
  return { x: W / 2 + q.x * W / 2 + f.dx * DPR, y: W / 2 + q.y * W / 2 + f.dy * DPR, s };
}
function drawSprite(rec, q, f, k, grow, alpha) {
  if (!rec.ok || alpha <= 0) return;
  const { x, y, s } = place(q, f, k, grow), w = rec.el.naturalWidth * k * s, h = rec.el.naturalHeight * k * s;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(f.rot); ctx.scale(q.flip, 1);
  ctx.drawImage(rec.el, -w / 2, -h / 2, w, h); ctx.restore();
}
/* baked pepperoni lets out its orange oil and melted cheese runs golden at the edge: a soft tinted pool under each piece */
function drawOil(q, f, k, grow, a) {
  const rec = img(q.baked); if (!rec.ok || !rec.oil) return;
  const { x, y, s } = place(q, f, k, grow), c = rec.oil, w = rec.el.naturalWidth * k * s * 1.22, h = rec.el.naturalHeight * k * s * 1.22;
  ctx.save(); ctx.globalAlpha = 0.55 * a * f.a; ctx.translate(x, y); ctx.rotate(f.rot);
  ctx.drawImage(c, -w * (1 + c._px * 2) / 2, -h * (1 + c._py * 2) / 2, w * (1 + c._px * 2), h * (1 + c._py * 2)); ctx.restore();
}
function drawShadow(q, f, k, grow, shA) {
  const rec = img(q.raw), bk = img(q.baked), use = state.bake > 0.5 && bk.ok ? bk : rec; if (!use.ok || !use.soft) return;
  const { x, y, s } = place(q, f, k, grow), w = use.el.naturalWidth * k * s, h = use.el.naturalHeight * k * s;
  const L = 1 + f.lift * 5; /* the light is top-left, as in the base photo, so shadows fall down-right */
  const soft = [use.soft, (7 + f.lift * 40) * k * L, shA * f.a * (1 - f.lift * 0.6)], tight = [use.tight, 2.2 * k, shA * 0.9 * f.a * (1 - f.lift)];
  for (const [c, off, al] of [soft, tight]) {
    if (al <= 0.01) continue;
    const pw = w * (1 + c._px * 2) * 1.03, ph = h * (1 + c._py * 2) * 1.03;
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x + off * 0.8, y + off * 1.15); ctx.rotate(f.rot); ctx.scale(q.flip, 1);
    ctx.drawImage(c, -pw / 2, -ph / 2, pw, ph); ctx.restore();
  }
}

/* ---------- the serve: one slice pulled out of the pie after the oven, the marble showing through the cut ---------- */
const offA = document.createElement('canvas'), offB = document.createElement('canvas');
function sliceOut(p) {
  const e = easeOut(p), c = W / 2, R = W * 0.5, a0 = Math.PI / 8, a1 = a0 + Math.PI / 4, mid = (a0 + a1) / 2, s = 1 - 0.07 * e, d = W * 0.07 * e;
  for (const o of [offA, offB]) if (o.width !== W) { o.width = W; o.height = W; }
  const A = offA.getContext('2d'), B = offB.getContext('2d');
  A.setTransform(1, 0, 0, 1, 0, 0); A.clearRect(0, 0, W, W); A.drawImage(cv, 0, 0);
  B.setTransform(1, 0, 0, 1, 0, 0); B.clearRect(0, 0, W, W);
  B.save(); B.beginPath(); B.moveTo(c, c); B.arc(c, c, R, a0, a1); B.closePath(); B.clip(); B.drawImage(offA, 0, 0); B.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W);
  ctx.save(); ctx.translate(c, c); ctx.scale(s, s); ctx.translate(-c, -c);
  ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a1, a0 + Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(offA, 0, 0); ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(70,48,30,0.38)'; ctx.shadowBlur = 16 * DPR * e; ctx.shadowOffsetX = 5 * DPR * e; ctx.shadowOffsetY = 8 * DPR * e;
  ctx.translate(c + Math.cos(mid) * d, c + Math.sin(mid) * d); ctx.scale(s, s); ctx.translate(-c, -c); ctx.drawImage(offB, 0, 0); ctx.restore();
}

/* ---------- steam after the bake: soft puffs made by scaling a tiny disc up (no gradients) ---------- */
const puff = (() => { const s = document.createElement('canvas'); s.width = s.height = 12; const x = s.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.arc(6, 6, 3.6, 0, Math.PI * 2); x.fill();
  const b = document.createElement('canvas'); b.width = b.height = 96; const y = b.getContext('2d'); y.imageSmoothingQuality = 'high'; y.drawImage(s, 0, 0, 96, 96); return b; })();
let puffs = [], steamUntil = 0, lastSpawn = 0;
function startSteam(now) { if (reduced) return; steamUntil = now + 14000; invalidate(); }
function stepSteam(now) {
  if (!SW) return false;
  sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, SW, SH);
  const live = now < steamUntil;
  if (live && now - lastSpawn > 70) {
    lastSpawn = now; const left = (steamUntil - now) / 14000;
    const n = left > 0.6 ? 2 : 1;
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.3;
      puffs.push({ x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r * 0.8, t0: now, life: 2400 + rnd() * 2000, s: 0.05 + rnd() * 0.06, sway: rnd() * 6.28, max: (0.05 + rnd() * 0.06) * Math.max(0.4, left) }); }
  }
  puffs = puffs.filter((q) => now - q.t0 < q.life);
  for (const q of puffs) {
    const t = (now - q.t0) / q.life, rise = t * 0.42;
    const x = (q.x + Math.sin(q.sway + t * 3) * 0.025 + t * 0.02) * SW, y = (q.y - rise) * SH, sz = (q.s * (1 + t * 2.2)) * SW;
    sctx.globalAlpha = q.max * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.55 + t * 0.6);
    sctx.drawImage(puff, x - sz / 2, y - sz / 2, sz, sz);
  }
  sctx.globalAlpha = 1;
  return live || puffs.length > 0;
}

/* ---------- placement: spaced random points inside the sauce, never on the crust ---------- */
function placeSpots(type, count) {
  const cfg = ING[type], all = Object.values(state.portions).flat().flat(), same = state.portions[type].flat();
  const spots = []; let tries = 0;
  while (spots.length < count && tries < 1400) {
    tries++;
    const scale = 0.85 + rnd() * 0.3, rad = RAD[type] * scale * (cfg.size || 1) * Math.max(...cfg.grow);
    const lim = SAUCE_R - rad * (type === 'basil' ? 0.6 : 0.9), a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * lim;
    const x = Math.cos(a) * r, y = Math.sin(a) * r, relax = Math.min(1, tries / 1200);
    const minSame = cfg.gap * (1 - relax * 0.55), minAny = 0.07 * (1 - relax);
    if (spots.some((s) => Math.hypot(s.x - x, s.y - y) < minSame)) continue;
    if (same.some((p) => Math.hypot(p.x - x, p.y - y) < minSame * 0.85)) continue;
    if (all.some((p) => p.type !== type && Math.hypot(p.x - x, p.y - y) < minAny)) continue;
    spots.push({ x, y, scale });
  }
  return spots;
}

/* ---------- add / remove a handful ---------- */
const gone = [];
function addPortion(type, from) {
  if (state.fired || state.busy) return;
  const P = state.portions[type]; if (P.length >= MAX) { flash(`Three handfuls of ${ING[type].name.toLowerCase()} is the most we put on.`); return; }
  const cfg = ING[type], rect = pie.getBoundingClientRect(), now = performance.now();
  const pieces = placeSpots(type, cfg.n).map((s, i) => {
    const vi = Math.floor(rnd() * 1000);
    const fx = from ? from.x - (rect.left + rect.width * (0.5 + s.x / 2)) : 0, fy = from ? from.y - (rect.top + rect.height * (0.5 + s.y / 2)) : -40;
    return { type, x: s.x, y: s.y, scale: s.scale * (cfg.size || 1), rot: rnd() * Math.PI * 2, flip: rnd() > 0.5 ? -1 : 1,
      raw: cfg.raw[vi % cfg.raw.length], baked: cfg.baked[vi % cfg.raw.length % cfg.baked.length], t0: now + i * 42, dur: 620 + i * 12, fx, fy };
  });
  pieces.forEach((q) => { img(q.raw); img(q.baked); });
  P.push(pieces); sync(type); invalidate();
}
function removePortion(type) {
  if (state.fired) return; const P = state.portions[type]; const last = P.pop(); if (!last) return;
  if (!reduced) { const now = performance.now(); last.forEach((q, i) => { q.out = now + i * 16; gone.push(q); }); }
  sync(type); invalidate();
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
  const D = reduced ? 0 : 3200, t0 = performance.now();
  if (!reduced) pie.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: D, easing: 'cubic-bezier(.76,0,.24,1)' });
  const tick = (t) => { const k = D ? Math.min(1, (t - t0) / D) : 1; state.bake = k; invalidate(); meter.textContent = `In the oven: ${Math.round(k * 90)} s at 485\u00b0C`; if (k < 1) requestAnimationFrame(tick); else done(t); };
  requestAnimationFrame(tick);
  function done(t) {
    state.busy = false; state.fired = true; state.bake = 1; board.classList.remove('is-firing'); board.classList.add('is-fired'); document.body.classList.remove('is-firing');
    startSteam(t || performance.now()); invalidate();
    const s0 = performance.now(), SD = reduced ? 0 : 1100;
    const sl = (n) => { const k = SD ? Math.min(1, Math.max(0, (n - s0 - 350) / SD)) : 1; state.slice = k; invalidate(); if (k < 1) requestAnimationFrame(sl); };
    requestAnimationFrame(sl);
    const no = 'HC-' + String(1000 + Math.floor(rnd() * 8999)); meter.textContent = 'Fired in 90 seconds.'; $('#t-no').textContent = `Ticket ${no}. Out of the oven.`;
    $('#t-done').hidden = false; fireBtn.hidden = true; sync(); $('#t-done .btn').focus({ preventScroll: true });
    if (mbFire) { mbFire.textContent = 'Order it'; mbFire.setAttribute('aria-disabled', 'false'); }
  }
}
fireBtn.addEventListener('click', fire);
mbFire && mbFire.addEventListener('click', () => { if (state.fired) document.getElementById('order').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); else fire(); });
$('#again').addEventListener('click', () => {
  Object.keys(state.portions).forEach((k) => { state.portions[k] = []; }); puffs = []; steamUntil = 0;
  state.fired = false; state.bake = 0; state.slice = 0; board.classList.remove('is-fired'); $('#t-done').hidden = true; fireBtn.hidden = false; meter.textContent = '';
  if (mbFire) mbFire.textContent = 'Fire it'; sync(); invalidate(); $('.dish').focus({ preventScroll: true });
});
sync(); size();

/* ---------- self-test hook for QA ---------- */
window.__p041 = { addPortion, fire, state, total, pieces: () => Object.values(state.portions).flat().flat().length, ready: () => baseRaw.ok && [...IMGS.values()].every((r) => r.ok) };
