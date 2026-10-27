/* TALUS Ridge C1 - desktop app (three r170). Real model: "Carbon Frame Bike" (CC BY-SA 4.0), see credits. */
import { THREE, reduced, Q, makeRenderer, studioEnv, reveals, smooth, clamp, lerp, damp } from '../_kit/kit.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { useHDRI } from '../../assets/hdri/hdri.js';
import { enhance, frameMaterial, anodised, addDecals } from './detail.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const BK = new URLSearchParams(location.search);
const BAKE = BK.has('bake');
const WAYS = {
  glacier: { c: '#8FB3C7', rim: '#B4552E', name: 'Glacier', sub: 'Cold blue-grey under four coats of clear. Looks wet at the trailhead, looks wet after it.' },
  oxide:   { c: '#A4472A', rim: '#C9D3D6', name: 'Oxide', sub: 'The colour of the rock the bike was named after. Iron in the pigment, warm in low sun.' },
  chalk:   { c: '#E4DCCB', rim: '#7FA3B8', name: 'Chalk', sub: 'Matte-feeling satin over bone white. Shows the dust, wears it well.' },
};
const ORDER = ['glacier', 'oxide', 'chalk'];

/* ---------- renderer + scene ---------- */
const canvas = $('#gl');
const renderer = makeRenderer(canvas, { exposure: 1.0 });
renderer.setSize(innerWidth, innerHeight, false);
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer);
scene.environmentIntensity = 1.0;
const camera = new THREE.PerspectiveCamera(26, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0.9, 7);
const key = new THREE.DirectionalLight(0xfff4e6, 1.2); key.position.set(3, 5, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0xff9a5a, 0); rim.position.set(-4, 2.2, -3); scene.add(rim);
const fill = new THREE.HemisphereLight(0xdfe8ec, 0x3d2219, 0.25); scene.add(fill);

const stage = new THREE.Group(); scene.add(stage);      // positioned per section
const spin = new THREE.Group(); stage.add(spin);        // drag + idle rotation

/* soft contact shadow (blurred radial gradient) */
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(40,22,16,.55)'); gr.addColorStop(.45, 'rgba(40,22,16,.22)'); gr.addColorStop(1, 'rgba(40,22,16,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.9 }));
shadow.rotation.x = -Math.PI / 2; shadow.scale.set(3.4, 1.1, 1); shadow.position.y = 0.002; shadow.renderOrder = -1;
spin.add(shadow);

/* ---------- model ---------- */
let model, mixer, action, tMax = 6, frame = null, gun = null, accent = null, ready = false;
const setAnim = (t) => { if (!action) return; action.time = t; mixer.update(0); };
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const bar = $('#load .load-bar i');
function load() {
  loader.load('../../assets/lab/cadence/talus-d.glb', (g) => {
    model = g.scene;
    // normalise: wheelbase-length 2.6 units, sit on the floor, centred
    const b = new THREE.Box3().setFromObject(model), s = b.getSize(new THREE.Vector3());
    const k = 2.6 / s.x; model.scale.setScalar(k);
    const b2 = new THREE.Box3().setFromObject(model), c = b2.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -b2.min.y, -c.z);
    enhance(model);   // shared surface detail (same on the phone build)
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      const m = o.material; if (!m) return;
      if (m.name === 'Carbon') {
        // the carbon frame takes the colourway: painted carbon, weave still faintly under an orange-peel clear coat
        if (!frame) frame = frameMaterial(m.normalMap, WAYS.glacier.c);
        o.material = frame;
      } else if (m.name === 'Rahmen') {
        if (!gun) gun = new THREE.MeshPhysicalMaterial({ color: 0x2a2826, metalness: 0.85, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2 });
        o.material = gun;
      } else if (m.name === 'FelgeInnen' || m.name === 'GriffSeiten') {
        // anodised accents (inner rim, grip collars) follow the colourway's accent
        if (!accent) accent = anodised(WAYS.glacier.rim);
        o.material = accent;
      }
    });
    spin.add(model);
    if (g.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(g.animations[0]); action.setLoop(THREE.LoopRepeat); action.play();
      tMax = findExplodeTime(g.animations[0].duration);
      setAnim(0);
    }
    model.updateMatrixWorld(true); try { addDecals(model, spin); } catch (e) { /* decals are optional */ }
    ready = true; window.__cadModel = model;
    $('#load').classList.add('done');
    applyWay(body.dataset.way, true);
  }, (e) => { if (e.total) bar.style.width = (e.loaded / e.total * 100).toFixed(0) + '%'; },
  () => { $('#load .load-t').textContent = 'Model unavailable'; });
}
/* the clip is a 12 s explode-and-return loop: find the moment the parts are furthest apart */
function findExplodeTime(dur) {
  const meshes = []; model.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const v = new THREE.Vector3(); let best = dur / 2, bestS = -1;
  setAnim(0); model.updateMatrixWorld(true);
  const base = meshes.map((m) => m.getWorldPosition(new THREE.Vector3()));
  for (let i = 1; i <= 36; i++) {
    const t = dur * i / 37; setAnim(t); model.updateMatrixWorld(true);
    let s = 0; meshes.forEach((m, j) => { m.getWorldPosition(v); s += v.distanceTo(base[j]); });
    if (s > bestS) { bestS = s; best = t; }
  }
  window.__cad = { tMax: best, dur };
  return best;
}
const startLoad = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 600 }) : setTimeout(load, 200));
if (document.readyState === 'complete') startLoad(); else addEventListener('load', startLoad);
useHDRI(renderer, scene, { size: 512, rotation: 0.6 });

