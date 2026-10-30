/* P042 Tally Pad - shared app for index.html (desktop) and m.html (phone). Spec: work/beast/specs/tally-pad_SPEC.md.
   One fixed three.js stage behind the page; each pinned section (CSS sticky, no layout shift) reports a progress 0..1
   that drives the camera, the explode, the key presses, the dial and the light. Reduced motion: every section shows
   its end state, nothing scrubs. No WebGL: the poster stays. */
import { landing } from '../../_kit/landing.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildPad, contactShadow, setLight, setFinish, LIGHTS, FINISHES } from './pad.js';
landing();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const M = document.documentElement.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* dial ticks strip */
const ticksEl = $('.tp-ticks'); if (ticksEl) ticksEl.innerHTML = Array.from({ length: 24 }, () => '<i></i>').join('');

const stage = $('.tp-stage'), canvas = $('.tp-gl'), poster = $('.tp-poster');
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { stage.classList.add('is-nogl'); }

/* ---------- camera keyframes per scene (pad units: 1 = 10 mm). Desktop frames the pad right of the copy; phone above it ---------- */
const K = {
  hero:    { pos: V(14, 12, 24),  tgt: V(0, 0.8, 0), sx: 0.2,  sy: 0.02 },
  explode: { pos: V(24, 11, 19),  tgt: V(0, 2.4, 0), sx: 0.21, sy: 0 },
  keys:    { pos: V(6, 21, 21),   tgt: V(-0.6, 1.2, 0), sx: 0.17, sy: 0 },
  dial:    { pos: V(19, 13, 15),  tgt: V(2.2, 1.4, 0), sx: 0.21, sy: 0 },
  light:   { pos: V(0.01, 40, 11), tgt: V(0, 0, 0.6), sx: 0.21, sy: 0 }
};
/* phone: portrait frame is narrow, so the camera stands ~2x further back and the model sits in the top half */
if (M) for (const k of Object.values(K)) { k.pos.multiplyScalar(k === K.hero || k === K.explode ? 1.9 : 1.7); k.sx = 0; k.sy = -0.2; }
const order = ['hero', 'explode', 'keys', 'dial', 'light'];
const secs = order.map((id) => document.getElementById(id));

let pad, L, caps, dial, scene, cam, keyLight;
const st = { light: 0, lightLock: -1, finish: 0, presses: 0, detent: 0, flash: 0 };
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  import('../../../assets/hdri/hdri.js').then((m) => m.useHDRI(renderer, scene, { size: 1024, intensity: 1.0 })).catch(() => {});
  keyLight = new THREE.DirectionalLight(0xfff3e6, 1.1); keyLight.position.set(-6, 12, 9); scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xe3eef6, 0.7); rim.position.set(8, 5, -9); scene.add(rim);
  pad = buildPad({ maxAniso: renderer.capabilities.getMaxAnisotropy() });
  ({ L, caps, dial } = pad.userData);
  scene.add(pad); scene.add(contactShadow());
  pad.userData.glow = new THREE.PointLight(LIGHTS[0].hex, 6, 9, 2); pad.userData.glow.position.set(0, -0.6, 4.6); scene.add(pad.userData.glow);
  cam = new THREE.PerspectiveCamera(M ? 34 : 28, 1, 0.1, 200);
  size(); addEventListener('resize', size);
  renderer.compile(scene, cam);
  requestAnimationFrame(frame);
}
function size() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
}

/* ---------- scroll state ---------- */
function sceneState() {
  const vh = innerHeight; let idx = 0, p = 0;
  for (let i = 0; i < secs.length; i++) {
    const r = secs[i].getBoundingClientRect();
    if (r.top <= vh * 0.5) { idx = i; const len = Math.max(1, r.height - vh); p = i === 0 ? clamp(-r.top / vh) : clamp(-r.top / len); }
  }
  if (reduced) p = 1;
  return { idx, p };
}
/* blend the camera between the previous scene's frame and this scene's frame over the first 18 % of a section */
const camPos = V(0, 0, 0), camTgt = V(0, 0, 0), sPos = K.hero.pos.clone(), sTgt = K.hero.tgt.clone();
const vo = { x: K.hero.sx, y: K.hero.sy };
let first = true, t0 = performance.now(), smP = [0, 0, 0, 0, 0];
const orderSec = document.getElementById('order');

