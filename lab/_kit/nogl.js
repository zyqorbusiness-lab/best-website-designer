/* Zyqor Lab - no-WebGL fallback (v3 gaps, Oct 28).
   When a device has no WebGL (blocked, very old GPU, Chrome --disable-3d-apis) or a context cannot be made,
   every 3D canvas shows a still of its own scene instead of a blank box, and <html> gets the class `no-webgl`
   so a demo's CSS can react. The page's text, nav and CTAs keep working (the demo code keeps running
   against a harmless stand-in renderer, see gl.js).
   Stills: nogl-map.js maps each canvas (CSS selector) to a still of that canvas, shot from the live scene
   (work/beast/v3gaps/probe.mjs "stills" jobs re-shoot them). A canvas with no entry gets the label only: the demo
   posters (poster.webp / poster-m.webp) are full-page shots that include the page text, so behind a canvas they
   would print every headline twice.
   Used by chrome.js (every demo page) and gl.js (every renderer). No three.js import here. */
import { STILLS } from './nogl-map.js';

const de = document.documentElement;
const isM = de.dataset.build === 'm';
const slug = () => (document.body && document.body.dataset.slug) || '';
let _gl;

/* true when this browser can make a WebGL context (cached; one throwaway context, no console output) */
export function hasWebGL() {
  if (_gl !== undefined) return _gl;
  try {
    const c = document.createElement('canvas');
    _gl = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { _gl = false; }
  return _gl;
}

export function markNoGL() { de.classList.add('no-webgl'); }

/* the still for one canvas: its own entry in nogl-map.js, else the demo poster */
export function posterFor(canvas) {
  const list = (STILLS[slug()] || {})[isM ? 'm' : 'd'] || [];
  for (const s of list) {
    const all = document.querySelectorAll(s.sel);
    if (all[s.n || 0] === canvas) return { src: new URL(s.src, import.meta.url).href, fit: s.fit || 'contain', pos: s.pos || 'center' };
  }
  return null;
}

function brand() {
  const t = (document.title || '').split(/[|·—–-]/)[0].trim();
  return t || 'this concept';
}

/* show the still on (behind) one canvas. The canvas keeps its place and size, so the layout does not move. */
export function showPoster(canvas) {
  markNoGL();
  if (!canvas || canvas.dataset.zlPoster) return;
  canvas.dataset.zlPoster = '1';
  canvas.dataset.zlAria = canvas.getAttribute('aria-label') || '';
  canvas.dataset.zlRole = canvas.getAttribute('role') || '';
  /* <canvas data-nogl="self">: the demo shows its own still (e.g. an <img> under the canvas); only the label changes */
  if (canvas.dataset.nogl === 'self') { canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `${brand()}: still image of the 3D scene (3D is not available on this device)`); return; }
  const p = posterFor(canvas);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${brand()}: still image of the 3D scene (3D is not available on this device)`);
  if (!p) { canvas.setAttribute('aria-label', `${brand()}: 3D scene (3D is not available on this device)`); return; }
  canvas.classList.add('zl-poster');
  const st = canvas.style;
  st.setProperty('background-image', `url("${p.src}")`);
  st.setProperty('background-size', p.fit);
  st.setProperty('background-position', p.pos);
  st.setProperty('background-repeat', 'no-repeat');
  st.setProperty('opacity', '1', 'important');
  st.setProperty('visibility', 'visible', 'important');
  st.setProperty('cursor', 'default');
}

/* undo showPoster (a lost WebGL context came back) */
export function hidePoster(canvas) {
  if (!canvas || !canvas.dataset.zlPoster) return;
  for (const k of ['background-image', 'background-size', 'background-position', 'background-repeat', 'opacity', 'visibility', 'cursor']) canvas.style.removeProperty(k);
  canvas.classList.remove('zl-poster');
  if (canvas.dataset.zlAria) canvas.setAttribute('aria-label', canvas.dataset.zlAria); else canvas.removeAttribute('aria-label');
  if (canvas.dataset.zlRole) canvas.setAttribute('role', canvas.dataset.zlRole); else canvas.removeAttribute('role');
  delete canvas.dataset.zlPoster; delete canvas.dataset.zlAria; delete canvas.dataset.zlRole;
}

/* page-level check: no WebGL at all -> mark <html> and put the stills on every mapped canvas right away
   (covers demos that build their canvas markup but never reach a renderer). Pages without 3D are untouched. */
function boot() {
  const has3D = document.querySelector('canvas') || /"three"/.test((document.querySelector('script[type="importmap"]') || {}).textContent || '');
  if (!has3D || hasWebGL()) return;
  markNoGL();
  const list = (STILLS[slug()] || {})[isM ? 'm' : 'd'] || [];
  for (const s of list) { const el = document.querySelectorAll(s.sel)[s.n || 0]; if (el) showPoster(el); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();

/* safety net: a WebGL error that escaped a demo's own code still ends with a still, not a blank box */
addEventListener('error', (e) => {
  if (!/webgl|WebGLRenderer/i.test(String(e.message || ''))) return;
  markNoGL();
  const big = [...document.querySelectorAll('canvas')].filter((c) => !c.dataset.zlPoster)
    .sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
  if (big) showPoster(big);
});
