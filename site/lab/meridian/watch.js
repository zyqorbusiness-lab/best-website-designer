/* Meridian - the hero watch is a real 3D model: "Wrist watch" by a.aazhgirevich (Sketchfab, CC BY 4.0), cleaned and optimised into one GLB
   (maker logo + dial text removed, re-scaled, meshopt). Code adds the printed dial (the fictional Meridian print), the PBR materials, lume and the light sweep.
   Built Y-up (dial faces +y, 12 o'clock = -z, 3 o'clock = +x); the returned group is turned so the dial faces the camera. */
import { THREE, Q, isM } from '../_kit/kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const DIALS = [
  { key: 'forest',   word: 'MERIDIAN', name: 'Forest',   note: 'Sunburst green, tan leather', dial: '#1F4D3A', dial2: '#2E6B52', strap: '#6E4426', stitch: '#E9DCC0', text: '#EFE8D8', word_c: '#1F4D3A', bg: '#EFE8D8' },
  { key: 'nocturne', word: 'NOCTURNE', name: 'Nocturne', note: 'Midnight green, sand stitching', dial: '#0F2D29', dial2: '#1D4A42', strap: '#1B3A33', stitch: '#C9A24A', text: '#E9DFC8', word_c: '#14382F', bg: '#E9E3D3' },
  { key: 'solstice', word: 'SOLSTICE', name: 'Solstice', note: 'Sand dial, forest leather',  dial: '#D8C49A', dial2: '#EFE2C2', strap: '#1F4D3A', stitch: '#EFE8D8', text: '#1F4D3A', word_c: '#B48E3C', bg: '#F1EADB' },
];

const GOLD = 0xC9A24A;

