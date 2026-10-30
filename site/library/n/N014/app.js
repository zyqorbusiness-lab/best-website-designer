/* N014 Glint Eyewear (best-4 build #4, Oct 31 2026): desktop index.html and phone m.html share this file.
   Beats: #hero chart wall (rows type in, the CC0 Round Spectacles drop 12 mm and settle; drag/swipe slides them with
   inertia and the lenses really refract the chart, lens control -3..+3) -> #frames + #finishes (one sticky studio
   canvas: 3/4 turn, the frame comes apart into its real pieces with four measured leader labels, then it rests on the
   CC0 Vintage Wooden Drawer and steps through four finishes) -> #exam ("1 or 2" with two CC0 Magnifying Glass 01
   lenses over one chart row, a demo) -> #fit (SVG drawn from the model's own measurements) -> #book (Concept: not sent).
   One rAF scroll engine (getBoundingClientRect progress, lerp 0.12), no scroll library. Same files on phone and desktop. */
import { createStage, THREE, isM, reduced, damp, clamp, smoothstep, lerp } from '../../_kit/stage.js';
import { makeChart } from './chart.js';
import { lensMaterial, splitSpectacles, lensCentres } from './lens.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
if (reduced) html.classList.add('rm');
const live = (t) => { const l = $('#live'); if (l) l.textContent = t; };
const ease = (t) => 1 - Math.pow(1 - t, 4);               /* expo-ish out */
const eio = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2); /* in-out-quart */

/* ---------- reveals, press, nav ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('[data-rv]').forEach((el, i) => { el.style.transitionDelay = ((+el.dataset.rv || 0) * 60) + 'ms'; io.observe(el); });
const menu = $('#nav-menu'), sheet = $('#nav-sheet');
if (menu && sheet) {
  const set = (o) => { menu.setAttribute('aria-expanded', String(o)); sheet.hidden = !o; menu.textContent = o ? 'Close' : 'Menu'; };
  menu.addEventListener('click', () => set(sheet.hidden));
  $$('a', sheet).forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { set(false); menu.focus(); } });
}

/* ---------- shared loads ---------- */
const MODEL = (s) => new URL('../../_assets/models/' + s, import.meta.url).href;
let specsGltf = null; let specsReady; const specsP = new Promise((r) => { specsReady = r; });

/* ================= HERO ================= */
const RX = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3];
let rxI = 9;                                    /* +1.50 to start: the bend reads at once */
const rxV = $('#rx-v'), rxSay = $('#rx-say');
const fmt = (d) => (d > 0 ? '+' : d < 0 ? '\u2212' : '') + Math.abs(d).toFixed(2);
const say = (d) => d === 0 ? 'Plain glass: the letters stay the same size.' : d > 0 ? 'Reading lens: the letters look larger.' : 'Distance lens: the letters look smaller.';
let dTarget = RX[rxI], dShown = dTarget, dFrom = dTarget, dT0 = 0;
function setRx(i, announce = true) {
  rxI = clamp(i, 0, RX.length - 1); dFrom = dShown; dTarget = RX[rxI]; dT0 = performance.now();
  rxV.textContent = fmt(dTarget); rxSay.textContent = say(dTarget);
  $('#rx-minus').disabled = rxI === 0; $('#rx-plus').disabled = rxI === RX.length - 1;
  if (announce) live('Lens ' + fmt(dTarget) + '. ' + say(dTarget));
  hero && hero.invalidate();
}
$('#rx-minus').addEventListener('click', () => setRx(rxI - 1));
$('#rx-plus').addEventListener('click', () => setRx(rxI + 1));
const rng = $('#rx-range'); if (rng) { rng.addEventListener('input', () => setRx(+rng.value)); }

