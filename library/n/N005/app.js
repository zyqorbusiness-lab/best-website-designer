/* N005 Fieldnote Optics - shared app for index.html (desktop) and m.html (phone).
   Signature: a misty pine forest (Poly Haven "Misty Pines", Greg Zaal, CC0) you can only see properly through a twin-circle
   lens. The lens is a CSS mask of two radial gradients that chase the pointer (or the thumb); inside it the same photo is sharp
   and magnified around the lens centre; a focus wheel blurs or sharpens only the inside. The real model in the card
   (Poly Haven "Binoculars", Derek Wight, CC0) aims at the lens. Hand-made: real magnification + shrinking field of view,
   the binoculars aim where you look, four pencilled notes written for this photo that exist only inside the lens. */
import { createStage, THREE, isM, reduced, damp, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from './landing.js';

reveals(); press('[data-press]'); landing();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const viewer = $('[data-viewer]'), layer = $('.lens-layer', viewer), phOut = $('.ph-out', viewer), phIn = $('.ph-in', viewer);
const rings = { l: $('.ring-l'), r: $('.ring-r'), il: $('.ring-in-l'), ir: $('.ring-in-r') }, reticle = $('.reticle'), handle = $('.lens-handle');
const live = $('#live'), notes = $$('.fn', viewer).map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, found: false }));
const IMG_AR = 2048 / 1280, ANCHOR_X = isM ? 0.6 : 0.5, ANCHOR_Y = 0.55, SHARP = 62;

/* ---- state ---- */
const S = { w: 1, h: 1, sx: 0, sy: 0, sw: 1, sh: 1, lx: 0, ly: 0, tx: 0, ty: 0, mag: 8, zoom: 2, r: 100, rT: 100, focus: SHARP, idle: 0, moved: false, found: 0 };
const zoomOf = (m) => m / 4;                                   // 6x -> 1.5, 8x -> 2, 10x -> 2.5 over the naked-eye view
const baseR = () => Math.min(S.w, S.h) * (isM ? 0.27 : 0.19);
const radiusOf = (m) => baseR() * Math.sqrt(8 / m);           // higher magnification, narrower field of view

function layout() {
  const r = viewer.getBoundingClientRect(); S.w = r.width; S.h = r.height;
  if (S.w / S.h > IMG_AR) { S.sw = S.w; S.sh = S.w / IMG_AR; } else { S.sh = S.h; S.sw = S.h * IMG_AR; }
  S.sx = (S.w - S.sw) * ANCHOR_X; S.sy = (S.h - S.sh) * ANCHOR_Y;
  for (const im of [phOut, phIn]) Object.assign(im.style, { left: S.sx + 'px', top: S.sy + 'px', width: S.sw + 'px', height: S.sh + 'px' });
  S.rT = radiusOf(S.mag); if (!S.ready) { S.r = S.rT; parkLens(); S.ready = true; }
  S.tx = clamp(S.tx, 0, S.w); S.ty = clamp(S.ty, 0, S.h);
  draw(true);
}
function parkLens() {                                          // start with note 01 (the nearest trunk) in the right-hand circle
  const n = notes[0], k = zoomOf(S.mag), d = S.r * 0.74, px = S.sx + n.x * S.sw, py = S.sy + n.y * S.sh;
  const lx = isM ? S.w * 0.5 : px - d / k;                      // qx = lx + (px - lx) * k lands on the right circle's centre
  S.tx = S.lx = clamp(lx, S.r + d, S.w - S.r - d); S.ty = S.ly = clamp(isM ? S.h * 0.5 : py, S.r, S.h - S.r);
}