function dialCanvas(d, size) {
  /* canvas radius = the real dial's outer edge (0.836 page units); the model's applied batons cover 0.60-0.92 of it, its rehaut slope starts at 0.84 */
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), R = size / 2;
  g.translate(R, R);
  /* sunburst: a soft radial base + hundreds of hairline rays */
  const base = g.createRadialGradient(-R * 0.25, -R * 0.35, R * 0.05, 0, 0, R);
  base.addColorStop(0, d.dial2); base.addColorStop(0.65, d.dial); base.addColorStop(1, shade(d.dial, -0.28));
  g.fillStyle = base; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2, k = (Math.sin(a * 2 + 0.6) + 1) / 2;
    g.strokeStyle = `rgba(255,255,255,${0.012 + 0.05 * k * k})`; g.lineWidth = size / 900;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke();
  }
  /* rehaut: the model's dial rises into a sloped flange from 0.84 R; print it a shade darker so the track reads as a separate ring */
  { const rg = g.createRadialGradient(0, 0, R * 0.84, 0, 0, R);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(0.08, shade(d.dial, -0.32)); rg.addColorStop(1, shade(d.dial, -0.42));
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.arc(0, 0, R * 0.84, 0, Math.PI * 2, true); g.fill(); }
  /* railroad minute track: two hairline rails, 60 minute ticks, 240 quarter-second ticks between them */
  const ink = d.text;
  g.strokeStyle = ink; g.globalAlpha = 0.9;
  g.lineWidth = size * 0.0011;
  for (const rr of [0.985, 0.94]) { g.beginPath(); g.arc(0, 0, R * rr, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 240; i++) {
    if (i % 4 === 0) continue;
    const a = (i / 240) * Math.PI * 2; g.lineWidth = size * 0.0007; g.globalAlpha = 0.55;
    g.beginPath(); g.moveTo(Math.sin(a) * R * 0.985, -Math.cos(a) * R * 0.985); g.lineTo(Math.sin(a) * R * 0.97, -Math.cos(a) * R * 0.97); g.stroke();
  }
  g.globalAlpha = 0.92;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
    g.lineWidth = size * (big ? 0.0042 : 0.0019);
    const r1 = R * 0.985, r2 = R * (big ? 0.93 : 0.94);
    g.beginPath(); g.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1); g.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2); g.stroke();
  }
  /* hour marks are the model's applied batons, so no printed numerals */
  /* inner chapter ring + a fine circular-grain band under the indices */
  g.strokeStyle = ink; g.globalAlpha = 0.28; g.lineWidth = size * 0.0012;
  g.beginPath(); g.arc(0, 0, R * 0.585, 0, Math.PI * 2); g.stroke();
  g.globalAlpha = 0.07;
  for (let rr = 0.6; rr < 0.9; rr += 0.0035) { g.lineWidth = size * 0.0006; g.beginPath(); g.arc(0, 0, R * rr, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = 1;
  /* wordmark + small print (a fictional brand; the page labels it Concept) */
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `400 ${size * 0.058}px Anton, "Arial Narrow", sans-serif`;
  spaced(g, 'MERIDIAN', 0, -R * 0.36, size * 0.011);
  g.font = `500 ${size * 0.0175}px "Inter Tight", sans-serif`; g.globalAlpha = 0.75;
  spaced(g, 'ZYQOR LAB  ·  CONCEPT 02', 0, -R * 0.27, size * 0.006);
  g.globalAlpha = 1;
  g.font = `italic 500 ${size * 0.03}px "Instrument Serif", Georgia, serif`;
  g.fillText('Automatic', 0, R * 0.3);
  g.font = `600 ${size * 0.0165}px "Inter Tight", sans-serif`; g.globalAlpha = 0.72;
  spaced(g, 'CALIBRE ZQ-28  ·  72 H  ·  100 M', 0, R * 0.375, size * 0.0045);
  /* tiny print either side of 6 o'clock, just inside the batons */
  g.font = `600 ${size * 0.0118}px "Inter Tight", sans-serif`; g.globalAlpha = 0.6;
  for (const [txt, sgn] of [['CONCEPT', -1], ['NOT FOR SALE', 1]]) {
    const a = Math.PI + sgn * 0.3; g.save(); g.rotate(a); g.translate(0, -R * 0.55); g.rotate(Math.PI);
    spaced(g, txt, 0, 0, size * 0.003); g.restore();
  }
  g.globalAlpha = 1;
  /* date window at 3 o'clock */
  const dw = size * 0.064, dh = size * 0.052, dx = R * 0.43;
  g.fillStyle = '#F4EEE1'; g.fillRect(dx - dw / 2, -dh / 2, dw, dh);
  { const sh = g.createLinearGradient(0, -dh / 2, 0, -dh / 2 + dh * 0.35); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(dx - dw / 2, -dh / 2, dw, dh * 0.35); }
  g.strokeStyle = '#C9A24A'; g.lineWidth = size * 0.004; g.strokeRect(dx - dw / 2, -dh / 2, dw, dh);
  g.fillStyle = '#1F2A26'; g.font = `600 ${size * 0.034}px "Inter Tight", sans-serif`;
  g.fillText(String(new Date().getDate()), dx, size * 0.002);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function spaced(g, txt, x, y, sp) {
  const w = [...txt].reduce((s, ch) => s + g.measureText(ch).width + sp, -sp);
  let cx = x - w / 2;
  for (const ch of txt) { const cw = g.measureText(ch).width; g.fillText(ch, cx + cw / 2, y); cx += cw + sp; }
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(Math.min(255, Math.max(0, k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `rgb(${f(r)},${f(gg)},${f(b)})`;
}
/* ---------------- procedural surface maps (all generated in the browser, no downloads) ---------------- */
const _cache = {};
/* circular graining for the case flank: streaks that run around the case */
function brushTex() {
  if (_cache.brush) return _cache.brush;
  const c = document.createElement('canvas'); c.width = 8; c.height = 1024;
  const g = c.getContext('2d'), img = g.createImageData(8, 1024), px = img.data;
  for (let y = 0; y < 1024; y++) {
    const v = 200 + Math.random() * 55 - (Math.random() < 0.08 ? 40 : 0);
    for (let x = 0; x < 8; x++) { const i = (y * 8 + x) * 4; px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255; }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3);
  return (_cache.brush = t);
}
/* sunburst: the anisotropy direction is tangential everywhere, so the light fans out in rays from the centre */
function sunburstDir() {
  if (_cache.sun) return _cache.sun;
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), px = img.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N - 0.5, v = 0.5 - (y + 0.5) / N, l = Math.hypot(u, v) || 1;
    const i = (y * N + x) * 4;
    px[i] = (-v / l * 0.5 + 0.5) * 255; px[i + 1] = (u / l * 0.5 + 0.5) * 255; px[i + 2] = 255; px[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return (_cache.sun = new THREE.CanvasTexture(c));
}
/* pebbled leather: a tileable cell-noise height field, turned into a normal map and a grain mask */
function leatherHeight() {
  if (_cache.lh) return _cache.lh;
  const N = 256, C = 22, pts = [];
  for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) pts.push([(i + Math.random()) / C, (j + Math.random()) / C]);
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = (x + 0.5) / N, py = (y + 0.5) / N, ci = Math.floor(px * C), cj = Math.floor(py * C);
    let f1 = 9, f2 = 9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (ci + di + C) % C, jj = (cj + dj + C) % C, p = pts[jj * C + ii];
      let dx = p[0] + Math.floor((ci + di) / C) - px, dy = p[1] + Math.floor((cj + dj) / C) - py;
      const d = dx * dx + dy * dy;
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    h[y * N + x] = Math.min(1, (Math.sqrt(f2) - Math.sqrt(f1)) * C * 1.6) + (Math.random() - 0.5) * 0.08;
  }
  return (_cache.lh = { h, N });
}
function leatherNormal() {
  if (_cache.ln) return _cache.ln;
  const { h, N } = leatherHeight(), c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), px = img.data, at = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let nx = (at(x - 1, y) - at(x + 1, y)) * 2.2, ny = (at(x, y + 1) - at(x, y - 1)) * 2.2, nz = 1;
    const l = Math.hypot(nx, ny, nz); const i = (y * N + x) * 4;
    px[i] = (nx / l * 0.5 + 0.5) * 255; px[i + 1] = (ny / l * 0.5 + 0.5) * 255; px[i + 2] = (nz / l * 0.5 + 0.5) * 255; px[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (_cache.ln = t);
}
function leatherColor(d) {
  const { h, N } = leatherHeight(), c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = d.strap; g.fillRect(0, 0, N, N);
  const img = g.getImageData(0, 0, N, N), px = img.data;
  for (let k = 0; k < N * N; k++) { const f = 0.8 + 0.28 * h[k]; px[k * 4] *= f; px[k * 4 + 1] *= f; px[k * 4 + 2] *= f; }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* dial fonts: loaded by the module itself so the printed dial never falls back to a system face */
const FONT = (f) => new URL('../../assets/font/' + f, import.meta.url).href;
const dialFonts = (() => {
  if (!('FontFace' in window) || !document.fonts) return Promise.resolve();
  const faces = [
    new FontFace('Anton', `url(${FONT('anton-400.woff2')})`, { weight: '400' }),
    new FontFace('Inter Tight', `url(${FONT('intertight-normal.woff2')})`, { weight: '100 900' }),
    new FontFace('Instrument Serif', `url(${FONT('instrumentserif-400-italic.woff2')})`, { style: 'italic', weight: '400' }),
  ];
  return Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)).catch(() => null)));
})();
/* sunburst brushing as a roughness map: thousands of radial hairlines with random strength */
function sunRough() {
  if (_cache.sr) return _cache.sr;
  const N = 1024, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = 'rgb(150,150,150)'; g.fillRect(0, 0, N, N); g.translate(N / 2, N / 2);
  for (let i = 0; i < 2600; i++) {
    const a = Math.random() * Math.PI * 2, v = 110 + Math.random() * 90, r0 = Math.random() * N * 0.08;
    g.strokeStyle = `rgba(${v},${v},${v},0.5)`; g.lineWidth = 0.6 + Math.random() * 0.8;
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * N * 0.72, Math.sin(a) * N * 0.72); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  return (_cache.sr = t);
}
/* polished steel is never perfect: faint wipes and fingerprint-like smudges in the roughness channel */
function smudgeRough() {
  if (_cache.sm) return _cache.sm;
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = 'rgb(40,40,40)'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * N, y = Math.random() * N, r = 20 + Math.random() * 60, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(120,120,120,.35)'); gr.addColorStop(1, 'rgba(120,120,120,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.strokeStyle = 'rgba(110,110,110,.18)';
  for (let i = 0; i < 160; i++) { const x = Math.random() * N, y = Math.random() * N, a = Math.random() * 6.28, l = 10 + Math.random() * 70;
    g.lineWidth = 0.5 + Math.random(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (_cache.sm = t);
}
/* engraved caseback: concentric text ring, sun emblem, serial; drawn as a height map (bump) + matching roughness */
function casebackMaps() {
  if (_cache.cb) return _cache.cb;
  const N = 1024, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const hc = mk(), g = hc.getContext('2d'), R = N / 2;
  g.fillStyle = '#fff'; g.fillRect(0, 0, N, N); g.translate(R, R);
  /* fine circular graining in the centre medallion */
  g.strokeStyle = 'rgba(0,0,0,.05)'; for (let r = 4; r < R * 0.62; r += 2.2) { g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#000'; g.strokeStyle = '#000';
  /* engraved rings */
  for (const [r, w] of [[0.95, 3], [0.66, 2.5], [0.63, 1.2]]) { g.lineWidth = w; g.beginPath(); g.arc(0, 0, R * r, 0, Math.PI * 2); g.stroke(); }
  /* text on the ring */
  const ring = 'MERIDIAN  ·  AUTOMATIC  ·  STAINLESS STEEL  ·  SAPPHIRE  ·  WATER RESISTANT 100 M  ·  CONCEPT 02  ·  ';
  g.font = `600 ${N * 0.034}px "Inter Tight", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const chars = [...ring], step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => { g.save(); g.rotate(i * step); g.translate(0, -R * 0.805); g.fillText(ch, 0, 0); g.restore(); });
  /* sun emblem: 24 tapered rays round a disc */
  for (let i = 0; i < 24; i++) { g.save(); g.rotate((i / 24) * Math.PI * 2); g.beginPath(); g.moveTo(-N * 0.006, -R * 0.14); g.lineTo(N * 0.006, -R * 0.14); g.lineTo(0, -R * (i % 2 ? 0.3 : 0.4)); g.closePath(); g.fill(); g.restore(); }
  g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * 0.11, 0, Math.PI * 2); g.stroke();
  g.font = `600 ${N * 0.026}px "Inter Tight", sans-serif`;
  spaced(g, 'ZQ-28  ·  N\u00B0 0207', 0, R * 0.5, N * 0.006);
  /* blur a touch so the bump has soft walls, then derive roughness: engraved grooves are matte */
  const bc = mk(), bg = bc.getContext('2d'); bg.filter = 'blur(1.2px)'; bg.drawImage(hc, 0, 0);
  const rc = mk(), rg = rc.getContext('2d'); rg.drawImage(bc, 0, 0);
  const id = rg.getImageData(0, 0, N, N), px = id.data;
  for (let i = 0; i < px.length; i += 4) { const v = 255 - px[i]; const r = 75 + v * 0.5; px[i] = px[i + 1] = px[i + 2] = r; }
  rg.putImageData(id, 0, 0);
  const bump = new THREE.CanvasTexture(bc), rough = new THREE.CanvasTexture(rc);
  bump.anisotropy = rough.anisotropy = 8;
  return (_cache.cb = { bump, rough });
}
const P2 = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
/* a padded, tapered leather strap, bent around the wrist. Outer (visible) face is +y before bending. */
function strapGeo(w0, w1, t, L, R, dir, pad) {
  const NS = 96, NC = 40, pos = [], uv = [], col = [], idx = [], cross = [];
  for (let k = 0; k < NC; k++) {
    const ph = (k / NC) * Math.PI * 2 - Math.PI / 2, c = Math.cos(ph), s = Math.sin(ph);
    cross.push([Math.sign(c) * Math.pow(Math.abs(c), 0.42), Math.sign(s) * Math.pow(Math.abs(s), 0.42)]);
  }
  for (let i = 0; i <= NS; i++) {
    const f = i / NS, sl = f * L, wv = w0 + (w1 - w0) * f * f, a = sl / R;
    for (let k = 0; k <= NC; k++) {
      const [cx, cy] = cross[k % NC];
      let x = cx * wv / 2, y = cy * t / 2; if (cy > 0) y += pad * (1 - cx * cx) * cy;
      const rr = R + y;
      pos.push(x, -(R - Math.cos(a) * rr), dir * Math.sin(a) * rr);
      uv.push((k / NC) * 5.0, sl * 3.4);
      const e = Math.abs(cx) > 0.9 ? 0.5 : 1; col.push(e, e * 0.96, e * 0.93);
    }
  }
  for (let i = 0; i < NS; i++) for (let k = 0; k < NC; k++) {
    const a0 = i * (NC + 1) + k, b0 = a0 + NC + 1;
    if (dir > 0) idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1); else idx.push(a0, a0 + 1, b0, b0, a0 + 1, b0 + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}


/* The real model, loaded once (desktop and phone fetch the same file). Parts are named by role in the GLB. */
const MODEL_URL = new URL('../../assets/lab/meridian/meridian-watch.glb', import.meta.url).href;
const LEATHER_N = new URL('../../assets/lab/meridian/leather_nor.webp', import.meta.url).href;
const LEATHER_R = new URL('../../assets/lab/meridian/leather_rough.webp', import.meta.url).href;
const DIAL_R = 0.836;   /* outer radius of the model's dial (page units, rehaut edge) = the printed canvas radius */

/* GLB attributes are quantized (normalized ints + a node transform); copy one into plain floats in the watch's space */
function bakeGeometry(mesh, keep = ['position', 'normal', 'uv']) {
  const src = mesh.geometry, g = new THREE.BufferGeometry(), M = mesh.matrix, N = new THREE.Matrix3().getNormalMatrix(M);
  const v = new THREE.Vector3();
  for (const name of keep) {
    const a = src.getAttribute(name); if (!a) continue;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) {
      if (name === 'position') { v.fromBufferAttribute(a, i).applyMatrix4(M); out.set([v.x, v.y, v.z], i * 3); }
      else if (name === 'normal') { v.fromBufferAttribute(a, i).applyMatrix3(N).normalize(); out.set([v.x, v.y, v.z], i * 3); }
      else for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    }
    g.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
  }
  if (src.index) g.setIndex(new THREE.BufferAttribute(Uint32Array.from(src.index.array), 1));
  return g;
}
/* the source dial and crystal are modelled facing into the case: turn them out (normals + winding) */
function flipFaces(g) {
  const n = g.getAttribute('normal'); if (n) { for (let i = 0; i < n.array.length; i++) n.array[i] = -n.array[i]; n.needsUpdate = true; }
  const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  g.index.needsUpdate = true; return g;
}

export function buildWatch(renderer) {
  const root = new THREE.Group();   /* faces camera */
  const w = new THREE.Group();      /* Y-up watch */
  w.rotation.x = Math.PI / 2;
  root.add(w);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4);

  /* ---- materials (PBR; the GLB carries geometry + part names, the look is set here) ---- */
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xE4E1DA, metalness: 1, roughness: 0.15, envMapIntensity: 1.25, clearcoat: 0.3, clearcoatRoughness: 0.08 });
  const bezelSteel = new THREE.MeshPhysicalMaterial({ color: 0xE9E6DF, metalness: 1, roughness: 0.1, envMapIntensity: 1.35 });
  const crownSteel = new THREE.MeshPhysicalMaterial({ color: 0xDDDAD3, metalness: 1, roughness: 0.22, envMapIntensity: 1.2 });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xD9B565, metalness: 1, roughness: 0.2, envMapIntensity: 1.3, emissive: 0x9DF7C4, emissiveIntensity: 0 });
  const secMat = new THREE.MeshPhysicalMaterial({ color: 0xE9DFC8, metalness: 0.7, roughness: 0.22 });
  const tl = new THREE.TextureLoader();
  const lN = tl.load(LEATHER_N), lR = tl.load(LEATHER_R);
  for (const t of [lN, lR]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); t.anisotropy = aniso; }
  const strapMat = new THREE.MeshPhysicalMaterial({ color: 0x6E4426, roughness: 1, roughnessMap: lR, metalness: 0, normalMap: lN, normalScale: new THREE.Vector2(1.4, 1.4),
    sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xd9c3a0), envMapIntensity: 0.6 });
  const dialMat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, roughnessMap: sunRough(), metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, anisotropy: 0.9, anisotropyMap: sunburstDir() });
  const glassMat = new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0,
    specularIntensity: 0.7, ior: 1.77, iridescence: 0.45, iridescenceIOR: 1.38, iridescenceThicknessRange: [250, 340],
    envMapIntensity: 0.8, depthWrite: false, color: 0xf3f6ff, side: THREE.FrontSide });

  /* ---- light sweep across the crystal (follows the real dome) ---- */
  const sweepMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: -1 }, uA: { value: 1 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz / ' + (2 * 0.9).toFixed(3) + '; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vP; uniform float uT; uniform float uA; void main(){ vec2 p = vP; float m = smoothstep(0.5, 0.44, length(p)); float d = (p.x - p.y) * 0.7 - uT; float b = exp(-d*d*90.0) * 0.5 + exp(-pow(d+0.09,2.0)*700.0) * 0.3; b *= uA; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * b * m, b * m); }',
  });

  /* ---- lume: the batons and hands glow, a halo layer ignites clockwise ---- */
  function glowTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  }
  const gt = glowTex();
  const glowMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uIgn: { value: 0 }, uN: { value: 0 }, uC: { value: new THREE.Color(0x9DF7C4) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uIgn; uniform float uN; uniform vec3 uC;
      void main(){ vec2 p = (vUv - 0.5) * 2.0; float r = length(p); float ang = atan(p.x, p.y); ang = ang < 0.0 ? ang + 6.2831853 : ang;
        float rev = smoothstep(ang - 0.25, ang, uIgn * 6.6);
        float k = floor(ang / 0.5235988 + 0.5); float ca = k * 0.5235988; vec2 c = vec2(sin(ca), cos(ca)) * 0.7;
        float pip = exp(-pow(length(p - c) * 9.0, 2.0)) * 1.1;
        float ring = exp(-pow((r - 0.9) * 14.0, 2.0)) * 0.1;
        float a = (pip + ring) * rev * uN; gl_FragColor = vec4(uC * a, a); }`,
  });
  const dGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), glowMat);
  dGlow.rotation.x = -Math.PI / 2; dGlow.position.y = 0.114; w.add(dGlow);
  const hgMat = new THREE.MeshBasicMaterial({ map: gt, color: 0x9DF7C4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

  /* hands live in pivots at the dial centre (the GLB has them pointing at 12) */
  const hH = new THREE.Group(), hM = new THREE.Group(), hS = new THREE.Group();
  w.add(hH, hM, hS);
  for (const [g, len] of [[hH, 0.5], [hM, 0.58]]) {
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.14, len * 0.95), hgMat);
    gl.rotation.x = -Math.PI / 2; gl.position.set(0, 0.16, -len * 0.5); g.add(gl);
  }

  /* flange ring between the dial's edge and the bezel (the source's printed ring was dropped with its maker text) */
  const flangeMat = new THREE.MeshPhysicalMaterial({ color: 0x1F4D3A, metalness: 0.45, roughness: 0.42, side: THREE.DoubleSide });
  { const pts = [[0.822, 0.116], [0.845, 0.128], [0.872, 0.165], [0.905, 0.236]].map(([r, y]) => new THREE.Vector2(r, y));
    const fl = new THREE.Mesh(new THREE.LatheGeometry(pts, 160), flangeMat); w.add(fl); }

  /* engraved caseback medallion (code-made, seen during the dial-change twist) on the model's flat back */
  { const cb = casebackMaps();
    const backMat = new THREE.MeshPhysicalMaterial({ color: 0xD6D3CC, metalness: 1, roughness: 1, roughnessMap: cb.rough, bumpMap: cb.bump, bumpScale: 1.6 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 128), backMat); disc.rotation.x = Math.PI / 2; disc.position.y = -0.0705; w.add(disc); }

  const parts = {};
  let ready = false, resolveReady;
  const whenReady = new Promise((r) => (resolveReady = r));
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const onProgress = (e) => { if (e.lengthComputable || e.total) window.dispatchEvent(new CustomEvent('meridian:progress', { detail: Math.min(1, e.loaded / (e.total || 1)) })); };
  function load() {
    loader.load(MODEL_URL, (gltf) => {
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => { if (o.isMesh) parts[o.name] = o; });
      const use = (name, mat, parent = w) => { const m = parts[name]; if (!m) return null; m.material = mat; parent.add(m); return m; };
      use('case', steel); use('bezel', bezelSteel); use('crown', crownSteel); use('buckle', steel);
      use('strap', strapMat); use('idx', gold); use('pin', gold); use('cap', gold);
      use('hand_h', gold, hH); use('hand_m', gold, hM); use('hand_s', secMat, hS);
      /* dial: planar UVs so the printed canvas lands on the real plate (12 o'clock = -z) */
      if (parts.dial) {
        const g = flipFaces(bakeGeometry(parts.dial, ['position', 'normal']));
        const p = g.getAttribute('position'), uv = new Float32Array(p.count * 2);
        for (let i = 0; i < p.count; i++) { uv[i * 2] = 0.5 + p.getX(i) / (2 * DIAL_R); uv[i * 2 + 1] = 0.5 - p.getZ(i) / (2 * DIAL_R); }
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        const d = new THREE.Mesh(g, dialMat); d.name = 'dial'; w.add(d); parts.dialMesh = d;
      }
      if (parts.glass) {
        const g = flipFaces(bakeGeometry(parts.glass, ['position', 'normal']));
        const crys = new THREE.Mesh(g, glassMat); crys.renderOrder = 2; w.add(crys);
        const sw = new THREE.Mesh(g, sweepMat); sw.renderOrder = 3; sw.scale.setScalar(1.002); w.add(sw);
      }
      ready = true; setVariant(curV); resolveReady(); window.dispatchEvent(new CustomEvent('meridian:ready'));
    }, onProgress, (err) => { console.warn('Meridian model failed to load', err); window.dispatchEvent(new CustomEvent('meridian:failed')); });
  }

  const LUME_D = new THREE.Color(0xD9B565), LUME_N = new THREE.Color(0xC4FFDC);
  const dialDay = new THREE.Color(0xffffff), dialNight = new THREE.Color(0x7d9488), strapNight = new THREE.Color(0x5a5850);
  const strapDay = new THREE.Color(0x6E4426);
  function setLume(n, ign) {
    glowMat.uniforms.uN.value = n; glowMat.uniforms.uIgn.value = ign;
    gold.emissiveIntensity = 1.6 * n * ign; gold.color.copy(LUME_D).lerp(LUME_N, n * 0.35);
    hgMat.opacity = 0.5 * n * ign;
    dialMat.color.copy(dialDay).lerp(dialNight, n);
    strapMat.color.copy(strapDay).lerp(strapNight, n * 0.6);
  }
  const dialTex = DIALS.map(() => null);
  function setVariant(i) {
    const d = DIALS[i]; curV = i;
    if (!dialTex[i]) dialTex[i] = dialCanvas(d, 2048);
    dialMat.map = dialTex[i]; dialMat.needsUpdate = true;
    strapDay.set(d.strap); strapMat.color.copy(strapDay);
    flangeMat.color.set(d.dial).multiplyScalar(i === 2 ? 0.92 : 0.82);
    secMat.color.set(i === 2 ? 0x1F4D3A : 0xE9DFC8);
  }
  let curV = 0;
  dialFonts.then(() => { for (let k = 0; k < dialTex.length; k++) if (dialTex[k]) { dialTex[k].dispose(); dialTex[k] = null; } setVariant(curV); });
  function setTime(date, smooth = true, offMin = 0) {
    const ms = date.getMilliseconds(), s = date.getSeconds() + (smooth ? ms / 1000 : 0);
    /* 28,800 vph: the seconds hand moves in 8 tiny steps per second */
    const sStep = smooth ? Math.floor(s * 8) / 8 : s;
    const m = date.getMinutes() + s / 60 + offMin, h = (date.getHours() % 12) + m / 60;
    hS.rotation.y = -(sStep / 60) * Math.PI * 2;
    hM.rotation.y = -(m / 60) * Math.PI * 2;
    hH.rotation.y = -(h / 12) * Math.PI * 2;
  }
  return { root, w, setVariant, setTime, setLume, sweepMat, load, whenReady, get ready() { return ready; } };
}

