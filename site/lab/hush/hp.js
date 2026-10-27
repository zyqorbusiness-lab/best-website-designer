/* Hush One - procedural over-ear headphones, v2 (Zyqor Lab, Concept 03).
   Rebuilt with real proportions: superellipse ear cups, a padded leather band with stitching on a spring-steel spine,
   brushed-aluminium yokes and sliders with click marks, anodised concentric-turned caps, sheen leather cushions with
   gathered pleats, a woven driver cloth. All textures are generated on a canvas at load: zero image downloads.
   Every part is still its own mesh/group so the exploded view keeps working. */
import { THREE } from '../_kit/kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const WAYS = [
  { key: 'mist',     name: 'Mist',     shell: 0xD9E0E5, soft: 0xB9C4CC, ring: 0xF0A23B, band: 0xC3CDD4, bg: '#E7ECEF', ink: '#24364A' },
  { key: 'midnight', name: 'Midnight', shell: 0x24364A, soft: 0x1B2836, ring: 0xF0A23B, band: 0x2C4157, bg: '#DCE3E8', ink: '#24364A' },
  { key: 'amber',    name: 'Amber',    shell: 0xE9A03E, soft: 0x2B3D52, ring: 0x24364A, band: 0xD9922F, bg: '#EEE6DA', ink: '#24364A' },
];

const TAU = Math.PI * 2;
const TX = 512;                       /* procedural texture size */
const NO = 200;                       /* segments around a cup */

/* ------------------------------------------------------------------ procedural textures */
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function tex(c, color) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function normalFrom(h, W, H, k) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (h[y * W + (x + 1) % W] - h[y * W + (x - 1 + W) % W]) * k;
    const dy = (h[((y + 1) % H) * W + x] - h[((y - 1 + H) % H) * W + x]) * k;
    const l = Math.hypot(dx, dy, 1), i = (y * W + x) * 4;
    d[i] = (-dx / l * 0.5 + 0.5) * 255; d[i + 1] = (dy / l * 0.5 + 0.5) * 255; d[i + 2] = (0.5 / l + 0.5) * 255; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return tex(c);
}
function grayTex(v, W, H, color) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
  for (let i = 0; i < W * H; i++) { const q = Math.max(0, Math.min(255, v[i] * 255)); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = q; d[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0); return tex(c, color);
}
/* tileable cellular noise: pebbled leather grain */
function cellular(W, cells, seed) {
  const r = rng(seed), P = new Float32Array(cells * cells * 2);
  for (let i = 0; i < P.length; i++) P[i] = r();
  const h = new Float32Array(W * W), cs = W / cells;
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const gx = Math.floor(x / cs), gy = Math.floor(y / cs); let f1 = 9, f2 = 9;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const cx = gx + ox, cy = gy + oy, k = ((((cy % cells) + cells) % cells) * cells + (((cx % cells) + cells) % cells)) * 2;
      const dd = Math.hypot((cx + P[k]) * cs - x, (cy + P[k + 1]) * cs - y) / cs;
      if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd;
    }
    h[y * W + x] = Math.sqrt(Math.min(1, (f2 - f1) * 2.6));
  }
  return h;
}
/* tileable value noise, octaves summed */
function vnoise(W, H, per, seed) {
  const r = rng(seed), gx = per, gy = Math.max(1, Math.round(per * H / W)), G = new Float32Array(gx * gy);
  for (let i = 0; i < G.length; i++) G[i] = r();
  const out = new Float32Array(W * H), s = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = x / W * gx, fy = y / H * gy, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = s(fx - x0), ty = s(fy - y0);
    const a = G[(y0 % gy) * gx + x0 % gx], b = G[(y0 % gy) * gx + (x0 + 1) % gx], c = G[((y0 + 1) % gy) * gx + x0 % gx], d = G[((y0 + 1) % gy) * gx + (x0 + 1) % gx];
    out[y * W + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  }
  return out;
}
/* Round 2: every surface map is a pre-baked high-res webp (work/assets_upgrade2/hush/bake.py), the SAME files on desktop and phone.
   Loading is async; materials render plain for the first frames, then sharpen in place. */
