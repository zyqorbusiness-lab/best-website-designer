/* Hush One - Concept 03 - Zyqor Lab.  3D scroll spin + exploded view with tracked callouts, and a noise-cancelling micro-demo.
   One module for both builds; the phone page (m.html) takes the light path (isM): no pinning, a tap-to-explode button. */
import { THREE, Q, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, whenVisible, clamp, damp, lerp } from '../_kit/kit.js';
import { buildHeadphones, WAYS } from './hp.js';
import { modeSwitch } from './mode.js';
import { useHDRI } from '../../assets/hdri/hdri.js';
import { contactShadow } from './shadow.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger;
const root = document.documentElement;
if (gsap && ST) gsap.registerPlugin(ST);
const lenis = smooth();
reveals();
document.addEventListener('click', (e) => { if (e.target.closest('[data-noop]')) e.preventDefault(); });

/* ---------------------------------------------------------------- scene */
const stage = $('.stage'), canvas = $('.gl'), wavesC = $('.waves'), wctx = wavesC.getContext('2d');
/* round 2: one quality profile for both builds - antialiased, DPR capped at 2 (the kit's phone profile is AA-off at 1.5) */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
const scene = new THREE.Scene(); scene.environment = studioEnv(renderer);
/* desktop: swap in the Poly Haven studio HDRI after first paint (phones keep the free procedural room) */
useHDRI(renderer, scene, { size: 512, rotation: 0.6 });   /* same studio HDRI on phone and desktop */
const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 80); cam.position.set(0, 0, 12);
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(4, 6, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffe2b8, 0.9); rim.position.set(-6, 3, -4); scene.add(rim);
const hemi = new THREE.HemisphereLight(0xffffff, 0x50627a, 0.45); scene.add(hemi);
const RIM_D = new THREE.Color(0xffe2b8), RIM_Q = new THREE.Color(0xF0A23B);
const QS = { n: 0 };
let quiet = false, qBusy = false;
const QBG = ['#1E2E3F', '#152230', '#232F3B'];
const bgOf = (i) => (quiet ? QBG[i] : WAYS[i].bg);
const hp = buildHeadphones();
const rig = new THREE.Group(), spinG = new THREE.Group(), floatG = new THREE.Group();
rig.add(spinG); spinG.add(floatG); floatG.add(hp.root); scene.add(rig);
hp.root.position.y = -0.7;  /* centre the arch + cups around the origin */
/* contact shadow: desktop renders a real blurred depth shadow of the product every frame; phones get a soft two-lobe blob */
const cs = contactShadow(renderer, scene, rig, { y: -1.76, w: 4.4, h: 2.4, far: 1.3, live: true });
const shMat = cs.material;

let W = 1, H = 1, VW = 1, VH = 1, dpr = Math.min(devicePixelRatio || 1, 2);
function resize() {
  W = canvas.clientWidth; H = canvas.clientHeight;
  renderer.setSize(W, H, false);
  cam.aspect = W / H; cam.updateProjectionMatrix();
  VH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); VW = VH * cam.aspect;
  wavesC.width = Math.round(W * Math.min(dpr, 1.5)); wavesC.height = Math.round(H * Math.min(dpr, 1.5));
}
addEventListener('resize', resize);

/* ---------------------------------------------------------------- state */
let p = 0, pT = 0;               /* pinned scroll progress (desktop) */
const st = { A: 1, explode: 0, intro: reduced ? 0 : 1, ripple: 0, rippleC: '#F0A23B' };
let dragYaw = 0, dragVel = 0, dragging = false, lastDrag = 0;