/* ---------- scroll choreography ---------- */
// stage keyframes per section: x/y offset of the bike, yaw, camera distance, camera height
const KF = {
  hero:  { x: 0.5, y: -0.66, yaw: -0.18, d: 6.5, h: 0.5 },
  apart: { x: 0.8,  y: -0.55, yaw: -0.7,  d: 8.4, h: 1.3 },
  paint: { x: -1.0, y: -0.6, yaw: 0.35,  d: 7.0, h: 0.75 },
  spec:  { x: 1.12, y: -0.55, yaw: -0.95, d: 7.6, h: 1.7 },
  dusk:  { x: -1.2, y: -0.62, yaw: 0.62,  d: 7.0, h: 0.5 },
  ride:  { x: 1.4,  y: -0.4,  yaw: -0.3,  d: 8.4, h: 1.0 },
};
const secs = ['hero', 'apart', 'paint', 'spec', 'dusk', 'ride'].map((id) => ({ id, el: document.getElementById(id) }));
const cur = { ...KF.hero }, tgt = { ...KF.hero };
let explode = 0, explodeT = 0;
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function onScroll() {
  const mid = innerHeight * 0.5;
  // which two sections straddle the viewport middle
  let a = secs[0], bsec = secs[0], f = 0;
  for (let i = 0; i < secs.length; i++) {
    const r = secs[i].el.getBoundingClientRect();
    const anchor = secs[i].id === 'apart' ? r.top + innerHeight * 0.5 : r.top + r.height * 0.5;
    if (anchor <= mid) { a = secs[i]; bsec = secs[Math.min(i + 1, secs.length - 1)]; }
  }
  if (a !== bsec) {
    const ra = a.el.getBoundingClientRect(), rb = bsec.el.getBoundingClientRect();
    const pa = a.id === 'apart' ? ra.bottom - innerHeight * 0.5 : ra.top + ra.height * 0.5;
    const pb = rb.top + rb.height * 0.5;
    f = clamp((mid - pa) / Math.max(1, pb - pa)); f = ease(f);
  }
  for (const k in tgt) tgt[k] = lerp(KF[a.id][k], KF[bsec.id][k], f);
  // exploded view progress
  const ap = $('#apart').getBoundingClientRect();
  const p = clamp(-ap.top / (ap.height - innerHeight));
  const past = Math.max(0, innerHeight - ap.bottom);          // px scrolled beyond the pinned teardown
  if (!BAKE) explodeT = clamp((p - 0.06) / 0.8) * (1 - clamp(past / (innerHeight * 0.55)));
  $('#meterFill').style.width = (explodeT * 200).toFixed(1) + 'px';
  $('#meterN').textContent = Math.round(explodeT * 100) + '%';
  $$('#stages li').forEach((li) => li.classList.toggle('on', explodeT + 0.02 >= +li.dataset.at && (li.nextElementSibling ? explodeT + 0.02 < +li.nextElementSibling.dataset.at : true)));
}
addEventListener('scroll', onScroll, { passive: true });

