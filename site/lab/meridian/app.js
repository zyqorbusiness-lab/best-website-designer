/* Meridian - Concept 02 - Zyqor Lab.  Giant type behind the product + a watch that travels through the page.
   One fixed WebGL canvas; the watch's pose is keyed to scroll positions of the sections (no pinning, no scroll-jacking). */
import { THREE, Q, isM, reduced, coarse, makeRenderer, glRenderer, studioEnv, reveals, smooth, whenVisible, clamp, damp, lerp } from '../_kit/kit.js';
import { buildWatch, buildBox, DIALS } from './watch.js';
import { modeSwitch } from './mode.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger;
const root = document.documentElement;
if (gsap && ST) gsap.registerPlugin(ST);
const lenis = smooth();
reveals();
document.addEventListener('click', (e) => { if (e.target.closest('[data-noop]')) e.preventDefault(); });

/* ---------------------------------------------------------------- scene */
const canvas = $('.gl');
/* one quality tier on every device (Sujon, Oct 27: the phone gets the same premium as desktop): antialias on, DPR capped at 2 */
const renderer = glRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer);
/* the CC0 studio HDRI swaps in after first paint on desktop AND phone (same softbox reflections on steel + sapphire everywhere) */
useHDRI(renderer, scene, { size: 1024, rotation: 0.6 });
const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 80);
cam.position.set(0, 0, 14);
const key = new THREE.DirectionalLight(0xfff6e8, 1.4); key.position.set(4, 6, 7); scene.add(key);
const fill = new THREE.DirectionalLight(0xdfeee6, 0.5); fill.position.set(-6, -2, 4); scene.add(fill);
const hemi = new THREE.HemisphereLight(0xffffff, 0x2a3f35, 0.4); scene.add(hemi);
const mint = new THREE.DirectionalLight(0x9DF7C4, 0); mint.position.set(-5, 3, -2); scene.add(mint);
const warm = new THREE.DirectionalLight(0xC9A24A, 0); warm.position.set(5, -3, 3); scene.add(warm);
let lume = false;
const L = { n: 0, ign: 0, off: 0 };

let W = 1, H = 1, VW = 1, VH = 1;
function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H, false);
  cam.aspect = W / H; cam.updateProjectionMatrix();
  VH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); VW = VH * cam.aspect;
  measure();
}

const watch = buildWatch(renderer);
/* the real model (one GLB, the same file on desktop and phone) loads after first paint; the poster holds the hero until it is in, with real progress.
   No WebGL (stand-in renderer from the kit): nothing is fetched and the poster stays (canvas data-nogl="self"). */
const GL = !renderer.isStub;
const prog = $('.mer-prog');
addEventListener('meridian:progress', (e) => { if (prog) prog.style.setProperty('--p', e.detail.toFixed(3)); });
addEventListener('meridian:ready', () => {
  root.classList.add('mer-ready');
  if (!reduced && gsap) gsap.to(tw, { intro: 0, duration: 2, ease: 'expo.out', delay: 0.05 }); else tw.intro = 0;
});
addEventListener('meridian:failed', () => root.classList.add('mer-failed'));
if (GL) {
  const go = () => watch.load();
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 120));
  if (document.readyState === 'complete') idle(go, { timeout: 900 }); else addEventListener('load', () => idle(go, { timeout: 900 }), { once: true });
}
const rig = new THREE.Group(), twist = new THREE.Group(), floatG = new THREE.Group();
rig.add(twist); twist.add(floatG); floatG.add(watch.root); scene.add(rig);
const box = buildBox(); const boxRig = new THREE.Group(); boxRig.add(box); scene.add(boxRig);

