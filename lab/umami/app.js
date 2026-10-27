/* UMAMI RING - Concept 08, Zyqor Lab. Five procedural ramen bowls on a rotating ring (orbit carousel);
   the page colour and the giant dish name follow the bowl at the front. Shared by index.html and m.html. */
import { THREE, Q, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, clamp, damp, lerp } from '../_kit/kit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const G = () => window.gsap;
const TAU = Math.PI * 2;
const SH = true;   // round 2: contact shadows on phone too (smaller map), same look as desktop

const D = [
  { name: 'Tonkotsu', sub: 'Pork bone broth, slow and milky. Twelve hours on the fire, ninety seconds to your seat.', note: 'Chashu, soft egg, nori, scallion, sesame',
    bg: '#C8342B', ink: '#F4E9D8', glaze: '#2E4A3B', band: '#F4E9D8', broth: '#EBDCBE', oil: '#F7E7B8',
    tops: [['chashu', 0.6, 0.5], ['chashu', 1.15, 0.52], ['egg', 2.4, 0.5], ['nori', 3.5, 0.66], ['nori', 3.85, 0.7], ['scallion', 5.2, 0.38], ['sesame', 4.6, 0.3]] },
  { name: 'Shoyu Classic', sub: 'Clear soy broth with chicken and dashi. The bowl that started the ring.', note: 'Chashu, soft egg, naruto, bamboo, nori',
    bg: '#2E4A3B', ink: '#F4E9D8', glaze: '#C8342B', band: '#F4E9D8', broth: '#9A5A26', oil: '#D79A4E',
    tops: [['chashu', 0.7, 0.52], ['egg', 1.9, 0.52], ['naruto', 2.9, 0.48], ['menma', 4.0, 0.5], ['nori', 5.0, 0.7], ['scallion', 5.7, 0.3]] },
  { name: 'Miso Fire', sub: 'Red miso and house chilli oil, with sweet corn to cool you down. Mostly.', note: 'Minced pork, corn, chilli threads, egg, scallion',
    bg: '#D2552C', ink: '#2A1A14', glaze: '#25332B', band: '#D2552C', broth: '#C46A28', oil: '#E0412A',
    tops: [['corn', 0.8, 0.5], ['mince', 2.0, 0.48], ['egg', 3.2, 0.5], ['chili', 4.4, 0.25], ['scallion', 5.3, 0.45]] },
  { name: 'Yuzu Shio', sub: 'Light salt broth, bright yuzu peel and tender chicken. Sunshine in a bowl.', note: 'Chicken, yuzu peel, soft egg, mitsuba, scallion',
    bg: '#E8D9BC', ink: '#2E4A3B', glaze: '#F6EFE2', band: '#C8342B', broth: '#E4C97E', oil: '#F2DA8A',
    tops: [['chicken', 0.7, 0.52], ['chicken', 1.25, 0.55], ['egg', 2.5, 0.5], ['yuzu', 3.6, 0.42], ['leaf', 4.5, 0.5], ['scallion', 5.4, 0.36]] },
  { name: 'Black Garlic', sub: 'Pork broth under a slick of burnt garlic oil. Dark, deep and a little dramatic.', note: 'Chashu, soft egg, garlic oil, nori, scallion',
    bg: '#3B2A24', ink: '#F4E9D8', glaze: '#C8342B', band: '#2E1F1A', broth: '#5A4031', oil: '#1E1410',
    tops: [['chashu', 0.6, 0.52], ['egg', 1.8, 0.5], ['nori', 3.3, 0.7], ['scallion', 4.4, 0.4], ['sesame', 5.2, 0.35]] },
];
let active = 0;

