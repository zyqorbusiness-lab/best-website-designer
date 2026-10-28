/* Stride Aero - Concept 01 - Zyqor Lab.  Colourway morph in a browser card + feature callouts.
   One module for both builds: the phone page (m.html) takes the light path (isM). */
import { THREE, Q, isM, reduced, coarse, loadGLB, modelURL, makeRenderer, glRenderer, studioEnv, fitObject, variants, reveals, smooth, whenVisible, clamp, damp, lerp } from '../_kit/kit.js';
import { modeSwitch } from './mode.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger;
const root = document.documentElement;

const CW = [
  { name: 'Tide',  v: 'midnight', page: '#DCE3E4', card: '#2B6E8F', ink: '#F1EFEA', acc: '#E8553B', accInk: '#FFF8F2' },
  { name: 'Dune',  v: 'beach',    page: '#EDE6E0', card: '#D8B8AE', ink: '#12313A', acc: '#12313A', accInk: '#F1EFEA' },
  { name: 'Ember', v: 'street',   page: '#E6E4DF', card: '#E8553B', ink: '#12313A', acc: '#12313A', accInk: '#F1EFEA' },
];
const KEYS = ['page', 'card', 'ink', 'acc', 'accInk'];
const setVars = (c) => KEYS.forEach((k) => root.style.setProperty('--' + k, c[k]));
/* Night run mode: every colourway gets a darker, lit-by-headlamp twin */
let night = false;
const mixHex = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
function nv(c) {
  if (!night) return c;
  const hot = c.name === 'Ember';
  const NC = { Tide: '#0F3A4E', Dune: '#213A40', Ember: '#4C1F16' };
  return { ...c, page: '#0D252C', card: NC[c.name] || mixHex(c.card, '#0A1D23', 0.64), ink: '#F1EFEA', acc: hot ? '#F3C9B8' : '#E8553B', accInk: hot ? '#12313A' : '#FFF8F2' };
}
setVars(CW[0]);
const meta = $('meta[name="theme-color"]');

if (gsap && ST) gsap.registerPlugin(ST);
const lenis = smooth();
reveals();
document.addEventListener('click', (e) => { const a = e.target.closest('[data-noop]'); if (a) e.preventDefault(); });

/* ------------------------------------------------------------------ 3D */
const canvas = $('.gl');
const stage = $('.stage') || $('.m-card');
/* round 2: both builds get the same renderer (MSAA on, DPR up to 2) - the phone is no longer a cheaper render */
/* v3 gaps: glRenderer never throws - with no WebGL the still below the canvas stays and the page keeps working */
const renderer = glRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const GL = !renderer.isStub;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer);
/* desktop: real studio HDRI (Poly Haven, CC0) swapped in after first paint; phone keeps the free RoomEnvironment */
const LV = { env: 1, key: 1.5 };
if (GL) useHDRI(renderer, scene, { size: 512, rotation: -0.6, onReady: () => { LV.env = 0.95; LV.key = 1.05; } });
const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
cam.position.set(0, 0, 9);
const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 6, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0xfff1e6, 0.8); rim.position.set(-5, 2, -4); scene.add(rim);
const hemi = new THREE.HemisphereLight(0xffffff, 0x3b4b55, 0.35); scene.add(hemi);
/* night rig: warm ember rim, cool street rim, a headlamp that sweeps the upper */
const cool = new THREE.DirectionalLight(0x8fd6ff, 0); cool.position.set(5, 1.5, -2); scene.add(cool);
const lamp = new THREE.SpotLight(0xfff4e6, 0, 0, 0.32, 0.85, 0); lamp.position.set(-3, 2.2, 7); scene.add(lamp); scene.add(lamp.target);
const N = { n: 0, sweep: 0 };
const RIM_D = new THREE.Color(0xfff1e6), RIM_N = new THREE.Color(0xff6a45);

const rig = new THREE.Group(), spinG = new THREE.Group(), bob = new THREE.Group();
rig.add(spinG); spinG.add(bob); scene.add(rig);