/* contact shadow under the hero watch */
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------- poses */
/* x, y in view fractions (y up), s = case diameter as a fraction of the view height, r = rotation */
const P = isM ? {
  hero:  { x: 0, y: 0.12, s: 0.34, rx: 0.12, ry: -0.25, rz: 0.04, box: 0 },
  specs: { x: 0.08, y: 0.27, s: 0.27, rx: 0.35, ry: 0.65, rz: -0.18, box: 0 },
  macro: { x: 0.1, y: 0.3, s: 1.3, rx: 0, ry: 0, rz: 0, box: 0 },
  box:   { x: 0, y: 0.2, s: 0.27, rx: -0.98, ry: 0, rz: 0, box: 1 },
  exit:  { x: 0, y: 0.9, s: 0.2, rx: -0.98, ry: 0, rz: 0, box: 0 },
} : {
  hero:  { x: 0, y: 0.05, s: 0.44, rx: 0.12, ry: -0.28, rz: 0.05, box: 0 },
  specs: { x: -0.2, y: 0.0, s: 0.5, rx: 0.32, ry: 0.62, rz: -0.16, box: 0 },
  macro: { x: 0.3, y: 0.08, s: 2.2, rx: 0, ry: 0, rz: 0, box: 0 },
  box:   { x: 0.17, y: -0.02, s: 0.36, rx: -0.98, ry: 0.0, rz: 0, box: 1 },
  exit:  { x: 0.17, y: 0.95, s: 0.28, rx: -0.98, ry: 0, rz: 0, box: 0 },
};
const BG = { light: '#EFE8D8', dark: '#1F4D3A', sand: '#E6DBC4' };
let keys = [];
function measure() {
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const sp = $('.specs'), mc = $('.macro'), bx = $('.boxs'), kp = $('.kept');
  const ih = innerHeight;
  keys = [
    { y: 0, p: P.hero, bg: 'light' },
    { y: isM ? top(sp) - ih * 0.12 : top(sp) + sp.offsetHeight / 2 - ih * 0.68, p: P.specs, bg: 'light' },
    { y: isM ? top(sp) + ih * 0.12 : top(sp) + sp.offsetHeight / 2 - ih * 0.32, p: P.specs, bg: 'light' },
    { y: top(mc), p: P.macro, bg: 'dark' },
    { y: top(mc) + mc.offsetHeight - ih, p: P.macro, bg: 'dark' },
    { y: top(bx) + bx.offsetHeight / 2 - ih / 2, p: P.box, bg: 'sand' },
    { y: top(kp) - ih * 0.25, p: P.exit, bg: 'light' },
  ];
}
const ez = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const col = new THREE.Color(), colB = new THREE.Color();
function poseAt(y) {
  let i = 0; while (i < keys.length - 2 && y > keys[i + 1].y) i++;
  const a = keys[i], b = keys[i + 1], t = ez(clamp((y - a.y) / Math.max(1, b.y - a.y)));
  const o = {}; for (const k in a.p) o[k] = lerp(a.p[k], b.p[k], t);
  col.set(bgOf(a.bg)); colB.set(bgOf(b.bg)); col.lerp(colB, t);
  o.bg = '#' + col.getHexString();
  return o;
}
const BGL = { light: '#0F2A21', dark: '#091C16', sand: '#14352A' };
const bgOf = (k) => (lume ? BGL[k] : k === 'light' ? DIALS[cur].bg : BG[k]);

/* ---------------------------------------------------------------- variants */
let cur = 0, busy = false;
watch.setVariant(0);
const tw = { spin: 0, lift: 0, sc: 1, intro: reduced ? 0 : 1 };
const letters = () => $$('.gw .ls > span');
function setWord(word, dir = 1) {
  const L = letters();
  if (reduced || !gsap) { L.forEach((s, k) => (s.textContent = word[k])); return; }
  L.forEach((s, k) => {
    gsap.timeline({ delay: k * 0.045 })
      .to(s, { yPercent: -110 * dir, duration: 0.42, ease: 'power3.in' })
      .add(() => { s.textContent = word[k]; })
      .fromTo(s, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
  });
}
function choose(i) {
  if (i === cur || busy) return;
  const d = DIALS[i], dir = i > cur ? 1 : -1; cur = i;
  $$('.vc').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
  setWord(d.word, dir);
  const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', d.bg);
  if (reduced || !gsap) { watch.setVariant(i); root.style.setProperty('--word', d.word_c); root.style.setProperty('--dial', d.dial); return; }
  busy = true;
  gsap.to(root, { '--word': d.word_c, '--dial': d.dial, duration: 0.9, ease: 'power2.inOut' });
  /* twist: a full turn with a lift; the dial changes while the case back faces you */
  let swapped = false;
  gsap.fromTo(tw, { spin: 0 }, { spin: Math.PI * 2 * dir, duration: 1.5, ease: 'power3.inOut',
    onUpdate: () => { if (!swapped && Math.abs(tw.spin) > Math.PI) { swapped = true; watch.setVariant(i); } },
    onComplete: () => { tw.spin = 0; busy = false; } });
  gsap.timeline().to(tw, { lift: 1, sc: 0.9, duration: 0.6, ease: 'power2.out' }).to(tw, { lift: 0, sc: 1, duration: 0.9, ease: 'power3.inOut' });
}
$$('.vc').forEach((b) => b.addEventListener('click', () => choose(+b.dataset.i)));
addEventListener('keydown', (e) => {
  if (scrollY > innerHeight * 0.6) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' && e.target.closest('.vc')) { if (e.key === 'ArrowRight') { e.preventDefault(); choose((cur + 1) % 3); } }
  if (e.key === 'ArrowLeft') { e.preventDefault(); choose((cur + 2) % 3); }
});

/* drag the hero to turn the watch (desktop) */
let dragY = 0, dragV = 0, dragging = false, lx = 0, lastDrag = 0;
const hero = $('.hero');
if (!isM) {
  hero.addEventListener('pointerdown', (e) => { if (e.target.closest('a,button')) return; dragging = true; lx = e.clientX; dragV = 0; hero.setPointerCapture(e.pointerId); });
  hero.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; dragY += dx * 0.008; dragV = dx * 0.5; lastDrag = performance.now(); });
  const up = () => { dragging = false; lastDrag = performance.now(); };
  hero.addEventListener('pointerup', up); hero.addEventListener('pointercancel', up);
}

