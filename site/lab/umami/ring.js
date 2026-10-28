/* UMAMI RING - Concept 08, Zyqor Lab: the 3D ring. Five real photogrammetry scans of ramen bowls
   (CC BY 4.0, credited on the page) ride a rotating orbit ring; the page colour and the giant dish name
   follow the bowl at the front. Loaded by app.js when WebGL is available, on index.html and m.html alike:
   same model files, same textures, same lighting on phone and desktop. */
import { THREE, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, clamp, damp, lerp } from '../_kit/kit.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { useHDRI } from '../../assets/hdri/hdri.js';
import { D, MODEL_DIR, plateSrc } from './dishes.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const G = () => window.gsap;
const TAU = Math.PI * 2;
const SH = true;   // contact shadows on phone too (smaller map), same look as desktop
let active = 0;
const SCALE = 0.93;   // scans are normalised to rim radius 1; this sits them on the 1.34 tray like the old bowls

/* ---------- textures ---------- */
const TS = 1024;   // same textures on phone and desktop
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(30,10,5,.5)'); gr.addColorStop(0.6, 'rgba(30,10,5,.2)'); gr.addColorStop(1, 'rgba(30,10,5,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const SEG = 160;
const trayGeo = (() => {
  const R = 1.34, T = 0.085, b = 0.025, p = [new THREE.Vector2(0.001, -T)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; p.push(new THREE.Vector2(R - b + Math.cos(a) * b, -T + b + Math.sin(a) * b)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; p.push(new THREE.Vector2(R - b + Math.cos(a) * b, -b + Math.sin(a) * b)); }
  p.push(new THREE.Vector2(0.001, 0));
  const g = new THREE.LatheGeometry(p, SEG), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (R * 2) + 0.5, pos.getZ(i) / (R * 2) + 0.5 + pos.getY(i) * 0.6);
  g.computeVertexNormals(); return g;
})();
/* round 2: real wood (Poly Haven "Fine Grained Wood", CC0) for the tray and chopsticks: colour + normal + roughness, webp */
const TL = new THREE.TextureLoader(), WOOD = '../../assets/lab/umami/';
const woodSet = (rep, rot = 0) => { const ld = (f, srgb) => { const t = TL.load(WOOD + f); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.rotation = rot; t.anisotropy = 8; return t; };
  return { map: ld('wood_col.webp', true), normalMap: ld('wood_nor.webp', false), roughnessMap: ld('wood_rough.webp', false) }; };
const trayMat = new THREE.MeshPhysicalMaterial({ ...woodSet([1.2, 1.2]), normalScale: new THREE.Vector2(0.8, 0.8), color: 0xFFF0E0, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 });

/* ---------- the bowls: a tray + a real scan each (scans stream in, front bowl first) ---------- */
const hitGeo = new THREE.CylinderGeometry(1.0 * SCALE, 0.62 * SCALE, 0.9 * SCALE, 24); hitGeo.translate(0, 0.45 * SCALE, 0);
function buildBowl(d, i) {
  const grp = new THREE.Group(), body = new THREE.Group(); grp.add(body);
  const tray = new THREE.Mesh(trayGeo, trayMat); tray.receiveShadow = SH; tray.userData.bi = i; grp.add(tray);
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.75), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.95 })); ao.rotation.x = -Math.PI / 2; ao.position.y = 0.003; grp.add(ao);
  let blob = null;
  if (!SH) { blob = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = -0.1; grp.add(blob); }
  const proxy = new THREE.Mesh(hitGeo, trayMat); proxy.visible = false; proxy.userData.bi = i; body.add(proxy);   // cheap pick target
  return { d, i, grp, body, hits: [tray, proxy], mats: [], surf: (d.surf - (d.sink || 0)) * SCALE, ready: false };
}