/* ---------- textures ---------- */
const TS = 1024;   // same textures on phone and desktop (round 2)
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function brothTex(d, seed) {
  return canvasTex(TS, TS, (g, w) => {
    const r = rng(seed);
    const gr = g.createRadialGradient(w / 2, w / 2, w * 0.05, w / 2, w / 2, w / 2);
    gr.addColorStop(0, d.broth); gr.addColorStop(1, shade(d.broth, -0.18)); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 160; i++) {
      const x = r() * w, y = r() * w, rr = (0.004 + r() * r() * 0.03) * w;
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fillStyle = d.oil; g.globalAlpha = 0.25 + r() * 0.5; g.fill();
      g.globalAlpha = 0.5; g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.45, Math.PI, Math.PI * 1.6); g.stroke();
    }
    g.globalAlpha = 1;
  });
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(gg)},${f(b)})`;
}
function glazeTex(d) {
  return canvasTex(TS, TS / 2, (g, w, h) => {
    g.fillStyle = d.glaze; g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.06})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
    // lathe v runs bottom -> rim; canvas top = rim. two bands near the rim + a dotted wave line
    g.fillStyle = d.band; g.fillRect(0, h * 0.06, w, h * 0.035); g.fillRect(0, h * 0.13, w, h * 0.012);
    g.globalAlpha = 0.9;
    for (let x = 0; x < w; x += w / 24) { g.beginPath(); g.arc(x + w / 48, h * 0.24, h * 0.045, Math.PI, TAU); g.lineWidth = Math.max(1.5, h * 0.012); g.strokeStyle = d.band; g.stroke(); }
    g.globalAlpha = 1;
  });
}
const chashuTex = canvasTex(TS / 2, TS / 2, (g, w) => {
  const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, '#E9B7A0'); gr.addColorStop(0.72, '#D88E72'); gr.addColorStop(0.86, '#9E4F30'); gr.addColorStop(1, '#6E331E');
  g.fillStyle = gr; g.fillRect(0, 0, w, w);
  g.strokeStyle = 'rgba(255,240,225,.75)'; g.lineWidth = w * 0.035;
  g.beginPath(); for (let a = 0; a < 9; a += 0.1) { const rr = w * 0.04 * a; const x = w / 2 + Math.cos(a * 1.6) * rr, y = w / 2 + Math.sin(a * 1.6) * rr; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
});
const narutoTex = canvasTex(TS / 2, TS / 2, (g, w) => {
  g.fillStyle = '#FBF6EE'; g.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.05) { const rr = w * (0.47 + Math.sin(a * 14) * 0.02); g.lineTo(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr); } g.fill();
  g.strokeStyle = '#E2577A'; g.lineWidth = w * 0.05; g.lineCap = 'round';
  g.beginPath(); for (let a = 0; a < 11; a += 0.08) { const rr = w * 0.034 * a; g.lineTo(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr); } g.stroke();
});
const yolkTex = canvasTex(TS / 2, TS / 2, (g, w) => {
  g.fillStyle = '#FBF5EA'; g.fillRect(0, 0, w, w);
  const gr = g.createRadialGradient(w / 2, w * 0.55, 0, w / 2, w * 0.55, w * 0.3); gr.addColorStop(0, '#FFB238'); gr.addColorStop(0.7, '#F28C1C'); gr.addColorStop(1, '#E9A23B');
  g.fillStyle = gr; g.beginPath(); g.ellipse(w / 2, w * 0.55, w * 0.27, w * 0.24, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(190,120,60,.35)'; g.lineWidth = w * 0.03; g.beginPath(); g.arc(w / 2, w / 2, w * 0.48, 0, TAU); g.stroke();
});
const garlicTex = canvasTex(TS, TS, (g, w) => {
  g.clearRect(0, 0, w, w); g.strokeStyle = 'rgba(20,12,8,.9)'; g.lineCap = 'round';
  const r = rng(5);
  for (let k = 0; k < 5; k++) { g.lineWidth = w * (0.02 + r() * 0.03); g.beginPath(); let a = r() * TAU; for (let t = 0; t < 1; t += 0.02) { const rr = w * (0.1 + t * 0.32); a += 0.12; g.lineTo(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr * 0.9); } g.stroke(); }
});
const woodTex = canvasTex(TS, TS, (g, w) => {
  // walnut/oak board: warped straight grain, growth bands, fine pores
  const base = g.createLinearGradient(0, 0, w, 0); base.addColorStop(0, '#A9764A'); base.addColorStop(0.5, '#B98656'); base.addColorStop(1, '#A26E43');
  g.fillStyle = base; g.fillRect(0, 0, w, w);
  const r = rng(3), N = 170;
  for (let i = 0; i < N; i++) {
    const x0 = r() * w, dark = r() < 0.55, amp = 4 + r() * 10, fr = 0.004 + r() * 0.01, ph = r() * 6;
    g.strokeStyle = dark ? `rgba(98,60,32,${0.05 + r() * 0.16})` : `rgba(222,182,132,${0.05 + r() * 0.12})`;
    g.lineWidth = 0.5 + r() * r() * 3; g.beginPath();
    for (let y = -4; y <= w + 4; y += 6) { const x = x0 + Math.sin(y * fr + ph) * amp + Math.sin(y * fr * 3.1 + ph * 2) * amp * 0.25; y < 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }
  for (let i = 0; i < (1800); i++) { g.fillStyle = `rgba(70,40,20,${0.12 + r() * 0.2})`; g.fillRect(r() * w, r() * w, 0.8, 2 + r() * 4); }
});
const steamTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(30,10,5,.5)'); gr.addColorStop(0.6, 'rgba(30,10,5,.2)'); gr.addColorStop(1, 'rgba(30,10,5,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

/* ---------- geometry (v2: rebuilt for realism - thrown bowl with foot ring and rolled rim, glaze maps,
   wavy noodle fold, ajitama egg, seared chashu, fibrous nori, lacquered chopsticks) ---------- */
const SEG = 160;
const outerR = (y) => { const t = clamp((y - 0.05) / 0.57); return 0.5 + 0.5 * Math.pow(Math.sin(t * Math.PI / 2), 0.78); };
const innerR = (y) => Math.max(0.001, outerR(y) - 0.042 - clamp((0.62 - y) / 0.5) * 0.035);
/* height canvas -> tangent-space normal map */
function heightToNormal(hc, strength, wrap = true) {
  const w = hc.width, h = hc.height, src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const og = out.getContext('2d'), id = og.createImageData(w, h), d = id.data;
  const H = (x, y) => { x = wrap ? (x + w) % w : clamp(x, 0, w - 1); y = wrap ? (y + h) % h : clamp(y, 0, h - 1); return src[(y * w + x) * 4] / 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let nx = -(H(x + 1, y) - H(x - 1, y)) * strength, ny = -(H(x, y - 1) - H(x, y + 1)) * strength, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const k = (y * w + x) * 4; d[k] = (nx * 0.5 + 0.5) * 255; d[k + 1] = (ny * 0.5 + 0.5) * 255; d[k + 2] = (nz * 0.5 + 0.5) * 255; d[k + 3] = 255;
  }
  og.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(out); t.colorSpace = THREE.NoColorSpace; if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
function mkCanvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function texOf(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function speckle(g, w, h, n, col, rmax, seed) { const r = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = col(r); g.beginPath(); g.arc(r() * w, r() * h, 0.4 + r() * r() * rmax, 0, TAU); g.fill(); } }

/* bowl profile: foot ring, a soft belly, a rolled rim (lathe v: 0 bottom .. 1 rim) */
const OUT_PTS = (() => {
  const p = [[0.0, 0.045], [0.3, 0.045], [0.33, 0.04], [0.352, 0.022], [0.364, 0.004], [0.38, 0.0], [0.43, 0.0], [0.448, 0.008], [0.458, 0.03], [0.462, 0.05], [0.475, 0.062]];
  const footN = p.length;
  for (let i = 1; i <= 22; i++) { const y = 0.062 + (0.618 - 0.062) * i / 22; p.push([outerR(y) + 0.012, y]); }
  const rimN = p.length;
  for (let i = 1; i <= 8; i++) { const a = -Math.PI / 2 + Math.PI * i / 8; p.push([1.004 + Math.cos(a) * 0.014 + 0.004, 0.632 + Math.sin(a) * 0.016 + 0.014]); }
  return { pts: p.map(([x, y]) => new THREE.Vector2(x, y)), vFoot: (footN - 1) / (p.length - 1), vRim: (rimN - 1) / (p.length - 1), last: p[p.length - 1] };
})();
const IN_PTS = (() => {
  const L = OUT_PTS.last, p = [[L[0], L[1]], [L[0] - 0.012, L[1] - 0.004], [innerR(0.64) + 0.002, 0.645]];
  for (let i = 1; i <= 20; i++) { const y = 0.64 - (0.64 - 0.115) * i / 20; p.push([innerR(y) * (1 - Math.pow(i / 20, 6) * 0.15), y]); }
  for (let i = 1; i <= 5; i++) { const k = i / 5; p.push([innerR(0.115) * 0.85 * (1 - k), 0.115 - Math.sin(k * Math.PI / 2) * 0.012]); }
  p[p.length - 1][0] = 0.0005;
  return p.map(([x, y]) => new THREE.Vector2(x, y));
})();
const outerGeo = new THREE.LatheGeometry(OUT_PTS.pts, SEG);
const innerGeo = new THREE.LatheGeometry(IN_PTS, SEG);
/* round 2: hand-thrown wobble - the same tiny out-of-round on outer wall, inner wall and broth so they stay matched */
const wob = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(z, x);
  const k = 1 + 0.0042 * Math.sin(3 * th + 1.3) + 0.0024 * Math.sin(5 * th + 0.4) * clamp(y / 0.6) + 0.0016 * Math.sin(2 * th + 2.0); p.setX(i, x * k); p.setZ(i, z * k); } return geo; };
wob(outerGeo); wob(innerGeo);
const BROTH_Y = 0.5;
/* broth disc with a tiny meniscus lip, planar uvs */
const brothR = innerR(BROTH_Y) + 0.004;
const brothGeo = (() => {
  const p = [new THREE.Vector2(0.0005, 0)]; for (let i = 1; i <= 10; i++) p.push(new THREE.Vector2(brothR * (i / 10) * 0.97, 0));
  p.push(new THREE.Vector2(brothR * 0.99, 0.004), new THREE.Vector2(brothR, 0.012));
  const g = new THREE.LatheGeometry(p.reverse(), SEG); const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (brothR * 2) + 0.5, -pos.getZ(i) / (brothR * 2) + 0.5);
  g.translate(0, BROTH_Y, 0); g.computeVertexNormals(); return wob(g);
})();

/* --- shared surface maps --- */
const GW = TS, GH = TS / 2;
const throwH = mkCanvas(GW, GH, (g, w, h) => {      // throwing rings + orange peel
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) { const v = 128 + Math.sin(y * 0.55) * 7 + Math.sin(y * 0.13 + 1) * 9; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, w, 1); }
  speckle(g, w, h, 3200, (r) => `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0,${0.05 + r() * 0.08})`.replace(/rgba\((\d+),(\d+),0/, (m, a) => `rgba(${a},${a},${a}`), 2.2, 3);
});
const glazeN = heightToNormal(throwH, 1.6);
function glazeMaps(d) {
  const vF = OUT_PTS.vFoot, vR = OUT_PTS.vRim, Y = (v) => (1 - v) * GH;
  const col = mkCanvas(GW, GH, (g, w, h) => {
    // glaze body, pooling darker toward the foot
    const gr = g.createLinearGradient(0, Y(vR), 0, Y(vF)); gr.addColorStop(0, shade(d.glaze, 0.05)); gr.addColorStop(0.75, d.glaze); gr.addColorStop(1, shade(d.glaze, -0.28));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1600, (r) => r() < 0.7 ? `rgba(40,25,15,${0.15 + r() * 0.3})` : `rgba(255,250,240,${0.08 + r() * 0.12})`, 1.3, 11);
    // decor: a raimon (key-fret) band under the rim between two lines
    const bTop = Y(vR) + h * 0.03, bH = h * 0.075, s = bH * 0.78, lw = Math.max(1.4, s * 0.12);
    g.fillStyle = d.band; g.fillRect(0, bTop, w, lw * 1.3); g.fillRect(0, bTop + bH + lw * 0.6, w, lw * 1.3);
    g.strokeStyle = d.band; g.lineWidth = lw; g.lineJoin = 'miter'; g.lineCap = 'square';
    const cells = Math.round(w / (s * 1.25)), cw = w / cells, sp = [[0, 1], [0, 0], [1, 0], [1, 1], [0.25, 1], [0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.5, 0.75]];
    for (let c = 0; c < cells; c++) {
      const x0 = c * cw + (cw - s) / 2, y0 = bTop + lw * 0.65 + (bH - s) / 2 + s * 0.08, flip = c % 2;
      g.beginPath(); sp.forEach(([px, py], k) => { const X = x0 + (flip ? 1 - px : px) * s, Yy = y0 + (flip ? py : 1 - py) * s; k ? g.lineTo(X, Yy) : g.moveTo(X, Yy); }); g.stroke();
    }
    // a thin second line lower on the belly
    g.globalAlpha = 0.85; g.fillRect(0, Y(vR) + h * 0.24, w, lw * 0.9); g.globalAlpha = 1;
    // iron-brown rim (kuchibeni) where the glaze breaks thin
    const rg = g.createLinearGradient(0, 0, 0, Y(vR) + h * 0.02); rg.addColorStop(0, '#4A2C1C'); rg.addColorStop(0.65, 'rgba(92,58,36,.85)'); rg.addColorStop(1, 'rgba(92,58,36,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, Y(vR) + h * 0.02);
    // unglazed foot: warm clay with grog, with a wavy glaze edge
    g.fillStyle = '#C49A72'; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) g.lineTo(x, Y(vF) - h * 0.012 + Math.sin(x * 0.05) * h * 0.006 + Math.sin(x * 0.17) * h * 0.003);
    g.lineTo(w, h); g.fill();
    // round 2: glaze runs - a few drips that crept past the glaze line onto the clay foot
    { const r = rng(17 + d.name.length); for (let k = 0; k < 9; k++) { const x = r() * w, dw = w * (0.006 + r() * 0.01), dl = h * (0.012 + r() * 0.03); const yy = Y(vF) - h * 0.015;
      const dg = g.createLinearGradient(0, yy, 0, yy + dl); dg.addColorStop(0, shade(d.glaze, -0.28)); dg.addColorStop(1, shade(d.glaze, -0.4));
      g.fillStyle = dg; g.beginPath(); g.moveTo(x - dw, yy); g.lineTo(x + dw, yy); g.lineTo(x + dw * 0.8, yy + dl - dw); g.arc(x, yy + dl - dw, dw * 0.8, 0, Math.PI); g.closePath(); g.fill(); } }
    g.save(); g.beginPath(); g.rect(0, Y(vF), w, h); g.clip();
    speckle(g, w, h, 900, (r) => `rgba(${90 + r() * 60 | 0},${60 + r() * 30 | 0},40,${0.3 + r() * 0.4})`, 1.4, 21); g.restore();
  });
  const rough = mkCanvas(GW, GH, (g, w, h) => {
    g.fillStyle = 'rgb(40,40,40)'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1200, (r) => `rgba(${r() > 0.5 ? 90 : 20},${r() > 0.5 ? 90 : 20},${r() > 0.5 ? 90 : 20},.35)`, 3, 31);
    g.fillStyle = 'rgb(215,215,215)'; g.fillRect(0, Y(vF) - h * 0.01, w, h);
  });
  const mt = texOf(col), rt = texOf(rough, false); return { map: mt, roughnessMap: rt };
}
const innerTex = texOf(mkCanvas(GW, GH, (g, w, h) => {
  g.fillStyle = '#F4ECDD'; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,80,50,.0)'); gr.addColorStop(1, 'rgba(160,130,95,.22)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 1400, (r) => `rgba(70,45,25,${0.12 + r() * 0.35})`, 1.1, 41);
  g.fillStyle = 'rgba(74,44,28,.9)'; g.fillRect(0, 0, w, h * 0.012);             // the rim edge seen from inside
  // round 2: fine crackle (crazing) in the cream glaze, stained faintly by the broth
  { const r = rng(43); g.lineWidth = 0.8; for (let i = 0; i < 260; i++) { let x = r() * w, y = h * 0.05 + r() * h * 0.9; g.strokeStyle = `rgba(110,74,44,${0.06 + r() * 0.1})`; g.beginPath(); g.moveTo(x, y); const n = 3 + (r() * 5 | 0); for (let k = 0; k < n; k++) { x += (r() - 0.5) * w * 0.03; y += (r() - 0.5) * h * 0.06; g.lineTo(x, y); } g.stroke(); } }
}));
const innerMat = new THREE.MeshPhysicalMaterial({ map: innerTex, normalMap: glazeN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05 });

/* broth: colour + an oil-droplet height map from the same seed (droplets catch the light) */
function brothMaps(d, seed) {
  const drops = []; const r = rng(seed);
  for (let i = 0; i < (140); i++) { const a = r() * TAU, rr = Math.sqrt(r()) * 0.48; drops.push([0.5 + Math.cos(a) * rr, 0.5 + Math.sin(a) * rr, 0.002 + r() * r() * r() * 0.026, r()]); }
  const col = mkCanvas(TS, TS, (g, w) => {
    const gr = g.createRadialGradient(w * 0.46, w * 0.44, w * 0.04, w / 2, w / 2, w / 2);
    gr.addColorStop(0, shade(d.broth, 0.08)); gr.addColorStop(0.7, d.broth); gr.addColorStop(1, shade(d.broth, -0.22)); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    // emulsified swirls
    const r2 = rng(seed + 9); g.globalAlpha = 0.18;
    for (let i = 0; i < 40; i++) { g.strokeStyle = r2() > 0.5 ? shade(d.broth, 0.2) : shade(d.broth, -0.15); g.lineWidth = w * (0.004 + r2() * 0.012); g.beginPath(); const cx = w * (0.2 + r2() * 0.6), cy = w * (0.2 + r2() * 0.6), rad = w * (0.05 + r2() * 0.2), a0 = r2() * TAU; g.arc(cx, cy, rad, a0, a0 + 0.8 + r2() * 2); g.stroke(); }
    g.globalAlpha = 1;
    drops.forEach(([x, y, s, k]) => { const X = x * w, Y = y * w, S = s * w; const dg = g.createRadialGradient(X, Y, S * 0.2, X, Y, S); dg.addColorStop(0, d.oil); dg.addColorStop(0.85, d.oil); dg.addColorStop(1, shade(d.oil, -0.35)); g.globalAlpha = 0.35 + k * 0.4; g.fillStyle = dg; g.beginPath(); g.arc(X, Y, S, 0, TAU); g.fill(); });
    g.globalAlpha = 1;
  });
  const hgt = mkCanvas(TS, TS, (g, w) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, w);
    drops.forEach(([x, y, s]) => { const X = x * w, Y = y * w, S = s * w; const dg = g.createRadialGradient(X, Y, 0, X, Y, S); dg.addColorStop(0, 'rgba(255,255,255,.9)'); dg.addColorStop(0.7, 'rgba(255,255,255,.55)'); dg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = dg; g.beginPath(); g.arc(X, Y, S, 0, TAU); g.fill(); });
  });
  return { map: texOf(col), normalMap: heightToNormal(hgt, 1.8, false) };
}

/* noodles (round 2): ~46 thin chijire strands per bowl, each with its own crimp phase, a lifted nest that
   dives back under the broth at both ends, plus loose loops below the surface. Lengthwise striation normal map. */
const noodleN = (() => {
  const c = mkCanvas(256, 64, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); const r = rng(5);
    for (let i = 0; i < 70; i++) { const y = r() * h, v = r() > 0.5 ? 170 : 90; g.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.35})`; g.lineWidth = 0.6 + r() * 1.4; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 1.2); g.stroke(); }
    speckle(g, w, h, 500, (rr) => `rgba(${rr() > 0.5 ? 200 : 60},${rr() > 0.5 ? 200 : 60},${rr() > 0.5 ? 200 : 60},.25)`, 1.2, 6);
  });
  const t = heightToNormal(c, 2.2); t.repeat.set(14, 1); return t;
})();
const noodleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.34, clearcoat: 0.75, clearcoatRoughness: 0.16,
  sheen: 0.45, sheenColor: new THREE.Color(0xFFE2A0), sheenRoughness: 0.4, normalMap: noodleN, normalScale: new THREE.Vector2(0.35, 0.35) });
