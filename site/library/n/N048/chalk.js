/* N048 Ironbark Barbers: chalk.js. The chalkboard writes each price in chalk, one hand-traced single-stroke path per
   glyph (drawn by Zyqor Studio, 60 x 100 box). Paths are sampled once into points (SVG getPointAtLength) and drawn onto a
   2D canvas a little at a time, with three thin jittered passes for chalk grain. Used as a three.js CanvasTexture. */
const G = {
  '0': 'M30 6 C10 6 6 30 6 50 C6 72 12 94 30 94 C48 94 54 72 54 50 C54 28 48 6 30 6',
  '1': 'M14 24 L34 6 L34 94',
  '2': 'M8 26 C10 12 20 6 31 6 C44 6 53 15 53 28 C53 44 40 54 8 94 L56 94',
  '3': 'M8 16 C14 9 22 6 30 6 C44 6 52 14 52 26 C52 38 42 46 26 47 C44 47 55 57 55 70 C55 85 44 94 29 94 C19 94 11 90 6 83',
  '4': 'M42 94 L42 6 L6 66 L58 66',
  '5': 'M52 6 L14 6 L10 46 C16 41 23 39 31 39 C46 39 55 50 55 66 C55 83 44 94 29 94 C19 94 11 90 6 84',
  '6': 'M48 12 C42 8 36 6 30 6 C14 6 7 28 7 54 C7 80 16 94 31 94 C46 94 54 83 54 68 C54 53 45 43 31 43 C19 43 9 51 7 62',
  '7': 'M6 6 L54 6 L24 94',
  '8': 'M30 48 C16 48 9 40 9 27 C9 14 18 6 30 6 C42 6 51 14 51 27 C51 40 44 48 30 48 C14 48 6 58 6 71 C6 85 16 94 30 94 C44 94 54 85 54 71 C54 58 46 48 30 48',
  '9': 'M53 38 C51 50 42 57 30 57 C16 57 7 47 7 32 C7 16 17 6 30 6 C45 6 53 18 53 40 C53 70 45 94 27 94 C19 94 13 91 9 86',
  '$': 'M50 22 C46 13 39 9 30 9 C18 9 10 16 10 27 C10 39 20 44 30 47 C42 51 52 56 52 70 C52 83 42 91 29 91 C19 91 11 86 7 78 M30 -2 L30 102'
};
const cache = new Map();
function points(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), out = [];
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute'; svg.setAttribute('aria-hidden', 'true');
  document.body.append(svg);
  /* each sub-path separately so a pen lift is a gap, not a line */
  for (const d of G[ch].split(/(?=M)/)) {
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.append(p);
    const L = p.getTotalLength(), n = Math.max(8, Math.ceil(L / 2)), seg = [];
    for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((i / n) * L); seg.push([q.x, q.y]); }
    out.push(seg);
  }
  svg.remove(); cache.set(ch, out); return out;
}
/* deterministic jitter so a redraw looks the same */
const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
export function drawGlyph(ctx, ch, x, y, h, t, color = '#E2DCD0') {
  const segs = points(ch); if (!segs) return;
  const k = h / 100, total = segs.reduce((a, s) => a + s.length - 1, 0); let budget = Math.round(total * Math.min(1, Math.max(0, t)));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  for (let pass = 0; pass < 3; pass++) {
    let b = budget; ctx.globalAlpha = pass === 0 ? 0.9 : 0.35; ctx.lineWidth = h * (pass === 0 ? 0.075 : 0.035);
    for (let si = 0; si < segs.length && b > 0; si++) {
      const s = segs[si]; ctx.beginPath();
      for (let i = 0; i < s.length && b >= 0; i++, b--) {
        const j = pass ? (rnd(si * 97 + i * 7 + pass * 13) - 0.5) * h * 0.04 : 0;
        const px = x + s[i][0] * k + j, py = y + s[i][1] * k + j;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
/* writes a whole string; t in 0..1 over all glyphs (each glyph gets an equal share, 520 ms each when animated) */
export function drawText(ctx, str, x, y, h, t, color) {
  const n = str.length; let cx = x;
  for (let i = 0; i < n; i++) { const ch = str[i]; const lt = Math.min(1, Math.max(0, t * n - i)); if (lt > 0) drawGlyph(ctx, ch, cx, y, h, lt, color); cx += h * (ch === '1' ? 0.5 : 0.66); }
}
export const textWidth = (str, h) => [...str].reduce((a, ch) => a + h * (ch === '1' ? 0.5 : 0.66), 0);
export const GLYPH_MS = 520;