const ASSET = '../../assets/lab/hush/';
const TL = new THREE.TextureLoader();
const TEX = {};
export const texReady = [];
function img(name, { color = false, rep = [1, 1], mirror = false, clamp = false } = {}) {
  let e = TEX[name];
  if (!e) {
    e = TEX[name] = { base: null, users: [], loaded: false };
    let done; texReady.push(new Promise((res) => { done = res; setTimeout(res, 9000); }));
    e.base = TL.load(ASSET + name + '.webp', () => { e.loaded = true; e.users.forEach((t) => (t.needsUpdate = true)); done(); }, undefined, done);
  }
  /* a fresh Texture that shares the loaded image (one GPU upload per file) but owns its own repeat / wrap / colour space;
     it is only flagged for upload once the image exists, so three never warns about an empty texture */
  const t = new THREE.Texture(); t.source = e.base.source;
  t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 8; t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.repeat.set(mirror ? -rep[0] : rep[0], rep[1]); if (mirror) { t.wrapS = THREE.RepeatWrapping; t.offset.x = 1; }
  if (e.loaded) t.needsUpdate = true; else e.users.push(t);
  return t;
}
function makeTextures() {
  return {
    leatherN: img('leather_n', { rep: [6, 1] }), leatherR: img('leather_r', { rep: [6, 1] }),
    cushN: img('cush_n', { rep: [3, 1] }), cushR: img('leather_r', { rep: [14, 2] }),
    fineN: img('shell_n', { rep: [3, 3] }), shellR: img('shell_r', { rep: [1, 1] }),
    brushR: img('brush_r'), brushN: img('brush_n'),
    clothN: img('knit_n', { rep: [7, 7] }),
    coneN: img('cone_n', { rep: [1, 1] }),
  };
}
function sideCloth(letter) { return img('cloth_' + letter, { color: true, clamp: true }); }

/* ------------------------------------------------------------------ geometry helpers */
/* superellipse outline in the cup plane, resampled by arc length. u -> z (front/back), v -> y (up). */
function outline(rx, ry, n, N) {
  const M = 2048, a = [];
  for (let i = 0; i <= M; i++) { const t = i / M * TAU, c = Math.cos(t), s = Math.sin(t);
    a.push([rx * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), ry * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]); }
  const L = [0]; for (let i = 1; i <= M; i++) L.push(L[i - 1] + Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]));
  const p = [], q = []; let k = 0;
  for (let i = 0; i < N; i++) { const t = i / N * L[M]; while (L[k + 1] < t) k++; const f = (t - L[k]) / (L[k + 1] - L[k] || 1);
    p.push([a[k][0] + (a[k + 1][0] - a[k][0]) * f, a[k][1] + (a[k + 1][1] - a[k][1]) * f]); }
  for (let i = 0; i < N; i++) { const A = p[(i - 1 + N) % N], B = p[(i + 1) % N], tx = B[0] - A[0], ty = B[1] - A[1], l = Math.hypot(tx, ty); q.push([ty / l, -tx / l]); }
  return { p, q, N, rx, ry };
}
const ptOn = (O, i, d, k = 1) => { const P = O.p[i % O.N], Qn = O.q[i % O.N]; return [(P[0] - Qn[0] * d) * k, (P[1] - Qn[1] * d) * k]; };
function finish(g, seamCols, rings) {
  g.computeVertexNormals();
  /* outward orientation check */
  const pos = g.attributes.position, idx = g.index.array, c = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), m = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) c.add(a.fromBufferAttribute(pos, i)); c.divideScalar(pos.count);
  let s = 0;
  for (let t = 0; t < idx.length; t += 3) {
    a.fromBufferAttribute(pos, idx[t]); b.fromBufferAttribute(pos, idx[t + 1]); d.fromBufferAttribute(pos, idx[t + 2]);
    m.copy(a).add(b).add(d).divideScalar(3).sub(c);
    b.sub(a); d.sub(a); s += b.cross(d).dot(m);
  }
  if (s < 0) { for (let t = 0; t < idx.length; t += 3) { const x = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = x; } g.index.needsUpdate = true; g.computeVertexNormals(); }
  if (seamCols) {  /* weld the normals across the u seam */
    const n = g.attributes.normal;
    for (let j = 0; j < rings; j++) { const i0 = j * (seamCols + 1), i1 = i0 + seamCols;
      a.fromBufferAttribute(n, i0).add(b.fromBufferAttribute(n, i1)).normalize(); n.setXYZ(i0, a.x, a.y, a.z); n.setXYZ(i1, a.x, a.y, a.z); }
  }
  return g;
}
/* an oval "lathe": profile rows [k, d, h] -> ring = (outline inset by d) scaled by k, at height h along +x */
function ovalLathe(O, prof, uvMode = 'wrap') {
  const N = O.N, R = prof.length, pos = [], uv = [], idx = [], vv = [0];
  for (let j = 1; j < R; j++) { const A = ptOn(O, 0, prof[j - 1][1], prof[j - 1][0]), B = ptOn(O, 0, prof[j][1], prof[j][0]);
    vv.push(vv[j - 1] + Math.hypot(A[0] - B[0], A[1] - B[1], prof[j][2] - prof[j - 1][2])); }
  for (let j = 0; j < R; j++) { const [k, d, h] = prof[j];
    for (let i = 0; i <= N; i++) { const [u, v] = ptOn(O, i, d, k); pos.push(h, v, u);
      if (uvMode === 'planar') uv.push(u / (2 * O.rx) + 0.5, v / (2 * O.ry) + 0.5); else uv.push(i / N, vv[j] / vv[R - 1]); } }
  for (let j = 0; j < R - 1; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return finish(g, N, R);
}
/* smooth closed 2D loop -> resampled points (for the cushion cross-section) */
function loop2(pts, n) {
  const c = new THREE.CatmullRomCurve3(pts.map(([a, b]) => new THREE.Vector3(a, b, 0)), true, 'centripetal');
  return c.getSpacedPoints(n).map((v) => [v.x, v.y]);
}
const superSec = (w, t, n, M) => { const o = []; for (let i = 0; i < M; i++) { const a = i / M * TAU, c = Math.cos(a), s = Math.sin(a);
  o.push([t / 2 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), w / 2 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]); } return o; };