function noodleGeo(rnd) {
  const geos = [], N = 46, W = 0.6, base = new THREE.Color(0xEDC768), deep = new THREE.Color(0xB27E34), hi = new THREE.Color(0xF7DE97);
  const dirA = 0.35 + (rnd() - 0.5) * 0.4, dir = new THREE.Vector2(Math.cos(dirA), Math.sin(dirA)), perp = new THREE.Vector2(-dir.y, dir.x);
  const cx = -0.08, cz = 0.02;
  const strand = (pts, rad, c, segs = 170) => {
    const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), segs, rad, 8, false);
    const P = tg.attributes.position, n = P.count, ca = new Float32Array(n * 3), cc = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const y = P.getY(i);
      const under = clamp(-y * 22 + 0.1);                 // submerged: darker, broth-tinted
      const top = clamp((y - 0.06) * 9);                  // crown of the nest catches light
      cc.copy(c).lerp(deep, under * 0.85).lerp(hi, top * 0.35);
      ca[i * 3] = cc.r; ca[i * 3 + 1] = cc.g; ca[i * 3 + 2] = cc.b;
    }
    tg.setAttribute('color', new THREE.BufferAttribute(ca, 3)); geos.push(tg);
  };
  const lim = brothR - 0.055;
  const clampR = (x, z) => { const rr = Math.hypot(x, z); return rr > lim ? [x * lim / rr, z * lim / rr] : [x, z]; };
  for (let k = 0; k < N; k++) {
    const s = (k / (N - 1) - 0.5) * W + (rnd() - 0.5) * 0.025, ph = rnd() * TAU, ph2 = rnd() * TAU, f = 26 + rnd() * 10, pts = [];
    const layer = rnd();                                   // strands stack: upper ones ride higher
    const lift = (0.1 + layer * 0.06) * (1 - Math.pow(2 * s / W, 2) * 0.7);
    const L = 0.66 + rnd() * 0.06, skew = (rnd() - 0.5) * 0.12;
    for (let j = 0; j <= 60; j++) {
      const t = j / 60 * 2 - 1;
      let x = cx + dir.x * t * L + perp.x * (s + skew * t), z = cz + dir.y * t * L + perp.y * (s + skew * t);
      const wv = Math.sin(t * f + ph) * 0.013 + Math.sin(t * f * 0.37 + ph2) * 0.008; x += perp.x * wv; z += perp.y * wv;
      [x, z] = clampR(x, z);
      const env = Math.pow(Math.max(0, 1 - t * t), 0.55);
      pts.push(new THREE.Vector3(x, lift * env - 0.055 * (1 - env) + Math.cos(t * f + ph) * 0.006 + layer * 0.012 * env, z));
    }
    strand(pts, 0.0135 + rnd() * 0.0025, base.clone().offsetHSL((rnd() - 0.5) * 0.015, (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.07));
  }
  for (let k = 0; k < 6; k++) {                            // a few strands lifted across the nest at another angle
    const a = dirA + 1.2 + (rnd() - 0.5) * 0.5, d2 = new THREE.Vector2(Math.cos(a), Math.sin(a)), off = (rnd() - 0.5) * 0.3, ph = rnd() * TAU, f = 28 + rnd() * 8, pts = [];
    for (let j = 0; j <= 50; j++) {
      const t = j / 50 * 2 - 1; let x = cx + d2.x * t * 0.5 - d2.y * off, z = cz + d2.y * t * 0.5 + d2.x * off;
      x += -d2.y * Math.sin(t * f + ph) * 0.012; z += d2.x * Math.sin(t * f + ph) * 0.012; [x, z] = clampR(x, z);
      const env = Math.pow(Math.max(0, 1 - t * t), 0.7); pts.push(new THREE.Vector3(x, 0.19 * env - 0.05 * (1 - env) + Math.cos(t * f + ph) * 0.005, z));
    }
    strand(pts, 0.0135, base.clone().offsetHSL(0, 0, (rnd() - 0.5) * 0.05), 140);
  }
  for (let k = 0; k < 14; k++) {                           // loose loops just under the surface (seen through clear broths)
    const pts = [], a0 = rnd() * TAU, r0 = 0.25 + rnd() * 0.45, ph = rnd() * TAU;
    for (let j = 0; j <= 40; j++) { const a = a0 + j * 0.08, rr = clamp(r0 + Math.sin(j * 0.35 + ph) * 0.1, 0.1, brothR - 0.08); pts.push(new THREE.Vector3(Math.cos(a) * rr + Math.sin(j * 1.9) * 0.01, -0.025 - rnd() * 0.035, Math.sin(a) * rr + Math.cos(j * 1.9) * 0.01)); }
    strand(pts, 0.0135, base, 90);
  }
  return mergeGeometries(geos);
}

/* ajitama (round 2): soy-marinated soft egg halved lengthwise: amber-stained white with a darker marinade line,
   a set orange ring and a glossy, slightly domed jammy centre; separate roughness so the yolk shines and the white is satin */
const eggWhiteTex = texOf(mkCanvas(512, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#B8743A'); gr.addColorStop(0.55, '#C98B4E'); gr.addColorStop(1, '#D9A56A'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 900, (r) => r() < 0.5 ? `rgba(120,64,26,${0.1 + r() * 0.2})` : `rgba(255,226,180,${0.08 + r() * 0.12})`, 2.2, 271);
  g.globalAlpha = 0.25; for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#A86430' : '#E2B27A'; g.fillRect(0, h * (0.1 + i * 0.15), w, h * 0.04); } g.globalAlpha = 1;
}));
const eggFace = (() => {
  const S = 1024, r = rng(273);
  const wobR = (a, R) => R * (1 + Math.sin(a * 3 + 0.7) * 0.025 + Math.sin(a * 7) * 0.012);
  const blob = (g, cx, cy, R, ry) => { g.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, rr = wobR(a, R); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * ry); } g.closePath(); };
  const col = mkCanvas(S, S, (g, w) => {
    g.fillStyle = '#B06A30'; g.fillRect(0, 0, w, w);                       // marinade skin at the very edge
    const wg = g.createRadialGradient(w / 2, w / 2, w * 0.3, w / 2, w / 2, w * 0.5);
    wg.addColorStop(0, '#DED5C3'); wg.addColorStop(0.72, '#D6CAB2'); wg.addColorStop(0.88, '#EBD8B8'); wg.addColorStop(0.95, '#C98A4E'); wg.addColorStop(1, '#9C5A26');
    g.fillStyle = wg; g.beginPath(); g.arc(w / 2, w / 2, w * 0.5, 0, TAU); g.fill();
    speckle(g, w, w, 500, (q) => `rgba(220,200,170,${0.1 + q() * 0.15})`, 2.5, 274);   // cooked-white micro texture
    // set yolk ring, then the jammy centre with a soft gradient
    const yr = w * 0.29;
    g.fillStyle = '#E8900A'; blob(g, w * 0.5, w * 0.5, yr, 0.93); g.fill();
    g.fillStyle = 'rgba(244,170,20,.7)'; blob(g, w * 0.5, w * 0.5, yr * 0.93, 0.93); g.fill();
    const jg = g.createRadialGradient(w * 0.49, w * 0.5, 0, w * 0.5, w * 0.5, yr * 0.82);
    jg.addColorStop(0, '#A83A00'); jg.addColorStop(0.35, '#BC4A00'); jg.addColorStop(0.7, '#D06000'); jg.addColorStop(0.92, '#E07C04'); jg.addColorStop(1, 'rgba(242,170,60,0)');
    g.fillStyle = jg; blob(g, w * 0.5, w * 0.5, yr * 0.82, 0.92); g.fill();
    speckle(g, w, w, 160, (q) => `rgba(170,60,0,${0.08 + q() * 0.12})`, 3, 275);
  });
  const rough = mkCanvas(S, S, (g, w) => {
    g.fillStyle = 'rgb(105,105,105)'; g.fillRect(0, 0, w, w);
    const rg = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w * 0.29); rg.addColorStop(0, 'rgb(14,14,14)'); rg.addColorStop(0.75, 'rgb(30,30,30)'); rg.addColorStop(1, 'rgb(80,80,80)');
    g.fillStyle = rg; g.beginPath(); g.arc(w / 2, w / 2, w * 0.29, 0, TAU); g.fill();
  });
  const hgt = mkCanvas(512, 512, (g, w) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, w); speckle(g, w, w, 1800, (q) => `rgba(${q() > 0.5 ? 255 : 0},${q() > 0.5 ? 255 : 0},${q() > 0.5 ? 255 : 0},.12)`, 2.4, 276); });
  return { map: texOf(col), roughnessMap: texOf(rough, false), normalMap: heightToNormal(hgt, 1.0, false) };
})();
const egg = (() => {
  const g = new THREE.Group();
  const shapeEgg = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); const k = 1 + z * 0.13; p.setX(i, p.getX(i) * k); p.setY(i, p.getY(i) * k); } geo.computeVertexNormals(); return geo; };
  const white = new THREE.Mesh(shapeEgg(new THREE.SphereGeometry(1, 72, 36, 0, TAU, Math.PI / 2, Math.PI / 2)), new THREE.MeshPhysicalMaterial({ map: eggWhiteTex, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.18, sheen: 0.3, sheenColor: new THREE.Color(0xFFE0B0) }));
  // the cut face: a disc with a gentle dome over the yolk (planar uvs so the face texture lands centred)
  const fg = new THREE.CircleGeometry(1, 128, 0, TAU); { const p = fg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), rr = Math.hypot(x, y); p.setZ(i, Math.max(0, 1 - Math.pow(rr / 0.6, 2)) * 0.12 - rr * rr * 0.02); } }
  shapeEgg(fg); fg.rotateX(-Math.PI / 2); fg.computeVertexNormals();
  const face = new THREE.Mesh(fg, new THREE.MeshPhysicalMaterial({ ...eggFace, roughness: 1, clearcoat: 0.12, clearcoatRoughness: 0.08, envMapIntensity: 0.45, specularIntensity: 0.6 })); face.position.y = 0.002;
  g.add(white, face); g.scale.set(0.21, 0.17, 0.29); return g;
})();

