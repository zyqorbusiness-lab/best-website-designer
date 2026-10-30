/* P041 Hotcoal Kitchen (best-4 flagship, Oct 30 2026): pizza.js
   The pizza renderer, shared by the hero, the builder board and the oven. One canvas per view, one image cache, one model:
   the oven draws the very pieces you dropped on the board, where you dropped them (spec signature 1).
   Photos: real cut-outs from Wikimedia Commons (credits.json; CC0 / CC BY / public domain), re-lit by Zyqor Studio.
   Realism rules kept from v3.1: one light from the top-left, two shadows per piece (soft + contact) multiplied onto what is
   under it, one pixel scale for every sprite, random rotation / mirror / +-15 % scale, never on the crust.
   Shadows are made by shrinking the sprite's silhouette and letting the browser scale it back up (no gradients, works everywhere). */
export const BASE_PX = 2048, SAUCE_R = 0.755;
const list = (p, n) => Array.from({ length: n }, (_, i) => `img/${p}-${i + 1}.webp`);
export const ING = {
  mozzarella: { name: 'Fior di latte', short: 'Mozz', price: 2.5, n: 4, size: 1.25, oil: 'rgb(238,170,92)', raw: list('mozz-raw', 6), baked: list('mozz-baked', 6), grow: [1.0, 1.2], shadow: [0.75, 0.1], gap: 0.24, rad: 0.15 },
  tomato:     { name: 'Cherry tomato', short: 'Tomato', price: 2.0, n: 6, size: 1.12, raw: list('tom-raw', 2), baked: list('tom-baked', 2), grow: [1, 0.9], shadow: [0.7, 0.55], gap: 0.17, rad: 0.08 },
  pepperoni:  { name: 'Pepperoni', short: 'Pepperoni', price: 3.0, n: 6, oil: 'rgb(226,118,38)', raw: list('pep-raw', 5), baked: list('pep-baked', 5), grow: [1.02, 0.92], shadow: [0.5, 0.38], gap: 0.25, rad: 0.135 },
  mushroom:   { name: 'Mushroom', short: 'Mushroom', price: 2.0, n: 8, size: 1.25, raw: list('mush-raw', 3), baked: list('mush-baked', 3), grow: [1, 0.9], shadow: [0.55, 0.42], gap: 0.2, rad: 0.105 },
  olive:      { name: 'Black olive', short: 'Olive', price: 1.5, n: 7, size: 1.15, raw: list('olive-raw', 3), baked: list('olive-baked', 3), grow: [1, 0.97], shadow: [0.55, 0.45], gap: 0.2, rad: 0.0625 },
  pepper:     { name: 'Roast pepper', short: 'Pepper', price: 1.5, n: 7, size: 1.12, raw: list('pepper-raw', 5), baked: list('pepper-baked', 5), grow: [1, 0.92], shadow: [0.5, 0.4], gap: 0.2, rad: 0.156 },
  onion:      { name: 'Red onion', short: 'Onion', price: 1.0, n: 8, size: 1.12, raw: list('onion-raw', 4), baked: list('onion-baked', 4), grow: [1, 0.9], shadow: [0.45, 0.35], gap: 0.19, rad: 0.146 },
  /* basil goes on after the oven, the way a pizzaiolo finishes it, so its baked state keeps the bright leaves */
  basil:      { name: 'Basil', short: 'Basil', price: 1.0, n: 4, raw: list('basil-raw', 4), baked: list('basil-raw', 4), grow: [1, 1], shadow: [0.5, 0.45], gap: 0.22, rad: 0.19 }
};
export const ORDER = ['mozzarella', 'tomato', 'pepperoni', 'mushroom', 'olive', 'pepper', 'onion', 'basil'];
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- images: load, decode, make each sprite's shadows once ---------- */
const IMGS = new Map(); const listeners = new Set();
export const onImage = (fn) => listeners.add(fn);
export function img(src) {
  if (IMGS.has(src)) return IMGS.get(src);
  const rec = { el: new Image(), ok: false, soft: null, tight: null };
  rec.el.decoding = 'async'; rec.el.src = src;
  rec.el.decode().then(() => {
    rec.ok = true;
    if (!/base-/.test(src)) { rec.soft = shadowOf(rec.el, 7); rec.tight = shadowOf(rec.el, 2.2); const t = /pep-baked/.test(src) ? ING.pepperoni.oil : /mozz-baked/.test(src) ? ING.mozzarella.oil : null; if (t) rec.oil = shadowOf(rec.el, 5, t); }
    listeners.forEach((f) => f());
  }).catch(() => {});
  IMGS.set(src, rec); return rec;
}
function shadowOf(el, blur, tint) {
  const k = 1 / blur, pad = 3, w = Math.max(2, Math.round(el.naturalWidth * k / 2)), h = Math.max(2, Math.round(el.naturalHeight * k / 2));
  const c = document.createElement('canvas'); c.width = w + pad * 2; c.height = h + pad * 2;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(el, pad, pad, w, h);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = tint || 'rgb(40,58,45)'; x.fillRect(0, 0, c.width, c.height);
  c._px = pad / w; c._py = pad / h; return c;
}
export function warmAll() { for (const t of ORDER) { ING[t].raw.forEach(img); ING[t].baked.forEach(img); } }

