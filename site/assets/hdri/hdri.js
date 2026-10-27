/* Shared studio HDRI for Zyqor Lab demos and the home Worlds scene.
   Source: "Studio Small 09" by Sergej Majboroda, Poly Haven, CC0 (https://polyhaven.com/a/studio_small_09).
   Files next to this module: studio_1k.hdr (1024x512, 1.6 MB), studio_512.hdr (512x256, 413 KB, default desktop),
   studio_256.hdr (256x128, 105 KB, phones if you want it at all).
   Usage (inside a page that has the usual importmap for 'three' and 'three/addons/'):
     import { useHDRI } from '../../assets/hdri/hdri.js';
     scene.environment = studioEnv(renderer);              // instant fallback (kit RoomEnvironment)
     useHDRI(renderer, scene, { size: isM ? 0 : 512 });    // swaps in the HDRI when it has loaded; size 0 = skip
   Options: size 1024 | 512 | 256 | 0, intensity (scene.environmentIntensity), rotation (radians, Y),
            background (false), onReady(texture).
   Never throws: a failed fetch keeps the fallback and logs nothing. */
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const BASE = new URL('./', import.meta.url).href;
const FILES = { 1024: 'studio_1k.hdr', 512: 'studio_512.hdr', 256: 'studio_256.hdr' };
const cache = new Map();

export function loadHDRI(renderer, size = 512) {
  const file = FILES[size] || FILES[512];
  const key = file;
  if (cache.has(key)) return cache.get(key);
  const p = new RGBELoader().setDataType(THREE.HalfFloatType).loadAsync(BASE + file).then((hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(hdr).texture;
    pm.dispose(); hdr.dispose();
    return env;
  });
  cache.set(key, p);
  return p;
}

export function useHDRI(renderer, scene, opts = {}) {
  const size = opts.size === undefined ? 512 : opts.size;
  if (!size) return Promise.resolve(null);
  const start = () => loadHDRI(renderer, size).then((env) => {
    const old = scene.environment;
    scene.environment = env;
    if (opts.background) scene.background = env;
    if (opts.intensity !== undefined) scene.environmentIntensity = opts.intensity;
    if (opts.rotation !== undefined && scene.environmentRotation) scene.environmentRotation.y = opts.rotation;
    if (old && old !== env && old.dispose && !opts.keepOld) old.dispose();
    if (opts.onReady) opts.onReady(env);
    return env;
  }).catch(() => null);
  // after first paint so the hero is never blocked by the download
  return new Promise((res) => {
    const go = () => start().then(res);
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1200 }); else setTimeout(go, 300);
  });
}
