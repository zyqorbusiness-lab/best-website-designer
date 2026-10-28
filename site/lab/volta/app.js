/* Volta One - Zyqor Lab concept 10. Shared by index.html (desktop) and m.html (phone, isM). */
import { THREE, reduced, coarse, isM, Q, makeRenderer, glRenderer, studioEnv, reveals, smooth, clamp, damp, lerp } from '../_kit/kit.js';
import { buildCar } from './car_model.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const root = document.documentElement;

/* ---------- data ---------- */
const TRIMS = [
  { name: 'ONE', label: 'Volta One', paint: '#0F7C7A', paintName: 'Tidal Teal', pale: '#A3CBC9', stroke: '#2b9a92', glow: 'rgba(15,124,122,.24)', stats: { range: '540', acc: '4.4', chg: '20' } },
  { name: 'ONE GT', label: 'Volta One GT', paint: '#F26B3A', paintName: 'Sunset Orange', pale: '#F5C4AE', stroke: '#d8693f', glow: 'rgba(242,107,58,.24)', stats: { range: '480', acc: '2.9', chg: '18' } },
  { name: 'ONE X', label: 'Volta One X', paint: '#DCE6E9', paintName: 'Glacier White', pale: '#BCCCD1', stroke: '#7aa3aa', glow: 'rgba(120,170,180,.26)', stats: { range: '690', acc: '4.9', chg: '19' } }
];
const DETAILS = [
  { k: 'light', t: 'Signature light bar', p: 'One unbroken LED line wraps the nose and runs into the shoulders. At night it is the first thing you see and the last you forget.', yaw: -0.55 },
  { k: 'glass', t: 'Glass canopy', p: 'A single sweep of tinted glass from windscreen to tail. The shade darkens in under half a second when the sun gets loud.', yaw: 0 },
  { k: 'wheel', t: 'Aero wheels', p: 'Five teardrop cut-outs pull hot air off the brakes and smooth it down the flank. The orange hub comes on every trim.', yaw: 0.12 },
  { k: 'charge', t: 'Hidden charge port', p: 'Tucked into the rear shoulder. Touch the light and it slides open: 10 to 80% in 18 minutes (concept target).', yaw: 0.25 },
  { k: 'tail', t: 'Full-width tail light', p: 'An orange line drawn edge to edge across the tail. It breathes slowly while the car charges.', yaw: 0.6 }
];
const DAY = new THREE.Color('#E9EEF0'), NIGHT = new THREE.Color('#0C2A2D');

/* ---------- renderer ---------- */
const canvas = $('#gl');
/* round 2: phone renders exactly like desktop (antialiased, DPR up to 2) instead of the kit's lighter phone profile */
const renderer = glRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer, 0.04);
useHDRI(renderer, scene, { size: 512 });
const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
camera.position.set(0, 1.3, 10.5);
camera.lookAt(0, 0.55, 0);
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-4, 7, 5); scene.add(key);
const rim = new THREE.DirectionalLight(new THREE.Color('#5fe0d2'), 0); rim.position.set(2, 3, -6); scene.add(rim);

const rig = new THREE.Group(); scene.add(rig);
/* evidence hook for close-up QA shots (?debug only) */
if (/[?&]debug/.test(location.search)) window.__volta = { THREE, camera, rig, scene, renderer };
const car = buildCar({ q: isM ? 0.6 : 1 });
rig.add(car.group);

function gradTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// floor: page-coloured disc that hides most of the mirror pass (= soft reflection)
const floorMat = new THREE.ShaderMaterial({
  uniforms: { uCol: { value: DAY.clone() }, uA: { value: 0.95 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'uniform vec3 uCol;uniform float uA;varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=uA*(1.-smoothstep(.5,1.,r));gl_FragColor=vec4(uCol,a);\n#include <colorspace_fragment>\n}',
  transparent: true, depthWrite: false
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMat);
floor.rotation.x = -Math.PI / 2; floor.renderOrder = 1; rig.add(floor);
// contact shadow (body + four tyre blobs), rotates with the car
const shadowTex = gradTex(512, 256, (g, w, h) => {
  const blob = (x, y, rx, ry, a) => { g.save(); g.translate(x, y); g.scale(rx, ry); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(8,30,33,${a})`); gr.addColorStop(1, 'rgba(8,30,33,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore(); };
  blob(w / 2, h / 2, w * 0.47, h * 0.42, 0.55);
  blob(w / 2, h / 2, w * 0.4, h * 0.3, 0.45);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) blob(w / 2 + sx * w * 0.254, h / 2 + sz * h * 0.29, w * 0.07, h * 0.1, 0.8);
});
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85, toneMapped: false });
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), shadowMat);
shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.004; shadow.renderOrder = 2; car.group.add(shadow);
// night: light pools on the floor + glow tubes on the light bars
const poolTex = gradTex(256, 128, (g, w, h) => {
  g.save(); g.translate(0, h / 2); g.scale(w, h / 2);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(220,250,245,.45)'); gr.addColorStop(1, 'rgba(200,240,235,0)');
  g.fillStyle = gr; g.fillRect(0, -1, 1, 2); g.restore();
});
const add = (opts) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0, ...opts });
const poolMat = add({ map: poolTex, color: new THREE.Color('#e9fffb') });
const pool = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.4), poolMat);
pool.rotation.x = -Math.PI / 2; pool.position.set(2.25 + 2.7, 0.006, 0); pool.renderOrder = 3; car.group.add(pool);
const rPoolMat = add({ map: poolTex, color: new THREE.Color('#ff7a45') });
const rPool = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), rPoolMat);
rPool.rotation.x = -Math.PI / 2; rPool.rotation.z = Math.PI; rPool.position.set(-2.3 - 1.1, 0.006, 0); rPool.renderOrder = 3; car.group.add(rPool);
const fGlowMat = add({ color: new THREE.Color('#bff8f1') }), rGlowMat = add({ color: new THREE.Color('#ff6a35') });
const fGlow = new THREE.Mesh(car.fBar.geometry.clone(), fGlowMat); fGlow.scale.setScalar(1.0);
const rGlow = new THREE.Mesh(car.rBar.geometry.clone(), rGlowMat);
// fat tube = glow: rebuild with a bigger radius from the bar's own path
fGlow.geometry = new THREE.TubeGeometry(car.fBar.geometry.parameters.path, 80, 0.042, 8, false);
rGlow.geometry = new THREE.TubeGeometry(car.rBar.geometry.parameters.path, 80, 0.05, 8, false);
car.group.add(fGlow, rGlow);
const portMat = add({ color: new THREE.Color('#5ff0e0') });
const port = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), portMat);
port.position.copy(car.anchors.charge).add(new THREE.Vector3(0, 0, 0.01)); car.group.add(port);

/* ---------- state ---------- */
const S = { night: 0, flashF: 0, flashR: 0, glassP: 0, portP: 0, intro: reduced ? 0 : 1, introX: reduced ? 0 : 9, wheelSpin: 0, hop: 0 };
let trim = 0, detail = 0, dragYaw = 0, dragV = 0;
const cur = { sx: 0, sy: -0.2, yaw: -0.62, s: 1, dy: 0 };
let W = 1, H = 1, kfit = 1;

function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  const vh = 2 * 10.5 * Math.tan(THREE.MathUtils.degToRad(14)), vw = vh * camera.aspect;
  kfit = isM ? Math.min(vw * 0.56 / 4.6, vh * 0.3 / 1.4) : Math.min(vw * 0.5 / 4.6, vh * 0.34 / 1.4);
  camera.updateProjectionMatrix();
  fitNames();
}

/* ---------- giant names ---------- */
const namesEl = $('#names');
const nmEls = TRIMS.map((t, i) => {
  const d = document.createElement('div'); d.className = 'nm';
  d.innerHTML = [...t.name].map((ch) => ch === ' ' ? '<span class="sp"></span>' : `<span>${ch}</span>`).join('');
  namesEl.append(d);
  if (i) $$('span', d).forEach((s) => (s.style.transform = 'translateY(110%)'));
  return d;
});
function fitNames() {
  const c = document.createElement('canvas').getContext('2d');
  c.font = '900 100px Unb';
  TRIMS.forEach((t, i) => {
    const w = c.measureText(t.name).width - 4.5 * (t.name.length - 1);
    const fs = Math.min(W * (isM ? 0.92 : 0.86) / (w / 100), H * (isM ? 0.2 : 0.4));
    nmEls[i].style.setProperty('--fs', fs.toFixed(1) + 'px');
  });
}

/* ---------- odometer ---------- */
function roll(el, str) {
  const chars = [...str];
  if (el.dataset.len !== String(chars.length) || el.dataset.shape !== str.replace(/\d/g, '0')) {
    el.innerHTML = chars.map((ch) => /\d/.test(ch)
      ? `<span class="dg"><span>${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</span></span>`
      : `<span>${ch}</span>`).join('');
    el.dataset.len = chars.length; el.dataset.shape = str.replace(/\d/g, '0');
    el.setAttribute('aria-label', str);
  }
  let di = 0;
  $$('.dg', el).forEach((dg) => {
    const d = +chars.filter((c) => /\d/.test(c))[di++];
    dg.firstElementChild.style.transitionDelay = (di * 70) + 'ms';
    dg.firstElementChild.style.transform = `translateY(${-d}em)`;
  });
  el.setAttribute('aria-label', str);
}
const rolls = $$('.roll');
rolls.forEach((r) => roll(r, TRIMS[0].stats[r.dataset.k]));

/* ---------- trims ---------- */
const trimBtns = $$('.trim'), ind = $('.trim-ind');
function placeInd() {
  const b = trimBtns[trim]; if (!b || !ind) return;
  ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`;
}
function applyTrimCss(t) {
  root.style.setProperty('--name', t.pale); root.style.setProperty('--name-n', t.stroke);
  root.style.setProperty('--paint', t.paint); root.style.setProperty('--glow', t.glow);
  const ct = $('#ctaTrim'), cp = $('#ctaPaint'); if (ct) ct.textContent = t.label; if (cp) cp.textContent = t.paintName;
}
car.U.uOld.value.set(TRIMS[0].paint); car.U.uNew.value.set(TRIMS[0].paint);
applyTrimCss(TRIMS[0]);
function setTrim(i, focus) {
  if (i === trim) return;
  const prev = trim; trim = i;
  const t = TRIMS[i];
  trimBtns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-checked', j === i); b.tabIndex = j === i ? 0 : -1; });
  if (focus) trimBtns[i].focus();
  placeInd(); applyTrimCss(t);
  rolls.forEach((r) => roll(r, t.stats[r.dataset.k]));
  const pn = $('.paint-name');
  const outL = $$('span', nmEls[prev]), inL = $$('span', nmEls[i]);
  if (reduced || !gsap) {
    outL.forEach((s) => (s.style.transform = 'translateY(110%)')); inL.forEach((s) => (s.style.transform = 'none'));
    car.U.uOld.value.set(t.paint); car.U.uNew.value.set(t.paint); if (pn) pn.textContent = t.paintName; return;
  }
  gsap.killTweensOf([...outL, ...inL]);
  gsap.to(outL, { yPercent: -112, y: 0, duration: 0.55, ease: 'power3.in', stagger: 0.035, overwrite: true });
  gsap.fromTo(inL, { yPercent: 112, y: 0 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.32, overwrite: true });
  // paint sweep, nose to tail
  const U = car.U;
  U.uOld.value.copy(U.uNew.value).lerp(U.uOld.value, 0); // keep current
  const from = U.uNew.value.clone();
  U.uOld.value.copy(from); U.uNew.value.set(t.paint);
  U.uEdgeCol.value.set(i === 1 ? '#ffd2b8' : '#d9fff9');
  gsap.killTweensOf(U.uSweep); gsap.killTweensOf(U.uEdge);
  gsap.fromTo(U.uSweep, { value: 2.7 }, { value: -2.7, duration: 1.25, ease: 'power2.inOut' });
  gsap.fromTo(U.uEdge, { value: 0 }, { value: 1.4, duration: 0.35, yoyo: true, repeat: 1, repeatDelay: 0.55, ease: 'sine.inOut' });
  gsap.fromTo(S, { hop: 0 }, { hop: 1, duration: 1.1, ease: 'power1.out' });
  if (pn) gsap.timeline().to(pn, { yPercent: -120, duration: 0.3, ease: 'power2.in' }).add(() => { pn.textContent = t.paintName; }).fromTo(pn, { yPercent: 120 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
}
trimBtns.forEach((b, j) => {
  b.tabIndex = j === 0 ? 0 : -1;
  b.addEventListener('click', () => setTrim(j));
  b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setTrim((trim + 1) % 3, true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setTrim((trim + 2) % 3, true); }
  });
});

/* ---------- day / night ---------- */
const modeBtn = $('#mode'), themeMeta = $('meta[name="theme-color"]');
const tmpC = new THREE.Color();
function applyNight() {
  const n = S.night;
  tmpC.copy(DAY).lerp(NIGHT, n);
  const hex = '#' + tmpC.getHexString(THREE.SRGBColorSpace);
  root.style.setProperty('--bg', hex);
  floorMat.uniforms.uCol.value.copy(tmpC);
  floorMat.uniforms.uA.value = lerp(0.95, 0.8, n);
  scene.environmentIntensity = lerp(1, 0.22, n);
  key.intensity = lerp(1.3, 0.12, n); rim.intensity = lerp(0, 2.2, n);
  shadowMat.opacity = lerp(0.85, 0.6, n);
  car.glassMat.emissiveIntensity = 0.12 * n + 0.6 * S.glassP;
  if (themeMeta) themeMeta.content = hex;
}
function setNight(on) {
  root.classList.toggle('night', on);
  modeBtn.setAttribute('aria-checked', on);
  if (reduced || !gsap) { S.night = on ? 1 : 0; applyNight(); return; }
  gsap.to(S, { night: on ? 1 : 0, duration: 1.3, ease: 'power2.inOut', onUpdate: applyNight });
}
modeBtn.addEventListener('click', () => setNight(!root.classList.contains('night')));
applyNight();

/* ---------- details / hotspots ---------- */
const hsLayer = $('#hsLayer');
const hsBtns = DETAILS.map((d, i) => {
  const b = document.createElement('button'); b.className = 'hs'; b.type = 'button';
  b.setAttribute('aria-label', `Detail ${i + 1}: ${d.t}`);
  b.innerHTML = `<i></i><b>${d.t}</b>`;
  b.addEventListener('click', () => setDetail(i));
  hsLayer.append(b); return b;
});
function pulse(prop, peak = 1, dur = 1.4) { if (!gsap || reduced) return; gsap.fromTo(S, { [prop]: peak }, { [prop]: 0, duration: dur, ease: 'power2.out' }); }
function setDetail(i) {
  detail = (i + DETAILS.length) % DETAILS.length;
  const d = DETAILS[detail];
  hsBtns.forEach((b, j) => b.classList.toggle('on', j === detail));
  const card = $('#dCard');
  const fill = () => { $('#dN').textContent = String(detail + 1).padStart(2, '0'); $('#dT').textContent = d.t; $('#dP').textContent = d.p; };
  if (gsap && !reduced) gsap.timeline().to(card, { y: 10, opacity: 0, duration: 0.2, ease: 'power2.in' }).add(fill).to(card, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
  else fill();
  if (d.k === 'light') pulse('flashF', 1.6, 1.6);
  if (d.k === 'tail') pulse('flashR', 1.6, 1.6);
  if (d.k === 'glass') pulse('glassP', 1, 1.8);
  if (d.k === 'charge') pulse('portP', 1, 2.2);
  if (d.k === 'wheel' && gsap && !reduced) gsap.to(S, { wheelSpin: S.wheelSpin - Math.PI * 2, duration: 1.4, ease: 'power3.inOut' });
}
$('#dPrev').addEventListener('click', () => setDetail(detail - 1));
$('#dNext').addEventListener('click', () => setDetail(detail + 1));
hsBtns[0].classList.add('on');

/* ---------- statement words ---------- */
const stEl = $('#stLines');
if (stEl) {
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s); } });
      n.replaceWith(frag);
    } else walk(n);
  });
  walk(stEl);
}
const words = $$('.w', stEl || document);

