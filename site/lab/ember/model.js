/* Ember & Oak - the real 3D assets (one file for desktop AND phone).
   ember.glb = "Cup of Cappuccino" by Krzysztof Mazia (CC BY 4.0) cup + saucer, and "Coffee beans" by kouitimizuno (CC BY 4.0),
   both via Sketchfab; liquid removed (the crema is our own shader), meshopt + WebP, every triangle kept.
   This module loads it once, bakes it into the same units the old procedural cup used (saucer radius 0.98, base at y=0,
   handle pointing +X) and hands back geometry + the scan textures. */
import { THREE } from '../_kit/kit.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const MODEL_URL = '../../assets/lab/ember/ember.glb';

/* de-quantize (meshopt stores int16/int8) so we can bake transforms without clipping */
function toFloat(g) {
  const o = new THREE.BufferGeometry();
  for (const k of ['position', 'normal', 'uv']) {
    const a = g.getAttribute(k); if (!a) continue;
    const n = a.count, s = a.itemSize, f = new Float32Array(n * s);
    for (let i = 0; i < n; i++) { f[i * s] = a.getX(i); if (s > 1) f[i * s + 1] = a.getY(i); if (s > 2) f[i * s + 2] = a.getZ(i); }
    o.setAttribute(k, new THREE.BufferAttribute(f, s));
  }
  if (g.index) o.setIndex(Array.from(g.index.array));
  return o;
}
function eachV(g, fn) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) fn(p.getX(i), p.getY(i), p.getZ(i), i); }


/* lathe-style UVs (u = angle round the axis, v = height or radius) so the glaze maps made for the old lathe cup
   (speckle, glaze normal, roughness prints) wrap the real cup the same way; the seam is split, not smeared */
function lathe(g, mode, span) {
  const t = g.index ? g.toNonIndexed() : g;
  const p = t.attributes.position, n = p.count, uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    uv[i * 2] = Math.atan2(z, x) / (Math.PI * 2) + 0.5;
    uv[i * 2 + 1] = mode === 'r' ? Math.hypot(x, z) / span : y / span;
  }
  for (let i = 0; i < n; i += 3) {
    const a = uv[i * 2], b = uv[i * 2 + 2], c = uv[i * 2 + 4];
    if (Math.max(a, b, c) - Math.min(a, b, c) > 0.5) for (let j = 0; j < 3; j++) if (uv[(i + j) * 2] < 0.5) uv[(i + j) * 2] += 1;
  }
  t.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return t;
}

