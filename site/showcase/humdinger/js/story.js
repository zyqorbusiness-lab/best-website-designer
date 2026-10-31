// Humdinger: the scroll story. One file for both builds; the phone build (m.html) uses the phone profile below.
import { Sound, Sequencer, LAYERS } from './sound.js';
const doc = document.documentElement;
const PHONE = doc.dataset.build === 'm';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q = new URLSearchParams(location.search);
const STILL = Q.get('still');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // power3.inOut
const TAU = Math.PI * 2;
window.__hd = { errors: [] };

/* ---------- boot dots (real progress) ---------- */
const boot = { p: 0, shown: 0, done: false, t0: performance.now() };
const dots = $$('#boot i'), bootN = $('#boot-n');
function bootTo(p) { boot.p = Math.max(boot.p, p); }
const repeat = (() => { try { return sessionStorage.getItem('hd-booted') === '1'; } catch { return false; } })();
bootTo(0.25);   // html + css + modules parsed (this file runs after three.js and the scene module loaded)
document.fonts && document.fonts.ready.then(() => bootTo(0.5));

/* ---------- poses ---------- */
const KEYS = ['x', 'y', 's', 'rx', 'ry', 'rz', 'ex', 'float', 'swing', 'shadow'];
const ANG = { rx: 1, ry: 1, rz: 1 };
const P = (x, y, s, rx, ry, rz, o = {}) => Object.assign({ x, y, s, rx, ry, rz, ex: 0, float: 0, swing: 0, shadow: 1 }, o);
const wrap = (d) => { d = (d + Math.PI) % TAU; if (d < 0) d += TAU; return d - Math.PI; };
function lerpPose(a, b, t) { const o = {}; for (const k of KEYS) o[k] = ANG[k] ? a[k] + wrap(b[k] - a[k]) * t : a[k] + (b[k] - a[k]) * t; return o; }