/* contact shadow: blurred radial gradient on a plane */
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const shMat = new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, color: 0x0b2026, opacity: 0.55 });
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shMat);
shadow.rotation.x = -Math.PI / 2; rig.add(shadow);
const glowMat = new THREE.MeshBasicMaterial({ map: shMat.map, transparent: true, depthWrite: false, color: 0xff6a45, opacity: 0, blending: THREE.AdditiveBlending });
const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat); glow.rotation.x = -Math.PI / 2; rig.add(glow);
/* desktop: a real contact shadow (depth from below, blurred twice) that follows the shoe's own silhouette */
const CS = { on: true, op: 0 };
let csRender = null;
if (CS.on) {
  const R = isM ? 384 : 512, SZ = 1.6, FAR = 0.32; /* phone: smaller shadow target only (never the model or textures) */
  const rtA = new THREE.WebGLRenderTarget(R, R), rtB = new THREE.WebGLRenderTarget(R, R);
  rtA.texture.generateMipmaps = rtB.texture.generateMipmaps = false;
  const csG = new THREE.Group(); rig.add(csG);
  const csCam = new THREE.OrthographicCamera(-SZ / 2, SZ / 2, SZ / 2, -SZ / 2, 0, FAR);
  csCam.rotation.x = Math.PI / 2; csG.add(csCam);
  const csMat = new THREE.MeshBasicMaterial({ map: rtA.texture, transparent: true, depthWrite: false, color: 0x0b2026, opacity: 0 });
  const csPlane = new THREE.Mesh(new THREE.PlaneGeometry(SZ, SZ), csMat);
  csPlane.rotation.x = Math.PI / 2; csPlane.scale.y = -1; csPlane.renderOrder = -1; csG.add(csPlane);
  const depthMat = new THREE.MeshDepthMaterial();
  depthMat.onBeforeCompile = (sh) => {
    sh.uniforms.darkness = { value: 2.6 };
    sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 1.0 ), pow( 1.0 - fragCoordZ, 1.6 ) * darkness );');
  };
  depthMat.depthTest = false; depthMat.depthWrite = false;
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv;
      void main(){ vec4 s = texture2D(tex, vUv) * 0.2270270270;
        s += texture2D(tex, vUv + dir * 1.3846153846) * 0.3162162162; s += texture2D(tex, vUv - dir * 1.3846153846) * 0.3162162162;
        s += texture2D(tex, vUv + dir * 3.2307692308) * 0.0702702703; s += texture2D(tex, vUv - dir * 3.2307692308) * 0.0702702703;
        gl_FragColor = s; }`,
    depthTest: false, depthWrite: false,
  });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat));
  const pass = (src, dst, dx, dy) => { blurMat.uniforms.tex.value = src.texture; blurMat.uniforms.dir.value.set(dx, dy); renderer.setRenderTarget(dst); renderer.render(quadScene, quadCam); };
  const clear = new THREE.Color();
  csRender = (y, op, spread) => {
    csG.position.y = y; csMat.opacity = op; if (op < 0.01) return;
    const prevBg = scene.background, prevCol = renderer.getClearColor(clear), prevA = renderer.getClearAlpha();
    const vis = [shadow.visible, glow.visible, csPlane.visible];
    shadow.visible = glow.visible = csPlane.visible = false; scene.background = null;
    scene.overrideMaterial = depthMat; renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(rtA); renderer.clear(); renderer.render(scene, csCam);
    scene.overrideMaterial = null;
    const b = spread / R;
    pass(rtA, rtB, b, 0); pass(rtB, rtA, 0, b);
    pass(rtA, rtB, b * 0.45, 0); pass(rtB, rtA, 0, b * 0.45);
    renderer.setRenderTarget(null); renderer.setClearColor(prevCol, prevA); scene.background = prevBg;
    [shadow.visible, glow.visible, csPlane.visible] = vis;
  };
}
function nightGL(t) {
  const n = N.n;
  scene.environmentIntensity = lerp(LV.env, 0.2, n);
  key.intensity = lerp(LV.key, 0.22, n); hemi.intensity = lerp(0.35, 0.08, n);
  rim.color.copy(RIM_D).lerp(RIM_N, n); rim.intensity = lerp(0.8, 5, n);
  cool.intensity = 3.2 * n;
  const sx = N.sweep < 1 ? lerp(-5, 5, N.sweep) : Math.sin(t * 0.45) * 2.6;
  lamp.position.set(sx, 2.4, 7); lamp.target.position.set(sx * 0.25, 0, 0);
  lamp.intensity = 9 * n * (N.sweep < 1 ? 1.6 : 1);
}

let shoe = null, V = null, anchors = [];
const sw = { yaw: 0, lift: 0, sc: 1, intro: 0 };
let dragYaw = 0, dragVel = 0, dragging = false, lastDrag = 0;
let p = 0, pT = 0; /* pinned scroll progress (desktop) */

/* the shoe model: rotate so it shows its side, toe to the right */
const BASE = { x: 0, y: 0, z: 0 };
/* ---------- round 2 micro-detail: a tiling height atlas (R knit loops, G midsole foam grain, B synthetic pebble),
   projected triplanar in model space so it never follows the UV seams, turned into normals with true-scale derivatives
   (same look at any DPR/zoom, so phone == desktop). Region masks: knit = the source ORM blue channel, sole = below the
   midsole line, panels = the rest. */
const DET = { tex: null, len: { value: 1 } };
/* v3 gaps: the detail map loads with the 3D (after first paint), not at module start */
let detailTex = null;
const loadDetail = () => detailTex || (detailTex = new THREE.TextureLoader().loadAsync('../../assets/lab/stride/stride-detail.webp').then((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); DET.tex = t; return t;
}).catch(() => null));
function addDetail(mat, bb) {
  const lenG = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
  const U = {
    uDet: { value: DET.tex }, uLen: DET.len, uBBMin: { value: bb.min.clone() }, uBBLen: { value: lenG },
    uSoleY: { value: 0.235 * (bb.max.y - bb.min.y) / lenG }, uAmp: { value: new THREE.Vector3(0.0011, 0.0009, 0.00022) },
    uScale: { value: new THREE.Vector3(6.0, 3.2, 9.0) },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vOP; varying vec3 vON;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vOP = position; vON = objectNormal;');
    sh.fragmentShader = `varying vec3 vOP; varying vec3 vON;