/* ---------- renderer + scene ---------- */
const hero = $('.hero'), canvas = $('#ring');
const renderer = makeRenderer(canvas, { exposure: 1.05 });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));   // round 2: phone renders at DPR 2 like desktop
renderer.toneMapping = THREE.ACESFilmicToneMapping;   // ACES, sRGB output (kit)
if (SH) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer, 0.04);          // instant fallback (phones keep it)
scene.environmentIntensity = 0.85;
useHDRI(renderer, scene, { size: 512, intensity: 0.8, rotation: 0.9 });   // Poly Haven studio HDRI on desktop
const cam = new THREE.PerspectiveCamera(isM ? 34 : 28, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xFFE9CC, 0x5A2E20, 0.35));
/* warm, low key light from the side + a back light so the broth and noodles glisten */
const key = new THREE.DirectionalLight(0xFFE2BC, 1.7); key.position.set(-5, 7.5, 4);
if (SH) { key.castShadow = true; key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 }); key.shadow.radius = 6; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; }
scene.add(key);
const back = new THREE.DirectionalLight(0xFFD09A, 1.6); back.position.set(3.5, 5, -7); scene.add(back);
if (SH) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 })); sp.rotation.x = -Math.PI / 2; sp.position.y = -0.09; sp.receiveShadow = true; scene.add(sp); }
const ring = new THREE.Group(); scene.add(ring);
const bowls = D.map((d, i) => { const b = buildBowl(d, i); ring.add(b.grp); return b; });
const R = isM ? 2.25 : 3.05;

/* steam over the front bowl: soft shader wisps (fbm noise, rising and curling), not sprites */
const STEAM_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const STEAM_FS = `precision mediump float; varying vec2 vUv; uniform float uTime, uAmt, uSeed; uniform vec3 uColor;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }
void main(){
  vec2 uv = vUv; float t = uTime * 0.16;
  float w = fbm(vec2(uv.x * 1.6 + uSeed, uv.y * 1.2 - t));
  float cx = 0.5 + (w - 0.5) * 0.55 * uv.y + sin(uv.y * 3.0 + uTime * 0.4 + uSeed) * 0.06 * uv.y;
  float d = fbm(vec2((uv.x - cx) * 3.2 + uSeed * 2.0, uv.y * 2.4 - t * 2.2) + w * 1.6);
  float col = smoothstep(0.42, 0.06, abs(uv.x - cx) / (0.35 + uv.y * 0.6));
  float vert = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.4, uv.y);
  float a = smoothstep(0.38, 0.8, d) * col * vert * uAmt;
  gl_FragColor = vec4(uColor, a);
}`;
const steam = new THREE.Group(); scene.add(steam);
const steamU = [];
for (let k = 0; k < (isM ? 2 : 3); k++) {
  const u = { uTime: { value: k * 7.3 }, uAmt: { value: 0.5 }, uSeed: { value: k * 3.1 + 0.7 }, uColor: { value: new THREE.Color(0xFFF8EE) } };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), new THREE.ShaderMaterial({ vertexShader: STEAM_VS, fragmentShader: STEAM_FS, uniforms: u, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  m.userData.off = (k - (isM ? 0.5 : 1)) * 0.32; m.renderOrder = 5; steam.add(m); steamU.push(u);
}
if (reduced) steam.visible = false;

/* ---------- ring state ---------- */
let ang = 0, angT = 0, dragA = 0;
const STEP = TAU / D.length;
function framing() {
  const W = hero.clientWidth, H = hero.clientHeight;
  renderer.setSize(W, H, false); cam.aspect = W / H;
  if (isM) { cam.position.set(0, 7.2, 12.4); cam.lookAt(0, -0.35, 1.05); }
  else { const k = clamp(1.6 / cam.aspect, 0.9, 1.35); cam.position.set(0, 5.6 * k, 11.4 * k); cam.lookAt(0, 0.15, 1.25); }
  cam.updateProjectionMatrix();
}
function setDish(n, opts = {}) {
  n = ((n % D.length) + D.length) % D.length;
  if (n === active && !opts.force) return;
  const prev = active; active = n; const d = D[n];
  // shortest way round
  let target = -n * STEP; const cur = angT; target += Math.round((cur - target) / TAU) * TAU; angT = target;
  paint();
  $('#cnum').textContent = String(n + 1).padStart(2, '0');
  $$('.dchip').forEach((c, j) => c.setAttribute('aria-pressed', j === n ? 'true' : 'false'));
  rollName(d.name, n > prev ? 1 : -1);
  const hs = $('#hsub'); const gs = G();
  if (gs && !reduced) gs.timeline().to(hs, { opacity: 0, y: -8, duration: 0.25 }).add(() => { hs.textContent = d.sub; }).to(hs, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  else hs.textContent = d.sub;
  if (!opts.fromMenu) selectMenu(n, true);
}
/* giant name: letters roll out and in */
const dn = $('#dn');
const mctx = document.createElement('canvas').getContext('2d');
function fitName(txt) {
  const vw = innerWidth, vh = hero.clientHeight || innerHeight;
  const max = isM ? Math.min(vw * 0.2, vh * 0.13) : Math.min(vw * 0.175, vh * 0.3);
  mctx.font = '800 100px "Bricolage Grotesque", "Arial Black", sans-serif';
  const s = txt.toUpperCase(), w100 = mctx.measureText(s).width - 4.5 * (s.length - 1);
  $('.dname').style.fontSize = Math.min(max, (100 * vw * (isM ? 0.92 : 0.9)) / w100).toFixed(1) + 'px';
}
function splitInto(el, txt) { fitName(txt); el.innerHTML = [...txt].map((c, k) => `<span class="ch" style="--k:${k}"><i>${c === ' ' ? '&nbsp;' : c}</i></span>`).join(''); return $$('.ch i', el); }
splitInto(dn, D[0].name);
function rollName(txt, dir) {
  const gs = G();
  if (!gs || reduced) { splitInto(dn, txt); return; }
  const old = $$('.ch i', dn);
  gs.killTweensOf(old);
  gs.to(old, { yPercent: -110 * dir, duration: 0.35, ease: 'power3.in', stagger: 0.025, onComplete() {
    const nu = splitInto(dn, txt);
    gs.fromTo(nu, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035 });
  } });
}
$('#prev').addEventListener('click', () => setDish(active - 1));
$('#next').addEventListener('click', () => setDish(active + 1));
$$('.dchip').forEach((c) => c.addEventListener('click', () => setDish(+c.dataset.i)));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const r = hero.getBoundingClientRect(); if (r.bottom < innerHeight * 0.4) return;
  e.preventDefault(); setDish(active + (e.key === 'ArrowRight' ? 1 : -1));
});