const D = {   // desktop poses
  hero: () => P(0.09, 0.0, 0.6, -0.14, -0.42, 0.07, { float: 1 }),
  flip: (p) => P(0.17, -0.03, 0.66, 0.06 + 0.2 * seg(p, 0.68, 0.92), -0.28 + Math.PI * seg(p, 0.3, 0.6) + Math.PI * seg(p, 0.68, 0.92), 0.05 * (1 - seg(p, 0.68, 0.92)), { float: 0.4 }),
  inside: (p) => { const open = seg(p, 0.02, 0.4) * (1 - seg(p, 0.82, 0.97)); return P(0, -0.05, 0.5, 0.18 + 0.2 * open, -0.25 - 0.62 * open, 0, { ex: open, float: 0.2 }); },
  play: () => P(-0.19, -0.03, 0.76, 0.0, 0.14, 0, { float: 0.25 }),
  anywhere: (p) => { const k = Math.sin(p * TAU); return P(0, -0.06 + 0.12 * k * k, 0.36, 0.08, 0.2 * Math.cos(p * TAU * 1.5), 0, { swing: -0.3 * Math.sin(p * TAU * 2), shadow: 0.5 }); },
  specs: (p) => P(-0.22, -0.02, 0.62, 0.0, 0.0, 0.3 - (Math.PI / 2) * p, { float: 0.15 }),
  pocket: (p) => { const f = seg(p, 0.05, 0.45), d = seg(p, 0.5, 0.86); return P(0.2, 0.14 - 0.12 * f - 0.22 * d, 0.44 * (1 - 0.15 * d), TAU * f, -0.2 + 0.2 * d, 0.06 + 0.08 * d, { float: 0.3 * (1 - d), shadow: 1 - d }); }
};
const M = {   // phone poses (same object, re-framed for a tall screen)
  hero: () => P(0.0, -0.05, 0.42, -0.12, -0.36, 0.06, { float: 1 }),
  flip: (p) => P(0.02, 0.04, 0.44, 0.06 + 0.2 * seg(p, 0.68, 0.92), -0.28 + Math.PI * seg(p, 0.3, 0.6) + Math.PI * seg(p, 0.68, 0.92), 0.05 * (1 - seg(p, 0.68, 0.92)), { float: 0.4 }),
  inside: (p) => { const open = seg(p, 0.02, 0.4) * (1 - seg(p, 0.82, 0.97)); return P(0.03, 0.13, 0.3, 0.18 + 0.2 * open, -0.25 - 0.62 * open, 0, { ex: open, float: 0.2 }); },
  play: () => P(0, 0.15, 0.4, 0, 0.1, 0, { float: 0.25 }),
  anywhere: (p) => { const k = Math.sin(p * TAU); return P(0, -0.02 + 0.1 * k * k, 0.27, 0.08, 0.2 * Math.cos(p * TAU * 1.5), 0, { swing: -0.3 * Math.sin(p * TAU * 2), shadow: 0.5 }); },
  specs: (p) => P(0, 0.25, 0.29, 0, 0, 0.3 - (Math.PI / 2) * p, { float: 0.15 }),
  pocket: (p) => { const f = seg(p, 0.05, 0.45), d = seg(p, 0.5, 0.86); return P(0, 0.06 - 0.1 * f - 0.2 * d, 0.32 * (1 - 0.12 * d), TAU * f, -0.2 + 0.2 * d, 0.06 + 0.08 * d, { float: 0.3 * (1 - d), shadow: 1 - d }); }
};
const POSE = PHONE ? M : D;
const SCREEN = { hero: 'PRESS', flip: 'FLIP', inside: 'INSIDE', play: 'PATTERN', anywhere: 'TRAVEL', specs: 'SPECS', pocket: 'POCKET' };
// key progress values used when motion is reduced (each section shows its key pose)
const RM_KEYS = { hero: [0], flip: [0, 0.5, 1], inside: [0, 0.5, 1], play: [0], anywhere: [0, 0.5, 1], specs: [0, 1], pocket: [0, 1] };
// still-image keys (for the no-WebGL fallback and for rendering the stills)
const STILLS = { hero: P(0, 0, 0.86, -0.14, -0.42, 0.07), flip: P(0, 0, 0.86, 0.06, Math.PI - 0.28, 0), inside: P(0, 0, 0.62, 0.38, -0.87, 0, { ex: 1 }), play: P(0, 0, 0.86, 0, 0.14, 0),
  anywhere: P(0, 0, 0.86, 0.08, 0.2, 0), specs: P(0, 0, 0.86, 0, 0, -0.6), pocket: P(0, 0, 0.86, 0, -0.2, 0.06) };

/* ---------- sections + scroll position ---------- */
const secs = $$('.sec').map((el) => ({ el, id: el.dataset.sec, top: 0, h: 0, bg: el.classList.contains('bg-lime') ? 'lime' : 'cream' }));
let vh = innerHeight, vw = innerWidth;
function measure() { vh = innerHeight; vw = innerWidth; let y = 0; for (const s of secs) { s.top = s.el.offsetTop; s.h = s.el.offsetHeight; } }
let scrollY = 0;
function where(y) {   // -> { i, phase:'pin'|'move', p (pin progress), t (transition progress) }
  for (let i = secs.length - 1; i >= 0; i--) { const s = secs[i]; if (y >= s.top - 0.5) { const pinLen = Math.max(1, s.h - vh), into = y - s.top;
      if (into <= pinLen || i === secs.length - 1) return { i, phase: 'pin', p: clamp(into / pinLen), t: 0, pinLen, into };
      return { i, phase: 'move', p: 1, t: clamp((into - pinLen) / vh), pinLen, into }; } }
  return { i: 0, phase: 'pin', p: 0, t: 0 };
}
function quant(id, p) { const k = RM_KEYS[id]; let best = k[0]; for (const v of k) if (Math.abs(v - p) < Math.abs(best - p)) best = v; return best; }
function targetPose(w) {
  const s = secs[w.i], fp = (p) => RM ? quant(s.id, p) : p;
  if (w.i === secs.length - 1) { const o = POSE[s.id](fp(w.p)); o.y += Math.max(0, (w.into - w.pinLen) / vh); return o; }
  if (w.phase === 'pin') return POSE[s.id](fp(w.p));
  const n = secs[w.i + 1]; const a = POSE[s.id](fp(1)), b = POSE[n.id](fp(0));
  return lerpPose(a, b, RM ? (w.t < 0.5 ? 0 : 1) : ease(w.t));
}