/* chashu: a rolled pork-belly slice, torched edge, fat spiral; extruded with a bevel and draped */
function sliceTex(kind) {
  const S = TS / 2, rnd = rng(kind === 'chashu' ? 61 : 71);
  const col = mkCanvas(S, S, (g, w) => {
    if (kind === 'chashu') {
      g.fillStyle = '#5E2C17'; g.fillRect(0, 0, w, w);
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w * 0.46); gr.addColorStop(0, '#C9876A'); gr.addColorStop(0.5, '#B87252'); gr.addColorStop(0.74, '#9A5534'); gr.addColorStop(0.86, '#7A3A1C'); gr.addColorStop(0.93, '#4E1E0A'); gr.addColorStop(1, 'rgba(70,30,15,1)');
      g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w * 0.47, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(244,222,180,.8)'; g.lineCap = 'round'; g.filter = 'blur(' + (w * 0.006).toFixed(1) + 'px)';
      for (let pass = 0; pass < 2; pass++) { g.lineWidth = w * (pass ? 0.008 : 0.02); g.globalAlpha = pass ? 0.3 : 0.5; g.beginPath(); for (let a = 0.6; a < 13; a += 0.06) { const rr = w * 0.032 * a + Math.sin(a * 3) * w * 0.006; g.lineTo(w / 2 + Math.cos(a * 1.0 + pass) * rr, w / 2 + Math.sin(a * 1.0 + pass) * rr); } g.stroke(); }
      g.filter = 'none'; g.globalAlpha = 1; speckle(g, w, w, 260, (r) => `rgba(${120 + r() * 60 | 0},50,30,${0.15 + r() * 0.25})`, 1.6, 62);
      // round 2b: irregular concentric fat layers of the rolled belly (soft, creamy, slightly translucent)
      g.save(); g.filter = 'blur(' + (w * 0.008).toFixed(1) + 'px)';
      for (let k = 0; k < 4; k++) { const rr0 = w * (0.12 + k * 0.085), ph = rnd() * TAU; g.strokeStyle = `rgba(242,220,178,${0.42 - k * 0.05})`; g.lineWidth = w * (0.018 + rnd() * 0.012); g.beginPath();
        for (let a = 0; a <= TAU + 0.01; a += 0.05) { const rr = rr0 * (1 + Math.sin(a * 2 + ph) * 0.12 + Math.sin(a * 5 + ph * 2) * 0.05); g.lineTo(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr * 0.95); } g.stroke(); }
      g.restore();
      // round 2: muscle fibres between the fat layers, thin fat veins, glaze sheen and a torched, caramelised rim
      g.save(); g.beginPath(); g.arc(w / 2, w / 2, w * 0.45, 0, TAU); g.clip();
      for (let i = 0; i < 420; i++) { const a = rnd() * TAU, rr = w * (0.04 + rnd() * 0.4), L = 0.05 + rnd() * 0.12; g.strokeStyle = rnd() < 0.55 ? `rgba(120,48,30,${0.12 + rnd() * 0.2})` : `rgba(235,170,145,${0.1 + rnd() * 0.18})`; g.lineWidth = 0.6 + rnd() * 1.4; g.beginPath(); g.arc(w / 2, w / 2, rr, a, a + L); g.stroke(); }
      for (let i = 0; i < 0; i++) { g.strokeStyle = `rgba(252,238,220,${0.35 + rnd() * 0.4})`; g.lineWidth = 1 + rnd() * 2.5; g.beginPath(); let x = w * (0.2 + rnd() * 0.6), y = w * (0.2 + rnd() * 0.6); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * w * 0.07; y += (rnd() - 0.5) * w * 0.07; g.lineTo(x, y); } g.stroke(); }
      g.restore();
      const rim = g.createRadialGradient(w / 2, w / 2, w * 0.38, w / 2, w / 2, w * 0.5); rim.addColorStop(0, 'rgba(60,22,8,0)'); rim.addColorStop(0.55, 'rgba(92,36,12,.75)'); rim.addColorStop(0.8, 'rgba(48,16,6,.95)'); rim.addColorStop(1, 'rgba(30,10,4,1)');
      g.fillStyle = rim; g.fillRect(0, 0, w, w);
      speckle(g, w, w, 500, (q) => { const a = q() * TAU; return `rgba(${20 + q() * 30 | 0},${8 + q() * 10 | 0},4,${0.4 + q() * 0.5})`; }, 2.4, 64);
      for (let i = 0; i < 40; i++) { const a = rnd() * TAU, rr = w * (0.43 + rnd() * 0.05); g.fillStyle = `rgba(${200 + rnd() * 50 | 0},${110 + rnd() * 40 | 0},50,${0.25 + rnd() * 0.3})`; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, w * (0.008 + rnd() * 0.015), w * 0.005, a, 0, TAU); g.fill(); }
      for (let i = 0; i < 9; i++) { const a = rnd() * TAU; g.fillStyle = `rgba(40,16,8,${0.25 + rnd() * 0.3})`; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * w * 0.42, w / 2 + Math.sin(a) * w * 0.42, w * 0.06, w * 0.025, a, 0, TAU); g.fill(); }
    } else {
      g.fillStyle = '#C9A682'; g.fillRect(0, 0, w, w);
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w * 0.47); gr.addColorStop(0, '#F3D9C6'); gr.addColorStop(0.6, '#EED6BF'); gr.addColorStop(0.93, '#E4C3A0'); gr.addColorStop(1, '#B98A5E');
      g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w * 0.47, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 40; i++) { g.beginPath(); const y = rnd() * w; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 6, w * 0.7, y - 6, w, y + 3); g.stroke(); }
    }
  });
  const rough = mkCanvas(S, S, (g, w) => { g.fillStyle = 'rgb(150,150,150)'; g.fillRect(0, 0, w, w); g.drawImage(col, 0, 0); const id = g.getImageData(0, 0, w, w), d = id.data; for (let i = 0; i < d.length; i += 4) { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; const v = 200 - l * 0.55; d[i] = d[i + 1] = d[i + 2] = v; } g.putImageData(id, 0, 0); });
  const hgt = mkCanvas(S, S, (g, w) => { g.drawImage(col, 0, 0); speckle(g, w, w, 600, (r) => `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},.15)`, 1.5, 63); });
  return { map: texOf(col), roughnessMap: texOf(rough, false), normalMap: heightToNormal(hgt, 1.2, false) };
}
const CHASHU = sliceTex('chashu'), CHICKEN = sliceTex('chicken');
/* round 2: the rolled belly's outer skin - torched, soy-lacquered bark with fat streaks, for the slice's cut sides */
const SEAR = (() => {
  const c = mkCanvas(1024, 256, (g, w, h) => { const r = rng(65);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2E1006'); gr.addColorStop(0.25, '#5A2410'); gr.addColorStop(0.55, '#7A3A1A'); gr.addColorStop(0.8, '#5C2610'); gr.addColorStop(1, '#2A0E04');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.filter = 'blur(6px)'; for (let i = 0; i < 120; i++) { g.fillStyle = r() < 0.35 ? `rgba(214,150,96,${0.08 + r() * 0.12})` : `rgba(24,8,2,${0.15 + r() * 0.25})`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 50, 4 + r() * 14, 0, 0, TAU); g.fill(); }
    g.filter = 'none'; speckle(g, w, h, 1400, (q) => `rgba(${q() < 0.6 ? 18 : 190},${q() < 0.6 ? 6 : 96},2,${0.25 + q() * 0.4})`, 1.6, 66); });
  const t = texOf(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.2, normalMap: heightToNormal(c, 1.6), normalScale: new THREE.Vector2(0.5, 0.5) });
})();
function sliceGeo(rnd, R, ry, wob, depth, scallop = 0) {
  // round 2: smooth organic outline (sum of low sines, no per-point jitter), 160 points; caps get planar uvs, the cut sides
  // get their own wrap-around uvs so the seared bark reads as a band, not stripes
  const sh = new THREE.Shape(), n = 160, p1 = rnd() * TAU, p2 = rnd() * TAU, p3 = rnd() * TAU;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = R * (1 + Math.sin(a * 3 + p1) * wob + Math.sin(a * 5 + p2) * wob * 0.35 + Math.sin(a * 9 + p3) * wob * 0.12 + Math.sin(a * 14) * scallop); const x = Math.cos(a) * r, y = Math.sin(a) * r * ry; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: depth * 0.4, bevelSegments: 5, curveSegments: 12 });
  const capN = g.groups.length ? g.groups[0].count : 0;
  g.rotateX(-Math.PI / 2); const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (i < capN) uv.setXY(i, x / (R * 2.1) + 0.5, -z / (R * 2.1 * ry) * ry + 0.5);
    else uv.setXY(i, (Math.atan2(z, x) / TAU + 0.5) * 4, (y / (depth * 1.7)) * 0.8 + 0.1);
    p.setY(i, y - (x * x) * 0.55); }
  g.computeVertexNormals(); return g;
}