/* ---------- spec track ---------- */
const track = $('#track'), specs = $('#specs'), bar = $('#trackBar');
const cards = $$('.card', track || document);
let specsST = null, pinMode = !isM && !reduced && gsap && ST;
if (pinMode) {
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: specs, start: 'top top', end: () => '+=' + (dist() + innerWidth * 0.35), pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (st) => bar && (bar.style.transform = `scaleX(${st.progress})`) } });
  specsST = ST.getAll().find((s) => s.trigger === specs);
}
function cardsTick() {
  cards.forEach((c) => {
    const r = c.getBoundingClientRect();
    const p = clamp((Math.min(W, H * 2) - r.left) / (W * 0.45)) * clamp((H - r.top) / (H * 0.35));
    const q = reduced ? (r.top < H && r.left < W ? 1 : 0) : p;
    if (Math.abs((c._p || 0) - q) < 0.002) return;
    c._p = q; c.style.setProperty('--p', q.toFixed(3));
    const n = $('.cnt', c); if (!n) return;
    const to = +n.dataset.to, dec = +(n.dataset.dec || 0), e = 1 - Math.pow(1 - q, 3);
    n.textContent = (to * e).toFixed(dec);
  });
  if (!pinMode && bar && track) { const tw = track.parentElement; const m = tw.scrollWidth - tw.clientWidth; bar.style.transform = `scaleX(${m > 0 ? tw.scrollLeft / m : 1})`; }
}