/* ---- draw one frame of the lens ---- */
function draw() {
  const r = S.r, d = r * 0.74, k = S.zoom, lx = S.lx, ly = S.ly;
  layer.style.setProperty('--lx', lx.toFixed(1) + 'px'); layer.style.setProperty('--ly', ly.toFixed(1) + 'px');
  layer.style.setProperty('--r', r.toFixed(1) + 'px'); layer.style.setProperty('--d', d.toFixed(1) + 'px');
  /* sharp copy: scaled by k around the lens centre (screen space) */
  phIn.style.transformOrigin = `${(lx - S.sx).toFixed(1)}px ${(ly - S.sy).toFixed(1)}px`;
  phIn.style.transform = `scale(${k.toFixed(3)})`;
  const blur = Math.abs(S.focus - SHARP) * 0.16; phIn.style.filter = `saturate(1.2) contrast(1.12)${blur > 0.15 ? ` blur(${blur.toFixed(2)}px)` : ''}`;
  for (const [c, x] of [[rings.l, lx - d], [rings.r, lx + d], [rings.il, lx - d], [rings.ir, lx + d]]) { c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', ly.toFixed(1)); c.setAttribute('r', (c === rings.l || c === rings.r ? r + 3 : r - 0.5).toFixed(1)); }
  reticle.setAttribute('transform', `translate(${(lx + d).toFixed(1)} ${ly.toFixed(1)}) scale(${(r / 120).toFixed(3)})`);
  if (handle) Object.assign(handle.style, { width: (2 * (r + d)) + 'px', height: (2 * r) + 'px', transform: `translate(${(lx - d - r).toFixed(1)}px, ${(ly - r).toFixed(1)}px)` });
  /* notes: scene position, magnified around the lens centre; found when inside either circle's inner 60% */
  let near = false;
  for (const n of notes) {
    const px = S.sx + n.x * S.sw, py = S.sy + n.y * S.sh;
    const qx = lx + (px - lx) * k, qy = ly + (py - ly) * k;
    n.el.style.transform = `translate(${qx.toFixed(1)}px, ${qy.toFixed(1)}px)`;
    if (!n.found) {
      const dl = Math.hypot(qx - (lx - d), qy - ly), dr = Math.hypot(qx - (lx + d), qy - ly);
      if (Math.min(dl, dr) < r * 0.62 && S.moved) foundNote(n);
    }
  }
  /* a field note's text under the crosshair: the reticle steps back so the note reads cleanly */
  const vr = viewer.getBoundingClientRect(), cx = vr.left + lx + d, cy = vr.top + ly, pad = r * 0.45;
  for (const n of notes) { const t = n.t || (n.t = n.el.querySelector('.fn-t')); if (!t) continue; const b = t.getBoundingClientRect();
    if (b.width && cx > b.left - pad && cx < b.right + pad && cy > b.top - pad && cy < b.bottom + pad) { near = true; break; } }
  if (near !== S.near) { S.near = near; viewer.classList.toggle('note-near', near); }
}
function foundNote(n) {
  n.found = true; n.el.classList.add('is-found'); S.found++;
  const jr = document.querySelector(`.jr-i[data-note="${n.el.id}"]`); if (jr) { jr.classList.add('is-found'); const b = jr.querySelector('.jr-btn'); b.lastChild.textContent = 'Look again'; }
  $('#found').textContent = S.found; $$('.found-dots i').forEach((d, i) => d.classList.toggle('on', i < S.found));
  live.textContent = `Field note ${S.found} of 4: ${$('.fn-t', n.el).textContent.replace(/^\d+/, '')}`;
}

/* ---- input: pointer (desktop), lens drag + tap (phone), keys ---- */
function setTarget(x, y, user = true) { S.tx = clamp(x, 0, S.w); S.ty = clamp(y, 0, S.h); if (user) { S.idle = 0; if (!S.moved) { S.moved = true; viewer.classList.add('has-moved'); } } kick(); }
const local = (e) => { const r = viewer.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
if (!isM) viewer.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setTarget(...local(e)); }, { passive: true });
let drag = null;
if (handle) {
  handle.addEventListener('pointerdown', (e) => { const [x, y] = local(e); drag = { id: e.pointerId, ox: S.tx - x, oy: S.ty - y }; handle.setPointerCapture(e.pointerId); e.preventDefault(); });
  handle.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; const [x, y] = local(e); setTarget(x + drag.ox, y + drag.oy); });
  const end = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
}
/* a tap anywhere on the photo moves the lens there (touch equivalent of hover on desktop) */
let down = null;
viewer.addEventListener('pointerdown', (e) => { if (e.target === handle) return; down = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
viewer.addEventListener('pointerup', (e) => { if (!down || e.target === handle) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); if (moved < 10 && performance.now() - down.t < 500) setTarget(...local(e)); down = null; }, { passive: true });
viewer.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 64 : 24, m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (m) { e.preventDefault(); setTarget(S.tx + m[0], S.ty + m[1]); return; }
  if (e.key === '+' || e.key === '=') { e.preventDefault(); setMag(S.mag === 6 ? 8 : 10); }
  if (e.key === '-' || e.key === '_') { e.preventDefault(); setMag(S.mag === 10 ? 8 : 6); }
});