/* drag the ring / click a bowl */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let drag = null;
function pickBowl(e) {
  const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, cam); const hits = ray.intersectObjects(bowls.flatMap((b) => b.hits), false);
  return hits.length ? bowls[hits[0].object.userData.bi] : null;
}
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, a: 0, moved: false, id: e.pointerId }; });
canvas.addEventListener('pointermove', (e) => {
  if (drag) {
    const dx = e.clientX - drag.x; if (Math.abs(dx) > 8 && !drag.moved) { drag.moved = true; try { canvas.setPointerCapture(drag.id); } catch (er) { /* ignore */ } }
    if (drag.moved) dragA = dx * (isM ? 0.008 : 0.0045);
    return;
  }
  if (!coarse) canvas.style.cursor = pickBowl(e) ? 'pointer' : 'grab';
});
const endDrag = (e) => {
  if (!drag) return; const d0 = drag; drag = null;
  if (d0.moved) {
    ang += dragA; angT += dragA; dragA = 0;           // the ring stays where the finger left it
    const k = Math.round(-angT / STEP);               // nearest bowl (unwrapped index)
    angT = -k * STEP;                                 // snap to it
    setDish(((k % D.length) + D.length) % D.length);
  } else if (e.type === 'pointerup') { const b = pickBowl(e); if (b) setDish(b.i); }
};
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

/* ---------- menu (pill highlight + plate spin) ---------- */
const rows = $$('.mrow'), pill = $('.mpill'), mlist = $('.mlist'), plateImg = $('#plateImg');
const thumbs = [];
function movePill(row) { pill.style.transform = `translateY(${row.parentElement.offsetTop}px)`; pill.style.height = row.offsetHeight + 'px'; rows.forEach((r) => r.classList.toggle('hot', r === row)); }
function selectMenu(n, fromHero) {
  rows.forEach((r, j) => r.setAttribute('aria-pressed', j === n ? 'true' : 'false'));
  movePill(rows[n]); pill.style.background = D[n].bg; rows.forEach((r) => (r.style.color = ''));
  rows[n].style.color = D[n].ink;
  $('#plateName').textContent = D[n].name; $('#plateNote').textContent = D[n].note;
  plateImg.alt = `Top view of the ${D[n].name} bowl`;
  const gs = G();
  const src = thumbs[n] || plateSrc(D[n]);
  if (!gs || reduced) { plateImg.src = src; return; }
  gs.timeline().to(plateImg, { rotate: 120, scale: 0.6, opacity: 0, duration: 0.38, ease: 'power3.in' })
    .add(() => { plateImg.src = src; })
    .fromTo(plateImg, { rotate: -140, scale: 0.7, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 1.0, ease: 'back.out(1.4)' });
  void fromHero;
}
rows.forEach((r, j) => {
  r.addEventListener('click', () => { setDish(j, { fromMenu: true }); selectMenu(j); });
  if (!coarse) r.addEventListener('pointerenter', () => { movePill(r); rows.forEach((x) => (x.style.color = '')); r.style.color = D[active].ink; });
});
if (!coarse) mlist.addEventListener('pointerleave', () => { movePill(rows[active]); rows.forEach((x) => (x.style.color = '')); rows[active].style.color = D[active].ink; });
addEventListener('resize', () => movePill(rows[active]));