/* nori: fibrous, slightly wavy sheet, darker and wet where it dips into the broth */
const NORI = (() => {
  const S = TS / 2;
  const col = mkCanvas(S, S, (g, w, h) => {
    g.fillStyle = '#16211A'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2400, (r) => r() < 0.6 ? `rgba(66,94,60,${0.25 + r() * 0.35})` : `rgba(8,12,9,${0.3 + r() * 0.4})`, 1.5, 81);
    // round 2: pressed-seaweed fibres, sudare mat lines and a few thin translucent spots
    { const r = rng(83); for (let i = 0; i < 5200; i++) { const x = r() * w, y = r() * h, a = r() * TAU, L = 2 + r() * 9; g.strokeStyle = r() < 0.45 ? `rgba(70,104,62,${0.18 + r() * 0.3})` : (r() < 0.5 ? `rgba(4,8,6,${0.3 + r() * 0.4})` : `rgba(40,58,38,${0.2 + r() * 0.3})`); g.lineWidth = 0.5 + r() * 0.9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
      g.globalAlpha = 0.12; for (let y = 0; y < h; y += h / 34) { g.fillStyle = '#0A100B'; g.fillRect(0, y, w, 1.5); } g.globalAlpha = 1;
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,90,50,${0.15 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 8, 2 + r() * 5, r() * 3, 0, TAU); g.fill(); } }
    const gr = g.createLinearGradient(0, h * 0.62, 0, h); gr.addColorStop(0, 'rgba(10,14,10,0)'); gr.addColorStop(1, 'rgba(10,14,10,.65)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const hgt = mkCanvas(S, S, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); { const r = rng(84); for (let i = 0; i < 4000; i++) { const x = r() * w, y = r() * h, a = r() * TAU, L = 2 + r() * 8, v = r() > 0.5 ? 210 : 50; g.strokeStyle = `rgba(${v},${v},${v},.3)`; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } } speckle(g, w, h, 2400, (r) => `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},.25)`, 1.8, 82); });
  const rough = mkCanvas(S, S, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgb(190,190,190)'); gr.addColorStop(0.62, 'rgb(170,170,170)'); gr.addColorStop(1, 'rgb(70,70,70)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const geo = new THREE.PlaneGeometry(0.46, 0.62, 24, 30); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, (x * x) * 0.45 + Math.sin(y * 5 + x * 3) * 0.004 + Math.sin(x * 38 + y * 6) * 0.0025 + Math.sin(y * 29 - x * 11) * 0.002); }
  geo.computeVertexNormals();
  return { geo, mat: new THREE.MeshPhysicalMaterial({ map: texOf(col), normalMap: heightToNormal(hgt, 1.5), roughnessMap: texOf(rough, false), roughness: 0.8, sheen: 0.3, sheenColor: new THREE.Color(0x2F4A33), sheenRoughness: 0.4, normalScale: new THREE.Vector2(1.4, 1.4), side: THREE.DoubleSide }) };
})();

const trayGeo = (() => {
  const R = 1.34, T = 0.085, b = 0.025, p = [new THREE.Vector2(0.001, -T)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; p.push(new THREE.Vector2(R - b + Math.cos(a) * b, -T + b + Math.sin(a) * b)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; p.push(new THREE.Vector2(R - b + Math.cos(a) * b, -b + Math.sin(a) * b)); }
  p.push(new THREE.Vector2(0.001, 0));
  const g = new THREE.LatheGeometry(p, SEG), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (R * 2) + 0.5, pos.getZ(i) / (R * 2) + 0.5 + pos.getY(i) * 0.6);
  g.computeVertexNormals(); return g;
})();
/* round 2: real wood (Poly Haven "Fine Grained Wood", CC0) for the tray and chopsticks: colour + normal + roughness, webp */
const TL = new THREE.TextureLoader(), WOOD = '../../assets/lab/umami/';
const woodSet = (rep, rot = 0) => { const ld = (f, srgb) => { const t = TL.load(WOOD + f); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.rotation = rot; t.anisotropy = 8; return t; };
  return { map: ld('wood_col.webp', true), normalMap: ld('wood_nor.webp', false), roughnessMap: ld('wood_rough.webp', false) }; };
const trayMat = new THREE.MeshPhysicalMaterial({ ...woodSet([1.2, 1.2]), normalScale: new THREE.Vector2(0.8, 0.8), color: 0xFFF0E0, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 });
const stickGeo = (() => { const g = new THREE.CylinderGeometry(0.009, 0.026, 2.3, 32, 24); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -1.0) { p.setX(i, p.getX(i) * 0.96); p.setZ(i, p.getZ(i) * 0.96); } g.computeVertexNormals(); g.rotateZ(Math.PI / 2); return g; })();
const stickMat = new THREE.MeshPhysicalMaterial({ ...woodSet([0.5, 3]), normalScale: new THREE.Vector2(0.6, 0.6), color: 0x9A6A44, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3 });
const stickBand = new THREE.Mesh(new THREE.CylinderGeometry(0.0262, 0.0262, 0.05, 32), new THREE.MeshPhysicalMaterial({ color: 0xC9A15A, metalness: 1, roughness: 0.3 }));
stickBand.rotation.z = Math.PI / 2; stickBand.position.x = 0.98;
const pale = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.3 });

/* round 2: menma (fermented bamboo) with lengthwise fibres and a soy-glazed sheen */
const MENMA = (() => { const c = mkCanvas(256, 256, (g, w, h) => { const r = rng(91); g.fillStyle = '#B98242'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { const x = r() * w; g.fillStyle = r() < 0.5 ? `rgba(120,70,25,${0.2 + r() * 0.35})` : `rgba(235,190,120,${0.15 + r() * 0.3})`; g.fillRect(x, 0, 0.8 + r() * 2.2, h); }
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(110,62,22,.35)'; g.fillRect(0, r() * h, w, 1.5); } });
  return new THREE.MeshPhysicalMaterial({ map: texOf(c), normalMap: heightToNormal(c, 2.5), normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.25 }); })();
function topping(type, rnd) {
  const g = new THREE.Group();
  if (type === 'egg') { const e = egg.clone(); e.rotation.set(0.55, Math.PI / 2 + (rnd() - 0.5) * 0.5, 0); e.position.y = 0.09; g.add(e); }
  else if (type === 'chashu' || type === 'chicken') {
    const M = type === 'chashu' ? CHASHU : CHICKEN;
    const faceM = new THREE.MeshPhysicalMaterial({ ...M, roughness: 1, clearcoat: type === 'chashu' ? 0.55 : 0.2, clearcoatRoughness: 0.3, sheen: 0.25, sheenColor: new THREE.Color(0xFFD2B0) });
    const sideM = type === 'chashu' ? SEAR : new THREE.MeshPhysicalMaterial({ color: 0xC99A6E, roughness: 0.55, clearcoat: 0.2 });
    const s = new THREE.Mesh(sliceGeo(rnd, type === 'chashu' ? 0.27 : 0.25, type === 'chashu' ? 0.92 : 0.7, 0.06, type === 'chashu' ? 0.022 : 0.026), [faceM, sideM]);
    s.rotation.set(0.5, (rnd() - 0.5) * 0.5, 0.05); s.position.set(0, 0.1, -0.04); s.scale.setScalar(1.12); s.castShadow = SH; g.add(s);
  }
  else if (type === 'naruto') { const s = new THREE.Mesh(sliceGeo(rnd, 0.19, 1, 0.0, 0.03, 0.035), new THREE.MeshPhysicalMaterial({ map: narutoTex, roughness: 0.4, clearcoat: 0.4 })); s.rotation.set(0.42, 0, 0.05); s.position.y = 0.07; g.add(s); }
  else if (type === 'nori') { const s = new THREE.Mesh(NORI.geo, NORI.mat); s.rotation.set(-0.5, 0, 0); s.position.y = 0.17; s.castShadow = SH; g.add(s); }
  else if (type === 'menma') { const m = MENMA; for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new RoundedBoxGeometry(0.055, 0.028, 0.27, 2, 0.01), m); s.position.set((rnd() - 0.5) * 0.24, 0.03 + i * 0.012, (rnd() - 0.5) * 0.16); s.rotation.set(0, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.2); g.add(s); } }
  else if (type === 'yuzu') { const m = new THREE.MeshPhysicalMaterial({ color: 0xF5C524, roughness: 0.3, clearcoat: 0.8 }); for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.01, 0.022, 1, 0.004), m); s.position.set((rnd() - 0.5) * 0.3, 0.03, (rnd() - 0.5) * 0.3); s.rotation.set((rnd() - 0.5) * 0.3, rnd() * 3, 0); g.add(s); } }
  else if (type === 'leaf') { const m = new THREE.MeshPhysicalMaterial({ color: 0x4E8A3A, roughness: 0.45, sheen: 0.5, sheenColor: new THREE.Color(0x9BD07A), side: THREE.DoubleSide }); for (let i = 0; i < 3; i++) { const lg = new THREE.CircleGeometry(0.09, 14); const p = lg.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, -(p.getX(k) ** 2) * 2.5); lg.computeVertexNormals(); const s = new THREE.Mesh(lg, m); s.scale.set(1, 1.7, 1); s.rotation.set(-Math.PI / 2 + 0.2, 0, i * 2.1); s.position.set(Math.cos(i * 2.1) * 0.08, 0.04, Math.sin(i * 2.1) * 0.08); g.add(s); } }
  else {
    // instanced bits: scallion rings (open tubes), corn, sesame, mince, chili threads
    const cfg = {
      scallion: [new THREE.LatheGeometry([[0.019, -0.006], [0.024, -0.006], [0.0255, -0.0045], [0.0255, 0.0045], [0.024, 0.006], [0.019, 0.006], [0.0178, 0.0045], [0.0178, -0.0045], [0.019, -0.006]].map(([x, y]) => new THREE.Vector2(x, y)), 28), 0xffffff, 64, 0.28],
      corn: [new THREE.SphereGeometry(0.036, 10, 8).scale(1, 0.8, 0.75), 0xF4C32E, 36, 0.24],
      sesame: [new THREE.SphereGeometry(0.012, 8, 6).scale(1, 0.45, 1.7), 0xF2E2BC, 60, 0.3],
      mince: [new THREE.IcosahedronGeometry(0.04, 1), 0x7A4128, 30, 0.22],
      chili: [new THREE.CylinderGeometry(0.003, 0.003, 0.22, 4), 0xD7261E, 30, 0.16],
    }[type];
    const [geo, col, n, spread] = cfg;
    const mat = type === 'scallion' ? new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2, sheen: 0.5, sheenColor: new THREE.Color(0xE8F5C0) })
      : new THREE.MeshPhysicalMaterial({ color: col, roughness: type === 'mince' ? 0.6 : 0.3, clearcoat: type === 'corn' ? 0.9 : 0.3 });
    if (type === 'mince') { const p = geo.attributes.position; for (let k = 0; k < p.count; k++) p.setXYZ(k, p.getX(k) * (0.8 + rnd() * 0.4), p.getY(k) * (0.7 + rnd() * 0.4), p.getZ(k) * (0.8 + rnd() * 0.4)); geo.computeVertexNormals(); }
    const im = new THREE.InstancedMesh(geo, mat, n);
    const o = new THREE.Object3D(), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU, rr = Math.sqrt(rnd()) * spread;
      o.position.set(Math.cos(a) * rr, 0.035 + rnd() * 0.045, Math.sin(a) * rr);
      o.rotation.set(type === 'scallion' ? (rnd() - 0.5) * 1.6 : rnd() * 3, rnd() * 3, type === 'chili' ? Math.PI / 2 : (type === 'scallion' ? (rnd() - 0.5) * 1.6 : rnd() * 3));
      const sc = 0.8 + rnd() * 0.4; o.scale.setScalar(sc);
      o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      if (type === 'scallion') { const q = rnd(); im.setColorAt(i, q < 0.3 ? c.set(0xD9E4A8).offsetHSL(0, 0, (rnd() - 0.5) * 0.08) : c.set(0x5E9A3A).offsetHSL((rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.1, (rnd() - 0.4) * 0.12)); }
      else im.setColorAt(i, c.set(0xffffff).multiplyScalar(0.85 + rnd() * 0.15));
    }
    im.castShadow = false; g.add(im);
  }
  return g;
}
function buildBowl(d, i) {
  const rnd = rng(101 + i * 37);
  const grp = new THREE.Group(), body = new THREE.Group(); grp.add(body);
  const gm = glazeMaps(d);
  const outer = new THREE.Mesh(outerGeo, new THREE.MeshPhysicalMaterial({ ...gm, normalMap: glazeN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 1, clearcoat: 1, clearcoatRoughness: 0.06 }));
  const inner = new THREE.Mesh(innerGeo, innerMat);
  const bm = brothMaps(d, 7 + i);
  const clear = { 'Shoyu Classic': 0.32, 'Yuzu Shio': 0.36, 'Black Garlic': 0.12, 'Tonkotsu': 0.1, 'Miso Fire': 0.12 }[d.name] || 0.1;
  const broth = new THREE.Mesh(brothGeo, new THREE.MeshPhysicalMaterial({ ...bm, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.08, ior: 1.34, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1,
    transparent: clear > 0.2, opacity: 1 - clear * 0.45, depthWrite: true }));
  broth.receiveShadow = SH;
  body.add(outer, inner, broth);
  if (d.name === 'Black Garlic') { const gmm = new THREE.Mesh(new THREE.CircleGeometry(0.8, 40), new THREE.MeshPhysicalMaterial({ map: garlicTex, transparent: true, depthWrite: false, roughness: 0.05, clearcoat: 1 })); gmm.rotation.x = -Math.PI / 2; gmm.position.y = BROTH_Y + 0.004; body.add(gmm); }
  const top = new THREE.Group(); top.position.y = BROTH_Y; body.add(top);
  top.add(new THREE.Mesh(noodleGeo(rnd), noodleMat));
  d.tops.forEach(([type, a, r]) => { const t = topping(type, rnd); t.position.x = Math.cos(a) * r; t.position.z = Math.sin(a) * r; if (type === 'nori') t.rotation.y = -a + Math.PI / 2; else t.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); top.add(t); });
  outer.castShadow = SH; outer.receiveShadow = false;
  const tray = new THREE.Mesh(trayGeo, trayMat); tray.receiveShadow = SH; grp.add(tray);
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.9 })); ao.rotation.x = -Math.PI / 2; ao.position.y = 0.003; grp.add(ao);
  const mkStick = () => { const s = new THREE.Group(); const m = new THREE.Mesh(stickGeo, stickMat); m.castShadow = SH; s.add(m, stickBand.clone()); return s; };
  const s1 = mkStick(), s2 = mkStick();
  { const A = 5.6, c = Math.cos(A), sn = Math.sin(A); s1.position.set(c * 0.8, 0.694, sn * 0.8); s1.rotation.y = -0.89 + 0.03; s2.position.set(c * 0.87, 0.694, sn * 0.87); s2.rotation.y = -0.89 - 0.03; }
  body.add(s1, s2);   // chopsticks rest across the rim, clear of the toppings
  let blob = null;
  if (!SH) { blob = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = -0.1; grp.add(blob); }
  return { d, i, grp, body, hit: outer };
}