/* ---------- reveals ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.2 });

/* ---------- sound + sequencer ---------- */
const sound = new Sound();
const sndBtn = $('.snd');
sound.onChange((on) => { sndBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); sndBtn.querySelector('span').textContent = PHONE ? 'Sound' : on ? 'Sound on' : 'Sound off'; if (seq.playing) { seq.stop(); seq.start(); } });
sndBtn.addEventListener('click', () => { sound.on ? sound.disable() : sound.enable(); });
let stage = null, dev = null;
const seq = new Sequencer(sound, (step, hits) => { if (dev) { dev.setStep(step, seq.grid()); for (const p of hits) { dev.press(p); ring(p, 0.6); } } });
const bpmOut = $('#bpm'), seqBtn = $('.seq-b');
function setBpm(b) { seq.bpm = clamp(Math.round(b), 70, 160); bpmOut.textContent = seq.bpm + ' BPM'; if (dev) { dev.setBpm(seq.bpm); dev.setKnob(0, -((seq.bpm - 70) / 90 - 0.5) * 4.6); } }
$$('.tb').forEach((b) => b.addEventListener('click', () => setBpm(seq.bpm + +b.dataset.d)));
function syncSeqBtn() { seqBtn.setAttribute('aria-pressed', seq.playing ? 'true' : 'false'); seqBtn.querySelector('span').textContent = seq.playing ? 'Stop the beat' : 'Play the beat'; }
let userSeq = null;   // null = the guided demo decides; true/false = the visitor decided
seqBtn.addEventListener('click', () => { if (!sound.on) sound.enable(); userSeq = !seq.playing; userSeq ? seq.start() : seq.stop(); syncSeqBtn(); });
const modes = { rec: false };
function modeUi() { $('[data-m="rec"]').classList.toggle('on', modes.rec); $('[data-m="shift"]').classList.toggle('on', sound.shift); $('[data-m="fx"]').classList.toggle('on', sound.fx); }
function trigger(i, from) {
  if (!sound.on) sound.enable();   // a tap on a pad is the visitor asking for sound
  if (dev) dev.press(i); ring(i, 1);
  const pb = $(`.pb[data-pad="${i}"]`); if (pb) { pb.classList.add('hit'); setTimeout(() => pb.classList.remove('hit'), 110); }
  if (i < 12) { sound.play(i); if (modes.rec && seq.playing) seq.record(i); }
  else if (i === 12) { userSeq = !seq.playing; seq.toggle(); syncSeqBtn(); sound.play(i); }
  else if (i === 13) { modes.rec = !modes.rec; sound.play(i); }
  else if (i === 14) { sound.shift = !sound.shift; sound.play(i); }
  else if (i === 15) { sound.setFx(!sound.fx); sound.play(i); }
  modeUi(); padHint();
}
$$('.pb').forEach((b) => b.addEventListener('click', () => trigger(+b.dataset.pad, 'btn')));
const KEYMAP = '12345678qwertyui';
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return; const t = e.target; if (t && (t.closest('input,textarea,select,dialog') )) return;
  const k = KEYMAP.indexOf(e.key.toLowerCase()); if (k >= 0) { trigger(k, 'key'); return; }
  if (e.key === ' ' && cur && cur.id === 'play' && !(t && t.closest('button,a'))) { e.preventDefault(); userSeq = !seq.playing; if (!sound.on) sound.enable(); seq.toggle(); syncSeqBtn(); }
});
let hinted = false; function padHint() { if (!hinted) { hinted = true; const h = $('.hint-pad'); if (h) h.style.opacity = '0'; } }