/* ---- magnification (segmented radios) ---- */
const segs = $$('.seg [data-mag]');
function setMag(m) {
  S.mag = m; S.rT = radiusOf(m);
  segs.forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.mag === m)));
  $('#lg-mag').textContent = m; $('#lg-fov').textContent = `lens radius ${Math.round(Math.sqrt(8 / m) * 100)}% of 8x`;
  live.textContent = `Magnification ${m} times`; diagram(); kick();
}
segs.forEach((b) => b.addEventListener('click', () => setMag(+b.dataset.mag)));
$('.seg').addEventListener('keydown', (e) => {
  const dir = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key]; if (!dir) return; e.preventDefault();
  const i = segs.findIndex((b) => b.getAttribute('aria-checked') === 'true'), nb = segs[(i + dir + segs.length) % segs.length]; nb.focus(); nb.click();
});

/* ---- focus wheel (role=slider): drag sideways or arrow keys; knurl moves like a real wheel ---- */
const wheel = $('[data-wheel]'), knurl = $('.wheel-knurl', wheel);
function setFocus(v, say) {
  S.focus = clamp(v, 0, 100); const off = Math.abs(S.focus - SHARP), word = off < 4 ? 'Sharp' : off < 14 ? 'Slightly soft' : 'Soft';
  wheel.setAttribute('aria-valuenow', Math.round(S.focus)); wheel.setAttribute('aria-valuetext', word);
  knurl.style.setProperty('--kx', (S.focus * 2.1).toFixed(1) + 'px');
  $('#focus-state').textContent = word; $('#lg-focus').innerHTML = `${word}<small>wheel at ${Math.round(S.focus)} of 100</small>`;
  if (say) live.textContent = `Focus ${word}`; kick();
}
let wd = null;
wheel.addEventListener('pointerdown', (e) => { wd = { id: e.pointerId, x: e.clientX, v: S.focus }; wheel.setPointerCapture(e.pointerId); e.preventDefault(); });
wheel.addEventListener('pointermove', (e) => { if (!wd || e.pointerId !== wd.id) return; setFocus(wd.v + (e.clientX - wd.x) * 0.32); });
const wEnd = (e) => { if (wd && e.pointerId === wd.id) { wd = null; setFocus(S.focus, true); } };
wheel.addEventListener('pointerup', wEnd); wheel.addEventListener('pointercancel', wEnd);
wheel.addEventListener('keydown', (e) => {
  const k = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 }[e.key];
  if (k) { e.preventDefault(); setFocus(S.focus + k, true); } else if (e.key === 'Home') setFocus(0, true); else if (e.key === 'End') setFocus(100, true);
});

/* ---- section hooks: "Try 6x in the lens", "Show me" a note ---- */
const toLook = (after) => { const top = viewer.getBoundingClientRect().top + scrollY - (isM ? 140 : 0); scrollTo({ top: isM ? top : 0, behavior: reduced ? 'auto' : 'smooth' }); setTimeout(after, reduced ? 0 : 450); };
$$('[data-try]').forEach((b) => b.addEventListener('click', () => toLook(() => { setMag(+b.dataset.try); viewer.focus({ preventScroll: true }); })));
$$('[data-show]').forEach((b) => b.addEventListener('click', () => {
  const n = notes.find((x) => x.el.id === b.dataset.show);
  toLook(() => { S.moved = true; viewer.classList.add('has-moved'); setTarget(S.sx + n.x * S.sw, S.sy + n.y * S.sh); viewer.focus({ preventScroll: true }); });
}));

/* ---- the little diagram in "how it works" mirrors the live lens ---- */
function diagram() {
  const f = Math.sqrt(8 / S.mag), r = 70 * f, d = r * 0.74, cx = 180, cy = 100;
  $('.dg-l').setAttribute('r', r.toFixed(1)); $('.dg-l').setAttribute('cx', (cx - d).toFixed(1));
  $('.dg-r').setAttribute('r', r.toFixed(1)); $('.dg-r').setAttribute('cx', (cx + d).toFixed(1));
  $('.dg-dot').setAttribute('cx', (cx + d).toFixed(1));
  const h = Math.sqrt(Math.max(0, r * r - d * d));          // lens-shaped overlap of the two circles
  $('.dg-o').setAttribute('d', `M${cx} ${cy - h}A${r} ${r} 0 0 1 ${cx} ${cy + h}A${r} ${r} 0 0 1 ${cx} ${cy - h}Z`);
  $('.dg-dim').setAttribute('d', `M${cx - d} ${cy + r + 14}h${2 * d}M${cx - d} ${cy + r + 8}v12M${cx + d} ${cy + r + 8}v12`);
  const t = $('#dg-gap'); t.setAttribute('y', (cy + r + 32).toFixed(0)); t.textContent = `offset 0.74 r · ${S.mag}x`;
}