/* ---------- renderer + scene ---------- */
const hero = $('.hero'), canvas = $('#ring');
const renderer = makeRenderer(canvas, { exposure: 1.05 });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));   // round 2: phone renders at DPR 2 like desktop
renderer.toneMapping = THREE.ACESFilmicToneMapping;   // ACES, sRGB output (kit)
if (SH) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer, 0.04);          // instant fallback (phones keep it)
scene.environmentIntensity = 0.85;
useHDRI(renderer, scene, { size: 512, intensity: 0.8, rotation: 0.9 });   // Poly Haven studio HDRI on desktop
const cam = new THREE.PerspectiveCamera(isM ? 34 : 28, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xFFE9CC, 0x5A2E20, 0.35));
/* warm, low key light from the side + a back light so the broth and noodles glisten */
const key = new THREE.DirectionalLight(0xFFE2BC, 1.7); key.position.set(-5, 7.5, 4);
if (SH) { key.castShadow = true; key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 }); key.shadow.radius = 6; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; }
scene.add(key);
const back = new THREE.DirectionalLight(0xFFD09A, 1.6); back.position.set(3.5, 5, -7); scene.add(back);
if (SH) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 })); sp.rotation.x = -Math.PI / 2; sp.position.y = -0.09; sp.receiveShadow = true; scene.add(sp); }
const ring = new THREE.Group(); scene.add(ring);
const bowls = D.map((d, i) => { const b = buildBowl(d, i); ring.add(b.grp); return b; });
const R = isM ? 2.25 : 3.05;

/* steam over the front bowl: soft shader wisps (fbm noise, rising and curling), not sprites */
const STEAM_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const STEAM_FS = `precision mediump float; varying vec2 vUv; uniform float uTime, uAmt, uSeed; uniform vec3 uColor;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }
void main(){
  vec2 uv = vUv; float t = uTime * 0.16;
  float w = fbm(vec2(uv.x * 1.6 + uSeed, uv.y * 1.2 - t));
  float cx = 0.5 + (w - 0.5) * 0.55 * uv.y + sin(uv.y * 3.0 + uTime * 0.4 + uSeed) * 0.06 * uv.y;
  float d = fbm(vec2((uv.x - cx) * 3.2 + uSeed * 2.0, uv.y * 2.4 - t * 2.2) + w * 1.6);
  float col = smoothstep(0.42, 0.06, abs(uv.x - cx) / (0.35 + uv.y * 0.6));
  float vert = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.4, uv.y);
  float a = smoothstep(0.38, 0.8, d) * col * vert * uAmt;
  gl_FragColor = vec4(uColor, a);
}`;
const steam = new THREE.Group(); scene.add(steam);
const steamU = [];
for (let k = 0; k < (isM ? 2 : 3); k++) {
  const u = { uTime: { value: k * 7.3 }, uAmt: { value: 0.5 }, uSeed: { value: k * 3.1 + 0.7 }, uColor: { value: new THREE.Color(0xFFF8EE) } };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), new THREE.ShaderMaterial({ vertexShader: STEAM_VS, fragmentShader: STEAM_FS, uniforms: u, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  m.userData.off = (k - (isM ? 0.5 : 1)) * 0.32; m.renderOrder = 5; steam.add(m); steamU.push(u);
}
if (reduced) steam.visible = false;

/* ---------- ring state ---------- */
let ang = 0, angT = 0, dragA = 0;
const STEP = TAU / D.length;
function framing() {
  const W = hero.clientWidth, H = hero.clientHeight;
  renderer.setSize(W, H, false); cam.aspect = W / H;
  if (isM) { cam.position.set(0, 7.2, 12.4); cam.lookAt(0, -0.35, 1.05); }
  else { const k = clamp(1.6 / cam.aspect, 0.9, 1.35); cam.position.set(0, 5.6 * k, 11.4 * k); cam.lookAt(0, 0.15, 1.25); }
  cam.updateProjectionMatrix();
}
function setDish(n, opts = {}) {
  n = ((n % D.length) + D.length) % D.length;
  if (n === active && !opts.force) return;
  const prev = active; active = n; const d = D[n];
  // shortest way round
  let target = -n * STEP; const cur = angT; target += Math.round((cur - target) / TAU) * TAU; angT = target;
  paint();
  $('#cnum').textContent = String(n + 1).padStart(2, '0');
  $$('.dchip').forEach((c, j) => c.setAttribute('aria-pressed', j === n ? 'true' : 'false'));
  rollName(d.name, n > prev ? 1 : -1);
  const hs = $('#hsub'); const gs = G();
  if (gs && !reduced) gs.timeline().to(hs, { opacity: 0, y: -8, duration: 0.25 }).add(() => { hs.textContent = d.sub; }).to(hs, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  else hs.textContent = d.sub;
  if (!opts.fromMenu) selectMenu(n, true);
}
/* giant name: letters roll out and in */
const dn = $('#dn');
const mctx = document.createElement('canvas').getContext('2d');
function fitName(txt) {
  const vw = innerWidth, vh = hero.clientHeight || innerHeight;
  const max = isM ? Math.min(vw * 0.2, vh * 0.13) : Math.min(vw * 0.175, vh * 0.3);
  mctx.font = '800 100px "Bricolage Grotesque", "Arial Black", sans-serif';
  const s = txt.toUpperCase(), w100 = mctx.measureText(s).width - 4.5 * (s.length - 1);
  $('.dname').style.fontSize = Math.min(max, (100 * vw * (isM ? 0.92 : 0.9)) / w100).toFixed(1) + 'px';
}
function splitInto(el, txt) { fitName(txt); el.innerHTML = [...txt].map((c, k) => `<span class="ch" style="--k:${k}"><i>${c === ' ' ? '&nbsp;' : c}</i></span>`).join(''); return $$('.ch i', el); }
splitInto(dn, D[0].name);
function rollName(txt, dir) {
  const gs = G();
  if (!gs || reduced) { splitInto(dn, txt); return; }
  const old = $$('.ch i', dn);
  gs.killTweensOf(old);
  gs.to(old, { yPercent: -110 * dir, duration: 0.35, ease: 'power3.in', stagger: 0.025, onComplete() {
    const nu = splitInto(dn, txt);
    gs.fromTo(nu, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035 });
  } });
}
$('#prev').addEventListener('click', () => setDish(active - 1));
$('#next').addEventListener('click', () => setDish(active + 1));
$$('.dchip').forEach((c) => c.addEventListener('click', () => setDish(+c.dataset.i)));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const r = hero.getBoundingClientRect(); if (r.bottom < innerHeight * 0.4) return;
  e.preventDefault(); setDish(active + (e.key === 'ArrowRight' ? 1 : -1));
});