/* ---------- rings (signature detail 1): a ring rolls across the flat colour from the pad you hit ---------- */
const rc = $('#rings'), rg = rc.getContext('2d'); const rings = [];
const RING_SIZE = [1.0, 0.75, 0.4, 0.6, 0.85, 0.85, 0.85, 0.85, 0.6, 0.6, 0.6, 0.6, 0.35, 0.35, 0.35, 0.35];
let padCenterFn = null;
function ring(i, k) { if (RM || !stage || !padCenterFn) return; const pt = stage.project3(padCenterFn(i)); rings.push({ x: pt.x, y: pt.y, t: 0, max: Math.max(vw, vh) * 0.42 * RING_SIZE[i] * k, w: 3 + 5 * RING_SIZE[i] }); if (rings.length > 24) rings.shift(); }
function drawRings(dt) {
  const dpr = Math.min(devicePixelRatio || 1, 2); if (rc.width !== Math.round(vw * dpr)) { rc.width = Math.round(vw * dpr); rc.height = Math.round(innerHeight * dpr); }
  rg.setTransform(dpr, 0, 0, dpr, 0, 0); rg.clearRect(0, 0, vw, innerHeight); if (!rings.length) return;
  const css = getComputedStyle(doc); const col = cur && cur.bg === 'lime' ? css.getPropertyValue('--cream') : css.getPropertyValue('--pop');
  rg.strokeStyle = col.trim() || '#FFF4E2';
  for (let j = rings.length - 1; j >= 0; j--) { const r = rings[j]; r.t += dt * (0.9 + seq.bpm / 160); const e = 1 - Math.pow(1 - clamp(r.t), 3); if (r.t >= 1) { rings.splice(j, 1); continue; }
    rg.globalAlpha = 1 - r.t; rg.lineWidth = r.w * (1 - r.t * 0.6); rg.beginPath(); rg.arc(r.x, r.y, 20 + e * r.max, 0, TAU); rg.stroke(); }
  rg.globalAlpha = 1;
}

