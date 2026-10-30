/* N014 Glint Eyewear: the eye chart, drawn in code on a 2048 px canvas (a prop, own work).
   Snellen-style ladder: 8 rows, each row 0.8x the one above, Archivo 800, letter spacing 0.18em, row numbers left and
   the classic 20/xx line labels right. drawChart(n) draws the first n rows, so the intro can type them in. */
import { THREE } from '../../_kit/stage.js';
export const ROWS = ['E', 'FP', 'TOZ', 'LPED', 'PECFD', 'EDFCZP', 'FELOPZD', 'DEFPOTEC'];
const LABEL = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20'];
const css = getComputedStyle(document.documentElement);
const col = (k, d) => (css.getPropertyValue(k).trim() || d);
export function makeChart({ w = 2048, h = 1280, rows = ROWS, first = 0.15, gapK = 0.36, top = 0.055, labels = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const mist = col('--mist', '#E2EAEE'), ink = col('--tortoise', '#3B2A1E'), ink2 = col('--tortoise-2', '#5C5048'), line = col('--line', '#C3CDD2');
  function draw(n = rows.length) {
    g.fillStyle = mist; g.fillRect(0, 0, w, h);
    g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(w * 0.235, h * 0.035, w * 0.53, h * 0.93);
    g.textBaseline = 'alphabetic'; g.textAlign = 'center';
    let s = h * first, y = h * top;
    for (let i = 0; i < rows.length; i++) {
      y += s;
      if (i < n) {
        g.fillStyle = ink; g.font = `800 ${s.toFixed(1)}px Archivo, "Archivo fallback", Arial, sans-serif`;
        g.letterSpacing = (s * 0.18).toFixed(1) + 'px';
        g.fillText(rows[i], w / 2 + s * 0.09, y);
        g.letterSpacing = '0px';
        if (labels) {
          g.font = `400 ${Math.max(22, s * 0.16).toFixed(0)}px "JetBrains Mono", monospace`; g.fillStyle = ink2;
          g.textAlign = 'left'; g.fillText(String(i + 1), w * 0.25, y); g.textAlign = 'right'; g.fillText(LABEL[i] || '', w * 0.75, y); g.textAlign = 'center';
        }
      }
      y += s * gapK; s *= 0.8;
    }
    tex.needsUpdate = true;
  }
  draw(rows.length);
  return { canvas: c, texture: tex, draw, rows: rows.length };
}