/* ---- loop: damped follow, idle drift (off with reduced motion) ---- */
let raf = 0, last = performance.now(), onScreen = true;
function tick(now) {
  raf = 0; const dt = Math.min(0.05, (now - last) / 1000); last = now; S.idle += dt;
  if (!reduced && S.idle > 3.5 && !drag) {                      // the glasses wander a little when nobody is looking
    const t = now / 1000; S.tx += Math.cos(t * 0.37) * 9 * dt * 6; S.ty += Math.sin(t * 0.51) * 5 * dt * 6;
    S.tx = clamp(S.tx, S.r, S.w - S.r); S.ty = clamp(S.ty, S.r * 0.8, S.h - S.r * 0.8);
  }
  const k = reduced ? 1 : 1 - Math.exp(-10 * dt);
  S.lx += (S.tx - S.lx) * k; S.ly += (S.ty - S.ly) * k; S.r += (S.rT - S.r) * (reduced ? 1 : 1 - Math.exp(-12 * dt));
  const zT = zoomOf(S.mag); S.zoom += (zT - S.zoom) * (reduced ? 1 : 1 - Math.exp(-12 * dt));
  draw(); aim3d();
  const settling = Math.abs(S.tx - S.lx) + Math.abs(S.ty - S.ly) + Math.abs(S.rT - S.r) + Math.abs(zT - S.zoom) * 100 > 0.2;
  if (onScreen && (settling || (!reduced && S.idle > 3.5))) raf = requestAnimationFrame(tick);
}
function kick() { if (!raf && onScreen) { last = performance.now(); raf = requestAnimationFrame(tick); } }
new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) kick(); }).observe(viewer);
new ResizeObserver(() => { layout(); kick(); }).observe(viewer);
setFocus(SHARP); setMag(8); layout(); kick();
if (phOut.complete) viewer.classList.add('is-ready'); else phOut.addEventListener('load', () => viewer.classList.add('is-ready'), { once: true });

/* ---- the real binoculars: aim at the lens ---- */
let aimer = null, stage = null; const aim = { yaw: 0, pitch: 0 };
const stEl = document.querySelector('[data-stage]');
function aim3d() {                                             // point the objectives from the card towards the lens centre
  if (!aimer) return;
  const v = viewer.getBoundingClientRect(), c = stEl.getBoundingClientRect();
  const dx = (v.left + S.lx) - (c.left + c.width / 2), dy = (v.top + S.ly) - (c.top + c.height / 2), depth = isM ? 260 : 520;
  aim.yaw = clamp(Math.atan2(dx, depth), -1.25, 1.25); aim.pitch = clamp(Math.atan2(dy, depth * 1.3), -0.6, 0.6); stage.invalidate();
}
try {
  stage = await createStage({
    el: '[data-stage]', demand: true, exposure: 1.3, envIntensity: 1.35,
    camera: { fov: 26, position: [0, 0.45, 3.2], target: [0, 0, 0] },
    label: 'A pair of vintage leather binoculars (Poly Haven, CC0) that turns to aim where the lens is looking'
  });
  if (!stage.failed) {
    const g = await stage.load(stage.asset('models/binoculars.glb'));
    const model = g.scene;
    const straps = []; model.traverse((o) => { if (/strap/i.test(o.name)) straps.push(o); }); straps.forEach((o) => o.parent && o.parent.remove(o));
    aimer = new THREE.Group(); const pivot = new THREE.Group();
    pivot.add(model); stage.fit(pivot, isM ? 1.55 : 1.45); aimer.add(pivot); stage.add(aimer);
    const key = new THREE.DirectionalLight(0xfff4e6, 2.2); key.position.set(-2.5, 3, 3);
    const rim = new THREE.DirectionalLight(0xe9f0d0, 1.6); rim.position.set(2.5, 1.5, -2.5);
    stage.add(key, rim);
    const cur = { yaw: 0, pitch: 0 };
    stage.onFrame((dt) => {
      const k = reduced ? 1 : 1 - Math.exp(-6 * dt);
      cur.yaw += (aim.yaw - cur.yaw) * k; cur.pitch += (aim.pitch - cur.pitch) * k;
      aimer.rotation.set(cur.pitch, cur.yaw, 0);
      return Math.abs(aim.yaw - cur.yaw) + Math.abs(aim.pitch - cur.pitch) > 0.001;
    });
    stage.loaded(); aim3d();
  }
} catch (e) { $('[data-stage]').classList.add('is-fallback'); }
