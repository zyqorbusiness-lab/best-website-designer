/* VOLT - Concept 07, Zyqor Lab. One fixed WebGL canvas; three cans (a real CC-BY can model, see can.js) travel
   hero (inside the wordmark) -> flavour carousel (colour flood) -> CTA fan. Shared by index.html and m.html. */
import { THREE, Q, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, clamp, damp, lerp } from '../_kit/kit.js';
import { modeSwitch } from './mode.js';
import { CAN_H, CAN_R, canKit, wrapMaterial, paintWrap, buildCan, contactShadowTex } from './can.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const G = () => window.gsap;

const FL = [
  { name: 'Lime Bolt', bg: '#C6F432', ink: '#1F4FD8', acc: '#FF9F1C', can: '#C6F432', canHi: '#D6FF4D', txt: '#1F4FD8', stripe: '#1F4FD8', bolt: '#FF9F1C', rim: 0xC6F432,
    notes: 'Key lime, yuzu zest and a sharp ginger finish.', chips: ['Citrus', 'Ginger', 'Ice cold'] },
  { name: 'Mango Rush', bg: '#FF9F1C', ink: '#1F4FD8', acc: '#C6F432', can: '#FF9F1C', canHi: '#FFB23F', txt: '#1F4FD8', stripe: '#1F4FD8', bolt: '#C6F432', rim: 0xFF9F1C,
    notes: 'Ripe mango, passion fruit and a pinch of chilli heat.', chips: ['Tropical', 'Chilli', 'Juicy'] },
  { name: 'Blue Surge', bg: '#1F4FD8', ink: '#4FD8FF', acc: '#C6F432', can: '#123A66', canHi: '#184C84', txt: '#4FD8FF', stripe: '#4FD8FF', bolt: '#C6F432', rim: 0x4FD8FF,
    notes: 'Blue raspberry, cold mint and a flash of lemon.', chips: ['Berry', 'Mint', 'Electric'] },
];
let active = 0;

/* ---------- small UI helpers ---------- */
const toastEl = $('.toast'); let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3200); }
let lenis = null;
function goTo(sel) {
  const el = $(sel); if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault();
  if (a.classList.contains('concept')) { toast('Concept only: VOLT is a fictional drink, nothing here is for sale.'); return; }
  goTo(a.getAttribute('href') === '#top' ? '#top' : a.getAttribute('href'));
});

