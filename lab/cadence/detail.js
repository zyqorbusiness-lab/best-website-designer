/* TALUS Ridge C1 - shared surface detail for desktop AND phone (same maps, same materials on both builds).
   Everything here is procedural (canvas), so it costs no download. Used by app.js (desktop) and bike-m.js (phone). */
import * as THREE from 'three';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
/* tileable value noise height field, several octaves */
function heightField(n, octs, seed) {
  const r = rng(seed), H = new Float32Array(n * n);
  for (const [cells, amp] of octs) {
    const g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = r();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const fx = x / n * cells, fy = y / n * cells, x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = g[(y0 % cells) * cells + x0 % cells], b = g[(y0 % cells) * cells + (x0 + 1) % cells];
      const c = g[((y0 + 1) % cells) * cells + x0 % cells], d = g[((y0 + 1) % cells) * cells + (x0 + 1) % cells];
      H[y * n + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
    }
  }
  return H;
}
function normalFrom(H, n, k) {
  const c = canvas(n, n), x = c.getContext('2d'), im = x.createImageData(n, n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const l = H[j * n + (i + n - 1) % n], r = H[j * n + (i + 1) % n], u = H[((j + n - 1) % n) * n + i], d = H[((j + 1) % n) * n + i];
    let nx = (l - r) * k, ny = (u - d) * k, nz = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
    const o = (j * n + i) * 4; im.data[o] = (nx * .5 + .5) * 255; im.data[o + 1] = (ny * .5 + .5) * 255; im.data[o + 2] = (nz * .5 + .5) * 255; im.data[o + 3] = 255;
  }
  x.putImageData(im, 0, 0); return c;
}
function greyFrom(H, n, lo, hi) {
  let mn = 1e9, mx = -1e9; for (const v of H) { if (v < mn) mn = v; if (v > mx) mx = v; }
  const c = canvas(n, n), x = c.getContext('2d'), im = x.createImageData(n, n);
  for (let p = 0; p < n * n; p++) { const v = (lo + (hi - lo) * (H[p] - mn) / (mx - mn)) * 255; im.data[p * 4] = im.data[p * 4 + 1] = im.data[p * 4 + 2] = v; im.data[p * 4 + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
}
function tex(c, rep, srgb) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t;
}
let MAPS;
export function maps() {
  if (MAPS) return MAPS;
  const n = 256;
  const peel = heightField(n, [[16, 1], [32, .5], [64, .2]], 7);          // clear-coat orange peel
  const grain = heightField(n, [[32, 1], [64, .7], [128, .45]], 11);       // rubber / leather / anodise grain
  const smudge = heightField(n, [[4, 1], [8, .6], [16, .3]], 23);          // fingerprints, polish wear
  MAPS = {
    peelN: tex(normalFrom(peel, n, 2.2), 7),
    grainN: tex(normalFrom(grain, n, 5), 10),
    grainR: tex(greyFrom(grain, n, .72, 1), 10),
    smudgeR: tex(greyFrom(smudge, n, .55, 1), 2),
  };
  return MAPS;
}
function toPhysical(m) {
  if (m.isMeshPhysicalMaterial) return m;
  const p = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(p, m);
  p.defines = { STANDARD: '', PHYSICAL: '' }; p.name = m.name;
  return p;
}
/* upgrade the model's own materials; returns the frame material hooks the page recolours */
export function enhance(model) {
  const M = maps(), done = new Map();
  const up = (m) => {
    if (done.has(m)) return done.get(m);
    let p = m;
    switch (m.name) {
      case 'Reifen': case 'Reifen_innen':           // tyre: soft rubber, grain + faint sheen, deeper tread normal
        p = toPhysical(m); p.roughness = 0.82; p.roughnessMap = M.grainR; p.sheen = 0.35; p.sheenRoughness = 0.6; p.sheenColor = new THREE.Color(0x3a3a3a);
        if (p.normalMap) p.normalScale.set(1.6, 1.6); break;
      case 'Sattel':                                 // saddle: microfibre leather
        p = toPhysical(m); p.color.setRGB(0.018, 0.017, 0.016); p.roughness = 0.62; p.roughnessMap = M.grainR; p.sheen = 0.55; p.sheenRoughness = 0.45; p.sheenColor = new THREE.Color(0x4a4640);
        if (p.normalMap) p.normalScale.set(1.4, 1.4); break;
      case 'Bremsscheiben':                          // rotors: machined steel
        p = toPhysical(m); p.color.setRGB(0.42, 0.42, 0.44); p.metalness = 1; p.roughness = 0.26; p.roughnessMap = M.smudgeR; break;
      case 'Schrauben': case 'FelgenBefestigung': case 'Feder':
        p = toPhysical(m); p.metalness = 1; p.roughness = Math.max(0.16, m.roughness); p.roughnessMap = M.smudgeR; break;
      case 'chain': case 'Getriebe':                 // drivetrain: oily steel
        p = toPhysical(m); p.color.setRGB(0.42, 0.42, 0.43); p.metalness = 1; p.roughness = 0.34; p.roughnessMap = M.grainR; if (p.normalMap) p.normalScale.set(1.3, 1.3); break;
      case 'FelgenStab':                             // spokes: satin black stainless
        p = toPhysical(m); p.color.setRGB(0.04, 0.04, 0.045); p.metalness = 0.9; p.roughness = 0.32; break;
      case 'Griffe':                                 // grips: textured silicone
        p = toPhysical(m); p.roughness = 0.78; p.roughnessMap = M.grainR; p.sheen = 0.3; p.sheenRoughness = 0.7; if (p.normalMap) p.normalScale.set(1.5, 1.5); break;
      case 'MetalLenker': case 'MetalMedGloss': case 'Unterschutzplatte': case 'Pedale': case 'Bremse':
        p = toPhysical(m); p.metalness = Math.max(0.6, m.metalness); p.roughnessMap = M.smudgeR; p.clearcoat = 0.35; p.clearcoatRoughness = 0.3; break;
      case 'GummiDunkel': case 'Schlauch':
        p = toPhysical(m); p.metalness = 0; p.roughness = 0.6; p.roughnessMap = M.grainR; break;
      default: break;
    }
    p.envMapIntensity = 1;
    done.set(m, p); return p;
  };
  model.traverse((o) => { if (o.isMesh && o.material && !Array.isArray(o.material)) o.material = up(o.material); });
}
/* the painted-carbon frame shared by both builds */
export function frameMaterial(normalMap, color) {
  const M = maps();
  const f = new THREE.MeshPhysicalMaterial({ name: 'Frame', color: new THREE.Color(color), metalness: 0.12, roughness: 0.34,
    normalMap, clearcoat: 1, clearcoatRoughness: 0.035, clearcoatNormalMap: M.peelN, clearcoatNormalScale: new THREE.Vector2(0.12, 0.12),
    roughnessMap: M.smudgeR, envMapIntensity: 1.15 });
  if (normalMap) { f.normalScale = new THREE.Vector2(0.3, 0.3); }
  return f;
}
export function anodised(color) {
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), metalness: 0.85, roughness: 0.24, roughnessMap: maps().grainR, clearcoat: 0.6, clearcoatRoughness: 0.12 });
}

