/* Zyqor Lab kit - shared helpers for every concept demo (ES module).
   Each demo imports what it needs:  import { Q, reduced, loadGLB, ... } from '../_kit/kit.js';
   Nothing here touches the DOM until you call it. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
/* true on the phone build (m.html sets <html data-build="m">) */
export const isM = document.documentElement.dataset.build === 'm';
/* quality profile: the phone build renders lighter */
export const Q = isM
  ? { dpr: Math.min(devicePixelRatio || 1, 1.5), aa: false, model: '-m.glb', particles: 0.35, shadows: false }
  : { dpr: Math.min(devicePixelRatio || 1, 2), aa: true, model: '-d.glb', particles: 1, shadows: true };

/* path to the shared model folder, relative to /lab/<slug>/ */
export const MODELS = '../../assets/models/';
export const modelURL = (name) => MODELS + name + Q.model;

let _loader;
export function loadGLB(url) {
  if (!_loader) { _loader = new GLTFLoader(); _loader.setMeshoptDecoder(MeshoptDecoder); }
  return _loader.loadAsync(url);
}

/* Renderer with sane defaults (sRGB, ACES, DPR capped by the quality profile). */
export function makeRenderer(canvas, opts = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: Q.aa, alpha: opts.alpha ?? true, powerPreference: 'high-performance' });
  r.setPixelRatio(Q.dpr);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = opts.exposure ?? 1;
  return r;
}
/* Soft studio reflections (no HDR download). */
export function studioEnv(renderer, blur = 0.04) {
  const pm = new THREE.PMREMGenerator(renderer);
  const t = pm.fromScene(new RoomEnvironment(), blur).texture;
  pm.dispose();
  return t;
}
/* Scale an object so its largest side == size, and centre it on the origin (bottom at y=0 if sit=true). */
export function fitObject(obj, size = 1, sit = false) {
  const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
  const k = size / Math.max(s.x, s.y, s.z); obj.scale.multiplyScalar(k);
  const b2 = new THREE.Box3().setFromObject(obj), c = b2.getCenter(new THREE.Vector3());
  obj.position.sub(c); if (sit) obj.position.y += (b2.max.y - b2.min.y) / 2;
  return obj;
}
/* KHR_materials_variants support (three's GLTFLoader leaves variants unapplied).
   const v = await variants(gltf);  v.names -> ['midnight','beach','street'];  await v.select('beach'); */
export async function variants(gltf) {
  const parser = gltf.parser, ext = parser.json.extensions && parser.json.extensions.KHR_materials_variants;
  const names = ext ? ext.variants.map((v) => v.name) : [];
  const targets = [];
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const a = parser.associations.get(o);
    if (!a || a.meshes === undefined) return;
    const prim = parser.json.meshes[a.meshes].primitives[a.primitives || 0];
    const m = prim.extensions && prim.extensions.KHR_materials_variants;
    if (m) targets.push({ o, mappings: m.mappings, original: o.material });
  });
  const cache = new Map();
  async function select(name) {
    const vi = names.indexOf(name);
    await Promise.all(targets.map(async (t) => {
      const map = t.mappings.find((mp) => mp.variants.includes(vi));
      if (!map) { t.o.material = t.original; return; }
      if (!cache.has(map.material)) cache.set(map.material, parser.getDependency('material', map.material));
      const mat = await cache.get(map.material);
      t.o.material = mat;
    }));
  }
  return { names, select };
}
/* Lazy reveal: elements with [data-rv] fade/slide in when they enter the viewport.
   data-rv="up|left|right|zoom|fade", data-rv-d="1..6" (stagger step 80 ms). */
export function reveals(root = document) {
  const els = [...root.querySelectorAll('[data-rv]')];
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}
/* Lenis smooth scroll + GSAP ScrollTrigger sync (desktop only; phones use native scroll). */
export function smooth() {
  if (reduced || isM || !window.Lenis) return null;
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  if (window.gsap) { window.gsap.ticker.add((t) => lenis.raf(t * 1000)); window.gsap.ticker.lagSmoothing(0); }
  else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  window.__lenis = lenis; return lenis;
}
/* Pause a render loop while its canvas is off screen or the tab is hidden. */
export function whenVisible(el, onChange) {
  let vis = false;
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; onChange(vis && !document.hidden); }, { threshold: 0 });
  io.observe(el);
  document.addEventListener('visibilitychange', () => onChange(vis && !document.hidden));
}
/* Lerp + damp helpers */
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export { THREE };