function prep(gltf) {
  const M = {};
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => { if (o.isMesh) M[o.name] = o; });
  const G = {};
  for (const k in M) { const g = toFloat(M[k].geometry); g.applyMatrix4(M[k].matrixWorld); G[k] = g; }
  const cupKeys = ['cup_body', 'cup_outer', 'cup_inner'], allKeys = [...cupKeys, 'saucer_top', 'saucer_body'];
  // saucer centre, radius and floor
  let cx = 0, cz = 0, n = 0, minY = Infinity;
  eachV(G.saucer_body, (x, y, z) => { cx += x; cz += z; n++; });
  cx /= n; cz /= n;
  let Rs = 0; for (const k of allKeys) eachV(G[k], (x, y, z) => { minY = Math.min(minY, y); });
  eachV(G.saucer_body, (x, y, z) => { Rs = Math.max(Rs, Math.hypot(x - cx, z - cz)); });
  const k = 0.98 / Rs;
  for (const key of allKeys) { G[key].translate(-cx, -minY, -cz); G[key].scale(k, k, k); }
  // handle direction -> +X (where the old cup's handle was, so every camera angle in the page still reads)
  let rim = 0; eachV(G.cup_outer, (x, y, z) => { rim = Math.max(rim, Math.hypot(x, z)); });
  let hx = 0, hz = 0; eachV(G.cup_body, (x, y, z) => { if (Math.hypot(x, z) > rim * 1.06) { hx += x; hz += z; } });
  const ang = Math.atan2(hz, hx);
  for (const key of allKeys) G[key].rotateY(ang);
  // split the white body: the handle takes the outer glaze, the rest (lip, well) stays white
  const body = G.cup_body, idx = body.index.array, P = body.attributes.position;
  const hI = [], bI = [];
  for (let t = 0; t < idx.length; t += 3) {
    let mx = 0, mz = 0; for (let j = 0; j < 3; j++) { mx += P.getX(idx[t + j]); mz += P.getZ(idx[t + j]); }
    (Math.hypot(mx / 3, mz / 3) > rim * 1.012 ? hI : bI).push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const handle = body.clone(); handle.setIndex(hI); body.setIndex(bI);
  // cup base / top, so the cup group sits on the saucer exactly where the model put it
  let cupBase = Infinity, cupTop = -Infinity; for (const key of cupKeys) eachV(G[key], (x, y) => { cupBase = Math.min(cupBase, y); cupTop = Math.max(cupTop, y); });
  for (const g of [body, handle, G.cup_outer, G.cup_inner]) g.translate(0, -cupBase, 0);
  cupTop -= cupBase;
  // coffee level and the inner wall radius there
  const coffeeY = cupTop * 0.86;
  let rs = 0, rn = 0; eachV(G.cup_inner, (x, y, z) => { if (Math.abs(y - coffeeY) < cupTop * 0.025) { rs += Math.hypot(x, z); rn++; } });
  const coffeeR = (rn ? rs / rn : rim * 0.9) + 0.004;
  let foot = 0; eachV(body, (x, y, z) => { if (y < cupTop * 0.04) foot = Math.max(foot, Math.hypot(x, z)); });
  const cup = { body: lathe(body, 'y', cupTop), handle: lathe(handle, 'y', cupTop), outer: lathe(G.cup_outer, 'y', cupTop), inner: G.cup_inner };
  const saucer = { top: lathe(G.saucer_top, 'r', 0.98), body: lathe(G.saucer_body, 'r', 0.98) };
  for (const g of [...Object.values(cup), ...Object.values(saucer)]) g.computeBoundingSphere(); // the model's own normals are kept (hard rim edges stay crisp)
  // bean: already centred and axis-aligned at build time (long axis Y, crease face +Z, half-length 1)
  const bm = M.bean.material;
  const bean = { geo: toFloat(M.bean.geometry), map: bm.map, normalMap: bm.normalMap, normalScale: bm.normalScale.clone() };
  bean.geo.computeBoundingSphere();
  return {
    cup, saucer,
    innerMap: M.cup_inner.material.map, saucerMap: M.saucer_top.material.map,
    cupBase: cupBase, cupTop, rim: rim, coffeeY, coffeeR, foot, bean,
  };
}

export function loadEmber(onProgress) {
  return new Promise((res, rej) => {
    const l = new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder);
    l.load(MODEL_URL, (g) => { try { res(prep(g)); } catch (e) { rej(e); } },
      (e) => { if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total); }, rej);
  });
}

/* the scanned bean, recoloured per roast: texture detail divided by its own mean colour, times the roast colour */
export function realBeanMaterial(B, color, o = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color, map: B.map, normalMap: B.normalMap, normalScale: B.normalScale.clone().multiplyScalar(o.normal ?? 1),
    roughness: o.roughness ?? 0.5, clearcoat: o.clearcoat ?? 0.4, clearcoatRoughness: o.clearcoatRoughness ?? 0.3,
    sheen: 0.15, sheenColor: new THREE.Color('#c89670'), sheenRoughness: 0.6,
  });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\ndiffuseColor.rgb = min(diffuseColor.rgb / vec3(.0255, .0141, .0084), vec3(1.6));');
  };
  m.customProgramCacheKey = () => 'realbean1';
  return m;
}