/* ---------- scroll keyframes for the car ---------- */
const KD = {
  hero: { sx: 0, sy: -0.2, yaw: -0.62, s: 1 },
  st: { sx: 0.56, sy: -0.14, yaw: -2.5, s: 0.74 },
  spA: { sx: 0.16, sy: 0.3, yaw: -2.5, s: 0.74 },
  spB: { sx: 0.16, sy: 0.3, yaw: -5.95, s: 0.74 },
  dA: { sx: 0.2, sy: -0.06, yaw: -6.283, s: 1.12 },
  cta: { sx: -0.44, sy: -0.18, yaw: -6.95, s: 0.95 }
};
const KM = {
  hero: { sx: 0, sy: 0.3, yaw: -0.62, s: 1.5 },
  st: { sx: 0, sy: -0.5, yaw: -2.5, s: 1.25 },
  spA: { sx: 0, sy: 0.12, yaw: -2.5, s: 1.25 },
  spB: { sx: 0, sy: 0.12, yaw: -5.95, s: 1.25 },
  dA: { sx: 0, sy: 0.12, yaw: -6.283, s: 1.62 },
  cta: { sx: 0, sy: 0.4, yaw: -6.95, s: 1.3 }
};
const K = isM ? KM : KD;
let keys = [];
function off(el) { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
function layout() {
  const st = $('.statement'), de = $('#design'), ct = $('#reserve');
  const center = (el) => off(el) + el.offsetHeight / 2 - H / 2;
  let a = specsST ? specsST.start : off(specs) - H * 0.25, b = specsST ? specsST.end : off(specs) + specs.offsetHeight - H * 0.6;
  keys = [
    [0, K.hero], [center(st), K.st], [a, K.spA], [b, K.spB],
    [off(de) - H * 0.05, K.dA], [off(de) + de.offsetHeight - H * 1.05, K.dA], [center(ct), K.cta]
  ];
  // after the CTA the car scrolls away with the page
  const end = Math.max(center(ct) + 1, document.documentElement.scrollHeight - H);
  keys.push([end, { ...K.cta, sy: K.cta.sy + (end - center(ct)) / (H / 2) }]);
  keys.sort((x, y) => x[0] - y[0]);
}
const ease = (t) => t * t * (3 - 2 * t);
function target(y) {
  if (y <= keys[0][0]) return { ...keys[0][1], hp: 1 };
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, A] = keys[i], [b, B] = keys[i + 1];
    if (y <= b) {
      const lt = clamp((y - a) / Math.max(1, b - a)), t = i === keys.length - 2 ? lt : ease(lt);
      const o = {}; for (const k in A) o[k] = lerp(A[k], B[k], t);
      o.hp = i === 0 ? 1 - t : 0; return o;
    }
  }
  return { ...keys[keys.length - 1][1], hp: 0 };
}