/* drag the ring / click a bowl */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let drag = null;
function pickBowl(e) {
  const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, cam); const hits = ray.intersectObjects(bowls.map((b) => b.hit), false);
  return hits.length ? bowls.find((b) => b.hit === hits[0].object) : null;
}
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, a: 0, moved: false, id: e.pointerId }; });
canvas.addEventListener('pointermove', (e) => {
  if (drag) {
    const dx = e.clientX - drag.x; if (Math.abs(dx) > 8 && !drag.moved) { drag.moved = true; try { canvas.setPointerCapture(drag.id); } catch (er) { /* ignore */ } }
    if (drag.moved) dragA = dx * (isM ? 0.008 : 0.0045);
    return;
  }
  if (!coarse) canvas.style.cursor = pickBowl(e) ? 'pointer' : 'grab';
});
const endDrag = (e) => {
  if (!drag) return; const d0 = drag; drag = null;
  if (d0.moved) {
    ang += dragA; angT += dragA; dragA = 0;           // the ring stays where the finger left it
    const k = Math.round(-angT / STEP);               // nearest bowl (unwrapped index)
    angT = -k * STEP;                                 // snap to it
    setDish(((k % D.length) + D.length) % D.length);
  } else if (e.type === 'pointerup') { const b = pickBowl(e); if (b) setDish(b.i); }
};
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

/* ---------- menu (pill highlight + plate spin) ---------- */
const rows = $$('.mrow'), pill = $('.mpill'), mlist = $('.mlist'), plateImg = $('#plateImg');
const thumbs = [];
function movePill(row) { pill.style.transform = `translateY(${row.parentElement.offsetTop}px)`; pill.style.height = row.offsetHeight + 'px'; rows.forEach((r) => r.classList.toggle('hot', r === row)); }
function selectMenu(n, fromHero) {
  rows.forEach((r, j) => r.setAttribute('aria-pressed', j === n ? 'true' : 'false'));
  movePill(rows[n]); pill.style.background = D[n].bg; rows.forEach((r) => (r.style.color = ''));
  rows[n].style.color = D[n].ink;
  $('#plateName').textContent = D[n].name; $('#plateNote').textContent = D[n].note;
  plateImg.alt = `Top view of the ${D[n].name} bowl`;
  const gs = G();
  if (!thumbs[n]) return;
  if (!gs || reduced) { plateImg.src = thumbs[n]; return; }
  gs.timeline().to(plateImg, { rotate: 120, scale: 0.6, opacity: 0, duration: 0.38, ease: 'power3.in' })
    .add(() => { plateImg.src = thumbs[n]; })
    .fromTo(plateImg, { rotate: -140, scale: 0.7, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 1.0, ease: 'back.out(1.4)' });
  void fromHero;
}
rows.forEach((r, j) => {
  r.addEventListener('click', () => { setDish(j, { fromMenu: true }); selectMenu(j); });
  if (!coarse) r.addEventListener('pointerenter', () => { movePill(r); rows.forEach((x) => (x.style.color = '')); r.style.color = D[active].ink; });
});
if (!coarse) mlist.addEventListener('pointerleave', () => { movePill(rows[active]); rows.forEach((x) => (x.style.color = '')); rows[active].style.color = D[active].ink; });
addEventListener('resize', () => movePill(rows[active]));

/* bake the five plate images once, top-down, with the same renderer */
function bakeThumbs() {
  const S = isM ? 280 : 520, dpr = renderer.getPixelRatio();
  const tcam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); tcam.position.set(0, 6.4, 1.6); tcam.lookAt(0, 0.25, 0);
  const keep = bowls.map((b) => ({ p: b.grp.position.clone(), s: b.grp.scale.clone(), r: b.grp.rotation.clone(), v: b.grp.visible }));
  const tray = (b) => b.grp.children.find((c) => c.geometry === trayGeo);
  const steamV = steam.visible; steam.visible = false;
  const out = document.createElement('canvas'); out.width = out.height = S; const og = out.getContext('2d');
  renderer.setClearColor(0x000000, 0);
  bowls.forEach((b) => {
    bowls.forEach((o) => (o.grp.visible = o === b));
    b.grp.position.set(0, 0, 0); b.grp.scale.setScalar(1); b.grp.rotation.set(0, 0.4, 0); b.body.rotation.y = 0;
    const t = tray(b); if (t) t.visible = false;
    renderer.setViewport(0, 0, S, S); renderer.setScissor(0, 0, S, S); renderer.setScissorTest(true);
    renderer.clear(); renderer.render(scene, tcam);
    og.clearRect(0, 0, S, S); og.drawImage(canvas, 0, canvas.height - S * dpr, S * dpr, S * dpr, 0, 0, S, S);
    thumbs[b.i] = out.toDataURL('image/webp', 0.86);
    if (t) t.visible = true;
  });
  renderer.setScissorTest(false); renderer.setViewport(0, 0, canvas.width / dpr, canvas.height / dpr);
  bowls.forEach((b, j) => { b.grp.position.copy(keep[j].p); b.grp.scale.copy(keep[j].s); b.grp.rotation.copy(keep[j].r); b.grp.visible = keep[j].v; });
  steam.visible = steamV;
  plateImg.src = thumbs[active];
}