const heroEl = $('#hero-stage');
const CH = { z: -0.6, y: isM ? -0.005 : 0.0, w: 0.96, h: 0.6 };
const heroState = { x: 0, v: 0, drag: false, px: 0, drop: 0, intro: 0 };
let hero = null;
(async () => {
hero = await createStage({
  el: heroEl, exposure: 1.0, envIntensity: 1.0, lazy: false, fitFov: true,
  camera: { fov: 26, position: [0, 0, isM ? 0.66 : 0.6], target: [0, 0, 0], near: 0.02, far: 10 },
  label: 'Glint Eyewear: round wire spectacles in front of an eye chart. The lenses bend the letters behind them. Drag sideways or use the arrow keys to slide them.'
});
if (!hero.failed) {
  await Promise.race([document.fonts.load('800 100px Archivo'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
  const chart = makeChart();
  chart.draw(reduced ? chart.rows : 0);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(CH.w, CH.h), new THREE.MeshBasicMaterial({ map: chart.texture, toneMapped: false }));
  wall.position.set(0, CH.y, CH.z); hero.add(wall);
  const g = await hero.load(MODEL('round_spectacles.glb'));
  specsGltf = g; specsReady(g);
  const S = splitSpectacles(g.scene);
  const lm = lensMaterial({ map: chart.texture, plane: { x: 0, y: CH.y, z: CH.z }, size: { x: CH.w, y: CH.h }, tintAmt: 0.02, env: 0.25 });
  lm.userData.u.uBend.value = 0.06;
  S.lensMeshes.forEach((m) => { m.material = lm; });
  /* the scan's wire is dark gunmetal; Glint shows it as warm gold wire (scanned normal + roughness maps kept) */
  const src0 = S.frameMeshes[0] && S.frameMeshes[0].material;
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xC9A36A, metalness: 0.55, roughness: 0.34, clearcoat: 0.4, normalMap: src0 && src0.normalMap || null, roughnessMap: src0 && src0.roughnessMap || null });
  S.frameMeshes.forEach((m) => { if (!/glass/i.test(m.material.name)) m.material = gold; });
  const holder = new THREE.Group(), tip = new THREE.Group(); tip.add(S.root); holder.add(tip); hero.add(holder);
  S.root.position.z = -0.03;                  /* lens plane sits on z = 0.04 */
  holder.rotation.y = -0.1; holder.rotation.x = 0.04;
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-0.6, 1.2, 1.4); hero.scene.add(key);
  /* the wall gets a soft contact shadow under the glasses (a blurred disc, own canvas) */
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sg = sc.getContext('2d');
  for (let r = 64; r > 0; r -= 2) { sg.fillStyle = `rgba(59,42,30,${(0.01 * (1 - r / 64)).toFixed(4)})`; sg.beginPath(); sg.ellipse(64, 64, r, r * 0.42, 0, 0, 7); sg.fill(); }
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.14), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, toneMapped: false }));
  sh.position.set(0, CH.y - 0.09, CH.z + 0.001); hero.add(sh);
  const WALL = isM ? 0.085 : 0.12;           /* soft walls: the lenses stay over the chart */
  const toM = () => { const d = hero.camera.position.z; const vh = 2 * d * Math.tan(THREE.MathUtils.degToRad(hero.camera.fov / 2)); return vh / heroEl.clientHeight; };
  heroEl.style.touchAction = 'pan-y';
  heroEl.addEventListener('pointerdown', (e) => { heroState.drag = true; heroState.px = e.clientX; heroState.v = 0; heroEl.setPointerCapture(e.pointerId); heroEl.classList.add('has-moved'); hero.invalidate(); });
  heroEl.addEventListener('pointermove', (e) => { if (!heroState.drag) return; const dx = (e.clientX - heroState.px) * toM(); heroState.px = e.clientX; heroState.x += dx; heroState.v = dx * 60; hero.invalidate(); });
  const end = () => { heroState.drag = false; };
  heroEl.addEventListener('pointerup', end); heroEl.addEventListener('pointercancel', end);
  const cv = hero.renderer.domElement; cv.tabIndex = 0;
  cv.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); heroState.v += (e.key === 'ArrowLeft' ? -1 : 1) * (reduced ? 0 : 0.35); if (reduced) heroState.x += e.key === 'ArrowLeft' ? -0.02 : 0.02; heroEl.classList.add('has-moved'); hero.invalidate(); }
    if (e.key === '+' || e.key === '=') setRx(rxI + 1); if (e.key === '-') setRx(rxI - 1);
  });
  /* intro: rows type in top to bottom, 40 ms per row, then the frames drop 12 mm and settle */
  const t0 = performance.now();
  heroState.drop = reduced ? 0 : 0.012;
  const cL = new THREE.Vector3(), cR = new THREE.Vector3();
  hero.onFrame((dt, t) => {
    const now = performance.now();
    if (!reduced && heroState.intro < chart.rows) { const n = Math.min(chart.rows, Math.floor((now - t0) / 40) + 1); if (n !== heroState.intro) { heroState.intro = n; chart.draw(n); } }
    const settled = heroState.intro >= chart.rows || reduced;
    /* inertia: friction .9 per 60 Hz frame, soft walls */
    if (!heroState.drag) {
      heroState.x += heroState.v * dt; heroState.v *= Math.pow(0.9, dt * 60);
      if (heroState.x > WALL) { heroState.v -= (heroState.x - WALL) * 60 * dt; heroState.x = lerp(heroState.x, WALL, 1 - Math.pow(0.001, dt)); }
      if (heroState.x < -WALL) { heroState.v -= (heroState.x + WALL) * 60 * dt; heroState.x = lerp(heroState.x, -WALL, 1 - Math.pow(0.001, dt)); }
    } else heroState.x = clamp(heroState.x, -WALL * 1.25, WALL * 1.25);
    holder.position.x = damp(holder.position.x, heroState.x, 18, dt);
    if (settled) heroState.drop = damp(heroState.drop, 0, 9, dt);
    holder.position.y = heroState.drop + (reduced ? 0 : Math.sin(t * 0.9) * 0.0012);
    tip.rotation.z = damp(tip.rotation.z, clamp(-heroState.v * 0.35, -0.1, 0.1), 8, dt);
    sh.position.x = holder.position.x * 0.55;
    /* dioptre eases over 420 ms */
    const k = clamp((now - dT0) / 420); dShown = lerp(dFrom, dTarget, ease(k));
    lm.userData.u.uMag.value = 1 + 0.11 * dShown;
    holder.updateMatrixWorld(true);
    const [a, b] = lensCentres(S.parts); cL.copy(a); cR.copy(b);
    lm.userData.u.uC0.value.copy(cL); lm.userData.u.uC1.value.copy(cR);
    return heroState.drag || Math.abs(heroState.v) > 1e-4 || Math.abs(holder.position.x - heroState.x) > 1e-5 || k < 1 || !settled || heroState.drop > 1e-5 || !reduced;
  });
  window.__glint = Object.assign(window.__glint || {}, { mm: S.mm, hero: { stage: hero, state: heroState } });
  fillFit(S.mm);
  hero.loaded && hero.loaded();
} else specsReady(null);
})();
setRx(rxI, false);