/* frame decals (fictional TALUS marks + Concept), projected onto the frame with DecalGeometry so they sit under the clear coat.
   root = the group the model sits in; placements are in that group's units (bike length 2.6, floor y=0). */
import { DecalGeometry } from './DecalGeometry.js';
function decalTex(lines, w, h) {
  const c = canvas(w, h), x = c.getContext('2d');
  x.clearRect(0, 0, w, h); x.textBaseline = 'middle';
  for (const L of lines) {
    x.font = L.font; x.fillStyle = L.fill; if (L.track) x.letterSpacing = L.track;
    if (L.rect) { x.fillRect(L.rect[0] * w, L.rect[1] * h, L.rect[2] * w, L.rect[3] * h); continue; }
    x.textAlign = L.align || 'left'; x.fillText(L.t, L.x * w, L.y * h);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function addDecals(model, root) {
  const frames = []; model.traverse((o) => { if (o.isMesh && o.material && o.material.name === 'Frame') frames.push(o); });
  if (!frames.length) return [];
  root.updateMatrixWorld(true);
  const ink = '#1E2422', ochre = '#B5832F', F = '"Bricolage","Arial Black",sans-serif', B = '"Manrope","Helvetica Neue",Arial,sans-serif';
  const big = decalTex([
    { font: `800 300px ${F}`, fill: ink, t: 'TALUS', x: 0.03, y: 0.52, track: '6px' },
    { rect: [0.80, 0.30, 0.008, 0.42], fill: ochre, font: '10px sans-serif' },
    { font: `700 62px ${B}`, fill: ink, t: 'RIDGE C1', x: 0.83, y: 0.40, track: '6px' },
    { font: `500 44px ${B}`, fill: ochre, t: 'CONCEPT', x: 0.83, y: 0.62, track: '8px' },
  ], 2048, 400);
  const small = decalTex([
    { font: `700 120px ${B}`, fill: ink, t: 'ZYQOR STUDIO  ·  DESIGN CONCEPT  ·  NOT FOR SALE', x: 0.5, y: 0.5, align: 'center', track: '10px' },
  ], 4096, 220);
  const mat = (map) => new THREE.MeshPhysicalMaterial({ map, transparent: true, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const mBig = mat(big), mSmall = mat(small);
  const rc = new THREE.Raycaster(), dummy = new THREE.Object3D(), out = [];
  const place = (x, y, side, ang, w, h, m) => {
    const o = root.localToWorld(new THREE.Vector3(x, y, 3 * side)), t = root.localToWorld(new THREE.Vector3(x, y, -3 * side));
    rc.set(o, t.sub(o).normalize()); const hit = rc.intersectObjects(frames, false)[0]; if (!hit) return;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    dummy.position.copy(hit.point); dummy.lookAt(hit.point.clone().add(n)); dummy.rotateZ(ang * side);
    const g = new DecalGeometry(hit.object, hit.point, dummy.rotation, new THREE.Vector3(w, h, 0.07));
    g.applyMatrix4(hit.object.matrixWorld.clone().invert());            // keep it in the frame's own space so it follows the explode
    const d = new THREE.Mesh(g, m); d.renderOrder = 2; d.frustumCulled = false; hit.object.add(d); out.push(d);
  };
  const A = -0.84;                                       // downtube angle (rad), from the probe
  for (const s of [1, -1]) {
    place(-0.16, 1.15, s, A, 0.40, 0.078, mBig);         // TALUS wordmark along the downtube, both sides
    place(0.66, 0.6, s, 0.0, 0.34, 0.018, mSmall);       // fine print on the chainstay
  }
  return out;
}