/* bake the five plate images once, top-down, with the same renderer */
function bakeThumbs() {
  const S = isM ? 280 : 520, dpr = renderer.getPixelRatio();
  const tcam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); tcam.position.set(0, 6.4, 1.6); tcam.lookAt(0, 0.25, 0);
  const keep = bowls.map((b) => ({ p: b.grp.position.clone(), s: b.grp.scale.clone(), r: b.grp.rotation.clone(), v: b.grp.visible }));
  const tray = (b) => b.grp.children.find((c) => c.geometry === trayGeo);
  const steamV = steam.visible; steam.visible = false;
  const out = document.createElement('canvas'); out.width = out.height = S; const og = out.getContext('2d');
  renderer.setClearColor(0x000000, 0);
  bowls.forEach((b) => {
    bowls.forEach((o) => (o.grp.visible = o === b));
    b.grp.position.set(0, 0, 0); b.grp.scale.setScalar(1); b.grp.rotation.set(0, 0.4, 0); b.body.rotation.y = 0;
    const t = tray(b); if (t) t.visible = false;
    renderer.setViewport(0, 0, S, S); renderer.setScissor(0, 0, S, S); renderer.setScissorTest(true);
    renderer.clear(); renderer.render(scene, tcam);
    og.clearRect(0, 0, S, S); og.drawImage(canvas, 0, canvas.height - S * dpr, S * dpr, S * dpr, 0, 0, S, S);
    thumbs[b.i] = out.toDataURL('image/webp', 0.86);
    if (t) t.visible = true;
  });
  renderer.setScissorTest(false); renderer.setViewport(0, 0, canvas.width / dpr, canvas.height / dpr);
  bowls.forEach((b, j) => { b.grp.position.copy(keep[j].p); b.grp.scale.copy(keep[j].s); b.grp.rotation.copy(keep[j].r); b.grp.visible = keep[j].v; });
  steam.visible = steamV;
  plateImg.src = thumbs[active];
  window.__thumbs = thumbs;
}