/* presentation box: forest felt case, cream pillow, open lid */
export function buildBox() {
  const g = new THREE.Group();
  const felt = new THREE.MeshPhysicalMaterial({ color: 0x1F4D3A, roughness: 0.92, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x5f8f78) });
  const lining = new THREE.MeshPhysicalMaterial({ color: 0xEDE3CC, roughness: 0.95, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff) });
  const goldM = new THREE.MeshPhysicalMaterial({ color: 0xD6B467, metalness: 1, roughness: 0.5 });
  /* sized for the real watch: its strap is a closed worn loop, so the case is deep enough to take it (the loop drops into a slot in the lining) */
  const W = 3.6, D = 4.4, H = 2.9, TOP = 0.1;
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 4, 0.14), felt); base.position.y = TOP - H / 2; g.add(base);
  const well = new THREE.Mesh(new RoundedBoxGeometry(W - 0.28, 0.08, D - 0.28, 3, 0.035), lining); well.position.y = TOP + 0.005; g.add(well);
  const pillow = new THREE.Mesh(new RoundedBoxGeometry(2.5, 0.62, 2.9, 8, 0.28), lining); pillow.position.set(0, TOP - 0.02, 0.09); g.add(pillow);
  const slot = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.02, 3.3, 2, 0.01), new THREE.MeshStandardMaterial({ color: 0x3a3226, roughness: 1 })); slot.position.set(0, TOP + 0.05, 0.09); g.add(slot);
  const hinge = new THREE.Group(); hinge.position.set(0, TOP + 0.05, -D / 2); g.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, 0.36, D, 4, 0.14), felt); lid.position.set(0, 0.18, D / 2); hinge.add(lid);
  const lidIn = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.4), lining); lidIn.rotation.x = Math.PI / 2; lidIn.position.set(0, -0.005, D / 2); hinge.add(lidIn);
  const plaque = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.02, 0.22, 2, 0.01), goldM); plaque.position.set(0, -0.01, D / 2 + 1.1); hinge.add(plaque);
  hinge.rotation.x = -1.95;
  g.userData.hinge = hinge;
  return g;
}