/* ---------------------------------------------------------------- loop */
let running = !document.hidden, last = performance.now(), tt = 0, y = scrollY, bgNow = '';
const now = () => new Date();
/* pause the renderer when the tab is hidden (the canvas is fixed, so it is otherwise always on screen) */
document.addEventListener('visibilitychange', () => { running = !document.hidden; });
function frame(t) {
  if (!GL) return;
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (!running) return;
  tt += dt;
  y = lenis ? lenis.scroll : scrollY;
  const p = poseAt(y);
  if (p.bg !== bgNow) { document.body.style.background = p.bg; root.style.background = p.bg; bgNow = p.bg; }
  const S = (p.s * VH) / 2 * (1 - tw.intro * 0.25) * tw.sc;
  rig.position.set(p.x * VW, p.y * VH + tw.intro * -VH * 0.08, 0);
  rig.scale.setScalar(S);
  if (!dragging) { dragY += dragV * dt * 0.02; dragV *= Math.pow(0.03, dt); if (t - lastDrag > 2000) dragY = damp(dragY, 0, 1.5, dt); }
  const heroK = clamp(1 - y / (innerHeight * 0.8));
  twist.rotation.set(p.rx, p.ry + tw.spin + dragY * heroK - tw.intro * 1.4, p.rz);
  const fl = reduced ? 0 : Math.sin(tt * 1.1) * 0.035 * (1 - p.box);
  floatG.position.y = fl + tw.lift * 0.25;
  floatG.rotation.x = reduced ? 0 : Math.sin(tt * 0.7) * 0.03 * (1 - p.box);
  /* presentation box rises from below while the watch settles onto it */
  const bk = ez(p.box);
  boxRig.visible = bk > 0.001;
  if (boxRig.visible) {
    const bs = (P.box.s * VH) / 2;
    boxRig.scale.setScalar(bs * 0.92);
    boxRig.position.set(P.box.x * VW, (P.box.y - (1 - bk) * 0.9) * VH - bs * 0.33, -bs * 0.3);
    boxRig.rotation.set(0.56, 0, 0);
    box.userData.hinge.rotation.x = lerp(-0.2, -1.95, bk);
  }
  watch.sweepMat.uniforms.uA.value = clamp(1 - (p.s - 0.6) / 0.9);
  watch.sweepMat.uniforms.uT.value = reduced ? 2 : ((tt % 5.5) / 5.5) * 1.8 - 0.9;
  watch.setTime(now(), !reduced, L.off);
  watch.setLume(L.n, L.ign);
  scene.environmentIntensity = lerp(1, 0.16, L.n);
  key.intensity = lerp(1.4, 0.3, L.n); fill.intensity = lerp(0.5, 0.12, L.n); hemi.intensity = lerp(0.4, 0.06, L.n);
  mint.intensity = 2.2 * L.n; warm.intensity = 1.4 * L.n;
  renderer.render(scene, cam);
}

/* ---------------------------------------------------------------- clocks + counters */
const mini = { h: $('.mi-h'), m: $('.mi-m'), s: $('.mi-s') };
const ck = { h: $('.ck-h'), m: $('.ck-m'), s: $('.ck-s') };
function tick() {
  const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  if (mini.h) { mini.h.setAttribute('transform', `rotate(${h * 30} 50 50)`); mini.m.setAttribute('transform', `rotate(${m * 6} 50 50)`); mini.s.setAttribute('transform', `rotate(${s * 6} 50 50)`); }
  const p2 = (n) => String(n).padStart(2, '0');
  if (ck.h) { ck.h.textContent = p2(d.getHours()); ck.m.textContent = p2(d.getMinutes()); ck.s.textContent = p2(s); }
}
tick(); setInterval(tick, 1000);
function counters() {
  const els = $$('.cnt');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    const el = en.target, to = +el.dataset.to, fmt = (v) => Math.round(v).toLocaleString('en-US');
    if (reduced || !gsap) { el.textContent = fmt(to); return; }
    const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', delay: 0.2, onUpdate: () => (el.textContent = fmt(o.v)) });
  }), { threshold: 0.6 });
  els.forEach((e) => { if (!reduced) e.textContent = '0'; io.observe(e); });
}
counters();