/* ---------- SPICE LEVEL: Mild / Hot / Fire (whole-page mode) ---------- */
const heat = { v: 0 };            // 0 mild .. 1 hot .. 2 fire (tweened)
let spice = 0, spiceBusy = false;
const HOT_TINT = '#D23F22', FIRE_TINT = '#5A110C', CREAM = '#F4E9D8';
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mixHex(a, b, t) { const A = hex2rgb(a), Bc = hex2rgb(b); return '#' + A.map((v, k) => Math.round(v + (Bc[k] - v) * t).toString(16).padStart(2, '0')).join(''); }
function heroColors(d, h) {
  let bg = d.bg, ink = d.ink;
  if (h >= 1) { bg = mixHex(bg, HOT_TINT, 0.78); ink = CREAM; }
  if (h >= 2) { bg = mixHex(d.bg, FIRE_TINT, 0.86); ink = CREAM; }
  return { bg, ink };
}
function paint() {
  const { bg, ink } = heroColors(D[active], spice);
  root.style.setProperty('--bg', bg); root.style.setProperty('--ink', ink);
  const tm = document.querySelector('meta[name="theme-color"]'); if (tm) tm.setAttribute('content', bg);
}
/* chilli oil layer on every broth, a tint and a glow on the broth itself */
const oilTex = canvasTex(TS, TS, (g, w) => {
  g.clearRect(0, 0, w, w); const r = rng(77);
  for (let i = 0; i < (170); i++) {
    const a = r() * TAU, rr = Math.sqrt(r()) * w * 0.46, x = w / 2 + Math.cos(a) * rr, y = w / 2 + Math.sin(a) * rr, s = (0.006 + r() * r() * 0.045) * w;
    const gr = g.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s); gr.addColorStop(0, 'rgba(255,170,90,.95)'); gr.addColorStop(0.55, 'rgba(226,60,30,.85)'); gr.addColorStop(1, 'rgba(160,20,10,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  // flakes
  for (let i = 0; i < (90); i++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${20 + r() * 25 | 0},14,${0.6 + r() * 0.4})`; const x = w * (0.1 + r() * 0.8), y = w * (0.1 + r() * 0.8); g.save(); g.translate(x, y); g.rotate(r() * 3); g.fillRect(-w * 0.008, -w * 0.003, w * 0.016, w * 0.006); g.restore(); }
});
const oilGeo = new THREE.CircleGeometry(0.74 * SCALE, SEG); oilGeo.rotateX(-Math.PI / 2);
const bst = bowls.map((b) => {
  const oil = new THREE.Mesh(oilGeo, new THREE.MeshBasicMaterial({ map: oilTex, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  oil.position.y = b.surf + 0.004; oil.scale.setScalar(0.3); oil.visible = false; oil.renderOrder = 2; b.body.add(oil);
  return { b, oilMesh: oil, oil: 0, glow: 0 };
});
/* lights that warm up */
const rim = new THREE.DirectionalLight(0xFF5A2A, 0); rim.position.set(0, 1.0, 9); scene.add(rim);
const keyCold = new THREE.Color(0xFFF1DC), keyHot = new THREE.Color(0xFFC79A);
/* embers */
const EN = isM ? 36 : 110;
const emberTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.35, 'rgba(255,150,60,.9)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
const eGeo = new THREE.BufferGeometry(), ePos = new Float32Array(EN * 3), eCol = new Float32Array(EN * 4);
const eL = new Float32Array(EN), eV = new Float32Array(EN * 3), eSeed = new Float32Array(EN);
eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3)); eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 4));
const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ size: isM ? 0.2 : 0.17, map: emberTex, transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
embers.frustumCulled = false; scene.add(embers);
function spawnEmber(i, burst) {
  const front = burst || Math.random() < 0.55;
  const src = front ? bowls[active].grp : bowls[(Math.random() * D.length) | 0].grp;
  const a = Math.random() * TAU, r = Math.random() * 0.7 * src.scale.x;
  ePos[i * 3] = src.position.x + Math.cos(a) * r; ePos[i * 3 + 1] = src.position.y + 0.7 * src.scale.x; ePos[i * 3 + 2] = src.position.z + Math.sin(a) * r;
  const sp = burst ? 2.2 + Math.random() * 2.6 : 0.6 + Math.random() * 0.9;
  eV[i * 3] = Math.cos(a) * (burst ? 1.6 + Math.random() * 1.8 : 0.15); eV[i * 3 + 1] = sp; eV[i * 3 + 2] = Math.sin(a) * (burst ? 1.2 + Math.random() * 1.4 : 0.15);
  eL[i] = 0; eSeed[i] = Math.random() * 10;
}
for (let i = 0; i < EN; i++) { spawnEmber(i); eL[i] = Math.random(); }
let emberBurstK = 0;
/* the drop + the ripple */
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xD8261A, roughness: 0.08, clearcoat: 1, emissive: 0x5A0A02 }));
drop.scale.set(1, 1.35, 1); drop.visible = false; scene.add(drop);
const rip = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: 0xFFB070, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
rip.rotation.x = -Math.PI / 2; rip.visible = false; scene.add(rip);
const ripS = { t: 1 }, dropS = { y: 0, on: 0 };
function heatFrame(dt, T) {
  const hv = heat.v, emberAmt = clamp(hv - 0.35, 0, 1.65) / 1.65; // none in mild, some in hot, full in fire
  bst.forEach((s) => {
    s.oilMesh.visible = s.oil > 0.01; s.oilMesh.material.opacity = Math.min(1, s.oil);
    s.oilMesh.scale.setScalar(0.3 + 0.7 * Math.min(1, s.oil * 1.3));
    const lv = clamp(hv / 2);   // the scan warms a little in Hot / Fire (emissive tint, never a recolour)
    s.b.mats.forEach((m) => { m.emissiveIntensity = lv * 0.16 + (reduced ? 0 : Math.sin(T * 3 + s.b.i) * 0.015 * lv); });
  });
  rim.intensity = hv * 0.9; key.color.copy(keyCold).lerp(keyHot, clamp(hv / 2));
  steamU.forEach((u) => { u.uColor.value.setRGB(1, 1 - hv * 0.05, 1 - hv * 0.1); });
  // embers
  const gust = Math.sin(T * 0.7) * 0.25;
  for (let i = 0; i < EN; i++) {
    eL[i] += dt * (0.32 + eSeed[i] * 0.02);
    if (eL[i] >= 1) spawnEmber(i);
    const t = eL[i];
    eV[i * 3 + 1] *= 1 - dt * 0.35; eV[i * 3] *= 1 - dt * 1.2; eV[i * 3 + 2] *= 1 - dt * 1.2;
    ePos[i * 3] += (eV[i * 3] + Math.sin(T * 2.1 + eSeed[i]) * 0.22 + gust) * dt;
    ePos[i * 3 + 1] += (eV[i * 3 + 1] + 0.25) * dt;
    ePos[i * 3 + 2] += (eV[i * 3 + 2] + Math.cos(T * 1.7 + eSeed[i]) * 0.12) * dt;
    const a = Math.sin(t * Math.PI) * (reduced ? 0 : 1) * Math.min(1, emberAmt + emberBurstK) * (0.55 + 0.45 * Math.sin(T * 9 + eSeed[i] * 3));
    eCol.set([1, 0.55 + 0.35 * (1 - t), 0.25 * (1 - t), Math.max(0, a)], i * 4);
  }
  embers.visible = emberAmt + emberBurstK > 0.01;
  eGeo.attributes.position.needsUpdate = true; eGeo.attributes.color.needsUpdate = true;
  // drop + ripple ride the front bowl
  const fb = bowls[active].grp, surf = fb.position.y + bowls[active].surf * fb.scale.x;
  drop.visible = dropS.on > 0; if (drop.visible) drop.position.set(fb.position.x + 0.12, surf + dropS.y, fb.position.z + 0.1);
  rip.visible = ripS.t < 1;
  if (rip.visible) { const k = 0.08 + ripS.t * 0.86; rip.position.set(fb.position.x, surf + 0.012, fb.position.z); rip.scale.setScalar(k * fb.scale.x); rip.material.opacity = (1 - ripS.t) * 0.9; }
}
/* screen point of the front bowl's broth (for the wipe origin) */
const _v = new THREE.Vector3();
function bowlScreen() {
  const fb = bowls[active].grp; _v.set(fb.position.x, fb.position.y + bowls[active].surf * fb.scale.x, fb.position.z).project(cam);
  const r = canvas.getBoundingClientRect(); return { x: r.left + (_v.x + 1) / 2 * r.width, y: r.top + (1 - _v.y) / 2 * r.height };
}
const spBtns = $$('.sp-b'), spTh = $('.sp-th'), spEl = $('.spicer');
function placeSpThumb() { const b = spBtns[spice]; if (!b) return; spTh.style.width = b.offsetWidth + 'px'; spTh.style.transform = `translateX(${b.offsetLeft}px)`; }
function applySpiceClasses() {
  root.classList.toggle('hot', spice === 1); root.classList.toggle('fire', spice === 2);
  spBtns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === spice)));
  placeSpThumb(); paint();
}
function setSpice(h, ev) {
  if (h === spice || spiceBusy) return;
  const up = h > spice; spice = h;
  const gs = G();
  if (reduced || !gs) { heat.v = h; bst.forEach((s) => { s.oil = [0, 0.6, 1][h]; }); applySpiceClasses(); return; }
  spiceBusy = true; setTimeout(() => { spiceBusy = false; }, 900);
  const go = () => impact(h, up, ev);
  if (up) { // 1: a chilli drop falls into the front bowl
    dropS.on = 1; gs.fromTo(dropS, { y: 3.4 }, { y: 0, duration: 0.5, ease: 'power3.in', onComplete() { dropS.on = 0; go(); } });
  } else go();
  gs.fromTo(spBtns[h], { scale: 0.9 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.45)', clearProps: 'scale' });
}
function impact(h, up) {
  const gs = G();
  // 2: the page heats (or cools) in a circle that opens from the bowl
  const p = bowlScreen();
  const R = Math.hypot(Math.max(p.x, innerWidth - p.x), Math.max(p.y, innerHeight - p.y));
  if (typeof document.startViewTransition === 'function') {
    root.classList.add('vt');
    try {
      const vt = document.startViewTransition(() => applySpiceClasses());
      vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${p.x}px ${p.y}px)`, `circle(${R}px at ${p.x}px ${p.y}px)`] },
        { duration: up ? 1100 : 900, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
      vt.finished.finally(() => root.classList.remove('vt'));
    } catch (e) { root.classList.remove('vt'); applySpiceClasses(); }
  } else applySpiceClasses();
  // 3: broth, light, steam and embers follow
  gs.to(heat, { v: h, duration: up ? 1.5 : 1.1, ease: 'power3.out' });
  const target = [0, 0.6, 1][h];
  bst.forEach((s) => { // oil spreads round the ring from the front bowl
    const dist = Math.min((s.b.i - active + D.length) % D.length, (active - s.b.i + D.length) % D.length);
    gs.to(s, { oil: target, duration: up ? 1.1 : 0.7, delay: dist * 0.16, ease: up ? 'expo.out' : 'power2.inOut' });
  });
  if (up) {
    ripS.t = 0; gs.to(ripS, { t: 1, duration: 1.2, ease: 'expo.out' });
    const fbody = bowls[active].body;
    gs.fromTo(fbody.scale, { x: 1.06, y: 0.84, z: 1.06 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1,0.35)' });
    for (let i = 0; i < EN; i += 2) spawnEmber(i, true);
    emberBurstK = 1; gs.to({ k: 1 }, { k: 0, duration: 1.6, ease: 'power2.in', onUpdate() { emberBurstK = this.targets()[0].k; } });
  }
  // 4: the giant name flares up letter by letter (or settles)
  const L = $$('.ch i', dn); gs.killTweensOf(L);
  gs.fromTo(L, { yPercent: 0, scaleY: 1 }, { keyframes: up ? [{ yPercent: -14, scaleY: 1.18, duration: 0.22, ease: 'power4.out' }, { yPercent: 0, scaleY: 1, duration: 0.9, ease: 'elastic.out(1,0.38)' }]
    : [{ yPercent: 8, scaleY: 0.9, duration: 0.25, ease: 'power3.out' }, { yPercent: 0, scaleY: 1, duration: 0.7, ease: 'power3.out' }],
    stagger: { each: 0.035, from: 'center' }, transformOrigin: '50% 100%', clearProps: 'transform' });
}
spBtns.forEach((b, j) => b.addEventListener('click', (e) => setSpice(j, e)));
spEl.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); e.stopPropagation();
  const n = clamp(spice + (e.key === 'ArrowRight' ? 1 : -1), 0, 2); setSpice(n); spBtns[n].focus();
});
addEventListener('resize', placeSpThumb);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeSpThumb);
requestAnimationFrame(placeSpThumb);

