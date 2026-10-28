/* Liquid Glass UI · 3D scene example · Zyqor Studio · MIT
   A CC0 glass vase with flowers (Khronos glTF sample) and a transmission glass capsule, lit by a CC0 studio HDRI,
   with the kit's glass controls floating over the live canvas. Same model and HDRI on desktop and phone. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const phone = document.documentElement.dataset.build === 'phone';
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = document.getElementById('scene');
const poster = document.getElementById('poster');
const state = { spin: !rm, light: 1, orb: true, visible: true, dirty: true };

function fail() { host.classList.add('is-poster'); if (poster) { poster.src = poster.dataset.src; poster.hidden = false; } }

function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

async function start() {
  if (!webglOK()) return fail();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return fail(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.75 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(phone ? 34 : 28, 1, 0.05, 50);
  const target = new THREE.Vector3(0, 0.17, 0);

  // contact shadow: a soft radial disc drawn on a canvas (no extra download)
  const sc = document.createElement('canvas'); sc.width = sc.height = 256;
  const g = sc.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(12,52,64,.34)'); gr.addColorStop(.5, 'rgba(12,52,64,.10)'); gr.addColorStop(1, 'rgba(12,52,64,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.001; scene.add(shadow);

  // the glass capsule (MeshPhysicalMaterial transmission)
  const orb = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.09, 12, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.06, thickness: 0.06, ior: 1.45,
      metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, attenuationColor: new THREE.Color('#F2B48F'), attenuationDistance: 0.35, specularIntensity: 1 }));
  orb.rotation.z = Math.PI / 2.6; scene.add(orb);

  // opaque backdrop (paper + a soft accent glow), so transmission glass has a real scene to bend
  const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 640;
  const bg = bc.getContext('2d');
  const cs = getComputedStyle(document.documentElement);
  const C1 = cs.getPropertyValue('--c1').trim() || '#F4EEE3', C3 = cs.getPropertyValue('--c3').trim() || '#EC7E46', C2 = cs.getPropertyValue('--c2').trim() || '#0A2F3A';
  bg.fillStyle = C1; bg.fillRect(0, 0, 1024, 640);
  const glow = bg.createRadialGradient(512, 300, 0, 512, 300, 360); glow.addColorStop(0, C3 + '66'); glow.addColorStop(1, C3 + '00');
  bg.fillStyle = glow; bg.fillRect(0, 0, 1024, 640);
  const floor = bg.createLinearGradient(0, 380, 0, 640); floor.addColorStop(0, C2 + '00'); floor.addColorStop(1, C2 + '22');
  bg.fillStyle = floor; bg.fillRect(0, 380, 1024, 260);
  const btex = new THREE.CanvasTexture(bc); btex.colorSpace = THREE.SRGBColorSpace;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: btex, toneMapped: false }));
  back.position.set(0, 0.6, -1.6); scene.add(back);
  const vase = new THREE.Group(); scene.add(vase);

  try {
    const hdr = await new RGBELoader().setDataType(THREE.HalfFloatType).loadAsync(new URL('assets/hdri/studio_512.hdr', location.href).href);
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(hdr).texture; pm.dispose(); hdr.dispose();
    scene.environmentIntensity = 1;
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('assets/model/glass-vase-flowers.glb');
    const m = gltf.scene;
    // the Khronos sample shows two vases side by side (alpha-blended and transmission) sharing one bouquet mesh.
    // Keep the transmission vase and its own bouquet: hide the other vase, drop the flower triangles on its side.
    m.updateMatrixWorld(true);
    const keep = m.getObjectByName('GlassTransmission'), drop = m.getObjectByName('GlassAlpha');
    const split = keep && drop ? (new THREE.Box3().setFromObject(keep).min.x + new THREE.Box3().setFromObject(drop).max.x) / 2 : null;
    if (drop) drop.visible = false;
    if (split !== null) m.traverse(o => {
      if (!o.isMesh || o === keep || o === drop || !o.geometry.index) return;
      const pos = o.geometry.attributes.position, idx = o.geometry.index, v = new THREE.Vector3(), out = [];
      for (let i = 0; i < idx.count; i += 3) {
        let x = 0;
        for (let k = 0; k < 3; k++) { v.fromBufferAttribute(pos, idx.getX(i + k)).applyMatrix4(o.matrixWorld); x += v.x; }
        if (x / 3 > split) out.push(idx.getX(i), idx.getX(i + 1), idx.getX(i + 2));
      }
      o.geometry.setIndex(out);
    });
    const box = new THREE.Box3();
    m.traverse(o => { if (o.isMesh && o.visible) { o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    if (keep) { const kb = new THREE.Box3().setFromObject(keep), kc = kb.getCenter(new THREE.Vector3()); c.x = kc.x; c.z = kc.z; }  // centre on the vase, not the bouquet
    const s = 0.46 / size.y; m.scale.setScalar(s); m.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    vase.add(m);
    target.y = 0.46 * 0.5;
  } catch (e) { return fail(); }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h;
    const dist = phone ? 1.12 : 1.18;
    cam.position.set(phone ? 0 : 0.10, target.y + (phone ? 0.10 : 0.07), dist);
    cam.lookAt(target.x + (phone ? 0 : 0.05), target.y, 0);
    back.lookAt(cam.position.x, back.position.y, cam.position.z);
    cam.updateProjectionMatrix(); state.dirty = true;
  }
  new ResizeObserver(resize).observe(host); resize();

  // pause when off screen or tab hidden
  new IntersectionObserver(es => { state.visible = es[0].isIntersecting; if (state.visible) loop(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const clock = new THREE.Clock(); let raf = 0, t = 0;
  function frame() {
    raf = 0;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (state.spin) { t += dt; vase.rotation.y += dt * 0.28; state.dirty = true; }
    const bob = state.spin ? Math.sin(t * 1.1) * 0.012 : 0;
    orb.visible = state.orb;
    orb.position.set(phone ? -0.12 : -0.2, 0.29 + bob, 0.1);
    orb.rotation.y = state.spin ? t * 0.5 : 0.4;
    renderer.toneMappingExposure = 0.85 + state.light * 0.35;
    if (state.dirty || state.spin) { renderer.render(scene, cam); state.dirty = false; }
    if (state.spin && state.visible && !document.hidden) loop();
  }
  function loop() { if (!raf) raf = requestAnimationFrame(frame); }
  window.__scene = { set(k, v) { state[k] = v; state.dirty = true; loop(); } };
  document.documentElement.classList.add('scene-ready');
  loop();
}

// controls (kit parts fire lg:change)
document.addEventListener('lg:change', e => {
  const s = window.__scene; if (!s) return;
  const n = e.target;
  if (n.id === 'spin') s.set('spin', e.detail.index === 0 && !rm);
  if (n.id === 'orb') s.set('orb', e.detail.checked);
});
const light = document.getElementById('light');
if (light) light.addEventListener('input', () => window.__scene && window.__scene.set('light', +light.value));

// lazy: start when the scene is near the viewport
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); start().catch(fail); } }, { rootMargin: '200px' });
  io.observe(host);
} else start().catch(fail);