/* ================= STUDIO: #frames + #finishes (one sticky canvas) ================= */
const FIN = [
  { k: 'tortoise', name: 'Tortoise', say: 'Warm brown acetate with amber flecks. The classic.', band: '#D9DDDE' },
  { k: 'cobalt', name: 'Cobalt', say: 'Deep blue enamel over thin metal. Quietly loud.', band: '#D4DEED' },
  { k: 'mist', name: 'Clear mist', say: 'See-through and light, it goes with everything.', band: '#E2EAEE' },
  { k: 'gold', name: 'Gold wire', say: 'Thin gold metal, the round wire frame from the top of the page.', band: '#DCDFDF' }
];
const studio = $('#studio'), stEl = $('#st-stage'), secF = $('#frames'), secN = $('#finishes');
const labels = $$('.lab', studio), dots = $$('.dot', studio), lead = $('#st-lines');
let finI = 0, finPicked = -1, pF = 0, pN = 0, sF = 0, sN = 0;
const chips = $$('.fin-chip');
function showFinish(i, from = 'scroll') {
  if (i === finI && from === 'scroll') return; finI = i; const f = FIN[i];
  html.dataset.finish = f.k; $('#fin-name').textContent = f.name; $('#fin-say').textContent = f.say;
  $('#fin-name').classList.remove('pop'); void $('#fin-name').offsetWidth; $('#fin-name').classList.add('pop');
  chips.forEach((c, j) => c.setAttribute('aria-pressed', String(j === i)));
  $('#fin-step').textContent = (i + 1) + ' / 4';
  if (from !== 'scroll') live('Finish: ' + f.name);
  studioApi && studioApi.finish(i);
}
chips.forEach((c, j) => c.addEventListener('click', () => { finPicked = j; showFinish(j, 'chip'); }));
let studioApi = null;
(async () => {
  const st = await createStage({
    el: stEl, exposure: 1.0, envIntensity: 1.0, fitFov: true,
    camera: { fov: 30, position: [0, 0.02, 0.42], target: [0, 0, 0], near: 0.02, far: 20 },
    label: 'The Glint round frame in 3D: it turns, comes apart into lenses, front, temples and nose pads, then rests on a wooden drawer in four finishes.'
  });
  if (st.failed) return;
  const g = await specsP; if (!g) return;
  const S = splitSpectacles(g.scene);
  /* each finish is one physical material on the frame pieces (lenses keep their clear glass look) */
  const tort = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#4A2F1C'; x.fillRect(0, 0, 512, 256); let s = 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) { const tone = r(); x.fillStyle = tone > 0.72 ? 'rgba(196,132,62,.55)' : tone > 0.4 ? 'rgba(122,74,38,.5)' : 'rgba(44,27,17,.55)'; x.beginPath(); x.ellipse(r() * 512, r() * 256, 4 + r() * 26, 2 + r() * 10, r() * 3, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
  })();
  const orig = S.frameMeshes[0].material;
  const fm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 1 });
  const P = {
    tortoise: { color: new THREE.Color('#ffffff'), metal: 0.0, rough: 0.28, op: 1, map: tort },
    cobalt: { color: new THREE.Color('#2F58DE'), metal: 0.4, rough: 0.3, op: 1, map: null },
    mist: { color: new THREE.Color('#E2EAEE'), metal: 0.0, rough: 0.08, op: 0.5, map: null },
    gold: { color: new THREE.Color('#C9A36A'), metal: 0.55, rough: 0.34, op: 1, map: null, rmap: orig.roughnessMap || null, mmap: null, nmap: orig.normalMap || null }
  };
  S.frameMeshes.forEach((m) => { if (!/glass/i.test(m.material.name)) m.material = fm; });
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.07, envMapIntensity: 1.6, clearcoat: 1 });
  S.lensMeshes.forEach((m) => { m.material = glassM; });
  let fx = { from: P.tortoise, to: P.tortoise, t0: 0 };
  const applyF = (a, b, k) => {
    fm.color.copy(a.color).lerp(b.color, k); fm.metalness = lerp(a.metal, b.metal, k); fm.roughness = lerp(a.rough, b.rough, k); fm.opacity = lerp(a.op, b.op, k);
    const src = k < 0.5 ? a : b; if (fm.map !== src.map) { fm.map = src.map; fm.roughnessMap = src.rmap || null; fm.metalnessMap = src.mmap || null; fm.normalMap = src.nmap || null; fm.needsUpdate = true; }
    fm.depthWrite = fm.opacity > 0.9;
  };
  applyF(P.tortoise, P.tortoise, 1);
  const spin = new THREE.Group(); spin.add(S.root); const lift = new THREE.Group(); lift.add(spin); st.add(lift);
  S.root.position.z = -0.0; spin.position.set(0, 0, 0);
  /* centre the frame on its own box */
  { const b = new THREE.Box3().setFromObject(S.root); const c = b.getCenter(new THREE.Vector3()); S.root.position.sub(c); }
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-0.5, 1.2, 0.9); st.scene.add(key);
  st.scene.add(new THREE.HemisphereLight(0xE2EAEE, 0x3B2A1E, 0.9));
  /* the drawer: CC0 Vintage Wooden Drawer 01; the frame rests on its top in #finishes */
  const dg = await st.load(MODEL('vintage_wooden_drawer_01.glb'));
  const drawer = dg.scene; drawer.scale.setScalar(0.34); drawer.updateMatrixWorld(true);
  const db = new THREE.Box3().setFromObject(drawer);
  const TOP = -0.026;
  const dBase = new THREE.Vector3(0.108 - db.max.x, TOP - db.max.y, 0.1 - db.max.z);   /* right edge just past the right temple */
  drawer.position.copy(dBase); drawer.visible = false;
  st.add(drawer);
  let slide = null; drawer.traverse((o) => { if (/drawer02/.test(o.name)) slide = o; });
  const slide0 = slide ? slide.position.z : 0;
  const restY = TOP + 0.0232;                   /* bottom of the rims on the drawer top */
  /* explode axes (mm -> m), up to 14 mm along each part's own axis */
  const AX = { lensL: [0, 0, 1], lensR: [0, 0, 1], templeL: [-0.75, 0, -0.66], templeR: [0.75, 0, -0.66], padL: [-0.2, -0.85, 0.5], padR: [0.2, -0.85, 0.5], front: [0, 0.35, 0] };
  const MAXX = 0.014;
  const cam = st.camera, v = new THREE.Vector3(), tgt = new THREE.Vector3();
  const A = S.anchors; const anchorParts = [['lens', 'lensL'], ['front', 'front'], ['temple', 'templeR'], ['pad', 'padR']];
  let lastW = 0, lastH = 0;
  function place(explode, labelsK) {
    /* leader labels (desktop) / numbered dots (phone): project each part's anchor */
    const W = stEl.clientWidth, H = stEl.clientHeight; const svg = lead;
    if (svg && (W !== lastW || H !== lastH)) { svg.setAttribute('viewBox', `0 0 ${W} ${H}`); lastW = W; lastH = H; }
    anchorParts.forEach(([a, p], i) => {
      const part = S.parts[p]; if (!part) return;
      v.copy(A[a]); part.localToWorld(v); v.project(cam);
      const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
      const on = labelsK[i];
      if (isM) { const d = dots[i]; if (d) { d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; d.classList.toggle('on', on > 0.5); } }
      else {
        const lab = labels[i], line = svg.children[i]; if (!lab || !line) return;
        const left = i < 2; const lw = lab.offsetWidth || 240, lh = lab.offsetHeight || 60;
        const lx = left ? W * 0.06 : W * 0.94 - lw; const ly = H * (i % 2 ? 0.6 : 0.26) - lh / 2;
        lab.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
        const ex = left ? lx + lw + 10 : lx - 10, ey = ly + lh / 2;
        line.setAttribute('x1', ex.toFixed(1)); line.setAttribute('y1', ey.toFixed(1)); line.setAttribute('x2', x.toFixed(1)); line.setAttribute('y2', y.toFixed(1));
        const len = Math.hypot(x - ex, y - ey); line.style.strokeDasharray = len.toFixed(1); line.style.strokeDashoffset = (len * (1 - on)).toFixed(1);
        lab.classList.toggle('on', on > 0.98); lab.style.opacity = on.toFixed(3);
      }
    });
  }
  let fs = 0;
  st.onFrame((dt, t) => {
    const now = performance.now();
    /* frames: 0-.25 turn to 3/4, .25-.70 parts separate (labels at .35/.45/.55/.65), .70-.90 return, .90-1 hold */
    const p = reduced ? (sN > 0.001 ? 1 : 0.6) : sF;
    const turn = eio(clamp(p / 0.25));
    const ex = reduced ? (sN > 0.001 ? 0 : 1) : eio(clamp((p - 0.25) / 0.2)) * (1 - eio(clamp((p - 0.7) / 0.2)));
    const lk = [0.35, 0.45, 0.55, 0.65].map((a) => reduced ? (sN > 0.001 ? 0 : 1) : clamp((p - a) / 0.06) * (1 - clamp((p - 0.72) / 0.08)));
    /* finishes: frame lowers onto the drawer, camera pulls back and looks down */
    const n = reduced ? (sN > 0.001 ? 1 : 0) : eio(clamp(sN * 3.2 + (sF > 0.92 ? (sF - 0.92) * 0 : 0)));
    for (const k in AX) { const part = S.parts[k]; if (!part) continue; const a = AX[k]; part.position.set(a[0] * ex * MAXX, a[1] * ex * MAXX, a[2] * ex * MAXX); }
    spin.rotation.y = lerp(0, -0.72, turn) + lerp(0, 0.18, n) + (reduced ? 0 : Math.sin(t * 0.5) * 0.02 * (1 - n));
    spin.rotation.x = lerp(0, 0.18, turn) * (1 - n);
    lift.position.y = lerp(0, restY, n); lift.position.x = lerp(isM ? -0.022 : 0.006, 0, n) * turn;
    cam.position.set(lerp(0.0, -0.05, n), lerp(0.02, restY + (isM ? 0.07 : 0.085), n), lerp(isM ? 0.52 : 0.37, isM ? 0.44 : 0.5, n));
    tgt.set(lerp(0, 0.004, n), lerp(0, restY - 0.006, n), 0); cam.lookAt(tgt);
    /* desktop finishes: subject sits in the left 7/12 (view offset), phone stays centred */
    const W = st.size.w, H = st.size.h;
    if (!isM) { const off = lerp(0, W * 0.2, n); cam.setViewOffset(W, H, off, 0, W, H); } else cam.clearViewOffset();
    drawer.visible = n > 0.002; drawer.position.y = dBase.y - (1 - n) * 0.22;
    if (slide) slide.position.z = slide0 + 0.12 * n;
    const fk = clamp((now - fx.t0) / 300); applyF(fx.from, fx.to, eio(fk));
    place(ex, lk);
    studio.classList.toggle('lab-on', lk[0] > 0.02);
    const busy = Math.abs(sF - pF) > 1e-4 || Math.abs(sN - pN) > 1e-4 || fk < 1;
    return busy || !reduced;
  });
  studioApi = { stage: st, finish: (i) => { const to = P[FIN[i].k]; fx = { from: { color: fm.color.clone(), metal: fm.metalness, rough: fm.roughness, op: fm.opacity, map: fm.map, rmap: fm.roughnessMap, mmap: fm.metalnessMap, nmap: fm.normalMap }, to, t0: performance.now() }; st.invalidate(); } };
  window.__glint = Object.assign(window.__glint || {}, { studio: st });
  studioApi.finish(finI);
  st.loaded();
})();