/* ---------- loop ---------- */
let last = performance.now(), T = 0, vis = true;
const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; }, { threshold: 0 }); io.observe(hero);
const line = $('.line'), broth = $('.broth');
const SHOT = new URLSearchParams(location.search).get('shot');   // QA hook: ?shot=close frames the front bowl up close
function frame(now) {
  requestAnimationFrame(frame);
  if (SHOT) { ang = angT; }
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  // broth timeline progress line
  const br = broth.getBoundingClientRect(); line.style.setProperty('--p', clamp((innerHeight * 0.85 - br.top) / (br.height * 0.9)).toFixed(3));
  if (!vis || document.hidden) return;
  ang = damp(ang, angT, reduced ? 1000 : 5.2, dt);
  const A = ang + dragA;
  bowls.forEach((b) => {
    const th = A + b.i * STEP, x = Math.sin(th) * R, z = Math.cos(th) * R;
    const front = Math.pow((Math.cos(th) + 1) / 2, 3);
    const s = lerp(0.6, isM ? 1.08 : 1.14, front);
    b.grp.position.set(x, front * 0.25 + (reduced ? 0 : Math.sin(T * 1.2 + b.i) * 0.03), z);
    b.grp.scale.setScalar(s);
    b.grp.rotation.y = -th * 0.4;
    b.body.rotation.y += (reduced ? 0 : dt * (0.05 + front * 0.18));
  });
  // steam wisps above the front bowl (billboarded to the camera)
  const fb = bowls[active].grp, top = fb.position.y + bowls[active].surf * fb.scale.x;
  steam.children.forEach((m, k) => {
    const u = steamU[k]; u.uTime.value += dt * (1 + heat.v * 0.35);
    u.uAmt.value = (isM ? 0.42 : 0.5) * (1 + heat.v * 0.45);
    m.quaternion.copy(cam.quaternion);
    const sc = fb.scale.x * (1 + heat.v * 0.12);
    m.scale.set(sc, sc * (1 + heat.v * 0.15), sc);
    m.position.set(fb.position.x + m.userData.off * sc, top + 1.15 * sc * (1 + heat.v * 0.15), fb.position.z + 0.05 * k);
  });
  heatFrame(dt, T);
  if (SHOT === 'close') { cam.position.set(0.55, 2.35, R + 2.15); cam.lookAt(0, 0.62, R - 0.05); }
  else if (SHOT === 'egg') { cam.position.set(-0.2, 1.75, R + 1.25); cam.lookAt(-0.15, 0.7, R - 0.1); }
  renderer.render(scene, cam);
}