/* ---------- drag to turn (pointer anywhere outside controls) ---------- */
let yawUser = 0, yawVel = 0, dragging = false, lastX = 0;
body.classList.add('grab');
addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || e.target.closest('a,button,summary,input,.zl-foot,.brand')) return;
  dragging = true; lastX = e.clientX; body.classList.add('dragging');
});
addEventListener('pointermove', (e) => {
  if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; yawVel = dx * 0.006; yawUser += yawVel; }
  mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
});
addEventListener('pointerup', () => { dragging = false; body.classList.remove('dragging'); });
let mx = 0, my = 0;

/* ---------- colourways ---------- */
const col = new THREE.Color(WAYS.glacier.c), colT = new THREE.Color(WAYS.glacier.c), acc = new THREE.Color(WAYS.glacier.rim), accT = new THREE.Color(WAYS.glacier.rim);
function applyWay(id, instant) {
  const w = WAYS[id]; if (!w) return;
  body.dataset.way = id; colT.set(w.c); accT.set(w.rim); if (instant || reduced) { col.copy(colT); acc.copy(accT); }
  $$('.way').forEach((b) => { const on = b.dataset.way === id; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  const nm = $('#wayName'), sb = $('#waySub');
  if (window.gsap && !reduced && !instant) {
    gsap.to([nm, sb], { y: -14, opacity: 0, duration: .28, ease: 'power2.in', stagger: .04, onComplete: () => {
      nm.textContent = w.name; sb.textContent = w.sub;
      gsap.fromTo([nm, sb], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .06 });
    } });
  } else { nm.textContent = w.name; sb.textContent = w.sub; }
  $('#wayIdx').textContent = String(ORDER.indexOf(id) + 1).padStart(2, '0');
  if (!instant) yawKick = 1;
}
let yawKick = 0;
$$('.way').forEach((b) => b.addEventListener('click', () => {
  b.classList.remove('ripple'); void b.offsetWidth; b.classList.add('ripple'); applyWay(b.dataset.way);
}));
$('.ways').addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
  e.preventDefault(); const i = ORDER.indexOf(body.dataset.way), n = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 2)) % 3;
  applyWay(ORDER[n]); $(`.way[data-way="${ORDER[n]}"]`).focus();
});

/* ---------- studio / dusk ---------- */
const lightT = { env: 1.0, key: 1.2, rim: 0, exp: 1.0 }, light = { ...lightT };
function setMode(m) {
  body.dataset.mode = m;
  $$('.mode-b').forEach((b) => { const on = b.dataset.mode === m; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  Object.assign(lightT, m === 'dusk' ? { env: 0.32, key: 0.25, rim: 3.2, exp: 1.08 } : { env: 1.0, key: 1.2, rim: 0, exp: 1.0 });
  if (reduced) Object.assign(light, lightT);
  $('meta[name="theme-color"]').setAttribute('content', m === 'dusk' ? '#2E1A13' : '#ECE6DC');
}
$$('.mode-b').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

/* ---------- small things: rolls, magnets, letters, cta ---------- */
const rollIO = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return; rollIO.unobserve(en.target);
  const el = en.target, to = +el.dataset.to, dec = +(el.dataset.dec || 0);
  if (reduced || !window.gsap) { el.textContent = to.toFixed(dec); return; }
  const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
}), { threshold: .6 });
$$('.roll').forEach((el) => rollIO.observe(el));
if (!reduced) $$('.mag').forEach((el) => {
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});
const letters = $$('.giant span');
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (a.id === 'ctaBtn') return;
  const t = $(id); if (!t) return; e.preventDefault();
  const y = id === '#apart' ? t.offsetTop + innerHeight * 0.9 : t.offsetTop;
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}));
$('#ctaBtn').addEventListener('click', (e) => { e.preventDefault(); $('#toast').textContent = 'Concept only: there is no bike to book. Thanks for riding along.'; });