/* one scroll engine: pinned progress from getBoundingClientRect, lerped 0.12 per frame */
function prog(el) { const r = el.getBoundingClientRect(); const span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span) : (r.top < 0 ? 1 : 0); }
function loop() {
  pF = prog(secF); pN = prog(secN);
  if (reduced) { sF = pF; sN = pN; } else { sF = lerp(sF, pF, 0.12); sN = lerp(sN, pN, 0.12); if (Math.abs(sF - pF) < 1e-4) sF = pF; if (Math.abs(sN - pN) < 1e-4) sN = pN; }
  const inN = pN > 0.001 || secN.getBoundingClientRect().top < innerHeight * 0.35;
  html.classList.toggle('in-fin', inN);
  html.classList.toggle('fr-done', sF > 0.9 && !inN);
  if (finPicked < 0 || !inN) { const i = clamp(Math.floor(sN * 4), 0, 3); if (inN && finPicked < 0) showFinish(i); }
  if (studioApi && (Math.abs(sF - pF) > 1e-5 || Math.abs(sN - pN) > 1e-5)) studioApi.stage.invalidate();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
addEventListener('scroll', () => { if (finPicked >= 0 && Math.abs(pN - prog(secN)) > 0.2) finPicked = -1; }, { passive: true });

/* ================= EXAM: "which is clearer, 1 or 2?" (a demo, not a vision test) ================= */
const PAIRS = [[{ m: 1.22, b: 0 }, { m: 1.22, b: 16 }], [{ m: 1.3, b: 7 }, { m: 1.3, b: 0 }], [{ m: 1.18, b: 0 }, { m: 1.18, b: 3 }]];
let pairI = 0, picks = [];
const exEl = $('#ex-stage'); let exApi = null;
(async () => {
  const st = await createStage({ el: exEl, exposure: 1.0, envIntensity: 1.0, camera: { fov: 30, position: [0, 0, 0.55], target: [0, 0, 0], near: 0.02, far: 10 },
    label: 'Two magnifying glasses over the same row of chart letters. Choose the one that looks clearer.' });
  if (st.failed) return;
  const row = makeChart({ w: 2048, h: 1024, rows: ['PECFD', 'EDFCZPT'], first: 0.3, gapK: 0.5, top: 0.12, labels: false });
  const RW = 0.62, RH = 0.31, RZ = -0.22;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), new THREE.MeshBasicMaterial({ map: row.texture, toneMapped: false })); wall.position.z = RZ; st.add(wall);
  const g = await st.load(MODEL('magnifying_glass_01.glb'));
  const mats = [];
  /* the scan's ring + handle are near-black plastic; Glint shows them in warm tortoise brown, keeping the scanned normal and roughness maps */
  let hm = null; const handleM = (src) => hm || (hm = new THREE.MeshStandardMaterial({ color: 0x6B4A2E, roughness: 0.42, metalness: 0.15, normalMap: src.normalMap || null, roughnessMap: src.roughnessMap || null }));
  const glasses = [-1, 1].map((sx, i) => {
    const s = g.scene.clone(true); const grp = new THREE.Group(); grp.add(s);
    const m = lensMaterial({ map: row.texture, plane: { x: 0, y: 0, z: RZ }, size: { x: RW, y: RH }, tintAmt: 0.03 }); m.userData.u.uBend.value = 0.15; mats.push(m);
    let lensBox = new THREE.Box3();
    s.updateMatrixWorld(true);
    s.traverse((o) => { if (!o.isMesh) return; if (/lense$/i.test(o.material.name)) { o.material = m; lensBox.expandByObject(o); } else { o.material = handleM(o.material); } });
    const c = lensBox.getCenter(new THREE.Vector3()); s.position.sub(c);   /* lens centre at the group origin */
    grp.position.set(sx * 0.082, 0.02, 0); grp.rotation.y = sx * -0.06; st.add(grp);
    return grp;
  });
  const ek = new THREE.DirectionalLight(0xffffff, 1.6); ek.position.set(-0.4, 0.8, 1.2); st.scene.add(ek); st.scene.add(new THREE.HemisphereLight(0xE2EAEE, 0x3B2A1E, 0.8));
  const fit = () => { const a = st.size.w / st.size.h; const need = 0.36 / a; st.camera.position.z = Math.max(0.42, need / (2 * Math.tan(THREE.MathUtils.degToRad(15)))); st.camera.updateProjectionMatrix(); st.invalidate(); };
  st.onFrame(Object.assign((dt, t) => {
    glasses.forEach((gr, i) => { gr.updateMatrixWorld(true); const c = new THREE.Vector3().setFromMatrixPosition(gr.matrixWorld); mats[i].userData.u.uC0.value.copy(c); if (!reduced) gr.rotation.z = Math.sin(t * 0.7 + i * 2) * 0.012; });
    return !reduced;
  }, { resize: fit }));
  fit();
  exApi = { set: (pair) => { pair.forEach((q, i) => { mats[i].userData.u.uMag.value = q.m; mats[i].userData.u.uBlur.value = q.b; }); st.invalidate(); } };
  exApi.set(PAIRS[0]); st.loaded();
  window.__glint = Object.assign(window.__glint || {}, { exam: st });
})();
const exStep = $('#ex-step'), exQ = $('#ex-q'), exDone = $('#ex-done'), exBtns = $('#ex-btns');
function pick(n) {
  picks.push(n); pairI++;
  if (pairI >= PAIRS.length) {
    exQ.hidden = true; exBtns.hidden = true; exDone.hidden = false; exStep.textContent = 'Done';
    $('#ex-sum').textContent = 'You picked ' + picks.join(', then ') + '. In a real exam those answers would steer the lenses. Here they steer nothing.';
    exDone.focus({ preventScroll: true }); live('Demo finished. Real answers come from a real exam.');
    return;
  }
  exStep.textContent = 'Pair ' + (pairI + 1) + ' of 3';
  exApi && exApi.set(PAIRS[pairI]);
  live('Pair ' + (pairI + 1) + ' of 3. Which is clearer, 1 or 2?');
}
$$('[data-pick]').forEach((b) => b.addEventListener('click', () => pick(+b.dataset.pick)));
$('#ex-again').addEventListener('click', () => { pairI = 0; picks = []; exQ.hidden = false; exBtns.hidden = false; exDone.hidden = true; exStep.textContent = 'Pair 1 of 3'; exApi && exApi.set(PAIRS[0]); $('[data-pick="1"]').focus(); });