/* ---------- load the scans: one small file per bowl (meshopt geometry + WebP texture), the same files on
   phone and desktop. The poster shows until the front bowl is in; a pill shows real progress. ---------- */
const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const lpill = document.createElement('div'); lpill.className = 'u-load'; lpill.setAttribute('role', 'progressbar');
lpill.setAttribute('aria-label', 'Loading the bowls'); lpill.setAttribute('aria-valuemin', '0'); lpill.setAttribute('aria-valuemax', '100');
lpill.innerHTML = '<span class="u-load-t">Plating the bowls</span><span class="u-load-b"><i></i></span>';
hero.appendChild(lpill);
const prog = D.map(() => 0);
function setProg() {
  const p = prog.reduce((a, b) => a + b, 0) / D.length;
  lpill.style.setProperty('--p', p.toFixed(3)); lpill.setAttribute('aria-valuenow', String(Math.round(p * 100)));
}
function fitScan(b, scene) {
  const node = scene.children[0] || scene;
  node.scale.setScalar(SCALE); node.position.y = -(b.d.sink || 0) * SCALE;
  node.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = SH; o.receiveShadow = SH; o.userData.bi = b.i;
    const m = o.material;
    // scans carry their lighting in the colour map: keep them matte-ish ceramic, a soft sheen for the broth
    m.metalness = 0; m.roughness = 0.62; m.envMapIntensity = 0.75;
    if (m.isMeshStandardMaterial) { m.emissive = new THREE.Color(0x7A1A06); m.emissiveIntensity = 0; m.needsUpdate = true; }
    if (m.map) m.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    b.mats.push(m);
  });
  b.body.add(node); b.ready = true;
}
function loadBowl(b) {
  return new Promise((res) => {
    gltfLoader.load(MODEL_DIR + 'bowl-' + b.d.slot + '.glb', (g) => { prog[b.i] = 1; setProg(); fitScan(b, g.scene); res(true); },
      (e) => { if (e.total) { prog[b.i] = Math.min(0.98, e.loaded / e.total); setProg(); } },
      () => { prog[b.i] = 1; setProg(); res(false); });
  });
}
async function loadAll() {
  setProg();
  const order = D.map((_, i) => i).sort((a, b) => Math.min((a - active + 5) % 5, (active - a + 5) % 5) - Math.min((b - active + 5) % 5, (active - b + 5) % 5));
  await loadBowl(bowls[order[0]]);                 // front bowl first, then the poster lifts
  root.classList.add('gl-on');
  await Promise.all(order.slice(1).map((i) => loadBowl(bowls[i])));
  lpill.classList.add('done'); setTimeout(() => lpill.remove(), 900);
  requestAnimationFrame(() => { bakeThumbs(); window.__umamiReady = true; });
}

/* ---------- misc UI ---------- */
let lenis = null;
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault();
  const el = $(a.getAttribute('href')); if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.5 }); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});
function magnetic() {
  if (coarse || isM || reduced) return;
  $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transition = 'transform .15s ease-out'; el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
  });
}

async function boot() {
  framing(); addEventListener('resize', framing);
  const qd = +new URLSearchParams(location.search).get('dish');   // QA hook: ?dish=n starts on bowl n
  if (qd > 0 && qd < D.length) { setDish(qd, { force: true }); ang = angT; }
  lenis = smooth(); reveals(); magnetic();
  paint();
  selectMenu(0);
  try { await document.fonts.load('800 100px "Bricolage Grotesque"'); } catch (e) { /* system font fallback */ }
  fitName(D[active].name); addEventListener('resize', () => fitName(D[active].name));
  requestAnimationFrame((t) => { last = t; frame(t); });
  loadAll();
  if (!reduced && G()) {
    // entrance: the ring spins in from a quarter turn, the bowls rise
    ang = angT + STEP * 2.2;
    G().from('.hero-l > *, .hero-r, .chips', { y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.35 });
    G().from($$('.ch i', dn), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.04, delay: 0.15 });
  }
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