uniform sampler2D uDet; uniform float uLen; uniform vec3 uBBMin; uniform float uBBLen; uniform float uSoleY; uniform vec3 uAmp; uniform vec3 uScale;
float dK, dS, dP, dH, dKB;
vec3 triDet(vec3 p, vec3 w) { return texture2D(uDet, p.yz).rgb * w.x + texture2D(uDet, p.xz).rgb * w.y + texture2D(uDet, p.xy).rgb * w.z; }
vec3 bumpTrue(vec3 sp, vec3 n, vec2 dH, float fd) {
  vec3 sx = dFdx(sp), sy = dFdy(sp); vec3 R1 = cross(sy, n), R2 = cross(n, sx);
  float det = dot(sx, R1) * fd; vec3 g = sign(det) * (dH.x * R1 + dH.y * R2);
  return normalize(abs(det) * n - g);
}
` + sh.fragmentShader
      .replace('#include <roughnessmap_fragment>', `{
  vec3 q = (vOP - uBBMin) / uBBLen; vec3 w = pow(abs(normalize(vON)), vec3(4.0)); w /= (w.x + w.y + w.z);
  float kb = texture2D(roughnessMap, vRoughnessMapUv).b;
  dK = smoothstep(0.22, 0.42, kb) * (1.0 - smoothstep(0.78, 0.88, kb)); dKB = kb;
  dS = (1.0 - dK) * (1.0 - smoothstep(uSoleY - 0.012, uSoleY + 0.006, q.y));
  dP = (1.0 - dK) * (1.0 - dS);
  float hk = triDet(q * uScale.x, w).r, hs = triDet(q * uScale.y, w).g, hp = triDet(q * uScale.z, w).b;
  dH = (dK * hk * uAmp.x + dS * hs * uAmp.y + dP * hp * uAmp.z) * uLen;
  diffuseColor.rgb *= mix(1.0, mix(0.74, 1.04, hk), dK) * mix(1.0, mix(0.93, 1.02, hs), dS);
}
#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + dK * 0.08 + dS * 0.06 - dP * 0.14, 0.05, 1.0);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
metalnessFactor = smoothstep(0.8, 0.95, dKB); /* only the eyelets are metal */`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
normal = bumpTrue(-vViewPosition, normal, vec2(dFdx(dH), dFdy(dH)), faceDirection);`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
#ifdef USE_SHEEN
material.sheenColor *= (0.25 + 0.75 * dK);
#endif
#ifdef USE_CLEARCOAT
material.clearcoat *= dP;
#endif`);
  };
  mat.customProgramCacheKey = () => 'stride-detail-r2';
}