/* ---------- hero drag + cursor ---------- */
const hero = $('.hero'), cursor = $('#cursor');
let dragging = false, lastX = 0;
const uiHit = (e) => e.target.closest('button, a, .hero-l, .hero-r');
hero.addEventListener('pointerdown', (e) => { if (uiHit(e)) return; dragging = true; lastX = e.clientX; hero.classList.add('dragging'); cursor && cursor.classList.add('down'); });
addEventListener('pointermove', (e) => {
  if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; dragV = dx * 0.006; dragYaw += dragV; }
  if (cursor && !coarse && !isM) {
    cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
    const over = e.target.closest && e.target.closest('.hero') && !uiHit(e) && scrollY < H * 0.6;
    cursor.classList.toggle('on', !!over);
  }
}, { passive: true });
addEventListener('pointerup', () => { dragging = false; hero.classList.remove('dragging'); cursor && cursor.classList.remove('down'); });
hero.addEventListener('pointerleave', () => cursor && cursor.classList.remove('on'));

/* magnetic pills */
if (!coarse && !reduced && gsap) $$('.mag').forEach((el) => {
  const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.28); qy((e.clientY - r.top - r.height / 2) * 0.4); });
  el.addEventListener('pointerleave', () => { qx(0); qy(0); });
});

/* CTA: concept only, the car answers with a double flash */
const ctaBtn = $('#ctaBtn');
if (ctaBtn) ctaBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const note = $('#ctaNote'); if (note) { note.style.color = 'var(--c3)'; note.textContent = 'Thanks for the interest. This is a concept: no bookings are taken.'; }
  if (gsap && !reduced) gsap.timeline().to(S, { flashF: 1.8, flashR: 1.8, duration: 0.12 }).to(S, { flashF: 0, flashR: 0, duration: 0.25 }).to(S, { flashF: 1.8, flashR: 1.8, duration: 0.12 }).to(S, { flashF: 0, flashR: 0, duration: 0.6 });
});
// nav links via Lenis when present
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2 || a === ctaBtn) return;
  const el = $(id); if (!el) return;
  e.preventDefault();
  const y = id === '#specs' && specsST ? specsST.start + 2 : off(el);
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}));
// keyboard for details while the design section is on screen
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('.trims')) return;
  const de = $('#design').getBoundingClientRect();
  if (de.top < H * 0.5 && de.bottom > H * 0.5) { if (e.key === 'ArrowRight') setDetail(detail + 1); if (e.key === 'ArrowLeft') setDetail(detail - 1); }
});