/* noise-cancelling demo: Listen = noisy rings, ANC on = rings collapse to one calm line */
const dbv = $('.dbv');
function setAnc(on, btn) {
  if (on === quiet || qBusy) return;
  qBusy = true;
  rig.getWorldPosition(v3); v3.project(cam);
  const r = canvas.getBoundingClientRect();
  const hpPt = { x: r.left + (v3.x * 0.5 + 0.5) * W, y: r.top + (-v3.y * 0.5 + 0.5) * H };
  const to = on ? 26 : 68;
  const apply = () => {
    quiet = on; root.classList.toggle('quiet', on); document.body.classList.toggle('anc-on', on);
    $$('.sg').forEach((b) => { const me = (b.dataset.anc === '1') === on; b.classList.toggle('on', me); b.setAttribute('aria-pressed', me ? 'true' : 'false'); });
    root.style.setProperty('--bg', bgOf(way));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', bgOf(way));
    if (reduced || !gsap) { st.A = on ? 0 : 1; QS.n = on ? 1 : 0; dbv.textContent = to; }
  };
  const after = () => {
    if (reduced || !gsap) return;
    gsap.to(st, { A: on ? 0 : 1, duration: on ? 1.6 : 1.1, ease: on ? 'expo.out' : 'power2.out' });
    gsap.to(QS, { n: on ? 1 : 0, duration: 1.4, ease: 'power2.inOut' });
    const o = { v: +dbv.textContent }; gsap.to(o, { v: to, duration: 1.4, ease: 'power3.out', onUpdate: () => (dbv.textContent = Math.round(o.v)) });
    const G = $$('.giant span');
    if (on) {
      /* the noise settles: each letter drifts in from a scattered pose, the cans exhale */
      gsap.fromTo(G, { y: () => (Math.random() - 0.5) * 70, rotation: () => (Math.random() - 0.5) * 14, opacity: 0.3 }, { y: 0, rotation: 0, opacity: 1, duration: 1.8, ease: 'expo.out', stagger: 0.09, clearProps: 'transform' });
      gsap.fromTo(spinG.scale, { x: 1.08, y: 1.08, z: 1.08 }, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' });
      gsap.fromTo(st, { ripple: 0 }, { ripple: 1, duration: 1.8, ease: 'power2.out' }); st.rippleC = '#F0A23B';
    } else {
      gsap.fromTo(G, { scale: 1.12 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.35)', stagger: 0.04, clearProps: 'transform' });
      gsap.fromTo(spinG.scale, { x: 0.94, y: 0.94, z: 0.94 }, { x: 1, y: 1, z: 1, duration: 1, ease: 'elastic.out(1,0.45)' });
    }
  };
  modeSwitch({ apply, after, reduced, shape: on ? 'close' : 'circle', duration: on ? 1150 : 1000, origin: on ? hpPt : btn }).then(() => { qBusy = false; });
  if (reduced || !document.startViewTransition) qBusy = false;
}
$$('.sg').forEach((b) => b.addEventListener('click', () => setAnc(b.dataset.anc === '1', b)));

/* colourways: swatch ripple + a coloured ring through the wave field + material tween */
let way = 0;
function setWay(i, ev, btn) {
  if (i === way) return; way = i;
  $$('.hsw').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
  if (btn && ev && !reduced) { const r = btn.getBoundingClientRect(), s = document.createElement('span'); s.className = 'rip'; s.style.setProperty('--x', (ev.clientX ? ev.clientX - r.left : r.width / 2) + 'px'); s.style.setProperty('--y', (ev.clientY ? ev.clientY - r.top : r.height / 2) + 'px'); btn.append(s); setTimeout(() => s.remove(), 800); }
  const w = WAYS[i];
  const from = { shell: hp.M.shell.color.clone(), soft: hp.M.soft.color.clone(), band: hp.M.band.color.clone(), ring: hp.M.ring.color.clone() };
  const to = { shell: new THREE.Color(w.shell), soft: new THREE.Color(w.soft), band: new THREE.Color(w.band), ring: new THREE.Color(w.ring) };
  const apply = (t) => { for (const k in from) hp.M[k].color.copy(from[k]).lerp(to[k], t); };
  const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', bgOf(i));
  if (reduced || !gsap) { apply(1); root.style.setProperty('--bg', bgOf(i)); return; }
  const o = { t: 0 }; gsap.to(o, { t: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: () => apply(o.t) });
  gsap.to(root, { '--bg': bgOf(i), duration: 0.9, ease: 'power2.inOut' });
  st.rippleC = '#' + new THREE.Color(w.shell === 0xD9E0E5 ? 0xF0A23B : w.shell).getHexString();
  gsap.fromTo(st, { ripple: 0 }, { ripple: 1, duration: 1.3, ease: 'power2.out' });
  gsap.fromTo(spinG.scale, { x: 0.94, y: 0.94, z: 0.94 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1,0.45)' });
}
$$('.hsw').forEach((b) => b.addEventListener('click', (e) => setWay(+b.dataset.i, e, b)));

/* drag to turn */
canvas.addEventListener('pointerdown', (e) => { dragging = true; dragVel = 0; canvas._lx = e.clientX; if (!isM) canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - canvas._lx; canvas._lx = e.clientX; dragYaw += dx * 0.008; dragVel = dx * 0.5; lastDrag = performance.now(); });
const endDrag = () => { dragging = false; lastDrag = performance.now(); };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

/* phone: explode button */
const xbtn = $('.xbtn');
xbtn && xbtn.addEventListener('click', () => {
  const on = xbtn.getAttribute('aria-pressed') !== 'true';
  xbtn.setAttribute('aria-pressed', on ? 'true' : 'false'); $('span', xbtn).textContent = on ? 'Put it back' : 'Explode view';
  if (reduced || !gsap) st.explode = on ? 1 : 0; else gsap.to(st, { explode: on ? 1 : 0, duration: on ? 1.3 : 1, ease: on ? 'expo.out' : 'power3.inOut' });
});

/* ---------------------------------------------------------------- waves (2D) */
function waves(cx, cy, R0, fade, t) {
  const c = wctx, k = wavesC.width / W;
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, W, H);
  if (fade <= 0.01) return;
  const N = 140, A = st.A;
  for (let r = 0; r < 6; r++) {
    const ph = reduced ? r / 6 : (t * 0.22 + r / 6) % 1;
    const rad = R0 * (1.02 + ph * 1.5 * (0.35 + 0.65 * A)) ;
    const amp = A * R0 * 0.09 * (1 - ph * 0.4);
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const n = Math.sin(a * 7 + t * 5 + r) * 0.5 + Math.sin(a * 13 - t * 7 + r * 2) * 0.3 + Math.sin(a * 23 + t * 11) * 0.2;
      const rr = rad + n * amp;
      const x = cx + Math.cos(a) * rr * 1.18, y = cy + Math.sin(a) * rr;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    const alpha = (1 - ph) * (0.12 + 0.28 * A) * fade;
    c.strokeStyle = quiet ? `rgba(231,236,239,${alpha.toFixed(3)})` : `rgba(36,54,74,${alpha.toFixed(3)})`; c.lineWidth = 1.4; c.stroke();
  }
  /* calm ring when cancelling */
  if (A < 0.98) {
    const br = reduced ? 0 : Math.sin(t * 1.6) * 0.015;
    c.beginPath(); c.ellipse(cx, cy, R0 * 1.12 * (1 + br) * 1.18, R0 * 1.12 * (1 + br), 0, 0, Math.PI * 2);
    c.strokeStyle = `rgba(240,162,59,${((1 - A) * 0.9 * fade).toFixed(3)})`; c.lineWidth = 2; c.stroke();
    const g = c.createRadialGradient(cx, cy, R0 * 0.6, cx, cy, R0 * 1.5);
    g.addColorStop(0, quiet ? `rgba(240,162,59,${((1 - A) * 0.14 * fade).toFixed(3)})` : `rgba(255,255,255,${((1 - A) * 0.35 * fade).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0 * 1.5, 0, Math.PI * 2); c.fill();
  }
  /* colourway ripple */
  if (st.ripple > 0 && st.ripple < 1) {
    c.beginPath(); c.ellipse(cx, cy, R0 * (0.8 + st.ripple * 2.4) * 1.18, R0 * (0.8 + st.ripple * 2.4), 0, 0, Math.PI * 2);
    c.strokeStyle = st.rippleC; c.globalAlpha = (1 - st.ripple) * 0.8 * fade; c.lineWidth = 3 * (1 - st.ripple) + 1; c.stroke(); c.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------- desktop pinned DOM */
const heroUI = $$('.h-ui, .hnav'), giant = $('.giant'), tHead = $('.t-head'), cos = $$('.co'), linesSvg = $('.lines'), tp = $('.tp'), tProg = $('.t-prog');
const CO_POS = { band: { x: 0.64, y: 0.1 }, slider: { x: 0.79, y: 0.3 }, driver: { x: 0.7, y: 0.84 }, mics: { x: 0.05, y: 0.62 }, foam: { x: 0.24, y: 0.85 } };
cos.forEach((el) => { const q = CO_POS[el.dataset.k]; el.style.left = q.x * 100 + 'vw'; el.style.top = q.y * 100 + 'vh'; });
const RM = reduced;
const v3 = new THREE.Vector3();
const eo = (t) => 1 - Math.pow(1 - t, 3);
const ez = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let lastA = -1, lastShown = -1;
function dom(a, t) {
  if (RM) return;
  if (Math.abs(a - lastA) > 0.0005) {
    heroUI.forEach((el) => { el.style.opacity = clamp(1 - a * 1.8); el.style.visibility = a > 0.6 ? 'hidden' : ''; });
    giant.style.opacity = clamp(1 - a * 1.4); giant.style.transform = `translateY(-50%) scale(${1 + a * 0.35})`;
    tHead.style.opacity = clamp((a - 0.5) / 0.5); tHead.style.transform = `translateY(${(1 - eo(clamp((a - 0.4) / 0.6))) * 30}px)`;
    lastA = a;
  }
  let svg = '', shown = 0;
  const out = clamp((p - 0.82) / 0.06);
  cos.forEach((el, i) => {
    const c = clamp((p - 0.42 - i * 0.075) / 0.06) * (1 - out);
    if (c > 0.02) shown = i + 1;
    if (Math.abs(c - (el._c ?? -1)) > 0.001) { el.style.opacity = c; el.style.transform = `translateY(${(1 - eo(c)) * 14}px)`; el._c = c; }
    if (c <= 0.001) return;
    hp.anchors[el.dataset.k].getWorldPosition(v3); v3.project(cam);
    const ax = (v3.x * 0.5 + 0.5) * W, ay = (-v3.y * 0.5 + 0.5) * H;
    const r = el.getBoundingClientRect(), left = r.left + r.width / 2 > ax;
    const ex = left ? r.left : r.right, ey = r.top + r.height / 2, mx = ex + (left ? -40 : 40);
    const len = Math.hypot(mx - ax, ey - ay) + 40, dl = len * eo(c);
    const ph = (t * 0.8 + i * 0.27) % 1;
    svg += `<path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${mx.toFixed(1)},${ey.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${(len - dl).toFixed(1)}"/>`;
    svg += `<circle class="ring" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="${(7 + 7 * ph).toFixed(1)}" opacity="${(c * (1 - ph)).toFixed(2)}"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="${(4.5 * eo(c)).toFixed(1)}"/>`;
  });
  linesSvg.innerHTML = svg;
  if (shown !== lastShown) { tp.textContent = '0' + Math.max(1, shown); lastShown = shown; }
  tProg.style.setProperty('--tp', clamp((p - 0.4) / 0.42).toFixed(3));
}

/* ---------------------------------------------------------------- loop */
let running = true, last = performance.now(), tt = 0;
/* evidence hook: ?cam=x,y,z,tx,ty,tz,pitch,yaw,explode frames a fixed close-up (same on both builds) */
const CAMQ = (new URLSearchParams(location.search).get('cam') || '').split(',').filter(Boolean).map(Number);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!running) return;
  tt += dt;
  p = isM ? 0 : damp(p, pT, 6, dt);
  const a = ez(clamp(p / 0.2));
  const spin = ez(clamp((p - 0.02) / 0.3)) * Math.PI * 2;
  const ex = isM ? st.explode : ez(clamp((p - 0.32) / 0.14)) * (1 - ez(clamp((p - 0.84) / 0.12)));
  hp.explode(ex);
  if (!dragging) { dragYaw += dragVel * dt * 0.02; dragVel *= Math.pow(0.03, dt); if (now - lastDrag > 2200) dragYaw = damp(dragYaw, 0, 1.4, dt); }
  const idle = reduced ? 0 : Math.sin(tt * 1.2) * 0.04;
  const heroL = isM ? Math.min(VW * 0.3, VH * 0.17) : Math.min(VW * 0.15, VH * 0.19);
  const techL = isM ? heroL : Math.min(VW * 0.14, VH * 0.2);
  const L = lerp(heroL, techL, a) * (1 - st.intro * 0.2) * (1 - ex * (isM ? 0.22 : 0.12));
  rig.scale.setScalar(L);
  rig.position.set(lerp(0, VW * 0.07, a), (isM ? VH * 0.08 : lerp(0.01, -0.01, a) * VH) + idle * L + st.intro * -VH * 0.06, 0);
  const autoYaw = isM && !reduced ? Math.sin(tt * 0.35) * 0.35 : 0;
  spinG.rotation.set(lerp(0.12, 0.16, a) + ex * 0.1, -0.55 + spin + ex * 0.2 + dragYaw + autoYaw - st.intro * 1.6, lerp(0.04, 0, a));
  shMat.opacity = 0.8 * (1 - st.intro) * (1 - ex * 0.45);
  const qn = QS.n;
  scene.environmentIntensity = lerp(1, 0.38, qn); key.intensity = lerp(1.2, 0.45, qn); hemi.intensity = lerp(0.3, 0.1, qn);
  hp.sync();
  rim.color.copy(RIM_D).lerp(RIM_Q, qn); rim.intensity = lerp(0.9, 3.4, qn);
  hp.M.ring.emissive.setHex(0xF0A23B); hp.M.ring.emissiveIntensity = qn * (0.9 + (reduced ? 0 : 0.35 * Math.sin(tt * 1.6)));
  cs.update();
  if (CAMQ.length) { spinG.rotation.set(CAMQ[6] || 0, CAMQ[7] || 0, 0); rig.position.set(0, 0, 0); rig.scale.setScalar(1); hp.explode(CAMQ[8] || 0);
    cam.position.set(CAMQ[0], CAMQ[1], CAMQ[2]); cam.lookAt(CAMQ[3], CAMQ[4], CAMQ[5]); }
  renderer.render(scene, cam);
  /* wave field centred on the headphones */
  rig.getWorldPosition(v3); v3.project(cam);
  waves((v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * H, (isM ? 0.33 : 0.25) * Math.min(W, H * 1.1), clamp(1 - a * 2), tt);
  if (!isM) dom(a, tt);
}

/* ---------------------------------------------------------------- counters, battery, toast, links */
function counters() {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    const el = en.target, to = +el.dataset.to;
    if (reduced || !gsap) { el.textContent = to; return; }
    const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', delay: 0.15, onUpdate: () => (el.textContent = Math.round(o.v)) });
  }), { threshold: 0.6 });
  $$('.cnt').forEach((e) => { if (!reduced) e.textContent = '0'; io.observe(e); });
}
counters();
const bt = $('.bt-big');
function battery() {
  const r = bt.getBoundingClientRect(), k = reduced ? 1 : clamp((innerHeight - r.top) / (innerHeight * 0.9 + r.height * 0.3));
  bt.style.setProperty('--fill', (k * 100).toFixed(1) + '%');
}
if (lenis) lenis.on('scroll', battery); addEventListener('scroll', battery, { passive: true }); battery();
const notify = $('.notify'), toast = $('.toast');
notify && notify.addEventListener('click', () => { toast.textContent = 'Concept only: there is nothing to notify you about, and nothing was saved.'; toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 3200); });
let pinST = null;
function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id === '#') return; e.preventDefault();
  if (id === '#main') return scrollToY(0);
  if (id === '#inside') return pinST ? scrollToY(pinST.start + (pinST.end - pinST.start) * 0.62) : scrollToY(innerHeight);
  const t = $(id); if (t) scrollToY(t.getBoundingClientRect().top + scrollY);
}));
if (!isM && !coarse) {
  const c = $('.cursor'), lab = $('span', c); let mx = -99, my = -99, cx = -99, cy = -99;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; c.style.opacity = 1; });
  const tk = () => { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tk); }; tk();
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cur], .gl');
    if (!t || (t === canvas && p > 0.15)) return c.classList.remove('big');
    lab.textContent = t === canvas ? 'Drag' : t.dataset.cur; c.classList.add('big');
  });
  if (!reduced && gsap) $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
  });
}

/* ---------------------------------------------------------------- boot */
resize();
whenVisible(stage, (v) => { running = v; if (v) last = performance.now(); });
if (!isM && ST) {
  if (!reduced) pinST = ST.create({ trigger: stage, start: 'top top', end: '+=320%', pin: true, anticipatePin: 1, onUpdate: (s) => { pT = s.progress; } });
  else { document.body.classList.add('rm'); const tech = $('.tech'); if (tech) stage.after(tech); }
}
if (!reduced && gsap) gsap.to(st, { intro: 0, duration: 2, ease: 'expo.out', delay: 0.1 });
requestAnimationFrame(frame);