/* every colourway becomes a MeshPhysicalMaterial: knit sheen, deeper normal relief, softer spec (less plastic) */
async function buildPhys(gltf) {
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } });
  const VK = await variants(gltf);
  const phys = {}, mesh = []; model.traverse((o) => { if (o.isMesh) mesh.push(o); });
  for (const n of VK.names) {
    await VK.select(n);
    phys[n] = mesh.map((o) => {
      const m = o.material, p = new THREE.MeshPhysicalMaterial();
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) p[k] = m[k];
      /* the source asset marks the knit half-metallic (ORM blue 0.6 x metallicFactor 1): fabric is a dielectric, so metal off; blue becomes the knit mask */
      p.color.copy(m.color); p.roughness = m.roughness; p.metalness = 1; p.aoMapIntensity = 1;
      if (m.normalScale) p.normalScale.copy(m.normalScale).multiplyScalar(1.3);
      p.clearcoat = 0.35; p.clearcoatRoughness = 0.32;
      if (o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); addDetail(p, o.geometry.boundingBox); }
      p.sheen = 0.6; p.sheenRoughness = 0.5; p.sheenColor.set(n === 'midnight' ? 0x8fb6c9 : n === 'beach' ? 0xf3e2da : 0xffc7b5);
      p.specularIntensity = 0.55; p.envMapIntensity = 1;
      p.name = 'stride-' + n; return p;
    });
  }
  return { names: VK.names, phys, mesh, model };
}
let PHYS = null, MESH = [], selV = null;
async function initShoe(gltf) {
  await loadDetail();
  const model = gltf.scene;
  const holder = new THREE.Group(); holder.add(model);
  model.rotation.set(BASE.x, BASE.y, BASE.z);
  fitObject(holder, 1, false);
  /* anchors from the bounding box, measured while the holder is still detached (x = heel->toe, y = sole->collar) */
  holder.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(holder), s = b.getSize(new THREE.Vector3());
  const at = (u, v, w) => { const o = new THREE.Object3D(); o.position.set(b.min.x + s.x * u, b.min.y + s.y * v, b.min.z + s.z * w); bob.add(o); return o; };
  anchors = [at(0.55, 0.62, 0.62), at(0.12, 0.55, 0.6), at(0.24, 0.16, 0.68), at(0.78, 0.04, 0.6)];
  shadow.userData.y = b.min.y - 0.01;
  const B = await buildPhys(gltf);
  PHYS = B.phys; MESH = B.mesh;
  V = { names: B.names, select: async (n) => { const arr = PHYS[n]; selV = n; if (arr) MESH.forEach((o, i) => { o.material = arr[i]; }); } };
  for (const n of [V.names[1], V.names[2], V.names[0]]) await V.select(n); /* warm every variant once */
  if (cur) await V.select(nv(CW[cur]).v); /* a colourway picked while the 3D was loading */
  bob.add(holder);
  shoe = model;
  /* the still already shows the shoe at rest, so the 3D takes its place without the fly-in (the fly-in stays when no still was seen) */
  if (!reduced && !stillShown()) {
    sw.intro = 1;
    gsap.to(sw, { intro: 0, duration: 1.8, ease: 'expo.out', delay: 0.15 });
  }
  canvas.classList.add('ready');
}
/* HD step: same model, full-resolution textures (and its geometry) swapped in place; the light set is freed */
async function upgradeShoe(gltf) {
  const B = await buildPhys(gltf);
  if (B.mesh.length !== MESH.length || !PHYS) { console.info('Stride: HD model layout differs, kept the first one'); return false; }
  const old = PHYS, oldGeo = MESH.map((o) => o.geometry);
  PHYS = B.phys;
  MESH.forEach((o, i) => { o.geometry = B.mesh[i].geometry; });
  await V.select(selV || V.names[0]);
  if (renderer.initTexture) for (const n of V.names) for (const m of PHYS[n]) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) if (m[k]) renderer.initTexture(m[k]);
  const seen = new Set();
  for (const n in old) for (const m of old[n]) { for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) { const t = m[k]; if (t && !seen.has(t)) { seen.add(t); t.dispose(); } } m.dispose(); }
  oldGeo.forEach((g) => g.dispose());
  return true;
}

/* layout: world size of the view at z=0 */
let VW = 1, VH = 1, W = 1, H = 1;
function resize() {
  W = canvas.clientWidth; H = canvas.clientHeight;
  renderer.setSize(W, H, false);
  cam.aspect = W / H; cam.updateProjectionMatrix();
  VH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); VW = VH * cam.aspect;
}
addEventListener('resize', resize);

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t) => 1 - Math.pow(1 - t, 3);
const v3 = new THREE.Vector3();
let last = performance.now(), running = true, tClock = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!running || !shoe) return;
  if (!live && pT > 0.03) goLive(); /* scrolling on: the live shoe follows the scroll story */
  tClock += dt;
  p = isM ? 0 : damp(p, pT, 7, dt);
  const a = ease(clamp(p / 0.28));
  /* drag inertia, then drift back to the hero angle */
  if (!dragging) { dragYaw += dragVel * dt; dragVel *= Math.pow(0.04, dt); if (now - lastDrag > 2200) dragYaw = damp(dragYaw, 0, 1.6, dt); }
  /* hero pose -> tech pose */
  const heroL = isM ? Math.min(VW * 0.86, VH * 0.95) : Math.min(VW * 0.4, VH * 0.95);
  const techL = Math.min(VW * 0.5, VH * 1.2);
  const L = lerp(heroL, techL, a) * sw.sc * (1 - sw.intro * 0.35);
  rig.position.set(lerp(0, VW * 0.05, a), lerp(isM ? -VH * 0.02 : -VH * 0.02, -VH * 0.04, a), 0);
  rig.scale.setScalar(L); DET.len.value = L;
  const idle = reduced ? 0 : Math.sin(tClock * 1.3) * 0.018;
  bob.position.y = idle + sw.lift * 0.35 + sw.intro * 0.9;
  bob.rotation.z = lerp(0.1, 0.02, a) + (reduced ? 0 : Math.sin(tClock * 0.9) * 0.02) - sw.lift * 0.25;
  spinG.rotation.y = lerp(-0.42, 0.02 + (p - 0.28) * 0.35, a) + sw.yaw + dragYaw - sw.intro * 2.2;
  spinG.rotation.x = lerp(0.18, 0.06, a);
  shadow.position.y = shadow.userData.y ?? -0.3;
  const lift = clamp(bob.position.y * 2.2, 0, 1.4);
  shadow.scale.set(1.15 * (1 - lift * 0.3), 0.42 * (1 - lift * 0.3), 1);
  shMat.opacity = 0.5 * (1 - lift * 0.55) * (1 - sw.intro) * (1 + N.n * 0.4);
  glow.position.y = shadow.position.y - 0.002; glow.scale.set(1.9 * (1 - lift * 0.2), 0.8, 1); glowMat.opacity = 0.42 * N.n * (1 - sw.intro) * (0.85 + 0.15 * Math.sin(tClock * 2.1));
  nightGL(tClock);
  if (csRender) {
    CS.op = 1.0 * (1 - clamp(lift * 1.6)) * (1 - sw.intro) * (1 - N.n * 0.35);
    csRender(shadow.position.y + 0.002, CS.op, 2.2 + lift * 6);
    shMat.opacity *= 0.55; /* the wide soft ellipse stays as ambient occlusion around it */
  }
  renderer.render(scene, cam);
  if (!isM) dom(a);
}