/* ---------- SPICE LEVEL: Mild / Hot / Fire (whole-page mode) ---------- */
const heat = { v: 0 };            // 0 mild .. 1 hot .. 2 fire (tweened)
let spice = 0, spiceBusy = false;
const HOT_TINT = '#D23F22', FIRE_TINT = '#5A110C', CREAM = '#F4E9D8';
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mixHex(a, b, t) { const A = hex2rgb(a), Bc = hex2rgb(b); return '#' + A.map((v, k) => Math.round(v + (Bc[k] - v) * t).toString(16).padStart(2, '0')).join(''); }
function heroColors(d, h) {
  let bg = d.bg, ink = d.ink;
  if (h >= 1) { bg = mixHex(bg, HOT_TINT, 0.78); ink = CREAM; }
  if (h >= 2) { bg = mixHex(d.bg, FIRE_TINT, 0.86); ink = CREAM; }
  return { bg, ink };
}
function paint() {
  const { bg, ink } = heroColors(D[active], spice);
  root.style.setProperty('--bg', bg); root.style.setProperty('--ink', ink);
  const tm = document.querySelector('meta[name="theme-color"]'); if (tm) tm.setAttribute('content', bg);
}
/* chilli oil layer on every broth, a tint and a glow on the broth itself */
const oilTex = canvasTex(TS, TS, (g, w) => {
  g.clearRect(0, 0, w, w); const r = rng(77);
  for (let i = 0; i < (170); i++) {
    const a = r() * TAU, rr = Math.sqrt(r()) * w * 0.46, x = w / 2 + Math.cos(a) * rr, y = w / 2 + Math.sin(a) * rr, s = (0.006 + r() * r() * 0.045) * w;
    const gr = g.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s); gr.addColorStop(0, 'rgba(255,170,90,.95)'); gr.addColorStop(0.55, 'rgba(226,60,30,.85)'); gr.addColorStop(1, 'rgba(160,20,10,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  // flakes
  for (let i = 0; i < (90); i++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${20 + r() * 25 | 0},14,${0.6 + r() * 0.4})`; const x = w * (0.1 + r() * 0.8), y = w * (0.1 + r() * 0.8); g.save(); g.translate(x, y); g.rotate(r() * 3); g.fillRect(-w * 0.008, -w * 0.003, w * 0.016, w * 0.006); g.restore(); }
});
const oilGeo = new THREE.CircleGeometry(outerR(BROTH_Y) - 0.075, SEG); oilGeo.rotateX(-Math.PI / 2);
const BROTH_WARM = [new THREE.Color(0xffffff), new THREE.Color(0xFFC2A6), new THREE.Color(0xFF9070)];
const bst = bowls.map((b) => {
  const brothMesh = b.body.children.find((c) => c.geometry === brothGeo);
  const oil = new THREE.Mesh(oilGeo, new THREE.MeshBasicMaterial({ map: oilTex, transparent: true, opacity: 0, depthWrite: false }));
  oil.position.y = BROTH_Y + 0.003; oil.scale.setScalar(0.3); oil.visible = false; b.body.add(oil);
  if (brothMesh) brothMesh.material.emissive = new THREE.Color(0x6A1404);
  return { b, broth: brothMesh, oilMesh: oil, oil: 0, glow: 0 };
});
/* lights that warm up */
const rim = new THREE.DirectionalLight(0xFF5A2A, 0); rim.position.set(0, 1.0, 9); scene.add(rim);
const keyCold = new THREE.Color(0xFFF1DC), keyHot = new THREE.Color(0xFFC79A);
/* embers */
const EN = isM ? 36 : 110;
const emberTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.35, 'rgba(255,150,60,.9)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
const eGeo = new THREE.BufferGeometry(), ePos = new Float32Array(EN * 3), eCol = new Float32Array(EN * 4);
const eL = new Float32Array(EN), eV = new Float32Array(EN * 3), eSeed = new Float32Array(EN);
eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3)); eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 4));
const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ size: isM ? 0.2 : 0.17, map: emberTex, transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
embers.frustumCulled = false; scene.add(embers);
function spawnEmber(i, burst) {
  const front = burst || Math.random() < 0.55;
  const src = front ? bowls[active].grp : bowls[(Math.random() * D.length) | 0].grp;
  const a = Math.random() * TAU, r = Math.random() * 0.7 * src.scale.x;
  ePos[i * 3] = src.position.x + Math.cos(a) * r; ePos[i * 3 + 1] = src.position.y + 0.6 * src.scale.x; ePos[i * 3 + 2] = src.position.z + Math.sin(a) * r;
  const sp = burst ? 2.2 + Math.random() * 2.6 : 0.6 + Math.random() * 0.9;
  eV[i * 3] = Math.cos(a) * (burst ? 1.6 + Math.random() * 1.8 : 0.15); eV[i * 3 + 1] = sp; eV[i * 3 + 2] = Math.sin(a) * (burst ? 1.2 + Math.random() * 1.4 : 0.15);
  eL[i] = 0; eSeed[i] = Math.random() * 10;
}
for (let i = 0; i < EN; i++) { spawnEmber(i); eL[i] = Math.random(); }
let emberBurstK = 0;
/* the drop + the ripple */
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xD8261A, roughness: 0.08, clearcoat: 1, emissive: 0x5A0A02 }));
drop.scale.set(1, 1.35, 1); drop.visible = false; scene.add(drop);
const rip = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: 0xFFB070, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
rip.rotation.x = -Math.PI / 2; rip.visible = false; scene.add(rip);
const ripS = { t: 1 }, dropS = { y: 0, on: 0 };
function heatFrame(dt, T) {
  const hv = heat.v, emberAmt = clamp(hv - 0.35, 0, 1.65) / 1.65; // none in mild, some in hot, full in fire
  bst.forEach((s) => {
    s.oilMesh.visible = s.oil > 0.01; s.oilMesh.material.opacity = Math.min(1, s.oil);
    s.oilMesh.scale.setScalar(0.3 + 0.7 * Math.min(1, s.oil * 1.3));
    if (s.broth) {
      const c = s.broth.material.color, lv = clamp(hv / 2);
      c.copy(BROTH_WARM[0]).lerp(hv <= 1 ? BROTH_WARM[1] : BROTH_WARM[2], hv <= 1 ? hv * 0.8 : 0.8 + (hv - 1) * 0.2);
      s.broth.material.emissiveIntensity = lv * 0.55 + (reduced ? 0 : Math.sin(T * 3 + s.b.i) * 0.06 * lv);
    }
  });
  rim.intensity = hv * 0.9; key.color.copy(keyCold).lerp(keyHot, clamp(hv / 2));
  steamU.forEach((u) => { u.uColor.value.setRGB(1, 1 - hv * 0.05, 1 - hv * 0.1); });
  // embers
  const gust = Math.sin(T * 0.7) * 0.25;
  for (let i = 0; i < EN; i++) {
    eL[i] += dt * (0.32 + eSeed[i] * 0.02);
    if (eL[i] >= 1) spawnEmber(i);
    const t = eL[i];
    eV[i * 3 + 1] *= 1 - dt * 0.35; eV[i * 3] *= 1 - dt * 1.2; eV[i * 3 + 2] *= 1 - dt * 1.2;
    ePos[i * 3] += (eV[i * 3] + Math.sin(T * 2.1 + eSeed[i]) * 0.22 + gust) * dt;
    ePos[i * 3 + 1] += (eV[i * 3 + 1] + 0.25) * dt;
    ePos[i * 3 + 2] += (eV[i * 3 + 2] + Math.cos(T * 1.7 + eSeed[i]) * 0.12) * dt;
    const a = Math.sin(t * Math.PI) * (reduced ? 0 : 1) * Math.min(1, emberAmt + emberBurstK) * (0.55 + 0.45 * Math.sin(T * 9 + eSeed[i] * 3));
    eCol.set([1, 0.55 + 0.35 * (1 - t), 0.25 * (1 - t), Math.max(0, a)], i * 4);
  }
  embers.visible = emberAmt + emberBurstK > 0.01;
  eGeo.attributes.position.needsUpdate = true; eGeo.attributes.color.needsUpdate = true;
  // drop + ripple ride the front bowl
  const fb = bowls[active].grp, surf = fb.position.y + BROTH_Y * fb.scale.x;
  drop.visible = dropS.on > 0; if (drop.visible) drop.position.set(fb.position.x + 0.12, surf + dropS.y, fb.position.z + 0.1);
  rip.visible = ripS.t < 1;
  if (rip.visible) { const k = 0.08 + ripS.t * 0.86; rip.position.set(fb.position.x, surf + 0.012, fb.position.z); rip.scale.setScalar(k * fb.scale.x); rip.material.opacity = (1 - ripS.t) * 0.9; }
}
/* screen point of the front bowl's broth (for the wipe origin) */
const _v = new THREE.Vector3();
function bowlScreen() {
  const fb = bowls[active].grp; _v.set(fb.position.x, fb.position.y + BROTH_Y * fb.scale.x, fb.position.z).project(cam);
  const r = canvas.getBoundingClientRect(); return { x: r.left + (_v.x + 1) / 2 * r.width, y: r.top + (1 - _v.y) / 2 * r.height };
}
const spBtns = $$('.sp-b'), spTh = $('.sp-th'), spEl = $('.spicer');
function placeSpThumb() { const b = spBtns[spice]; if (!b) return; spTh.style.width = b.offsetWidth + 'px'; spTh.style.transform = `translateX(${b.offsetLeft}px)`; }
function applySpiceClasses() {
  root.classList.toggle('hot', spice === 1); root.classList.toggle('fire', spice === 2);
  spBtns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === spice)));
  placeSpThumb(); paint();
}
function setSpice(h, ev) {
  if (h === spice || spiceBusy) return;
  const up = h > spice; spice = h;
  const gs = G();
  if (reduced || !gs) { heat.v = h; bst.forEach((s) => { s.oil = [0, 0.6, 1][h]; }); applySpiceClasses(); return; }
  spiceBusy = true; setTimeout(() => { spiceBusy = false; }, 900);
  const go = () => impact(h, up, ev);
  if (up) { // 1: a chilli drop falls into the front bowl
    dropS.on = 1; gs.fromTo(dropS, { y: 3.4 }, { y: 0, duration: 0.5, ease: 'power3.in', onComplete() { dropS.on = 0; go(); } });
  } else go();
  gs.fromTo(spBtns[h], { scale: 0.9 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.45)', clearProps: 'scale' });
}
function impact(h, up) {
  const gs = G();
  // 2: the page heats (or cools) in a circle that opens from the bowl
  const p = bowlScreen();
  const R = Math.hypot(Math.max(p.x, innerWidth - p.x), Math.max(p.y, innerHeight - p.y));
  if (typeof document.startViewTransition === 'function') {
    root.classList.add('vt');
    try {
      const vt = document.startViewTransition(() => applySpiceClasses());
      vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${p.x}px ${p.y}px)`, `circle(${R}px at ${p.x}px ${p.y}px)`] },
        { duration: up ? 1100 : 900, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
      vt.finished.finally(() => root.classList.remove('vt'));
    } catch (e) { root.classList.remove('vt'); applySpiceClasses(); }
  } else applySpiceClasses();
  // 3: broth, light, steam and embers follow
  gs.to(heat, { v: h, duration: up ? 1.5 : 1.1, ease: 'power3.out' });
  const target = [0, 0.6, 1][h];
  bst.forEach((s) => { // oil spreads round the ring from the front bowl
    const dist = Math.min((s.b.i - active + D.length) % D.length, (active - s.b.i + D.length) % D.length);
    gs.to(s, { oil: target, duration: up ? 1.1 : 0.7, delay: dist * 0.16, ease: up ? 'expo.out' : 'power2.inOut' });
  });
  if (up) {
    ripS.t = 0; gs.to(ripS, { t: 1, duration: 1.2, ease: 'expo.out' });
    const fbody = bowls[active].body;
    gs.fromTo(fbody.scale, { x: 1.06, y: 0.84, z: 1.06 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1,0.35)' });
    for (let i = 0; i < EN; i += 2) spawnEmber(i, true);
    emberBurstK = 1; gs.to({ k: 1 }, { k: 0, duration: 1.6, ease: 'power2.in', onUpdate() { emberBurstK = this.targets()[0].k; } });
  }
  // 4: the giant name flares up letter by letter (or settles)
  const L = $$('.ch i', dn); gs.killTweensOf(L);
  gs.fromTo(L, { yPercent: 0, scaleY: 1 }, { keyframes: up ? [{ yPercent: -14, scaleY: 1.18, duration: 0.22, ease: 'power4.out' }, { yPercent: 0, scaleY: 1, duration: 0.9, ease: 'elastic.out(1,0.38)' }]
    : [{ yPercent: 8, scaleY: 0.9, duration: 0.25, ease: 'power3.out' }, { yPercent: 0, scaleY: 1, duration: 0.7, ease: 'power3.out' }],
    stagger: { each: 0.035, from: 'center' }, transformOrigin: '50% 100%', clearProps: 'transform' });
}
spBtns.forEach((b, j) => b.addEventListener('click', (e) => setSpice(j, e)));
spEl.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); e.stopPropagation();
  const n = clamp(spice + (e.key === 'ArrowRight' ? 1 : -1), 0, 2); setSpice(n); spBtns[n].focus();
});
addEventListener('resize', placeSpThumb);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeSpThumb);
requestAnimationFrame(placeSpThumb);

/* ---------- loop ---------- */
let last = performance.now(), T = 0, vis = true;
const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; }, { threshold: 0 }); io.observe(hero);
const line = $('.line'), broth = $('.broth');
const SHOT = new URLSearchParams(location.search).get('shot');   // QA hook: ?shot=close frames the front bowl up close
function frame(now) {
  requestAnimationFrame(frame);
  if (SHOT) { ang = angT; }
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  // broth timeline progress line
  const br = broth.getBoundingClientRect(); line.style.setProperty('--p', clamp((innerHeight * 0.85 - br.top) / (br.height * 0.9)).toFixed(3));
  if (!vis || document.hidden) return;
  ang = damp(ang, angT, reduced ? 1000 : 5.2, dt);
  const A = ang + dragA;
  bowls.forEach((b) => {
    const th = A + b.i * STEP, x = Math.sin(th) * R, z = Math.cos(th) * R;
    const front = Math.pow((Math.cos(th) + 1) / 2, 3);
    const s = lerp(0.6, isM ? 1.08 : 1.14, front);
    b.grp.position.set(x, front * 0.25 + (reduced ? 0 : Math.sin(T * 1.2 + b.i) * 0.03), z);
    b.grp.scale.setScalar(s);
    b.grp.rotation.y = -th * 0.4;
    b.body.rotation.y += (reduced ? 0 : dt * (0.05 + front * 0.18));
  });
  // steam wisps above the front bowl (billboarded to the camera)
  const fb = bowls[active].grp, top = fb.position.y + BROTH_Y * fb.scale.x;
  steam.children.forEach((m, k) => {
    const u = steamU[k]; u.uTime.value += dt * (1 + heat.v * 0.35);
    u.uAmt.value = (isM ? 0.42 : 0.5) * (1 + heat.v * 0.45);
    m.quaternion.copy(cam.quaternion);
    const sc = fb.scale.x * (1 + heat.v * 0.12);
    m.scale.set(sc, sc * (1 + heat.v * 0.15), sc);
    m.position.set(fb.position.x + m.userData.off * sc, top + 1.15 * sc * (1 + heat.v * 0.15), fb.position.z + 0.05 * k);
  });
  heatFrame(dt, T);
  if (SHOT === 'close') { cam.position.set(0.55, 2.35, R + 2.15); cam.lookAt(0, 0.62, R - 0.05); }
  else if (SHOT === 'egg') { cam.position.set(-0.2, 1.75, R + 1.25); cam.lookAt(-0.15, 0.7, R - 0.1); }
  renderer.render(scene, cam);
}

/* ---------- misc UI ---------- */
let lenis = null;
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault();
  const el = $(a.getAttribute('href')); if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.5 }); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});
function magnetic() {
  if (coarse || isM || reduced) return;
  $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transition = 'transform .15s ease-out'; el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
  });
}

async function boot() {
  framing(); addEventListener('resize', framing);
  lenis = smooth(); reveals(); magnetic();
  paint();
  selectMenu(0);
  try { await document.fonts.load('800 100px "Bricolage Grotesque"'); } catch (e) { /* system font fallback */ }
  fitName(D[active].name); addEventListener('resize', () => fitName(D[active].name));
  requestAnimationFrame((t) => { bakeThumbs(); last = t; frame(t); });
  if (!reduced && G()) {
    // entrance: the ring spins in from a quarter turn, the bowls rise
    ang = angT + STEP * 2.2;
    G().from('.hero-l > *, .hero-r, .chips', { y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.35 });
    G().from($$('.ch i', dn), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.04, delay: 0.15 });
  }
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