/* ---------------------------------------------------------------- links, cursor, magnets, toast */
function scrollToY(yy) { if (lenis) lenis.scrollTo(yy, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) }); else scrollTo({ top: yy, behavior: reduced ? 'auto' : 'smooth' }); }
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id === '#') return; e.preventDefault();
  if (id === '#main') return scrollToY(0);
  const t = $(id); if (!t) return;
  const ty = t.getBoundingClientRect().top + scrollY;
  scrollToY(id === '#specs' ? ty + t.offsetHeight / 2 - innerHeight / 2 : ty);
}));
const book = $('.book'), toast = $('.toast');
book && book.addEventListener('click', () => { toast.textContent = 'Concept only: nothing was booked and no details were sent.'; toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 3200); });
if (!isM && !coarse) {
  const c = $('.cursor'), lab = $('span', c); let mx = -99, my = -99, cx = -99, cy = -99;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; c.style.opacity = 1; });
  const tk = () => { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tk); }; tk();
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cur]');
    if (t) { lab.textContent = t.dataset.cur; c.classList.add('big'); return; }
    if (e.target.closest('.hero') && !e.target.closest('a,button,.ui') && scrollY < innerHeight * 0.4) { lab.textContent = 'Drag'; c.classList.add('big'); return; }
    c.classList.remove('big');
  });
  if (!reduced && gsap) $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
  });
}

/* ---------------------------------------------------------------- lume mode */
const modeBtns = $$('.mode'); let modeBusy = false;
const vv = new THREE.Vector3();
function setLumeMode(on) {
  if (modeBusy || on === lume) return;
  modeBusy = true;
  vv.copy(rig.position).project(cam);
  const origin = { x: (vv.x * 0.5 + 0.5) * innerWidth, y: (-vv.y * 0.5 + 0.5) * innerHeight };
  const apply = () => {
    lume = on; root.classList.toggle('lume', on);
    modeBtns.forEach((b) => { b.setAttribute('aria-pressed', on ? 'true' : 'false'); const t = $('.ml', b); if (t) t.textContent = on ? 'Lume on' : 'Lume off'; });
    L.n = on ? 1 : 0; L.ign = on ? 0 : 1;
    const pb = poseAt(lenis ? lenis.scroll : scrollY).bg; document.body.style.background = pb; root.style.background = pb; bgNow = pb;
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', pb);
    if (reduced || !gsap) L.ign = 1;
  };
  const after = () => {
    if (reduced || !gsap) return;
    const Ls = letters();
    if (on) {
      /* lume charges clockwise behind the hand, the hands race once round the dial, the giant word pulls into focus */
      gsap.to(L, { ign: 1, duration: 1.7, ease: 'power2.inOut' });
      gsap.fromTo(L, { off: -720 }, { off: 0, duration: 2.2, ease: 'expo.out' });
      gsap.fromTo(Ls, { opacity: 0.1, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.07, clearProps: 'filter' });
    } else {
      gsap.fromTo(L, { off: 720 }, { off: 0, duration: 2, ease: 'expo.out' });
      gsap.fromTo(Ls, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.045 });
    }
    gsap.timeline().to(tw, { lift: 0.8, sc: 0.94, duration: 0.5, ease: 'power2.out' }).to(tw, { lift: 0, sc: 1, duration: 1.2, ease: 'expo.out' });
  };
  modeSwitch({ apply, after, reduced, shape: 'sweep', duration: 1250, origin }).then(() => { modeBusy = false; });
  if (reduced || !document.startViewTransition) modeBusy = false;
}
modeBtns.forEach((b) => b.addEventListener('click', () => setLumeMode(!lume)));

/* ---------------------------------------------------------------- boot */
root.style.setProperty('--word', DIALS[0].word_c); root.style.setProperty('--dial', DIALS[0].dial);
resize();
addEventListener('resize', resize);
addEventListener('load', measure);
document.fonts && document.fonts.ready.then(() => { measure(); watch.setVariant(cur); });
/* stop drawing once the closing section fills the screen and the watch has left */
const kept = $('.kept');
let keptVisible = false;
new IntersectionObserver(([e]) => { keptVisible = e.intersectionRatio > 0.9; running = !keptVisible && !document.hidden; }, { threshold: [0, 0.9, 1] }).observe(kept);
document.addEventListener('visibilitychange', () => { running = !keptVisible && !document.hidden; if (running) last = performance.now(); });
requestAnimationFrame(frame);