/* ------------------------------------------------------- desktop scroll DOM */
const card = $('.card'), heroBits = $$('.browser, .cnav, .hero-ui'), giant = $('.giant'), tHead = $('.t-head');
const cos = $$('.co'), linesSvg = $('.lines'), tp = $('.tp'), tpBar = $('.t-prog');
const cue = $('.scrollcue'), g3 = $('.g3');
const CO_POS = [{ x: 0.67, y: 0.16 }, { x: 0.06, y: 0.6 }, { x: 0.17, y: 0.83 }, { x: 0.7, y: 0.76 }];
let lastA = -1, lastP = -1;
const RM = reduced;
function dom(a) {
  if (RM) return;
  if (Math.abs(a - lastA) > 0.0005) {
    card.style.setProperty('--i', (1 - a).toFixed(4)); giant.style.setProperty('--i', (1 - a).toFixed(4));
    heroBits.forEach((el) => { el.style.opacity = clamp(1 - a * 1.8); el.style.transform = `translateY(${(-a * 40).toFixed(1)}px)`; el.style.visibility = a > 0.6 ? 'hidden' : ''; });
    giant.style.opacity = 1 - a * 0.55;
    giant.style.transform = `scale(${1 + a * 0.25}) translateY(${a * -4}vh)`;
    tHead.style.opacity = clamp((a - 0.55) / 0.45); g3.style.opacity = clamp(1 - a * 2);
    tHead.style.transform = `translateY(${(1 - eo(clamp((a - 0.5) / 0.5))) * 30}px)`;
    lastA = a;
  }
  /* callouts: pills + leader lines that follow the 3D anchors every frame */
  let svg = '', shown = 0;
  cos.forEach((el, i) => {
    const c = clamp((p - 0.32 - i * 0.135) / 0.1);
    if (c > 0.02) shown = i + 1;
    if (Math.abs(c - (el._c ?? -1)) > 0.001) { el.style.opacity = c; el.style.transform = `translateY(${(1 - eo(c)) * 14}px) scale(${0.96 + 0.04 * eo(c)})`; el._c = c; }
    if (c <= 0.001 || !anchors[i]) return;
    anchors[i].getWorldPosition(v3); v3.project(cam);
    const ax = (v3.x * 0.5 + 0.5) * W, ay = (-v3.y * 0.5 + 0.5) * H;
    const r = el.getBoundingClientRect();
    const left = r.left + r.width / 2 > ax;
    const ex = left ? r.left : r.right, ey = r.top + r.height / 2;
    const mx = ex + (left ? -36 : 36);
    const d1 = Math.hypot(mx - ax, ey - ay), d2 = 36, len = d1 + d2, dl = len * eo(c);
    svg += `<path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${mx.toFixed(1)},${ey.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${(len - dl).toFixed(1)}"/>`;
    svg += `<circle class="ring" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="${(8 + 6 * ((tClock * 0.8 + i * 0.3) % 1)).toFixed(1)}" opacity="${(c * (1 - ((tClock * 0.8 + i * 0.3) % 1))).toFixed(2)}"/>`;
    svg += `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="${(5 * eo(c)).toFixed(1)}"/>`;
  });
  linesSvg.innerHTML = svg;
  if (shown !== lastP) { tp.textContent = String(Math.max(1, shown)).padStart(2, '0'); lastP = shown; }
  tpBar.style.setProperty('--tp', clamp((p - 0.3) / 0.62).toFixed(3));
  cue.style.opacity = 0;
}
function placeCallouts() { cos.forEach((el, i) => { el.style.left = CO_POS[i].x * 100 + 'vw'; el.style.top = CO_POS[i].y * 100 + 'vh'; }); }