/* ---------- section DOM states ---------- */
const flipLis = $$('.flip-l li'), partLis = $$('.parts li'), stepLis = $$('.steps li'), song = $('.song'), strip = $('.strip'), sticker = $('.sticker');
const leaders = $('#leaders');
let cur = null, lastLayers = -1;
const PART_AT = { face: 0.42, pads: 0.5, board: 0.58, battery: 0.66, shell: 0.74 };
function domFor(w) {
  const s = secs[w.i]; cur = s; const p = w.p; const pinned = w.phase === 'pin';
  if (doc.dataset.sec !== s.id) doc.dataset.sec = s.id;
  $$('.pills a').forEach((a) => a.classList.toggle('cur', a.getAttribute('href') === '#' + s.id));
  // flip labels: one active at a time
  if (s.id === 'flip') { const k = p < 0.3 ? 0 : p < 0.68 ? 1 : 2; flipLis.forEach((li, j) => li.classList.toggle('on', j === k)); }
  // inside labels appear 40-80% and stay
  if (s.id === 'inside' || (s.id === 'flip' && w.phase === 'move')) { const pp = s.id === 'inside' ? p : 0; partLis.forEach((li) => li.classList.toggle('on', pp >= PART_AT[li.dataset.a] && pp < 0.86 || (RM && pp >= 0.4 && pp < 0.86))); }
  // play: guided demo, 4 steps at 0/25/50/75%
  if (s.id === 'play' && pinned) {
    const layers = 1 + Math.min(3, Math.floor(clamp(p) * 4));
    if (layers !== lastLayers) { if (layers > lastLayers && lastLayers > 0) for (const [pad] of LAYERS[layers - 1].hits) trigger(pad, 'demo'); else if (lastLayers < 0) for (const [pad] of LAYERS[0].hits) { if (dev) dev.press(pad); }
      lastLayers = layers; seq.layers = layers; stepLis.forEach((li, j) => li.classList.toggle('on', j < layers)); song.classList.toggle('on', layers === 4); if (dev) dev.setStep(seq.step, seq.grid()); }
    if (userSeq === null && !seq.playing && !RM) { seq.start(); syncSeqBtn(); }
  } else if (s.id !== 'play' && seq.playing && userSeq !== true) { seq.stop(); syncSeqBtn(); }
  if (s.id !== 'play' && seq.layers === 0) seq.layers = 4;
  // anywhere strip
  if (s.id === 'anywhere') { const k = RM ? quant('anywhere', p) : p; strip.style.transform = PHONE ? `translate3d(0,${-k * 200}svh,0)` : `translate3d(${-k * 200}vw,0,0)`; if (dev) dev.setDot(k); }
  if (s.id === 'pocket') sticker.classList.toggle('on', p > 0.86);
  // screen: a hovered nav pill previews its section's screen (signature detail 2)
  if (dev) dev.setScreen(hoverScreen || (s.id === 'play' ? 'PATTERN' : SCREEN[s.id]));
}
let hoverScreen = null;
$$('.pills a').forEach((a) => { a.addEventListener('mouseenter', () => { hoverScreen = a.dataset.screen; }); a.addEventListener('mouseleave', () => { hoverScreen = null; });
  a.addEventListener('mousemove', (e) => { if (RM) return; const r = a.getBoundingClientRect(); a.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 8}px,${((e.clientY - r.top) / r.height - 0.5) * 8}px)`; });
  a.addEventListener('mouseleave', () => { a.style.transform = ''; });
  a.addEventListener('click', (e) => { const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); const y = t.offsetTop + (t.id === 'play' ? 2 : 0); if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); });
});
$('.logo').addEventListener('click', (e) => { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
$('.wl').addEventListener('click', () => { const d = $('#note'); if (d.showModal) d.showModal(); });

/* leader lines (desktop): label edge -> projected anchor on the device */
const ANCH_FLIP = { pads: [-0.2, -0.05, 0.1], door: [0, -0.2, -0.09], loop: [-0.3, 1.02, 0] };
function drawLeaders(w) {
  if (!stage || !stage.project3) { leaders.innerHTML = ''; return; }
  const s = secs[w.i]; let out = '';
  const on = w.phase === 'pin' && (s.id === 'flip' || s.id === 'inside');
  if (on && s.id === 'flip' && !PHONE) {
    const li = flipLis.find((l) => l.classList.contains('on')); if (li) { const a = ANCH_FLIP[li.dataset.a], pt = stage.project3(a), r = li.getBoundingClientRect();
      const x1 = r.left + Math.min(r.width, li.scrollWidth) + 18, y1 = r.top + r.height * 0.62; const vis = stage.facing(a);
      if (vis) out += `<line x1="${x1}" y1="${y1}" x2="${pt.x}" y2="${pt.y}"/><circle cx="${x1}" cy="${y1}" r="3"/><circle class="ring" cx="${pt.x}" cy="${pt.y}" r="6"/>`; } }
  if (on && s.id === 'inside' && dev) { const A = dev.anchors(); partLis.forEach((li, j) => { if (!li.classList.contains('on')) return; const pt = stage.project(A[li.dataset.a]);
      if (PHONE) { out += `<circle class="ring" cx="${pt.x}" cy="${pt.y}" r="11"/><text x="${pt.x}" y="${pt.y + 4}" text-anchor="middle" style="font:500 11px var(--f-m);fill:var(--ink)">${j + 1}</text>`; return; }
      const r = li.getBoundingClientRect(), left = li.classList.contains('l'); const x1 = left ? r.right + 14 : r.left - 14, y1 = r.top + 8;
      out += `<line x1="${x1}" y1="${y1}" x2="${pt.x}" y2="${pt.y}"/><circle cx="${x1}" cy="${y1}" r="3"/><circle class="ring" cx="${pt.x}" cy="${pt.y}" r="6"/>`; }); }
  if (leaders.__last !== out) { leaders.innerHTML = out; leaders.__last = out; }
}

/* ---------- pointer: pads, knob drag, hero tilt / spin, cursor ring ---------- */
const curEl = $('#cur'); const ptr = { x: vw / 2, y: vh / 2, nx: 0, ny: 0, in: false }; let drag = null, spin = 0, spinV = 0, hoverHit = null, needHit = false;
addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.nx = e.clientX / vw - 0.5; ptr.ny = e.clientY / vh - 0.5; if (e.pointerType === 'mouse' && (e.clientX || e.clientY)) ptr.in = true; needHit = e.pointerType === 'mouse';
  if (drag) { if (drag.knob !== undefined) { const dy = drag.y - e.clientY; drag.y = e.clientY; if (drag.knob === 0) setBpm(seq.bpm + dy * 0.35); else { dev.tone = clamp((dev.tone ?? 0.5) + dy * 0.004); dev.setKnob(1, (dev.tone - 0.5) * 4.6); } }
    else if (drag.spin) { const dx = e.clientX - drag.x; drag.x = e.clientX; spin += dx * 0.012; spinV = dx * 0.012; } } }, { passive: true });
addEventListener('pointerdown', (e) => {
  if (!stage || e.button > 0) return; if (e.target.closest('a,button,input,dialog,.top,.padgrid')) return;
  const h = stage.hit(e.clientX, e.clientY); if (!h) return;
  if (h.pad !== undefined) { if (e.pointerType === 'touch') { tapCand = { pad: h.pad, x: e.clientX, y: e.clientY, t: performance.now() }; if (dev) dev.press(h.pad); } else trigger(h.pad, 'tap'); return; }
  if (h.knob !== undefined) { drag = { knob: h.knob, y: e.clientY }; if (!sound.on) sound.enable(); return; }
  if (h.body && cur && cur.id === 'hero') drag = { spin: true, x: e.clientX };
});
let tapCand = null;
addEventListener('pointerup', (e) => { if (drag && drag.knob !== undefined) sound.click(); drag = null;
  if (tapCand) { const c = tapCand; tapCand = null; if (Math.hypot(e.clientX - c.x, e.clientY - c.y) < 12 && performance.now() - c.t < 600) trigger(c.pad, 'tap'); } });
addEventListener('pointercancel', () => { drag = null; tapCand = null; });
document.addEventListener('mouseleave', () => { ptr.in = false; });

/* ---------- main loop ---------- */
let lenis = null, last = performance.now(), cpose = null, intro = 0, introStart = 0, tNow = 0, lastW = null;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; tNow += dt;
  if (lenis) lenis.raf(now);
  bootTick(dt);
  if (document.hidden) return;
  scrollY = lenis ? lenis.scroll : window.scrollY;
  const w = where(scrollY); lastW = w;
  domFor(w);
  seq.frame();
  if (!stage) { drawRings(dt); return; }
  let tp = targetPose(w);
  // hero extras: cursor tilt (desktop), auto sway (phone), drag spin
  const heroK = w.i === 0 ? 1 - (w.phase === 'move' ? ease(w.t) : 0) : 0;
  if (heroK > 0) { if (!RM) { if (!PHONE && ptr.in) { tp.rx += ptr.ny * 0.34 * heroK; tp.ry += ptr.nx * 0.34 * heroK; } if (PHONE) { tp.ry += Math.sin(tNow * 0.6) * 0.12 * heroK; } }
    if (!drag) { spinV *= 0.94; spin += spinV; spin *= 0.97; } tp.ry += spin * heroK; }
  // the TEMPO knob speeds up the idle float (signature detail 3)
  const tempoK = seq.bpm / 112;
  if (RM) { tp.float = 0; tp.swing = 0; }
  // intro drop
  if (intro < 1 && boot.done) { intro = clamp((now - introStart) / (RM ? 1 : 900)); }
  const di = RM ? 0 : 1 - ease(Math.min(1, intro * 1.15));
  tp.y += di * 0.9; tp.rz += di * 0.4;
  const squash = !RM && intro > 0.85 && intro < 1 ? Math.sin((intro - 0.85) / 0.15 * Math.PI) * 0.05 : 0;
  // damp toward the target (angle-aware)
  if (!cpose) cpose = { ...tp };
  const k = 1 - Math.exp(-dt * (RM ? 14 : 7));
  for (const key of KEYS) { const d = ANG[key] ? wrap(tp[key] - cpose[key]) : tp[key] - cpose[key]; cpose[key] += d * (key === 'y' && di > 0 ? 1 : k); }
  const pose = { ...cpose, s: cpose.s * (1 - squash) };
  if (lastW.i === 0 || lastW.i === 3) pose.float = cpose.float * tempoK;
  stage.applyPose(pose, tNow * (RM ? 0 : tempoK));
  // phone/desktop cursor ring over pads
  if (needHit && !drag) { needHit = false; hoverHit = stage.hit(ptr.x, ptr.y); }
  if (!PHONE) { curEl.classList.toggle('on', ptr.in); curEl.classList.toggle('tap', !!(hoverHit && (hoverHit.pad !== undefined || hoverHit.knob !== undefined)));
    curEl.querySelector('span').textContent = hoverHit && hoverHit.knob !== undefined ? 'DRAG' : 'TAP';
    curEl.style.transform = `translate3d(${ptr.x}px,${ptr.y}px,0)`; doc.style.cursor = ''; }
  stage.render(dt);
  drawLeaders(w);
  drawRings(dt);
  if (!window.__hd.firstFrame) { window.__hd.firstFrame = true; bootTo(1); }
}

/* ---------- boot sequence: dots -> 4 sine bands -> hero ---------- */
const wipe = $('#wipe'); let wipeT = -1;
function bootTick(dt) {
  if (boot.done) return;
  const target = Math.round(boot.p * 16); if (boot.shown < target) { boot.shown = Math.min(target, boot.shown + (repeat ? 16 : dt * 40)); }
  const n = Math.floor(boot.shown); dots.forEach((d, i) => d.classList.toggle('on', i < n)); bootN.textContent = Math.round(n / 16 * 100);
  if (n >= 16 && wipeT < 0) wipeT = 0;
  if (wipeT >= 0) {
    if (RM || repeat) { finishBoot(); return; }
    wipeT += dt / 0.62; const g = wipe.getContext('2d'), W = wipe.width = innerWidth, H = wipe.height = innerHeight;
    g.clearRect(0, 0, W, H); g.fillStyle = getComputedStyle(doc).getPropertyValue('--pop').trim() || '#C6F03C';
    for (let b = 0; b < 4; b++) { const t = clamp((wipeT - b * 0.09) / 0.7), e = 1 - Math.pow(1 - t, 3); const y0 = (b / 4) * H, bh = H / 4 + 2, x = e * (W + 160) - 80;
      g.beginPath(); g.moveTo(0, y0); for (let yy = 0; yy <= bh; yy += 6) g.lineTo(x + Math.sin(yy / bh * Math.PI * 2 + b) * 40 * (1 - e * 0.5), y0 + yy); g.lineTo(0, y0 + bh); g.closePath(); g.fill(); }
    $('#boot .dots').style.opacity = $('#boot .boot-t').style.opacity = String(1 - clamp(wipeT * 2.2));
    if (wipeT >= 1.05) finishBoot();
  }
}
function finishBoot() { if (boot.done) return; boot.done = true; introStart = performance.now(); doc.classList.add('booted'); try { sessionStorage.setItem('hd-booted', '1'); } catch {} setTimeout(() => { const b = $('#boot'); if (b) b.remove(); }, 400); if (dev) dev.setScreen('PRESS'); }
setTimeout(() => { bootTo(1); setTimeout(finishBoot, 2500); }, 7000);   // never hold the page hostage

/* ---------- start ---------- */
function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
async function start() {
  if (PHONE) sndBtn.querySelector('span').textContent = 'Sound';
  measure(); addEventListener('resize', () => { measure(); if (stage) stage.resize(); });
  $$('.rv').forEach((el) => io.observe(el));
  if (!RM && !PHONE && window.Lenis) { lenis = new window.Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true }); }
  const useGL = !Q.has('nogl') && hasGL();
  if (useGL) {
    try { const S = await import('./scene.js'); bootTo(0.75); stage = new S.Stage($('#gl'), { quality: PHONE ? 'phone' : 'desktop', still: !!STILL }); dev = stage.device; padCenterFn = (i) => { const c = S.padCenter(i); return [c.x, c.y, 0.09]; };
      stage.project3 = (a) => stage.project(new stage.V3(...a)); stage.facing = (a) => stage.facing3(a);
      $('#gl').addEventListener('webglcontextlost', (e) => { e.preventDefault(); toFallback(); });
    } catch (err) { window.__hd.errors.push(String(err)); stage = null; dev = null; }
  }
  if (!stage) await toFallback();
  if (dev) { dev.setScreen(boot.done ? 'PRESS' : 'BOOT'); setBpm(112); }
  if (STILL) { stillMode(); return; }
  requestAnimationFrame(frame);
}
async function toFallback() {
  doc.classList.add('nogl'); bootTo(1);
  const F = await import('./nogl.js'); stage = null; dev = null;
  const fb = new F.Fallback($('#still'), STILLS); window.__hd.fallback = true;
  // drive the stills from the same poses
  const loop = () => { requestAnimationFrame(loop); if (!lastW) return; const s = secs[lastW.i]; const key = lastW.phase === 'move' && lastW.t > 0.5 && secs[lastW.i + 1] ? secs[lastW.i + 1].id : s.id;
    const flipBack = s.id === 'flip' && lastW.phase === 'pin' && lastW.p > 0.38 && lastW.p < 0.74; fb.show(flipBack ? 'flip' : key === 'flip' ? 'hero' : key, targetPose(lastW), vw, innerHeight); };
  requestAnimationFrame(loop);
}
function stillMode() {   // ?still=<key>: render one pose on a transparent canvas (used to make the fallback stills)
  doc.classList.add('still', 'booted'); $('#boot') && $('#boot').remove();
  const pose = STILLS[STILL] || STILLS.hero; dev.setScreen(SCREEN[STILL] === 'PATTERN' ? 'PATTERN' : SCREEN[STILL] || 'PRESS');
  if (STILL === 'play') { seq.layers = 4; dev.setStep(0, seq.grid()); }
  if (STILL === 'pocket') dev.setScreen('POCKET');
  let n = 0; const go = () => { stage.applyPose({ ...pose, shadow: 0 }, 0); stage.render(0.016); if (++n < 4) requestAnimationFrame(go); else window.__hd.stillReady = true; }; requestAnimationFrame(go);
}
start().catch((e) => { window.__hd.errors.push(String(e)); });
window.__hd.state = () => ({ w: lastW, sec: cur && cur.id, pose: cpose, seq: { playing: seq.playing, layers: seq.layers, bpm: seq.bpm }, sound: sound.on, gl: !!stage, info: stage && stage.info, fallback: !!window.__hd.fallback });
window.__hd.trigger = trigger;
window.__hd.padXY = (i) => (stage && padCenterFn ? stage.project3(padCenterFn(i)) : null);