/* odometer numbers */
function odometers() {
  $$('.odo').forEach((el) => {
    const to = el.dataset.to; el.textContent = ''; el.setAttribute('aria-label', to);
    const cols = [...to].map((d) => {
      const col = document.createElement('span'); col.className = 'col'; col.setAttribute('aria-hidden', 'true');
      for (let r = 0; r < 2; r++) for (let n = 0; n < 10; n++) { const s = document.createElement('span'); s.textContent = n; col.append(s); }
      el.append(col); return { col, d: +d };
    });
    const run = () => cols.forEach(({ col, d }, i) => { col.style.transitionDelay = (i * 0.12) + 's'; col.style.transform = `translateY(${-(10 + d) * 0.88}em)`; });
    if (reduced) { cols.forEach(({ col, d }) => { col.style.transition = 'none'; col.style.transform = `translateY(${-(10 + d) * 0.88}em)`; }); return; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* magnetic pills, tilt cards and the cursor label (pointer devices only) */
function pointerFX() {
  if (coarse || isM || reduced) return;
  $$('.pill-mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transition = 'transform .15s ease-out'; el.style.transform = `translate(${x * 0.22}px,${y * 0.32}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
  });
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform .12s ease-out, background .4s, border-color .4s';
      el.style.transform = `perspective(800px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), background .4s, border-color .4s'; el.style.transform = ''; });
  });
  const cur = $('.cursor'), lab = cur.firstElementChild; let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    const t = e.target.closest && e.target.closest('[data-cursor]');
    if (t) { lab.textContent = t.dataset.cursor; cur.classList.add('on'); } else cur.classList.remove('on');
  });
  (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.translate = `${cx}px ${cy}px`; requestAnimationFrame(loop); })();
}

/* ---------- WebGL cans ---------- */
const canvas = $('#gl');
/* one renderer for every screen (round 2): antialiased, DPR capped at 2 on desktop AND phone, ACES */
/* no WebGL (blocked, very old GPU, failed context): the page still works, with real stills of the model in the cans' places */
const HAS_GL = (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();
let renderer = null;
if (HAS_GL) { try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; } }
let GL = !!renderer;
if (!GL) root.classList.add('no-gl');
const scene = new THREE.Scene();
if (GL) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = 0.6; // the water beads' refraction pass
  scene.environment = studioEnv(renderer, 0.035);
  /* the shared Poly Haven studio HDRI (CC0, 1k) replaces the procedural room once it has loaded: same file on desktop and phone */
  useHDRI(renderer, scene, { size: 1024, intensity: 1.25, rotation: 1.6 });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); GL = false; root.classList.add('no-gl'); root.classList.remove('gl-ready'); });
}
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const CAMZ = 12; cam.position.set(0, 0, CAMZ);
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-4, 6, 8); scene.add(key);
/* rim: a cool strip from behind outlines the silhouette, the flavour-tinted points colour the edges */
const rimBack = new THREE.DirectionalLight(0xEAF4FF, 2.2); rimBack.position.set(2.5, 3, -8); scene.add(rimBack);
const rimL = new THREE.PointLight(FL[0].rim, 30, 20, 2); rimL.position.set(-4, 1, -2); scene.add(rimL);
const rimR = new THREE.PointLight(0xFF9F1C, 24, 20, 2); rimR.position.set(4, -1, -2); scene.add(rimR);
const flash = new THREE.PointLight(0xF4FFD0, 0, 30, 2); flash.position.set(0, 3, 5); scene.add(flash);

const kit = canKit({ aniso: GL ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1, load: GL });
/* poster first: a real still of each can (rendered from the same model) holds the can's place until the 3D model is in,
   and stays as the picture when there is no WebGL */
const stillBox = document.createElement('div'); stillBox.className = 'can-stills'; stillBox.setAttribute('aria-hidden', 'true');
document.body.appendChild(stillBox);
const stills = FL.map((f, i) => { const im = new Image(); im.alt = ''; im.decoding = 'async'; stillBox.appendChild(im); return im; });
const stillSrc = (i) => { if (!stills[i].src) stills[i].src = `../../assets/lab/volt/still-${i}.webp`; };
/* the hero still always; the other two only without WebGL, or if the model is slow (they cost nothing once the 3D is in) */
stillSrc(0); if (!GL) { stillSrc(1); stillSrc(2); } else setTimeout(() => { if (!modelIn) { stillSrc(1); stillSrc(2); } }, 2500);
let modelIn = false, labelsIn = false;
function modelReady() { if (!modelIn && labelsIn && GL && kit.geo.wall) { modelIn = true; root.classList.add('gl-ready'); } }
kit.model.then(modelReady);
const SEG = kit.SEG;
const shTex = contactShadowTex();
const cans = FL.map((f, i) => {
  const grp = new THREE.Group();
  const labelMat = wrapMaterial(kit);
  const spin = buildCan(kit, labelMat); grp.add(spin);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0 }));
  sh.rotation.x = -Math.PI / 2 + 0.28; scene.add(grp, sh);
  return { f, i, grp, spin, sh, labelMat, L: { x: 0, y: 0, z: 0, s: 1, rz: 0, ry: 0 }, spinT: 0, spinC: 0, wrapUntil: 0 };
});
async function paintLabels() {
  try { await Promise.race([document.fonts.load('400 100px Anton'), new Promise((r) => setTimeout(r, 2500))]); await document.fonts.load('700 16px "Inter Tight"'); } catch (e) { /* fall back to system fonts */ }
  cans.forEach((c) => paintWrap(kit, c.labelMat, c.f));
}

/* ---------- layout + anchors ---------- */
let VW = innerWidth, VH = innerHeight, WPP = 1;
const mctx = document.createElement('canvas').getContext('2d');
const hero = $('.hero'), gap = $('#gap'), word = $('.word'), lv = $('.lv'), flav = $('.flav'), cta = $('.cta'), ctaCans = $('#ctaCans'), stage = $('#stage');
const heroA = { cx: 0, cy: 0, h: 100, ok: false };
const intro = { p: reduced ? 1 : 0, gw: reduced ? 1 : 0 };
function measureHero() {
  const fs = parseFloat(getComputedStyle(word).fontSize);
  mctx.font = `400 ${fs}px Anton`; const m = mctx.measureText('V');
  const cap = m.actualBoundingBoxAscent || fs * 0.72, fa = m.fontBoundingBoxAscent || fs * 0.9, fd = m.fontBoundingBoxDescent || fs * 0.25;
  return { fs, cap, fa, fd };
}
let HM = null;
function resize() {
  VW = innerWidth; VH = innerHeight;
  if (renderer) renderer.setSize(VW, VH, false); canvas.style.height = VH + 'px';
  cam.aspect = VW / VH; cam.updateProjectionMatrix();
  WPP = (2 * CAMZ * Math.tan(THREE.MathUtils.degToRad(15))) / VH;
  HM = measureHero(); applyGap();
}
function canPxH() { return HM.cap * (isM ? 1.16 : 1.12); }
function applyGap() { const wpx = canPxH() * (2 * CAN_R / CAN_H) * 1.22 + HM.fs * 0.02; gap.style.setProperty('--gw', (wpx * intro.gw) + 'px'); }
const toW = (px, py) => [(px - VW / 2) * WPP, -(py - VH / 2) * WPP];
const scaleFor = (pxH) => (pxH * WPP) / CAN_H;
function slotOf(i) { const d = (i - active + 3) % 3; return d === 0 ? 0 : d === 1 ? 1 : -1; }

/* carousel slot targets in px relative to the section centre */
function carouselSlot(sl) {
  if (isM) return sl === 0 ? { x: 0, y: -VH * 0.06, h: VH * 0.44, rz: 0, ry: 0, z: 0.4 } : { x: sl * VW * 0.43, y: VH * 0.0, h: VH * 0.3, rz: -sl * 0.24, ry: -sl * 0.5, z: -1.2 };
  return sl === 0 ? { x: 0, y: -VH * 0.05, h: VH * 0.6, rz: 0, ry: 0, z: 0.4 } : { x: sl * VW * 0.26, y: VH * 0.02, h: VH * 0.43, rz: -sl * 0.22, ry: -sl * 0.55, z: -1.4 };
}
function fanSlot(sl) {
  const h = isM ? VH * 0.34 : VH * 0.47, w = h * (2 * CAN_R / CAN_H);
  return { x: sl * w * (isM ? 1.1 : 1.12), y: Math.abs(sl) * h * 0.04, h: sl === 0 ? h * 1.08 : h, rz: -sl * 0.2, ry: -sl * 0.35, z: sl === 0 ? 0.6 : -0.4 };
}

/* ---------- flavour switching (colour flood from the can) ---------- */
const flood = $('.flood'), ghostT = $('.ghost-t'), fnameT = $('.fname-t'), fnum = $('.fnum'), fnotes = $('.fnotes'), chips = $('.chips'), dots = $$('.fdot');
const meta = document.querySelector('meta[name="theme-color"]');
/* CHARGED mode: every flavour flips to a dark field with its own neon ink */
let charged = false;
const CHG = { 'Lime Bolt': { bg: '#1A44C2', ink: '#C6F432' }, 'Mango Rush': { bg: '#2340B0', ink: '#FF9F1C' }, 'Blue Surge': { bg: '#163BA8', ink: '#4FD8FF' } };
const cv = (f) => (charged ? { ...f, ...CHG[f.name] } : f);
function applyVars(f0) { const f = cv(f0); root.style.setProperty('--bg', f.bg); root.style.setProperty('--ink', f.ink); root.style.setProperty('--acc', f.acc); }
function setText(f, n) {
  fnum.textContent = String(n + 1).padStart(2, '0'); fnotes.textContent = f.notes;
  chips.innerHTML = f.chips.map((c) => `<li>${c}</li>`).join('');
  dots.forEach((d, j) => d.setAttribute('aria-selected', j === n ? 'true' : 'false'));
}
let floodTw = null;
function setFlavour(n, dir = 1) {
  n = (n + 3) % 3; if (n === active) return;
  const prev = active; active = n; const f = cv(FL[n]);
  // carousel motion: wrap the can that crosses behind, spin the new hero can
  cans.forEach((c) => { const was = ((c.i - prev + 3) % 3), now = slotOf(c.i); if ((was === 1 && now === -1) || (was === 2 && now === 1)) c.wrapUntil = performance.now() + 520; });
  cans[n].spinT += Math.PI * 2 * dir;
  rimL.color.setHex(f.rim);
  const gs = G();
  if (reduced || !gs) { applyVars(f); setText(f, n); ghostT.textContent = f.name; fnameT.textContent = f.name; meta.setAttribute('content', f.bg); return; }
  // flood: a circle grows from the centre can
  const r = flav.getBoundingClientRect(); const ox = VW / 2, oy = (r.top + r.height / 2 - VH * 0.05) - r.top;
  flood.style.setProperty('--nbg', f.bg);
  if (floodTw) floodTw.progress(1);
  floodTw = gs.fromTo(flood, { clipPath: `circle(0% at ${ox}px ${oy}px)` }, { clipPath: `circle(150% at ${ox}px ${oy}px)`, duration: 1.05, ease: 'power3.inOut',
    onUpdate() { if (this.progress() > 0.32 && root.style.getPropertyValue('--ink') !== f.ink) root.style.setProperty('--ink', f.ink); },
    onComplete() { applyVars(f); meta.setAttribute('content', f.bg); gs.set(flood, { clipPath: 'circle(0% at 50% 50%)' }); floodTw = null; } });
  // type rolls
  const roll = (el, txt, d) => gs.timeline().to(el, { yPercent: -110 * dir, duration: 0.42, ease: 'power3.in' })
    .add(() => { el.textContent = txt; }).fromTo(el, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }).delay(d);
  roll(fnameT, f.name, 0.05); roll(ghostT, f.name, 0);
  gs.fromTo([fnotes, chips], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.45, stagger: 0.08 });
  setTimeout(() => setText(f, n), 380);
}
$('#prev').addEventListener('click', () => setFlavour(active - 1, -1));
$('#next').addEventListener('click', () => setFlavour(active + 1, 1));
dots.forEach((d, j) => d.addEventListener('click', () => setFlavour(j, j > active ? 1 : -1)));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const r = flav.getBoundingClientRect(); if (r.top > VH * 0.5 || r.bottom < VH * 0.5) return;
  e.preventDefault(); e.key === 'ArrowRight' ? setFlavour(active + 1, 1) : setFlavour(active - 1, -1);
});

/* drag: spin the can live; a long or fast drag switches flavour */
let drag = null, dragRot = 0, dragVel = 0;
stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, t: performance.now(), lx: e.clientX }; stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointermove', (e) => {
  if (!drag) return; const dx = e.clientX - drag.lx; drag.lx = e.clientX;
  dragRot += dx * (isM ? 0.016 : 0.011); dragVel = dx;
});
const endDrag = (e) => {
  if (!drag) return; const tot = e.clientX - drag.x, dt = performance.now() - drag.t; drag = null;
  const fast = Math.abs(tot) / Math.max(dt, 1) > 0.9 && Math.abs(tot) > 40;
  if (Math.abs(tot) > (isM ? 70 : 160) || fast) { const dir = tot < 0 ? 1 : -1; dragRot = 0; setFlavour(active + dir, dir); }
};
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

/* pointer parallax for the hero can */
let px = 0, py = 0;
if (!coarse) addEventListener('pointermove', (e) => { px = e.clientX / VW - 0.5; py = e.clientY / VH - 0.5; });

/* ---------- statement scrub (sticky section, works with native or Lenis scroll) ---------- */
const st = $('.statement'), words = $$('.st .w'), mark = $('.mark'), stSub = $('.st-sub');
const rots = [-8, 6, -5, 9, -4, 3];
const easeO = (t) => 1 - Math.pow(1 - t, 4), easeIO = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
function statement() {
  if (reduced) return;
  const r = st.getBoundingClientRect(); if (r.bottom < -50 || r.top > VH + 50) return;
  const p = clamp(-r.top / Math.max(1, r.height - VH));
  words.forEach((w, i) => {
    const t = clamp((p - (0.04 + i * 0.12)) / 0.13), e = easeO(t);
    w.style.opacity = t > 0 ? Math.min(1, t * 3) : 0;
    w.style.transform = `translate3d(0,${(1 - e) * 40}%,0) scale(${1 + (1 - e) * 1.5}) rotate(${(1 - e) * rots[i]}deg)`;
  });
  mark.style.transform = `scaleX(${easeO(clamp((p - 0.76) / 0.12))}) skewX(-8deg)`;
  const s = clamp((p - 0.84) / 0.1); stSub.style.opacity = s; stSub.style.transform = `translateY(${(1 - s) * 20}px)`;
}

/* ---------- hero intro + flashes ---------- */
function zap() {
  if (reduced) return;
  hero.classList.remove('flash', 'sweep'); void hero.offsetWidth; hero.classList.add('flash', 'sweep');
  flashUntil = performance.now() + 500;
}
let flashUntil = 0;
function startIntro() {
  const gs = G();
  if (reduced || !gs) { intro.p = 1; intro.gw = 1; applyGap(); return; }
  gs.to(intro, { gw: 1, duration: 1.15, delay: 0.25, ease: 'power4.inOut', onUpdate: applyGap });
  gs.to(intro, { p: 1, duration: 1.7, delay: 0.1, ease: 'expo.out' });
  setTimeout(zap, 1050);
  setInterval(() => { if (hero.getBoundingClientRect().bottom > VH * 0.3 && !document.hidden) zap(); }, 7000);
}

/* ---------- frame loop ---------- */
let last = performance.now(), T = 0, shown = true;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  statement();
  const hr = hero.getBoundingClientRect(), cr = flav.getBoundingClientRect(), tr = ctaCans.getBoundingClientRect();
  const heroVis = hr.bottom > 0, carVis = cr.top < VH && cr.bottom > 0, ctaVis = tr.top < VH && tr.bottom > 0;
  const vis = heroVis || carVis || ctaVis;
  if (vis !== shown) { shown = vis; canvas.style.visibility = vis ? 'visible' : 'hidden'; stillBox.style.visibility = vis ? '' : 'hidden'; }
  if (!vis) return;
  const ctaMode = cr.bottom < 0;
  // hero anchor from the gap in the wordmark
  const gr = gap.getBoundingClientRect(), vr = lv.getBoundingClientRect();
  const base = vr.top + (HM.fs - (HM.fa + HM.fd)) / 2 + HM.fa;
  const hpx = canPxH(), hcx = gr.left + gr.width / 2, hcy = base - HM.cap / 2 - HM.cap * 0.02;
  const pT = clamp((VH - cr.top) / VH), e = easeIO(pT);
  const ccx = VW / 2, ccy = cr.top + cr.height / 2;
  const tcx = tr.left + tr.width / 2, tcy = tr.top + tr.height * 0.52;
  cans.forEach((c) => {
    const sl = slotOf(c.i);
    const tgt = ctaMode ? fanSlot(sl) : carouselSlot(sl);
    const L = c.L, k = reduced ? 1000 : 6.5;
    const wrapping = now < c.wrapUntil;
    L.x = damp(L.x, tgt.x, k, dt); L.y = damp(L.y, tgt.y - (wrapping ? VH * 0.06 : 0), k, dt);
    L.z = damp(L.z, wrapping ? -5 : tgt.z, wrapping ? 14 : k, dt); L.s = damp(L.s, tgt.h, k, dt);
    L.rz = damp(L.rz, tgt.rz, k, dt); L.ry = damp(L.ry, tgt.ry, k, dt);
    c.spinC = damp(c.spinC, c.spinT, reduced ? 1000 : 4.2, dt);
    let sx, sy, sh, z = L.z, rz = L.rz, ry = L.ry + c.spinC, rx = 0, shOp = 0.5;
    if (ctaMode) { sx = tcx + L.x; sy = tcy + L.y; sh = L.s; ry += reduced ? 0 : Math.sin(T * 0.7 + c.i * 2) * 0.35; }
    else {
      const cx = ccx + L.x, cy = ccy + L.y;
      if (sl === 0) {
        // hero can: intro drop + spin, idle sway, pointer tilt; blends into the carousel centre on scroll
        const ip = intro.p, drop = (1 - ip);
        const hx = hcx, hy = hcy - drop * VH * 0.9;
        const idle = reduced ? 0 : Math.sin(T * 0.8) * 0.45;
        sx = lerp(hx, cx, e); sy = lerp(hy, cy, e); sh = lerp(hpx * (1 + drop * 0.5), L.s, e);
        /* R3: scroll beat - the hero can barrel-turns once and tips toward the camera as it travels into the carousel */
        const sb = reduced ? 0 : Math.sin(e * Math.PI);
        ry = lerp(idle + px * 0.8 - drop * Math.PI * 5, ry, e) + (reduced ? 0 : e * Math.PI * 2);
        rz = lerp(drop * 0.6, rz, e) + sb * 0.22; rx = lerp(py * 0.25, 0, e) + sb * 0.42;
        z = lerp(0.6, z, e); shOp = 0.5 * e;
      } else {
        sx = cx + sl * (1 - e) * VW * 0.7; sy = cy; sh = L.s; ry += (1 - e) * sl * 2.4;
        rz += (1 - e) * -sl * 0.4;
      }
    }
    if (sl === 0 && !drag) dragRot = damp(dragRot, Math.round(dragRot / (Math.PI * 2)) * Math.PI * 2, 2.5, dt);
    if (sl === 0) ry += dragRot;
    const [wx, wy] = toW(sx, sy), s = scaleFor(sh);
    const hum = reduced ? 0 : CH.n * (Math.sin(T * 83 + c.i * 7) * 0.006 + Math.sin(T * 57) * 0.004);
    c.grp.position.set(wx + hum, wy + (reduced ? 0 : Math.sin(T * 1.3 + c.i) * 0.03), z);
    c.grp.scale.setScalar(s); c.grp.rotation.set(rx, 0, rz); c.spin.rotation.y = ry + (window.__voltSpin || 0);
    // contact shadow under the can
    const bottom = wy - (CAN_H / 2) * s * Math.cos(rz);
    c.sh.position.set(wx, bottom - 0.02, z); c.sh.scale.set(s * 1.5, s * 0.62, 1); c.sh.material.opacity = shOp * (1 - Math.abs(rz));
    if (!modelIn || !GL) { // the still stands exactly where the 3D can will be (same anchor, height and tilt)
      const im = stills[c.i], k2 = CAMZ / Math.max(1, CAMZ - z), hpx2 = sh * k2;
      im.style.height = hpx2.toFixed(1) + 'px';
      im.style.transform = `translate(${(sx + hum / WPP).toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-50%) rotate(${(-rz).toFixed(4)}rad)`;
      im.style.zIndex = String(Math.round(10 + z * 2));
    }
  });
  flash.intensity = (now < flashUntil ? 60 * (flashUntil - now) / 500 : 0) + (now < arcFlash ? 22 * (arcFlash - now) / 140 : 0);
  if (GL) renderer.render(scene, cam);
  if (heroVis) arcs(now, hcx, hcy, hpx); else if (arcOn) { actx.clearRect(0, 0, arcC.width, arcC.height); arcOn = false; }
}

/* ---------- charged: lightning arcs from the can to the wordmark ---------- */
const CH = { n: 0 };
const arcC = $('.arcs'), actx = arcC.getContext('2d');
let arcList = [], nextArc = 0, arcFlash = 0, arcOn = false;
function sizeArcs() { const k = Math.min(Q.dpr, isM ? 1 : 1.5), r = hero.getBoundingClientRect(); arcC.width = Math.round(r.width * k); arcC.height = Math.round(r.height * k); arcC._k = k; }
function bolt(x0, y0, x1, y1, rough) {
  let pts = [[x0, y0], [x1, y1]];
  for (let it = 0; it < 5; it++) {
    const nx = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], l = Math.hypot(bx - ax, by - ay); nx.push([(ax + bx) / 2 + (Math.random() - 0.5) * l * rough, (ay + by) / 2 + (Math.random() - 0.5) * l * rough]); nx.push(pts[i + 1]); }
    pts = nx; rough *= 0.62;
  }
  return pts;
}
function arcs(now, cx, cy, ch) {
  if (CH.n < 0.02 || reduced) { if (arcOn) { actx.clearRect(0, 0, arcC.width, arcC.height); arcOn = false; } return; }
  arcOn = true;
  const hr = hero.getBoundingClientRect(), k = arcC._k || 1, col = FL[active].name === 'Blue Surge' ? '79,216,255' : FL[active].name === 'Mango Rush' ? '255,159,28' : '198,244,50';
  if (now > nextArc) {
    nextArc = now + (isM ? 260 : 120) + Math.random() * (isM ? 520 : 360);
    const L = $$('.lt', hero), t = L[Math.random() < 0.5 ? 0 : L.length - 1].getBoundingClientRect();
    const side = t.left + t.width / 2 < cx ? -1 : 1, w = ch * 0.27;
    const x0 = cx + side * w * 0.9, y0 = cy + (Math.random() - 0.5) * ch * 0.7;
    const x1 = side < 0 ? t.right - Math.random() * t.width * 0.3 : t.left + Math.random() * t.width * 0.3, y1 = t.top + t.height * (0.15 + Math.random() * 0.7);
    arcList.push({ p: bolt(x0 - hr.left, y0 - hr.top, x1 - hr.left, y1 - hr.top, 0.5), t: now, life: 110 + Math.random() * 120 });
    if (Math.random() < 0.35) arcFlash = now + 140;
  }
  actx.setTransform(k, 0, 0, k, 0, 0); actx.clearRect(0, 0, arcC.width / k, arcC.height / k);
  actx.lineCap = 'round'; actx.lineJoin = 'round';
  arcList = arcList.filter((a) => now - a.t < a.life);
  arcList.forEach((a) => {
    const f = 1 - (now - a.t) / a.life;
    actx.beginPath(); a.p.forEach(([x, y], i) => (i ? actx.lineTo(x, y) : actx.moveTo(x, y)));
    actx.shadowColor = `rgba(${col},1)`; actx.shadowBlur = isM ? 8 : 16;
    actx.strokeStyle = `rgba(${col},${(0.85 * f * CH.n).toFixed(3)})`; actx.lineWidth = 3.2; actx.stroke();
    actx.shadowBlur = 0; actx.strokeStyle = `rgba(255,255,240,${(0.95 * f * CH.n).toFixed(3)})`; actx.lineWidth = 1.2; actx.stroke();
  });
}
const chBtns = $$('.charge'); let chBusy = false;
function setCharged(on, btn) {
  if (chBusy || on === charged) return;
  chBusy = true;
  const apply = () => {
    charged = on; root.classList.toggle('charged', on);
    chBtns.forEach((b) => { b.setAttribute('aria-pressed', on ? 'true' : 'false'); const t = $('.cl', b); if (t) t.textContent = on ? 'Charged' : 'Charge it'; });
    applyVars(FL[active]); meta.setAttribute('content', cv(FL[active]).bg);
    if (reduced || !G()) CH.n = on ? 1 : 0;
  };
  const after = () => {
    const gs = G(); if (reduced || !gs) return;
    gs.to(CH, { n: on ? 1 : 0, duration: on ? 0.6 : 0.9, ease: on ? 'power4.out' : 'power2.inOut' });
    if (on) {
      zap();
      /* the wordmark shorts out and strikes back on, the hero can takes a jolt */
      gs.fromTo('.lt', { opacity: 0.15 }, { keyframes: { opacity: [0.15, 1, 0.3, 1, 0.55, 1] }, duration: 0.8, ease: 'none', stagger: 0.12 });
      cans[active].spinT += Math.PI * 2;
      gs.fromTo('.word', { scale: 1.04 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1,0.35)', clearProps: 'transform' });
    } else {
      gs.fromTo('.lt', { opacity: 0.4 }, { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08 });
    }
  };
  modeSwitch({ apply, after, reduced, shape: on ? 'zap' : 'circle', duration: on ? 900 : 950, origin: btn }).then(() => { chBusy = false; });
  if (reduced || !document.startViewTransition) chBusy = false;
}
chBtns.forEach((b) => b.addEventListener('click', () => setCharged(!charged, b)));

/* ---------- boot ---------- */
async function boot() {
  resize(); addEventListener('resize', resize); sizeArcs(); addEventListener('resize', sizeArcs);
  lenis = smooth();
  odometers(); pointerFX(); reveals();
  applyVars(FL[0]);
  await paintLabels();
  if (GL) await Promise.race([kit.model, new Promise((r) => setTimeout(r, 6000))]);
  labelsIn = true; modelReady();
  resize();
  startIntro();
  requestAnimationFrame(frame);
  if (/[?&]shot/.test(location.search)) window.__volt = { THREE, cam, scene, renderer, cans, kit, CAMZ };
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