/* ---------- loop ---------- */
const v3 = new THREE.Vector3();
let last = performance.now(), running = true, tAll = 0;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });
function frame(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now; tAll += dt;
  const y = window.__lenis ? window.__lenis.scroll : scrollY;
  const T = target(y);
  const k = reduced ? 1 : 1 - Math.exp(-6 * dt);
  for (const p of ['sx', 'sy', 's']) cur[p] = lerp(cur[p], T[p], k);
  // drag inertia, only in the hero
  if (!dragging) { dragV *= Math.pow(0.04, dt); dragYaw += dragV; }
  const idle = reduced ? 0 : Math.sin(tAll * 0.45) * 0.07 * T.hp;
  const dYaw = DETAILS[detail].yaw * clamp(1 - Math.abs(cur.sy - K.dA.sy) * 4) * (Math.abs(T.yaw - K.dA.yaw) < 0.05 ? 1 : 0);
  cur.dy = lerp(cur.dy, dYaw, reduced ? 1 : 1 - Math.exp(-4 * dt));
  cur.yaw = lerp(cur.yaw, T.yaw + dragYaw * T.hp + idle + cur.dy, k);
  // intro roll-in
  rig.position.x = S.introX;
  car.group.rotation.y = cur.yaw;
  car.group.position.y = Math.sin(S.hop * Math.PI) * 0.06 * (1 - S.hop);
  car.group.rotation.z = Math.sin(S.hop * Math.PI * 2) * 0.012 * (1 - S.hop);
  const sc = kfit * cur.s; rig.scale.setScalar(sc);
  car.wheels.forEach((w) => (w.rotation.z = S.wheelSpin - S.introX / 0.365));
  // lights
  const n = S.night;
  const fOn = clamp(n + S.flashF * 0.6, 0, 2), rOn = clamp(n + S.flashR * 0.6, 0, 2);
  car.fMat.color.setRGB(0.62 + 0.9 * fOn, 0.68 + 0.86 * fOn, 0.7 + 0.85 * fOn);
  car.rMat.color.set('#F26B3A').multiplyScalar(0.55 + 0.9 * rOn);
  fGlowMat.opacity = 0.22 * fOn; rGlowMat.opacity = 0.3 * rOn;
  poolMat.opacity = 0.5 * n + 0.25 * S.flashF; rPoolMat.opacity = 0.35 * n + 0.15 * S.flashR;
  const breathe = 0.5 + 0.5 * Math.sin(tAll * 2.2);
  portMat.opacity = S.portP * (0.5 + 0.5 * breathe) + n * 0.25;
  car.glassMat.emissiveIntensity = 0.12 * n + 0.5 * S.glassP;
  // shifted lens keeps the perspective and moves the car on screen
  camera.setViewOffset(W, H, -cur.sx * W / 2, cur.sy * H / 2, W, H);
  // hotspots
  const dVis = clamp(1 - Math.abs(cur.yaw - (K.dA.yaw + cur.dy)) * 3) * clamp(1 - Math.abs(cur.sy - K.dA.sy) * 6) * clamp(1 - Math.abs(cur.s - K.dA.s) * 6);
  car.group.updateMatrixWorld(true); rig.updateMatrixWorld(true);
  DETAILS.forEach((d, i) => {
    const b = hsBtns[i];
    v3.copy(car.anchors[d.k]).applyMatrix4(car.group.matrixWorld).project(camera);
    b.style.transform = `translate(${((v3.x + 1) / 2 * W).toFixed(1)}px,${((1 - v3.y) / 2 * H).toFixed(1)}px)`;
    const on = dVis > 0.5; b.style.opacity = dVis.toFixed(2); b.style.pointerEvents = on ? 'auto' : 'none'; b.tabIndex = on ? 0 : -1;
  });
  // names leave with the hero
  namesEl.style.transform = `translateY(${(-y * 0.35).toFixed(1)}px)`;
  namesEl.style.opacity = clamp(1 - y / (H * 0.9)).toFixed(3);
  // statement words
  if (words.length) {
    const r = stEl.getBoundingClientRect();
    const p = clamp((H * 0.82 - r.top) / (r.height + H * 0.3));
    const lit = Math.floor(p * (words.length + 1));
    words.forEach((w, i) => w.classList.toggle('lit', reduced || i < lit));
  }
  cardsTick();
  // render: mirror pass then the scene
  renderer.autoClear = false; renderer.clear();
  {
    floor.visible = shadow.visible = pool.visible = rPool.visible = fGlow.visible = rGlow.visible = port.visible = false;
    car.group.scale.y = -1; car.group.position.y = -car.group.position.y;
    renderer.render(scene, camera);
    car.group.scale.y = 1; car.group.position.y = -car.group.position.y;
    floor.visible = shadow.visible = pool.visible = rPool.visible = fGlow.visible = rGlow.visible = port.visible = true;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
reveals();
smooth();
resize();
addEventListener('resize', () => { resize(); placeInd(); layout(); });
if (ST) ST.addEventListener('refresh', layout);
layout();
placeInd();
const loader = $('#loader');
(document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve()).then(() => {
  fitNames(); placeInd(); if (ST) ST.refresh(); layout();
  requestAnimationFrame(frame);
  if (reduced || !gsap) { loader && loader.remove(); return; }
  const pc = $('.ld-pc b'), barI = $('.ld-bar i'), o = { v: 0 };
  gsap.timeline()
    .to(o, { v: 100, duration: 0.9, ease: 'power2.inOut', onUpdate: () => { pc.textContent = Math.round(o.v); barI.style.width = o.v + '%'; } })
    .add(() => loader.classList.add('out'))
    .fromTo($$('span', nmEls[0]), { yPercent: 112 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.07 }, '+=0.15')
    .to(S, { introX: 0, duration: 2.2, ease: 'expo.out' }, '<0.05')
    .from(['.hero-l > *', '.hero-r > *', '.topnav', '.drag-hint'], { y: 26, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, '<0.5')
    .add(() => setTimeout(() => loader.remove(), 900));
});