/* ------------------------------------------------------- colourway switch */
let cur = 0, busy = false, auto = null, interacted = false, pending = null;
function done() { busy = false; if (pending) { const q = pending; pending = null; go(q.i, q.from, false); } else if (nightQ) { const q = nightQ; nightQ = null; setNight(q.on, q.from); } }
const nameEls = $$('.cwn');
function rollText(el, txt) {
  if (reduced || !gsap) { el.textContent = txt; return; }
  gsap.to(el, { yPercent: -60, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { el.textContent = txt; gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }); } });
}
function syncUI(i) {
  $$('.sw').forEach((b, k) => b.setAttribute('aria-selected', k === i ? 'true' : 'false'));
  $$('.dot').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
  const cn = $('.cnum'); if (cn) cn.textContent = String(i + 1).padStart(2, '0');
  nameEls.forEach((el) => rollText(el, CW[i].name));
  if (meta) meta.setAttribute('content', nv(CW[i]).page);
}
function flood(c, ox, oy) {
  const f = $('.flood'); if (!f) return;
  f.style.setProperty('--nextc', c.card);
  gsap.fromTo(f, { clipPath: `circle(0% at ${ox}px ${oy}px)` }, { clipPath: `circle(150% at ${ox}px ${oy}px)`, duration: 0.95, ease: 'power3.inOut',
    onComplete: () => { root.style.setProperty('--card', c.card); gsap.set(f, { clipPath: `circle(0% at ${ox}px ${oy}px)` }); } });
}
async function go(i, from, user = true) {
  i = (i + CW.length) % CW.length;
  if (user) stopAuto();
  if (busy) { pending = { i, from }; return; }
  if (i === cur) return;
  if (V) goLive(); /* a colourway pick while the still shows: the 3D (already loaded) takes over now */
  busy = true; const dir = i > cur || (cur === CW.length - 1 && i === 0) ? 1 : -1; cur = i;
  const c = nv(CW[i]);
  syncUI(i);
  if (reduced || !gsap) { setVars(c); root.style.setProperty('--card', c.card); if (V) await V.select(c.v); else setStill(i); done(); return; }
  /* where the colour flood starts: the control that was used, else the card centre */
  const sr = stage.getBoundingClientRect();
  let ox = sr.width / 2, oy = sr.height / 2;
  if (from && from.getBoundingClientRect) { const r = from.getBoundingClientRect(); ox = r.left + r.width / 2 - sr.left; oy = r.top + r.height / 2 - sr.top; }
  flood(c, ox, oy);
  const vars = {}; KEYS.forEach((k) => { if (k !== 'card') vars['--' + k] = c[k]; });
  gsap.to(root, { ...vars, duration: 0.9, ease: 'power2.inOut' });
  const L = $$('.gw > span');
  if (L.length) gsap.timeline().to(L, { yPercent: -105, duration: 0.38, ease: 'power3.in', stagger: 0.045 * dir })
    .set(L, { yPercent: 105 }).to(L, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 * dir });
  if (!V) { setStill(i); setTimeout(done, 650); return; } /* 3D not in yet, or no WebGL: the still follows the colourway */
  await new Promise((res) => gsap.to(sw, { yaw: 1.5 * dir, lift: 1, sc: 0.84, duration: 0.42, ease: 'power3.in', onComplete: res }));
  await V.select(c.v);
  sw.yaw = -1.9 * dir;
  gsap.to(sw, { yaw: 0, lift: 0, sc: 1, duration: 1.15, ease: 'expo.out' });
  setTimeout(done, 650);
}
/* auto-advance with a progress ring on the active dot (desktop, until the visitor takes over) */
let autoTw = null;
function startAuto() {
  if (reduced || isM || interacted || !gsap) return;
  const dot = $$('.dot')[cur]; if (!dot) return;
  autoTw && autoTw.kill();
  autoTw = gsap.fromTo(dot, { '--p': 0 }, { '--p': 1, duration: 5, ease: 'none', onComplete: () => { if (p < 0.05 && running && !document.hidden) go(cur + 1, null, false).then(() => setTimeout(startAuto, 50)); else startAuto(); } });
}
function stopAuto() { interacted = true; autoTw && autoTw.kill(); $$('.dot').forEach((d) => d.style.setProperty('--p', 1)); }

$$('.sw, .dot').forEach((b) => b.addEventListener('click', () => go(+b.dataset.i, b)));
const pv = $('.prev'), nx = $('.next');
pv && pv.addEventListener('click', () => go(cur - 1, pv));
nx && nx.addEventListener('click', () => go(cur + 1, nx));
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input,textarea')) return;
  const r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || p > 0.2) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, nx); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, pv); }
});