/* sweep a closed section along a curve. secFn(t) -> {pts:[[a,b]...], off}; a goes along the in-plane normal, b along the plane axis B */
function sweep(curve, S, B, C, secFn, uLen = 1) {
  const pos = [], uv = [], idx = []; let M = 0;
  const T = new THREE.Vector3(), Nn = new THREE.Vector3(), P = new THREE.Vector3(), tmp = new THREE.Vector3();
  for (let s = 0; s <= S; s++) {
    const t = s / S; curve.getPointAt(t, P); curve.getTangentAt(t, T);
    Nn.crossVectors(T, B).normalize(); if (Nn.dot(tmp.copy(P).sub(C)) < 0) Nn.negate();
    const sec = secFn(t); M = sec.pts.length;
    for (let m = 0; m <= M; m++) { const [a, b] = sec.pts[m % M];
      tmp.copy(P).addScaledVector(Nn, sec.off + a).addScaledVector(B, b); pos.push(tmp.x, tmp.y, tmp.z); uv.push(t * uLen, m / M); }
  }
  for (let s = 0; s < S; s++) for (let m = 0; m < M; m++) { const a = s * (M + 1) + m, b = a + M + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  /* end caps (fans) */
  for (const s of [0, S]) { const base = s * (M + 1), cx = [0, 0, 0];
    for (let m = 0; m < M; m++) for (let k = 0; k < 3; k++) cx[k] += pos[(base + m) * 3 + k] / M;
    const ci = pos.length / 3; pos.push(...cx); uv.push(s / S * uLen, 0.5);
    for (let m = 0; m < M; m++) idx.push(ci, base + m, base + m + 1); }
  const g = new THREE.BufferGeometry(); g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  /* orientation: compare the first ring's normals with (vertex - curve point) */
  const n = g.attributes.normal; curve.getPointAt(0.5, P); let sgn = 0; const mid = Math.floor(S / 2) * (M + 1);
  for (let m = 0; m < M; m++) { tmp.fromBufferAttribute(g.attributes.position, mid + m); const q = new THREE.Vector3().fromBufferAttribute(n, mid + m); sgn += q.dot(tmp.sub(P)); }
  if (sgn < 0) { const ia = g.index.array; for (let t = 0; t < ia.length; t += 3) { const x = ia[t + 1]; ia[t + 1] = ia[t + 2]; ia[t + 2] = x; } g.computeVertexNormals(); }
  for (let s = 0; s <= S; s++) { const i0 = s * (M + 1), i1 = i0 + M; tmp.fromBufferAttribute(n, i0).add(P.fromBufferAttribute(n, i1)).normalize(); n.setXYZ(i0, tmp.x, tmp.y, tmp.z); n.setXYZ(i1, tmp.x, tmp.y, tmp.z); }
  return g;
}
/* instanced stitches along a list of [position, direction] */
function stitches(list, mat, len = 0.024, rad = 0.0055) {
  const geo = new THREE.CapsuleGeometry(rad, len, 3, 6); geo.rotateZ(Math.PI / 2);   /* along +x */
  const im = new THREE.InstancedMesh(geo, mat, list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), one = new THREE.Vector3(1, 1, 1);
  list.forEach(([p, d], i) => { q.setFromUnitVectors(X, d.clone().normalize()); m4.compose(p, q, one); im.setMatrixAt(i, m4); });
  im.instanceMatrix.needsUpdate = true; return im;
}

/* ------------------------------------------------------------------ the build */
export function buildHeadphones() {
  const T = makeTextures();
  const root = new THREE.Group();
  const M = {
    /* soft-touch polymer cup shell: micro grain normal + uneven satin roughness */
    shell: new THREE.MeshPhysicalMaterial({ color: 0xD9E0E5, roughness: 0.62, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.5,
      roughnessMap: T.shellR, normalMap: T.fineN, normalScale: new THREE.Vector2(0.35, 0.35), sheen: 0.25, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff) }),
    /* protein-leather cushions: pebble grain + pores + gathered pleats on the inner wall */
    soft: new THREE.MeshPhysicalMaterial({ color: 0xB9C4CC, roughness: 0.62, roughnessMap: T.cushR, sheen: 0.7, sheenRoughness: 0.42, sheenColor: new THREE.Color(0xc8d0d8),
      clearcoat: 0.22, clearcoatRoughness: 0.4, normalMap: T.cushN, normalScale: new THREE.Vector2(0.75, 0.75) }),
    /* headband outer: painted spring steel, satin */
    band: new THREE.MeshPhysicalMaterial({ color: 0xC3CDD4, roughness: 0.36, metalness: 0.8, roughnessMap: img('brush_r', { rep: [1, 2] }), anisotropy: 0.6,
      clearcoat: 0.4, clearcoatRoughness: 0.2 }),
    /* brushed aluminium: yokes, sliders, hinge blocks */
    metal: new THREE.MeshPhysicalMaterial({ color: 0xE3E6E9, metalness: 1, roughness: 1, roughnessMap: img('brush_r', { rep: [1, 3] }), anisotropy: 0.75,
      normalMap: img('brush_n', { rep: [1, 3] }), normalScale: new THREE.Vector2(0.3, 0.3) }),
    /* polished accent bezel (emissive glow in quiet mode is driven by app.js) */
    ring: new THREE.MeshPhysicalMaterial({ color: 0xF0A23B, metalness: 1, roughness: 0.16, clearcoat: 0.8, clearcoatRoughness: 0.08 }),
    /* anodised outer cap: planar maps baked at 2048 - lathe-turned grooves, diamond-cut polished chamfer, two rings of
       laser-drilled mic holes, etched wordmark (colour follows the shell) */
    cap: new THREE.MeshPhysicalMaterial({ color: 0xD9E0E5, metalness: 1, roughness: 1, map: img('cap_c', { color: true, mirror: true }),
      roughnessMap: img('cap_r', { mirror: true }), normalMap: img('cap_n', { mirror: true }), normalScale: new THREE.Vector2(0.55, 0.55),
      clearcoat: 0.3, clearcoatRoughness: 0.2 }),
    thread: new THREE.MeshStandardMaterial({ color: 0xE6EBEF, roughness: 0.8 }),
    cone: new THREE.MeshPhysicalMaterial({ color: 0x2a3644, roughness: 0.55, metalness: 0.1, normalMap: T.coneN, normalScale: new THREE.Vector2(0.6, 0.6),
      clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color(0x8899aa) }),
    magnet: new THREE.MeshPhysicalMaterial({ color: 0xBFC6CC, metalness: 1, roughness: 0.26 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a222b, roughness: 0.6, metalness: 0.2 }),
    hole: new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.9 }),
    copper: new THREE.MeshPhysicalMaterial({ color: 0xC8743E, metalness: 1, roughness: 0.3 }),
    pcb: new THREE.MeshPhysicalMaterial({ map: img('pcb', { color: true, clamp: true }), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0x8a9096, metalness: 1, roughness: 0.38 }),
  };
  /* planar cap UVs read reversed on the right cup and true on the mirrored left one: flip the right cup's maps so both wordmarks read */
  M.capL = M.cap.clone();
  M.capL.map = img('cap_c', { color: true, clamp: true }); M.capL.roughnessMap = img('cap_r', { clamp: true }); M.capL.normalMap = img('cap_n', { clamp: true });
  const leatherBand = M.soft.clone(); leatherBand.normalMap = T.leatherN; leatherBand.roughnessMap = T.leatherR; leatherBand.normalScale.set(0.7, 0.7);
  M.softBand = leatherBand;
  const parts = {};

  /* ---------------- headband: spine + padded leather + stitching + hinge blocks ---------------- */
  const CX = 1.06, CY = -0.30, RX = 0.56, RY = 0.74, YX = CX + 0.08;          /* cup centre and half sizes; yoke plane x */
  const A = YX, Y0 = 0.84, BH = 1.16;                                           /* band arch: half-width, base height, rise */
  const archPts = []; for (let i = 0; i <= 64; i++) { const f = i / 64 * Math.PI, c = Math.cos(f), s = Math.sin(f);
    archPts.push(new THREE.Vector3(A * Math.sign(c) * Math.pow(Math.abs(c), 0.92), Y0 + BH * Math.pow(s, 0.8), 0)); }
  const arch = new THREE.CatmullRomCurve3(archPts);
  const BZ = new THREE.Vector3(0, 0, 1), AC = new THREE.Vector3(0, Y0, 0);
  const bandG = new THREE.Group(); root.add(bandG);
  const S = 180, SM = 32;
  const spineSec = superSec(0.34, 0.055, 5, SM);
  const spine = new THREE.Mesh(sweep(arch, S, BZ, AC, () => ({ pts: spineSec, off: 0 }), 4), M.band); bandG.add(spine);
  const P0 = 0.17, P1 = 0.83;                                                   /* pad span along the arch */
  const padCurve = new THREE.CatmullRomCurve3(Array.from({ length: 41 }, (_, i) => arch.getPointAt(P0 + (P1 - P0) * i / 40)));
  const padTh = (t) => 0.035 + 0.085 * Math.pow(Math.sin(Math.PI * t), 0.45);
  const padW = (t) => 0.30 + 0.06 * Math.pow(Math.sin(Math.PI * t), 0.6);
  const pad = new THREE.Mesh(sweep(padCurve, S, BZ, AC, (t) => ({ pts: superSec(padW(t), padTh(t), 3.2, SM), off: -(0.027 + padTh(t) / 2) }), 6), M.softBand);
  bandG.add(pad);
  /* stitching: two rows along the underside edges of the pad */
  { const list = [], P = new THREE.Vector3(), Tn = new THREE.Vector3(), Nn = new THREE.Vector3(), n = 110;
    for (let i = 0; i <= n; i++) { const t = 0.03 + 0.94 * i / n; padCurve.getPointAt(t, P); padCurve.getTangentAt(t, Tn);
      Nn.crossVectors(Tn, BZ).normalize(); if (Nn.dot(P.clone().sub(AC)) < 0) Nn.negate();
      const w = padW(t) / 2, th = padTh(t), off = -(0.027 + th / 2);
      for (const sb of [-1, 1]) { const b = sb * (w - 0.032), a = off - th / 2 * Math.pow(1 - Math.pow(Math.abs(b) / w, 3.2), 1 / 3.2) - 0.001;
        list.push([P.clone().addScaledVector(Nn, a).addScaledVector(BZ, b), Tn.clone()]); } }
    bandG.add(stitches(list, M.thread, 0.016, 0.0045)); }
  /* hinge blocks at the band ends: the slider enters here */
  const blockGeo = new RoundedBoxGeometry(0.115, 0.19, 0.355, 5, 0.05);
  for (const s of [-1, 1]) { const b = new THREE.Mesh(blockGeo, M.band); b.position.set(s * A, Y0 - 0.04, 0); bandG.add(b);
    const lip = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.03, 0.3, 2, 0.012), M.metal); lip.position.set(s * A, Y0 - 0.145, 0); bandG.add(lip); }
  /* a debossed wordmark plate on top of the band (fictional brand) */
  { const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#fff'; g.font = '700 38px "Inter Tight", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.letterSpacing = '14px'; g.fillText('HUSH', 256, 34);
    const t = new THREE.CanvasTexture(c);
    const top = arch.getPointAt(0.5);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.0525), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.22, alphaMap: t, transparent: true, depthWrite: false }));
    plate.rotation.x = -Math.PI / 2; plate.position.set(0, top.y + 0.0285, 0); bandG.add(plate); M.mark = plate.material; }
  parts.band = bandG; bandG.userData.out = new THREE.Vector3(0, 0.42, 0);

  /* ---------------- cups (built as the right side, mirrored for the left) ---------------- */
  const O = outline(RX, RY, 2.55, NO);
  const shellGeo = ovalLathe(O, [
    [0, 0.0, -0.066], [0.6, 0.06, -0.066], [1, 0.09, -0.064], [1, 0.045, -0.062], [1, 0.012, -0.05], [1, -0.004, -0.025],
    [1, -0.012, 0.03], [1, -0.013, 0.1], [1, -0.008, 0.16], [1, 0.006, 0.205], [1, 0.03, 0.238], [1, 0.062, 0.256], [1, 0.088, 0.262]]);
  const bezelGeo = ovalLathe(O, [[1, 0.084, 0.258], [1, 0.08, 0.272], [1, 0.088, 0.284], [1, 0.104, 0.29], [1, 0.128, 0.289], [1, 0.142, 0.282], [1, 0.15, 0.27]]);
  const capGeo = ovalLathe(O, [[1, 0.148, 0.27], [0.995, 0.148, 0.276], [0.985, 0.148, 0.281], [0.965, 0.148, 0.2855], [0.94, 0.148, 0.288], [0.85, 0.148, 0.2915], [0.75, 0.148, 0.2935], [0.6, 0.148, 0.2953], [0.45, 0.148, 0.2963], [0.3, 0.148, 0.2968], [0.15, 0.148, 0.297], [0, 0.148, 0.297]], 'planar');
  /* cushion cross-section in (d, h): a plump pillow from the shell's inner rim toward the head */
  const cushSec = loop2([[0.03, -0.055], [-0.006, -0.11], [-0.004, -0.2], [0.03, -0.272], [0.09, -0.3], [0.165, -0.302], [0.225, -0.282], [0.252, -0.225], [0.254, -0.13], [0.24, -0.065], [0.17, -0.052], [0.09, -0.05]], 40);
  const cushGeo = ovalLathe(O, cushSec.map(([d, h]) => [1, d, h]));
  const clothGeo = ovalLathe(O, [[1, 0.236, -0.075], [0.7, 0.236, -0.08], [0.35, 0.236, -0.083], [0, 0.236, -0.084]], 'planar');
  const coneGeo = new THREE.LatheGeometry([[0.02, 0], [0.08, 0.012], [0.16, 0.035], [0.25, 0.06], [0.3, 0.075], [0.315, 0.078], [0.33, 0.07], [0.345, 0.078], [0.36, 0.08]].map(([r, y]) => new THREE.Vector2(r, y)), 96).rotateZ(Math.PI / 2);
  const capDome = new THREE.SphereGeometry(0.08, 32, 12, 0, TAU, 0, Math.PI / 2).rotateZ(-Math.PI / 2).scale(0.35, 1, 1);
  const magGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 48).rotateZ(Math.PI / 2);
  const surGeo = new THREE.TorusGeometry(0.36, 0.016, 10, 96).rotateY(Math.PI / 2);
  const yokeCurve = new THREE.CatmullRomCurve3(Array.from({ length: 33 }, (_, i) => { const k = Math.round(i / 32 * NO / 2); const [u, v] = ptOn(O, k, -0.07);
    return new THREE.Vector3(YX - CX, v, u); }));
  const yokeGeo = sweep(yokeCurve, 140, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), () => ({ pts: superSec(0.11, 0.05, 4.5, 24), off: 0 }), 3);
  const pivotGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.075, 32);
  const pivotCap = new THREE.CylinderGeometry(0.043, 0.043, 0.014, 32);
  const sliderGeo = new RoundedBoxGeometry(0.034, 0.36, 0.11, 3, 0.012);
  /* sliders: engraved size scale + numerals + the side letter (baked, the left one pre-mirrored) */
  const sliderMat = {};
  for (const k of ['L', 'R']) { const m = M.metal.clone(); const t = img('slider_' + k, { color: true, clamp: true });
    m.map = t; m.bumpMap = img('slider_' + k, { clamp: true }); m.bumpScale = 1.2; sliderMat[k] = m; }
  /* control buttons: brushed caps with engraved icons (map darkens, bump sinks the icon) */
  const icoMat = (n) => new THREE.MeshPhysicalMaterial({ color: 0xE3E6E9, metalness: 1, roughness: 0.32, map: img('ico_' + n, { color: true, clamp: true }),
    bumpMap: img('ico_' + n, { clamp: true }), bumpScale: 1.6, clearcoat: 0.3, clearcoatRoughness: 0.2 });
  const btnGeo = new THREE.CylinderGeometry(0.021, 0.0225, 0.014, 40, 1);
  const gapGeo = new THREE.TorusGeometry(0.0238, 0.0018, 8, 48).rotateX(Math.PI / 2);
  /* cushion piping welt where the leather meets the cup */
  const weltGeo = ovalLathe(O, Array.from({ length: 13 }, (_, i) => { const a = i / 12 * TAU; return [1, 0.012 + Math.cos(a) * 0.0085, -0.066 + Math.sin(a) * 0.0085]; }));
  /* driver internals for the exploded view: stamped basket with spokes, copper voice coil, controller board */
  const basketRing = new THREE.TorusGeometry(0.372, 0.011, 10, 120).rotateY(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.014, 0.2, 0.026);
  const coilGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.04, 64, 1, true).rotateZ(Math.PI / 2);
  const pcbGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.014, 96).rotateZ(-Math.PI / 2);
  const ventGeo = new THREE.TorusGeometry(0.2, 0.006, 8, 96).rotateY(Math.PI / 2);

  for (const s of [-1, 1]) {
    const k = s < 0 ? 'L' : 'R';
    const side = new THREE.Group(); side.scale.x = s; root.add(side);
    /* yoke: arc over the cup, pivots front/back, slider bar up into the hinge block */
    const yG = new THREE.Group(); side.add(yG);
    const yoke = new THREE.Mesh(yokeGeo, M.metal); yoke.position.set(CX, CY, 0); yG.add(yoke);
    for (const e of [0, 1]) { const [u] = ptOn(O, e ? NO / 2 : 0, -0.07); const zz = u;
      const pv = new THREE.Mesh(pivotGeo, M.metal); pv.rotation.x = Math.PI / 2; pv.position.set(YX, CY, zz - Math.sign(zz) * 0.035); yG.add(pv);
      const pc = new THREE.Mesh(pivotCap, M.ring); pc.rotation.x = Math.PI / 2; pc.position.set(YX, CY, zz + Math.sign(zz) * 0.024); yG.add(pc); }
    const yTop = CY + RY + 0.07;
    const slider = new THREE.Mesh(sliderGeo, sliderMat[k]); slider.position.set(YX, yTop + 0.16, 0); yG.add(slider);
    const collar = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.06, 0.13, 3, 0.02), M.metal); collar.position.set(YX, yTop + 0.01, 0); yG.add(collar);
    /* the cup */
    const cup = new THREE.Group(); cup.position.set(CX, CY, 0); side.add(cup);
    const shell = new THREE.Mesh(shellGeo, M.shell); cup.add(shell);
    shell.add(new THREE.Mesh(bezelGeo, M.ring));
    shell.add(new THREE.Mesh(capGeo, s < 0 ? M.capL : M.cap));
    /* three mic ports per cup on the shell wall, plus a control button and a USB-C port on the right */
    { const g = new THREE.CylinderGeometry(0.011, 0.011, 0.01, 12), im = new THREE.InstancedMesh(g, M.dark, 3), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
      [[0.05, 0.13], [0.11, 0.13], [0.62, 0.1]].forEach(([f, h], i) => { const ii = Math.round(f * NO); const [u, v] = ptOn(O, ii, -0.0135); const Qn = O.q[ii];
        q.setFromUnitVectors(Y, new THREE.Vector3(0, Qn[1], Qn[0]).normalize()); m4.compose(new THREE.Vector3(h, v, u), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4); });
      shell.add(im); }
    if (s > 0) {
      /* three buttons (volume down, play/pause, volume up) along the rear edge, each in a shadow-gap ring */
      const Yv = new THREE.Vector3(0, 1, 0);
      [['minus', 0.535], ['play', 0.575], ['plus', 0.615]].forEach(([n, f]) => { const ii = Math.round(f * NO), [u, v] = ptOn(O, ii, -0.0125), Qn = O.q[ii];
        const nrm = new THREE.Vector3(0, Qn[1], Qn[0]).normalize();
        const b = new THREE.Mesh(btnGeo, [M.metal, icoMat(n), M.metal]); b.position.set(0.105, v, u).addScaledVector(nrm, 0.004); b.quaternion.setFromUnitVectors(Yv, nrm); shell.add(b);
        const gp = new THREE.Mesh(gapGeo, M.hole); gp.position.set(0.105, v, u).addScaledVector(nrm, -0.002); gp.quaternion.copy(b.quaternion); shell.add(gp); });
      /* power / pairing slide switch with an amber index */
      { const ii = Math.round(0.665 * NO), [u, v] = ptOn(O, ii, -0.012), Qn = O.q[ii], nrm = new THREE.Vector3(0, Qn[1], Qn[0]).normalize();
        const tr = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.012, 0.082, 3, 0.005), M.hole); tr.position.set(0.105, v, u); tr.quaternion.setFromUnitVectors(Yv, nrm); shell.add(tr);
        const kn = new THREE.Mesh(new RoundedBoxGeometry(0.024, 0.016, 0.04, 3, 0.006), M.metal); kn.position.set(0.105, v, u).addScaledVector(nrm, 0.003);
        kn.quaternion.copy(tr.quaternion); kn.translateZ(0.016); shell.add(kn);
        const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 16), M.ring); dot.position.copy(kn.position).addScaledVector(nrm, 0.007); dot.quaternion.copy(tr.quaternion); shell.add(dot); }
      /* USB-C: steel shroud, black cavity, tongue, and a tiny status LED beside it */
      { const jj = Math.round(0.75 * NO), [u2, v2] = ptOn(O, jj, -0.012), Qn = O.q[jj], nrm = new THREE.Vector3(0, Qn[1], Qn[0]).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(Yv, nrm);
        const sh = new THREE.Mesh(new RoundedBoxGeometry(0.036, 0.012, 0.104, 3, 0.0058), M.steel); sh.position.set(0.085, v2, u2); sh.quaternion.copy(q); shell.add(sh);
        const cav = new THREE.Mesh(new RoundedBoxGeometry(0.029, 0.012, 0.096, 3, 0.0052), M.hole); cav.position.copy(sh.position).addScaledVector(nrm, 0.0016); cav.quaternion.copy(q); shell.add(cav);
        const tg = new THREE.Mesh(new RoundedBoxGeometry(0.0085, 0.01, 0.066, 2, 0.002), M.dark); tg.position.copy(sh.position).addScaledVector(nrm, 0.0022); tg.quaternion.copy(q); shell.add(tg);
        const led = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.006, 16), new THREE.MeshStandardMaterial({ color: 0x332211, emissive: 0xF0A23B, emissiveIntensity: 1.2, roughness: 0.3 }));
        led.position.copy(sh.position).addScaledVector(nrm, 0.0008); led.quaternion.copy(q); led.translateZ(0.085); shell.add(led); }
    }
    const cush = new THREE.Mesh(cushGeo, M.soft); cup.add(cush);
    /* a stitched seam round the cushion's outer wall */
    { const list = [], n = 170;
      for (let i = 0; i < n; i++) { const ii = Math.round(i / n * NO); const [u, v] = ptOn(O, ii, -0.0085); const Qn = O.q[ii % NO];
        list.push([new THREE.Vector3(-0.11, v, u), new THREE.Vector3(0, Qn[0], -Qn[1])]); }
      cush.add(stitches(list, M.thread, 0.012, 0.0038)); }
    cush.add(new THREE.Mesh(weltGeo, M.soft));
    { const list = [], n = 150;
      for (let i = 0; i < n; i++) { const ii = Math.round(i / n * NO); const [u, v] = ptOn(O, ii, 0.214); const Qn = O.q[ii % NO];
        list.push([new THREE.Vector3(-0.287, v, u), new THREE.Vector3(0, Qn[0], -Qn[1])]); }
      cush.add(stitches(list, M.thread, 0.011, 0.0034)); }
    /* driver: printed cloth + cone + surround (sits inside the cushion), magnet behind */
    const drv = new THREE.Group(); cup.add(drv);
    const clothMat = new THREE.MeshPhysicalMaterial({ map: sideCloth(k), normalMap: T.clothN, normalScale: new THREE.Vector2(0.8, 0.8),
      roughness: 0.92, sheen: 0.7, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x9aa6b4) });
    const cloth = new THREE.Mesh(clothGeo, clothMat); drv.add(cloth);
    const cone = new THREE.Mesh(coneGeo, M.cone); cone.position.x = 0.06; drv.add(cone);
    const dome = new THREE.Mesh(capDome, M.magnet); dome.position.x = 0.052; dome.rotation.z = Math.PI; drv.add(dome);
    const sur = new THREE.Mesh(surGeo, M.ring); sur.position.x = -0.02; drv.add(sur);
    { const br = new THREE.Mesh(basketRing, M.steel); br.position.x = 0.075; drv.add(br); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.26, sp = new THREE.Mesh(spokeGeo, M.steel);
      sp.position.set(0.1, Math.cos(a) * 0.27, Math.sin(a) * 0.27); sp.rotation.x = -a; drv.add(sp); }
    { const coil = new THREE.Mesh(coilGeo, M.copper); coil.position.x = 0.1; drv.add(coil); }
    const mag = new THREE.Mesh(magGeo, M.magnet); mag.position.x = 0.13; cup.add(mag);
    { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.104, 40).rotateZ(Math.PI / 2), M.steel); mag.add(pole);
      const board = new THREE.Mesh(pcbGeo, [M.dark, M.pcb, M.dark]); board.position.x = 0.075; mag.add(board);
      const v1 = new THREE.Mesh(ventGeo, M.steel); v1.position.x = -0.05; mag.add(v1); }

    parts['yoke' + k] = yG; yG.userData.out = new THREE.Vector3(0.22, 0.12, 0);
    parts['cup' + k] = cup; cup.userData.out = new THREE.Vector3(0.22, -0.04, 0);
    parts['shell' + k] = shell; shell.userData.out = new THREE.Vector3(0.5, 0, 0);
    parts['cush' + k] = cush; cush.userData.out = new THREE.Vector3(-0.44, 0, 0);
    parts['drv' + k] = drv; drv.userData.out = new THREE.Vector3(-0.08, 0, 0);
    parts['mag' + k] = mag; mag.userData.out = new THREE.Vector3(0.26, 0, 0);
  }
  for (const k in parts) parts[k].userData.home = parts[k].position.clone();

  function explode(t) {
    for (const k in parts) { const p = parts[k]; p.position.copy(p.userData.home).addScaledVector(p.userData.out, t); }
  }
  /* derived colours: anodised cap follows the shell, thread is a lighter tone of the leather, band pad = leather */
  const W1 = new THREE.Color(0xffffff), tmp = new THREE.Color();
  function sync() {
    M.cap.color.copy(M.shell.color).lerp(W1, 0.12); M.capL.color.copy(M.cap.color);
    M.thread.color.copy(M.soft.color).lerp(W1, 0.32);
    M.softBand.color.copy(M.soft.color);
    if (M.mark) M.mark.color.copy(M.band.color).lerp(W1, 0.5);
  }
  function setWay(w, k = 1) {
    M.shell.color.lerp(tmp.set(w.shell), k); M.soft.color.lerp(tmp.set(w.soft), k);
    M.band.color.lerp(tmp.set(w.band), k); M.ring.color.lerp(tmp.set(w.ring), k); sync();
  }
  sync();
  /* anchor points for callouts (children of parts, so they travel with the explode) */
  const anchor = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const anchors = {
    driver: anchor(parts.drvR, -0.08, 0.16, 0.14),
    foam: anchor(parts.cushL, -0.3, -0.45, 0.22),
    mics: anchor(parts.shellL, 0.14, 0.42, 0.42),
    band: anchor(parts.band, 0.35, Y0 + BH * 0.97, 0.12),
    slider: anchor(parts.yokeR, YX, CY + RY + 0.2, 0),
  };
  return { root, parts, explode, setWay, sync, anchors, M };
}