/* ---------- loop ---------- */
const clock = new THREE.Clock(); let t0 = 0;
function frameLoop() {
  const dt = Math.min(clock.getDelta(), 0.05); t0 += dt;
  for (const k in cur) cur[k] = reduced ? tgt[k] : damp(cur[k], tgt[k], 3.2, dt);
  explode = reduced ? explodeT : damp(explode, explodeT, 5, dt);
  if (!dragging) { yawVel *= Math.pow(0.04, dt); yawUser += yawVel; yawUser = damp(yawUser, 0, dragging ? 0 : 0.35, dt); }
  yawKick = damp(yawKick, 0, 2.4, dt);
  const idle = reduced || BAKE ? 0 : Math.sin(t0 * 0.35) * 0.16;
  spin.rotation.y = cur.yaw + yawUser + idle + yawKick * 0.5;
  stage.position.set(cur.x, cur.y, 0);
  const aspect = innerWidth / innerHeight;
  const d = (cur.d + (BAKE ? 0 : explode * 1.5)) * (aspect < 1.45 ? 1.45 / aspect : 1);   // pull back as the parts spread
  camera.position.set(BAKE ? 0 : mx * -0.25, cur.h + (BAKE ? 0 : my * 0.15), d);
  camera.lookAt(0, 0.35, 0);
  if (window.__camO) { const o = window.__camO; camera.position.set(o.p[0], o.p[1], o.p[2]); camera.lookAt(o.l[0], o.l[1], o.l[2]); if (o.f && camera.fov !== o.f) { camera.fov = o.f; camera.updateProjectionMatrix(); } }
  if (mixer) setAnim(ease(explode) * tMax);
  shadow.scale.set(3.4 + explode * 1.6, 1.1 + explode * 1.2, 1); shadow.material.opacity = 0.9 - explode * 0.35;
  col.lerp(colT, reduced ? 1 : 1 - Math.exp(-4 * dt)); if (frame) frame.color.copy(col);
  acc.lerp(accT, reduced ? 1 : 1 - Math.exp(-4 * dt)); if (accent) accent.color.copy(acc);
  for (const k in light) light[k] = reduced ? lightT[k] : damp(light[k], lightT[k], 2.5, dt);
  scene.environmentIntensity = light.env; key.intensity = light.key; rim.intensity = light.rim; renderer.toneMappingExposure = light.exp;
  if (!reduced) letters.forEach((l, i) => { l.style.transform = `translate3d(${mx * (i - 2) * 14}px,${my * 10}px,0)`; });
  renderer.render(scene, camera);
  requestAnimationFrame(frameLoop);
}
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); onScroll(); });
if (BAKE) {
  body.classList.add('bake');
  const way = BK.get('way') || 'glacier';
  addEventListener('load', () => {});
  Object.assign(KF.hero, { x: 0, y: -0.62, yaw: +(BK.get('yaw') || -0.22), d: +(BK.get('d') || 6.4), h: +(BK.get('h') || 0.55) });
  const wait = () => { if (!ready) return setTimeout(wait, 200); applyWay(way, true); explodeT = explode = +(BK.get('ex') || 0); setMode(BK.get('mode') || 'studio'); Object.assign(light, lightT); window.__baked = true; };
  window.__setBake = (w, ex, m, dd) => { if (dd) { KF.hero.d = dd; cur.d = tgt.d = dd; } applyWay(w, true); explodeT = explode = ex; setMode(m); Object.assign(light, lightT); col.copy(colT); acc.copy(accT); };
  wait();
}
reveals(); if (!BAKE) smooth(); onScroll(); setMode('studio');
requestAnimationFrame(frameLoop);