/* ---------- the model: handfuls of pieces, shared by every view ---------- */
let seed = 4242; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export function makeModel() { return { portions: Object.fromEntries(ORDER.map((k) => [k, []])), seq: 0 }; }
export const count = (m) => Object.values(m.portions).reduce((n, v) => n + v.length, 0);
export function placeSpots(m, type, count, near) {
  const cfg = ING[type], all = Object.values(m.portions).flat().flat(), same = m.portions[type].flat();
  const spots = []; let tries = 0;
  while (spots.length < count && tries < 1600) {
    tries++;
    const scale = 0.85 + rnd() * 0.3, rad = cfg.rad * scale * (cfg.size || 1) * Math.max(...cfg.grow);
    const lim = SAUCE_R - rad * (type === 'basil' ? 0.6 : 0.9);
    let x, y;
    if (near && tries < 900) { /* where you dropped it: a loose handful around the drop point */
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * (0.3 + tries / 2400);
      x = near.x + Math.cos(a) * r; y = near.y + Math.sin(a) * r;
      const d = Math.hypot(x, y); if (d > lim) { x *= lim / d; y *= lim / d; }
    } else { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * lim; x = Math.cos(a) * r; y = Math.sin(a) * r; }
    const relax = Math.min(1, tries / 1300), minSame = cfg.gap * (1 - relax * 0.55), minAny = 0.07 * (1 - relax);
    if (spots.some((s) => Math.hypot(s.x - x, s.y - y) < minSame)) continue;
    if (same.some((p) => Math.hypot(p.x - x, p.y - y) < minSame * 0.85)) continue;
    if (all.some((p) => p.type !== type && Math.hypot(p.x - x, p.y - y) < minAny)) continue;
    spots.push({ x, y, scale });
  }
  return spots;
}
/* add one handful; from = {fx, fy} css-pixel offset the pieces fly in from (0,0 = a plain drop) */
export function addHandful(m, type, { near = null, fly = null, delay = 0, now = performance.now(), preload = true } = {}) {
  const cfg = ING[type], h = m.seq++;
  const pieces = placeSpots(m, type, cfg.n, near).map((s, i) => {
    const vi = Math.floor(rnd() * 1000);
    return { type, h, x: s.x, y: s.y, scale: s.scale * (cfg.size || 1), rot: rnd() * Math.PI * 2, flip: rnd() > 0.5 ? -1 : 1,
      raw: cfg.raw[vi % cfg.raw.length], baked: cfg.baked[vi % cfg.raw.length % cfg.baked.length],
      t0: now + delay + i * 40, dur: fly ? 520 : 180, fx: fly ? fly.x : 0, fy: fly ? fly.y : -18, arc: !!fly };
  });
  if (preload) pieces.forEach((q) => { img(q.raw); img(q.baked); });
  m.portions[type].push(pieces); return pieces;
}