function frame(now) {
  requestAnimationFrame(frame);
  const { idx, p } = sceneState();
  for (let i = 0; i < 5; i++) { const target = i < idx ? 1 : i === idx ? p : 0; smP[i] = reduced ? target : lerp(smP[i], target, 0.14); }
  const name = order[idx], prev = order[Math.max(0, idx - 1)];
  const blend = idx === 0 ? 1 : io(ss(0, 0.18, smP[idx]));
  camPos.copy(K[prev].pos).lerp(K[name].pos, blend); camTgt.copy(K[prev].tgt).lerp(K[name].tgt, blend);
  /* hero intro settle + idle float */
  const t = (now - t0) / 1000;
  const intro = reduced ? 1 : ss(0, 0.9, t);
  pad.position.y = (1 - intro) * 0.6 * Math.cos(intro * 9) + (reduced ? 0 : Math.sin(t * 1.57) * 0.08);
  if (first) { sPos.copy(camPos); sTgt.copy(camTgt); first = false; }
  sPos.lerp(camPos, reduced ? 1 : 0.12); sTgt.lerp(camTgt, reduced ? 1 : 0.12);
  cam.position.copy(sPos); cam.lookAt(sTgt);
  /* screen-space framing: shift the picture, not the view direction, so the pad never rolls */
  const sx = lerp(K[prev].sx, K[name].sx, blend), sy = lerp(K[prev].sy, K[name].sy, blend);
  vo.x = reduced ? sx : lerp(vo.x, sx, 0.12); vo.y = reduced ? sy : lerp(vo.y, sy, 0.12);
  cam.setViewOffset(innerWidth, innerHeight, -vo.x * innerWidth, -vo.y * innerHeight, innerWidth, innerHeight);
  /* pointer follow (desktop) / slow auto-turn (phone) only in the hero */
  const heroK = idx === 0 ? 1 - smP[0] : 0;
  pad.rotation.y = heroK * (M ? Math.sin(t * 0.4) * 0.07 : ptr.x * 0.1) + (idx === 4 ? 0 : 0);
  pad.rotation.x = heroK * (M ? 0 : ptr.y * 0.05);

  /* explode: layers lift with a stagger; reassemble during the keys scene */
  const ex = smP[1] * (1 - ss(0, 0.15, smP[2]));
  const lift = (k, a) => ss(0.15 + a * 0.08, 0.6 + a * 0.08, ex);
  L.caps.position.y = L.caps.userData.y0 + 2.6 * lift('caps', 0);
  L.switches.position.y = L.switches.userData.y0 + 1.6 * lift('sw', 1);
  L.pcb.position.y = L.pcb.userData.y0 + 0.4 * lift('pcb', 2) - 0.9 * lift('pcb', 2) * 0;
  $$('.tp-layers li').forEach((li, i) => li.classList.toggle('is-on', ex > 0.25 + i * 0.12 || (reduced && idx >= 1)));

  /* keys: three presses at 0.3 / 0.5 / 0.7 */
  const kp = idx === 2 ? smP[2] : idx > 2 ? 1 : 0;
  let n = 0;
  caps.forEach((c, i) => {
    const at = 0.3 + i * 0.2, d = kp - at;
    const press = d > 0 ? (d < 0.06 ? ss(0, 0.02, d) * (1 - ss(0.03, 0.06, d)) : 0) : 0;
    c.position.y = c.userData.y0 - 0.3 * press; if (kp >= at) n++;
  });
  if (n !== st.presses) { st.presses = n; st.flash = 1; const el = $('#ky-n'); if (el) el.textContent = n; $$('.tp-keys li').forEach((li, i) => li.classList.toggle('is-on', i < n)); }

  /* dial: 24 detents, snap inside each 15 deg step */
  const dp = idx === 3 ? ss(0.1, 0.95, smP[3]) : idx > 3 ? 1 : 0;
  const raw = dp * 24, k = Math.floor(raw), f = raw - k, snap = k + (f * f * (3 - 2 * f));
  dial.rotation.y = -snap * (Math.PI * 2 / 24);
  const det = Math.min(24, Math.round(raw));
  if (det !== st.detent) { st.detent = det; const el = $('#dl-n'); if (el) el.textContent = String(det).padStart(2, '0'); $$('.tp-ticks i').forEach((x, i) => x.classList.toggle('is-on', i < det)); }

  /* light: four colours across the light scene unless a button locked one */
  let li = st.lightLock >= 0 ? st.lightLock : (idx === 4 ? (smP[4] < 0.2 ? 0 : smP[4] < 0.45 ? 1 : smP[4] < 0.7 ? 2 : 3) : 0);
  if (li !== st.light) { st.light = li; $$('.tp-sw button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === li))); document.body.style.setProperty('--tint', LIGHTS[li].hex); }
  document.body.classList.toggle('is-tint', idx === 4);
  st.flash = Math.max(0, st.flash - 0.05);
  const breathe = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 1.96);
  setLight(pad, LIGHTS[st.light].hex, intro * (breathe + st.flash * 0.9));
  pad.userData.glow.color.set(LIGHTS[st.light].hex); pad.userData.glow.intensity = 6 * intro * (breathe + st.flash);

  /* the stage steps back for the order form */
  const orr = orderSec.getBoundingClientRect(), fade = clamp(1 - (innerHeight - orr.top) / (innerHeight * 0.6));
  stage.style.opacity = String(fade);
  if (fade > 0.01) renderer.render(scene, cam);
  if (!stage.classList.contains('is-live')) { stage.classList.add('is-live'); }
}
const ptr = { x: 0, y: 0 };
if (!M) addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

/* light buttons lock a colour; finish buttons recolour the case and fill the form */
$$('.tp-sw button').forEach((b) => b.addEventListener('click', () => { st.lightLock = +b.dataset.light; }));
$$('.tp-finish button').forEach((b) => b.addEventListener('click', () => {
  const i = +b.dataset.fin; st.finish = i; $$('.tp-finish button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (pad) setFinish(pad, FINISHES[i]); const sel = $('#od-finish'); if (sel) sel.value = FINISHES[i].name;
  if (stage) { stage.style.opacity = '1'; }
}));

/* QA hook */
window.__p042 = { state: st, ready: () => !!pad, gl: !!renderer };