/* drag: desktop spins the shoe; phone swipes change the colourway */
let sx = 0, sy = 0, lx = 0, lt = 0, swipe = false;
canvas.addEventListener('pointerdown', (e) => {
  goLive();
  dragging = true; swipe = false; sx = lx = e.clientX; sy = e.clientY; lt = performance.now(); dragVel = 0;
  if (!isM) canvas.setPointerCapture(e.pointerId); stopAuto();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const now = performance.now(), dx = e.clientX - lx;
  if (isM) { if (Math.abs(e.clientX - sx) > 12 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) swipe = true; if (swipe) dragYaw += dx * 0.004; }
  else { dragYaw += dx * 0.009; dragVel = (dx * 0.009) / Math.max(0.008, (now - lt) / 1000); }
  lx = e.clientX; lt = now; lastDrag = now;
});
const endDrag = (e) => {
  if (!dragging) return; dragging = false; lastDrag = performance.now();
  if (isM) { const d = e.clientX - sx; if (swipe && Math.abs(d) > 46) go(cur + (d < 0 ? 1 : -1), null); }
};
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

/* ------------------------------------------------------- cursor + magnets (desktop) */
if (!isM && !coarse) {
  const cur$ = $('.cursor'), lab = cur$ && $('span', cur$);
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; cur$.style.opacity = 1; });
  document.addEventListener('pointerleave', () => { cur$.style.opacity = 0; });
  const tick = () => { cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22); cur$.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tick); };
  tick();
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cur], .gl');
    if (!t || (t === canvas && p > 0.25)) { cur$.classList.remove('big'); return; }
    lab.textContent = t === canvas ? 'Drag' : t.dataset.cur; cur$.classList.add('big');
  });
  if (!reduced && gsap) $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
  });
}

/* ------------------------------------------------------- scroll links */
function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
let pinST = null;
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id === '#') return;
  e.preventDefault();
  if (id === '#main') return scrollToY(0);
  if (id === '#tech' && pinST) return scrollToY(pinST.start + (pinST.end - pinST.start) * 0.9);
  const t = $(id); if (t) scrollToY(t.getBoundingClientRect().top + scrollY - (isM ? 20 : 0));
}));

/* ------------------------------------------------------- specs odometer */
function odometers() {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    $$('.od', en.target).forEach((od, k) => { const r = $('.od-r', od); r.style.transitionDelay = reduced ? '0s' : (0.15 + k * 0.12) + 's'; r.style.transform = `translateY(-${od.dataset.v}em)`; });
  }), { threshold: 0.4 });
  $$('.sp li').forEach((li) => io.observe(li));
}
odometers();