/* ---------- a view: one canvas drawing the model ---------- */
/* base photos load lazily: a view asks only for the states it is about to draw (a fully baked hero never fetches the raw base) */
const baseSet = (small) => { const s = { raw: small ? 'img/base-raw-1024.webp' : 'img/base-raw.webp', baked: small ? 'img/base-baked-1024.webp' : 'img/base-baked.webp', cheese: small ? 'img/base-cheese-1024.webp' : 'img/base-cheese.webp' };
  return { get raw() { return img(s.raw); }, get baked() { return img(s.baked); }, get cheese() { return img(s.cheese); } }; };
export class PieView {
  constructor(canvas, model, { small = false, dprMax = 2 } = {}) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.model = model; this.base = baseSet(small); this.dprMax = dprMax;
    this.W = 0; this.rot = 0; this.light = 0; this.clock = 0; this.uniform = null; this.slice = 0;
    new ResizeObserver(() => this.size()).observe(canvas); this.size();
  }
  size() { const r = this.cv.getBoundingClientRect(); if (!r.width) return; const d = Math.min(window.devicePixelRatio || 1, this.dprMax); const W = Math.round(r.width * d); if (this.cv.width !== W) { this.cv.width = W; this.cv.height = W; } this.W = W; this.css = r.width; this.dirty = true; }
  /* bake of one piece at the oven clock (seconds): handful i starts at 10 + 6i s and takes 30 s (spec 3.5) */
  bakeOf(q) { if (this.uniform != null) return this.uniform; const st = Math.min(10 + 6 * this.rank(q.h), 58); return sstep(st, st + 30, this.clock); }
  rank(h) { if (!this._ranks) { const hs = [...new Set(Object.values(this.model.portions).flat().map((p) => p[0] && p[0].h))].sort((a, b) => a - b); this._ranks = new Map(hs.map((x, i) => [x, i])); } return this._ranks.get(h) || 0; }
  draw(now = performance.now()) {
    const { ctx, W } = this; if (!W) return false; this._ranks = null;
    const k = W / BASE_PX, c = W / 2; let busy = false;
    const pb = this.uniform != null ? this.uniform : Math.min(1, this.clock / 90);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.save(); ctx.translate(c, c); ctx.rotate(this.rot); ctx.translate(-c, -c);
    const B = this.base;
    if (pb < 0.9 && B.raw.ok) ctx.drawImage(B.raw.el, 0, 0, W, W);
    if (B.baked.ok && pb > 0) { ctx.globalAlpha = sstep(0.05, 0.9, pb); ctx.drawImage(B.baked.el, 0, 0, W, W); ctx.globalAlpha = 1; }
    const nz = this.model.portions.mozzarella.length;
    if (nz && B.cheese.ok && pb > 0) { ctx.globalAlpha = sstep(0.2, 0.85, pb) * Math.min(1, 0.55 + 0.25 * nz); ctx.drawImage(B.cheese.el, 0, 0, W, W); ctx.globalAlpha = 1; }
    ctx.restore();
    /* light: top-left; this.light (radians) turns it a little (pointer, desktop hero only) */
    const la = Math.atan2(1.15, 0.8) + this.light, lx = Math.cos(la) * 1.4, ly = Math.sin(la) * 1.4;
    const cos = Math.cos(this.rot), sin = Math.sin(this.rot);
    for (const type of ORDER) {
      const cfg = ING[type], pieces = this.model.portions[type].flat(); if (!pieces.length) continue;
      const fr = pieces.map((q) => this.frame(q, now)); if (fr.some((f) => f.anim)) busy = true;
      const pos = pieces.map((q, i) => { const f = fr[i], p = this.bakeOf(q), grow = cfg.grow[0] + (cfg.grow[1] - cfg.grow[0]) * easeOut(p);
        const s = q.scale * grow * (1 + f.lift * 0.22); const x0 = q.x * c, y0 = q.y * c;
        return { p, s, x: c + x0 * cos - y0 * sin + f.dx * W / this.css, y: c + x0 * sin + y0 * cos + f.dy * W / this.css, r: q.rot + this.rot - f.lift * 0.7 }; });
      ctx.globalCompositeOperation = 'multiply';
      pieces.forEach((q, i) => { const f = fr[i], P = pos[i];
        if (cfg.oil && P.p > 0) this.oil(q, P, k, sstep(0.08, 0.85, P.p) * f.a);
        const shA = (cfg.shadow[0] + (cfg.shadow[1] - cfg.shadow[0]) * P.p) * f.a;
        const rec = img(P.p > 0.5 ? q.baked : q.raw); if (!rec.ok || !rec.soft) return;
        const w = rec.el.naturalWidth * k * P.s, h = rec.el.naturalHeight * k * P.s, L = 1 + f.lift * 5;
        for (const [cnv, off, al] of [[rec.soft, 7 * k * L * (1 + f.lift * 5), shA * (1 - f.lift * 0.6)], [rec.tight, 2.2 * k, shA * 0.9 * (1 - f.lift)]]) {
          if (al <= 0.01) continue; const pw = w * (1 + cnv._px * 2) * 1.03, ph = h * (1 + cnv._py * 2) * 1.03;
          ctx.save(); ctx.globalAlpha = al; ctx.translate(P.x + off * lx * 0.7, P.y + off * ly * 0.7); ctx.rotate(P.r); ctx.scale(q.flip, 1); ctx.drawImage(cnv, -pw / 2, -ph / 2, pw, ph); ctx.restore();
        } });
      ctx.globalCompositeOperation = 'source-over';
      pieces.forEach((q, i) => { const f = fr[i], P = pos[i], ra = 1 - sstep(0.55, 1, P.p), ba = sstep(0.08, 0.85, P.p);
        if (ra > 0) this.sprite(img(q.raw), q, P, k, ra * f.a); if (ba > 0) this.sprite(img(q.baked), q, P, k, ba * f.a); });
    }
    if (pb > 0) { ctx.save(); ctx.beginPath(); ctx.arc(c, c, W * 0.465, 0, Math.PI * 2); ctx.clip(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.16 * pb; ctx.fillStyle = 'rgb(255,176,96)'; ctx.fillRect(0, 0, W, W); ctx.restore(); }
    if (this.slice > 0) this.cut(this.slice);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    return busy;
  }
  frame(q, now) {
    let t = reduced ? 1 : Math.min(1, Math.max(0, (now - q.t0) / q.dur)), a = 1, lift = 0, dx = 0, dy = 0;
    if (now < q.t0 && !reduced) return { anim: true, a: 0, lift: 1, dx: q.fx, dy: q.fy };
    if (t < 1) { const e = q.arc ? (t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2) : easeOut(t); lift = 1 - e; dx = q.fx * lift; dy = q.fy * lift - (q.arc ? Math.sin(Math.PI * t) * 80 : 0); a = Math.min(1, t * 6); }
    return { anim: t < 1, a, lift, dx, dy };
  }
  sprite(rec, q, P, k, alpha) { if (!rec.ok || alpha <= 0) return; const w = rec.el.naturalWidth * k * P.s, h = rec.el.naturalHeight * k * P.s, x = this.ctx; x.save(); x.globalAlpha = alpha; x.translate(P.x, P.y); x.rotate(P.r); x.scale(q.flip, 1); x.drawImage(rec.el, -w / 2, -h / 2, w, h); x.restore(); }
  oil(q, P, k, a) { const rec = img(q.baked); if (!rec.ok || !rec.oil) return; const c = rec.oil, w = rec.el.naturalWidth * k * P.s * 1.22, h = rec.el.naturalHeight * k * P.s * 1.22, x = this.ctx;
    x.save(); x.globalAlpha = 0.55 * a; x.translate(P.x, P.y); x.rotate(P.r); x.drawImage(c, -w * (1 + c._px * 2) / 2, -h * (1 + c._py * 2) / 2, w * (1 + c._px * 2), h * (1 + c._py * 2)); x.restore(); }
  cut(p) { const { ctx, W } = this, e = easeOut(p), c = W / 2, R = W * 0.462; ctx.save(); ctx.beginPath(); ctx.arc(c, c, W * 0.47, 0, Math.PI * 2); ctx.clip(); ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const a = Math.PI / 8 + i * Math.PI / 4 + this.rot, dx = Math.cos(a) * R * e, dy = Math.sin(a) * R * e;
      ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = 'rgba(122,74,38,0.55)'; ctx.lineWidth = Math.max(1.2, W * 0.0032); ctx.beginPath(); ctx.moveTo(c - dx, c - dy); ctx.lineTo(c + dx, c + dy); ctx.stroke(); }
    ctx.restore(); }
}