/* ================= FIT: drawn from the model's own measurements ================= */
function fillFit(mm) {
  if (!mm || !mm.lensWidth) return;
  const set = (k, v) => $$(`[data-mm="${k}"]`).forEach((el) => { el.dataset.to = v; if (reduced || el.dataset.done) el.textContent = v; });
  set('lens', mm.lensWidth); set('bridge', mm.bridge); set('temple', mm.temple);
  drawFit(mm);
}
function drawFit(mm) {
  const L = mm.lensWidth, B = mm.bridge, T = mm.temple, H = mm.lensHeight || L;
  const f = $('#fit-front'), s = $('#fit-side'); if (!f || !s) return;
  /* front: two round rims + bridge arc, dimension lines for lens width and bridge (1 unit = 1 mm) */
  const W = 2 * L + B, x0 = 10, cy = 34 + H / 2;
  const r = L / 2;
  f.setAttribute('viewBox', `0 0 ${W + 20} ${H + 70}`);
  f.innerHTML = `<g class="fr"><circle cx="${x0 + r}" cy="${cy}" r="${r - 0.6}"/><circle cx="${x0 + L + B + r}" cy="${cy}" r="${r - 0.6}"/><path d="M${x0 + L - 0.8} ${cy - 3} Q ${x0 + L + B / 2} ${cy - 11} ${x0 + L + B + 0.8} ${cy - 3}"/></g>
  <g class="dim"><path class="dl" pathLength="1" d="M${x0} 16 H${x0 + L}"/><path class="dl" pathLength="1" d="M${x0} 11 V21 M${x0 + L} 11 V21"/><text x="${x0 + r}" y="10">LENS <tspan data-mm="lens">${L}</tspan></text>
  <path class="dl" pathLength="1" d="M${x0 + L} ${H + 50} H${x0 + L + B}"/><path class="dl" pathLength="1" d="M${x0 + L} ${H + 45} V${H + 55} M${x0 + L + B} ${H + 45} V${H + 55}"/><text x="${x0 + L + B / 2}" y="${H + 66}">BRIDGE <tspan data-mm="bridge">${B}</tspan></text></g>`;
  s.setAttribute('viewBox', `0 0 ${T + 30} 70`);
  s.innerHTML = `<g class="fr"><path d="M12 30 V${30 - 2} L14 26 H${T - 6} Q ${T + 4} 26 ${T + 8} 40"/><rect x="8" y="16" width="5" height="26" rx="2"/></g>
  <g class="dim"><path class="dl" pathLength="1" d="M12 54 H${T + 8}"/><path class="dl" pathLength="1" d="M12 49 V59 M${T + 8} 49 V59"/><text x="${(T + 20) / 2}" y="68">TEMPLE <tspan data-mm="temple">${T}</tspan></text></g>`;
}
drawFit({ lensWidth: 43, bridge: 23, temple: 146, lensHeight: 43 });
const fitIo = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; fitIo.disconnect();
  const fig = $('#fit-figs'); fig.classList.add('draw');
  $$('[data-mm]').forEach((el, i) => {
    const to = +(el.dataset.to || el.textContent); if (reduced) { el.textContent = to; el.dataset.done = 1; return; }
    const t0 = performance.now() + i * 120; const tick = (now) => { const k = clamp((now - t0) / 600); el.textContent = Math.round(to * ease(k)); if (k < 1) requestAnimationFrame(tick); else el.dataset.done = 1; }; requestAnimationFrame(tick);
  });
}), { threshold: 0.35 });
fitIo.observe($('#fit-figs'));