/* ------------------------------------------------------- size picker */
const szv = $('.szv');
$$('.sz').forEach((b) => b.addEventListener('click', () => {
  $$('.sz').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  const nv = b.dataset.s; if (szv.textContent === nv) return;
  if (reduced || !gsap) { szv.textContent = nv; return; }
  const up = parseFloat(nv) > parseFloat(szv.textContent) ? 1 : -1;
  gsap.timeline().to(szv, { yPercent: -100 * up, duration: 0.28, ease: 'power3.in' }).add(() => { szv.textContent = nv; }).fromTo(szv, { yPercent: 100 * up }, { yPercent: 0, duration: 0.7, ease: 'expo.out' });
}));
$$('.wd').forEach((b) => b.addEventListener('click', () => { $$('.wd').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); const w = $('.wdv'); if (w) w.textContent = b.textContent; }));
let bag = 0; const add = $('.addbag');
add && add.addEventListener('click', () => {
  bag++; const n = $('.bagn'), bb = $('.bagbtn');
  if (n) { n.textContent = bag; bb.setAttribute('aria-label', `Bag (concept), ${bag} item${bag > 1 ? 's' : ''}`); if (gsap && !reduced) gsap.fromTo(n, { scale: 1.8 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.4)' }); }
  add.classList.add('done'); $('.ab-t', add).textContent = 'Added (concept)';
  clearTimeout(add._t); add._t = setTimeout(() => { add.classList.remove('done'); $('.ab-t', add).textContent = 'Add to bag'; }, 2400);
});

/* ------------------------------------------------------- night run mode */
const modeBtns = $$('.mode');
let modeBusy = false, nightQ = null;
function setNight(on, from) {
  if (modeBusy || on === night) return;
  /* a colourway morph is running (autoplay or a click): queue the switch so the tap is never lost */
  if (busy) { stopAuto(); nightQ = { on, from }; return; }
  modeBusy = true; stopAuto();
  const L = $$('.gw > span');
  const apply = () => {
    if (gsap) gsap.killTweensOf(root); /* a colourway colour tween must not repaint over the new mode */
    night = on; root.classList.toggle('night', on);
    modeBtns.forEach((b) => { b.setAttribute('aria-pressed', on ? 'true' : 'false'); const t = $('.ml', b); if (t) t.textContent = on ? 'Night run' : 'Day run'; });
    const c = nv(CW[cur]); setVars(c); if (meta) meta.setAttribute('content', c.page);
    N.n = on ? 1 : 0; N.sweep = on ? 0 : 1;
  };
  const after = () => {
    if (reduced || !gsap) { N.sweep = 1; return; }
    if (on) {
      /* the headlamp sweeps nose to heel, then the giant letters strike on like a sign */
      gsap.to(N, { sweep: 1, duration: 1.5, ease: 'power2.inOut' });
      gsap.fromTo(L, { opacity: 0.08 }, { keyframes: { opacity: [0.08, 1, 0.25, 1, 0.6, 1] }, duration: 0.9, ease: 'none', stagger: 0.11 });
      gsap.fromTo(sw, { lift: 0.9, sc: 0.94 }, { lift: 0, sc: 1, duration: 1.4, ease: 'expo.out' });
    } else {
      gsap.fromTo(L, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05 });
    }
  };
  modeSwitch({ apply, after, reduced, shape: 'circle', duration: 1100, origin: from }).then(() => { modeBusy = false; });
  if (reduced || !document.startViewTransition) modeBusy = false;
}
modeBtns.forEach((b) => b.addEventListener('click', () => setNight(!night, b)));
if (!isM && !coarse) {
  const lampEl = $('.lampfx');
  stage.addEventListener('pointermove', (e) => { if (!night || !lampEl) return; const r = stage.getBoundingClientRect(); lampEl.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); lampEl.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
}

/* ------------------------------------------------------- boot */
$$('.dot').forEach((b, k) => b.classList.toggle('on', k === 0));
resize();
if (!isM) placeCallouts();
whenVisible(isM ? canvas : stage, (v) => { running = v; if (v) last = performance.now(); });
requestAnimationFrame(frame);

function bootScroll() {
  if (isM || !ST) return;
  if (!reduced && GL) {
    pinST = ST.create({ trigger: stage, start: 'top top', end: '+=240%', pin: true, anticipatePin: 1, onUpdate: (s) => { pT = s.progress; } });
    gsap.fromTo('.r1', { xPercent: 0 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.r2', { xPercent: -14 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  } else {
    /* reduced motion (and no WebGL, where nothing would move while pinned): no pinning; the callouts become a static block under the hero */
    document.body.classList.add('rm');
    const tech = $('.tech'); if (tech) stage.after(tech);
  }
}
bootScroll();
/* ------------------------------------------------------- first screen (v3 gaps, Oct 28)
   1. The still (a render of this same model at rest) is in the HTML, so the shoe is on screen at first paint.
   2. After first paint + idle, the light copy of the model (same mesh, small textures, 0.3 MB) loads and is
      built, ready for touch: a drag or a colourway pick swaps the still for live 3D at once.
   3. The full model (3.7 MB, the same file on desktop and phone) streams in with real byte progress; when it
      is in, its textures and geometry replace the light ones and the 3D takes the still's place.
   No WebGL: nothing 3D is downloaded and the still stays (colourway picks swap it for that colourway's still). */
const still = $('.st-still'), prog = $('.st-prog');
const ASSET = '../../assets/lab/stride/', LIGHT = ASSET + 'stride-m.glb', FULL = ASSET + 'stride-d.glb';
const BYTES = { light: 315728, full: 3736500 };
const STILL = (i) => `${ASSET}stride-still-${isM ? 'm' : 'd'}-${i}.webp`;
let live = false;
function stillShown() { return !!(still && still.complete && still.naturalWidth && !live); }
function setStill(i) { if (still && !live) still.src = STILL(i); }
function goLive() {
  if (live || !shoe) return;
  live = true; stage.classList.add('st-live');
}
function setProg(f) {
  if (!prog) return;
  const pct = Math.round(clamp(f) * 100);
  prog.hidden = false; prog.style.setProperty('--f', clamp(f).toFixed(3));
  const n = prog.querySelector('.st-prog-n'); if (n) n.textContent = pct + '%';
  prog.setAttribute('aria-valuenow', String(pct));
}
function endProg() { if (!prog) return; prog.classList.add('done'); setTimeout(() => { prog.hidden = true; }, 800); }
const afterFirstPaint = () => new Promise((res) => {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(res, { timeout: 500 }) : setTimeout(res, 60));
  const paint = () => requestAnimationFrame(() => requestAnimationFrame(idle));
  const ready = still && !still.complete ? still.decode().catch(() => {}) : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(paint);
});
async function load3D() {
  if (!GL) { if (prog) prog.hidden = true; return; }
  await afterFirstPaint();
  const W8 = BYTES.light / (BYTES.light + BYTES.full);
  setProg(0);
  const light = await loadGLB(LIGHT, (e) => setProg(W8 * clamp(e.loaded / (e.total || BYTES.light))));
  await initShoe(light);
  startAuto();
  try {
    const full = await loadGLB(FULL, (e) => setProg(W8 + (1 - W8) * clamp(e.loaded / (e.total || BYTES.full))));
    setProg(1);
    await upgradeShoe(full);
    root.classList.add('st-hd');
  } catch (e) { console.info('Stride: full-resolution textures unavailable, kept the light set', e && e.message); }
  requestAnimationFrame(() => requestAnimationFrame(goLive));
  endProg();
}
load3D().catch((e) => { console.info('3D model unavailable', e && e.message); canvas.style.display = 'none'; endProg(); });