/* ================= BOOK (Concept: not sent) ================= */
const form = $('#bk-form'), done = $('#bk-done');
let day = '';
$$('.day').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; day = b.dataset.day; $$('.day').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); err('day', ''); }));
function err(k, msg) { const e = $('#e-' + k); if (!e) return; e.textContent = msg; e.hidden = !msg; const f = $('#f-' + k); if (f) f.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#f-name').value.trim(), reach = $('#f-reach').value.trim(), time = $('#f-time').value, type = (form.querySelector('[name=type]:checked') || {}).value;
  let ok = true;
  if (!day) { err('day', 'Pick a day (Sunday is closed).'); ok = false; } else err('day', '');
  if (!time) { err('time', 'Pick a time.'); ok = false; } else err('time', '');
  if (name.length < 2) { err('name', 'Add your name.'); ok = false; } else err('name', '');
  if (!/^\S+@\S+\.\S+$/.test(reach) && reach.replace(/\D/g, '').length < 7) { err('reach', 'Add a phone number or an email.'); ok = false; } else err('reach', '');
  if (!ok) { const first = form.querySelector('[aria-invalid=true]') || form.querySelector('.err:not([hidden])'); if (first) (first.focus ? first : form).focus(); live('Some fields need a look.'); return; }
  const go = $('#bk-go'); go.disabled = true; go.textContent = 'Checking';
  setTimeout(() => {
    go.disabled = false; go.textContent = 'Request my exam';
    form.hidden = true; done.hidden = false;
    $('#bk-sum').textContent = `${type} on ${day} around ${time}, for ${name}.`;
    done.focus({ preventScroll: false }); live('Concept: not sent. Your request stayed on this page.');
  }, reduced ? 0 : 520);
});
$('#bk-again').addEventListener('click', () => { done.hidden = true; form.hidden = false; $('#f-name').focus(); });
