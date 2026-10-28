/* UMAMI RING - Concept 08, Zyqor Lab. Five real scanned ramen bowls on a rotating ring (orbit carousel);
   the page colour and the giant dish name follow the bowl at the front. Shared by index.html and m.html.
   This file only checks for WebGL: with it, the 3D ring loads (ring.js); without it, the poster and a
   plain version of the menu, chips and spice switch run here. */
import { D, plateSrc } from './dishes.js';

const root = document.documentElement;
const glOK = (() => {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
})();

if (glOK) import('./ring.js').catch((e) => { console.error('Umami ring could not start:', e); noGL(); });
else noGL();

function noGL() {
  root.classList.add('nogl');
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  let active = 0, spice = 0;
  const paint = () => {
    const d = D[active]; let bg = d.bg, ink = d.ink;
    if (spice === 1) { bg = '#C93A26'; ink = '#F4E9D8'; } else if (spice === 2) { bg = '#5E1710'; ink = '#F4E9D8'; }
    root.style.setProperty('--bg', bg); root.style.setProperty('--ink', ink);
  };
  const show = (n) => {
    active = (n + D.length) % D.length; const d = D[active];
    const dn = $('#dn'); if (dn) dn.textContent = d.name;
    const hs = $('#hsub'); if (hs) hs.textContent = d.sub;
    const cn = $('#cnum'); if (cn) cn.textContent = String(active + 1).padStart(2, '0');
    $$('.dchip').forEach((c, j) => c.setAttribute('aria-pressed', j === active ? 'true' : 'false'));
    $$('.mrow').forEach((r, j) => { r.setAttribute('aria-pressed', j === active ? 'true' : 'false'); r.classList.toggle('hot', j === active); });
    const pn = $('#plateName'); if (pn) pn.textContent = d.name;
    const pt = $('#plateNote'); if (pt) pt.textContent = d.note;
    const pi = $('#plateImg'); if (pi) { pi.src = plateSrc(d); pi.alt = `Top view of the ${d.name} bowl`; }
    paint();
  };
  $('#prev')?.addEventListener('click', () => show(active - 1));
  $('#next')?.addEventListener('click', () => show(active + 1));
  $$('.dchip').forEach((c) => c.addEventListener('click', () => show(+c.dataset.i)));
  $$('.mrow').forEach((r, j) => r.addEventListener('click', () => show(j)));
  const placeTh = () => { const b = $$('.sp-b')[spice], th = $('.sp-th'); if (b && th) { th.style.width = b.offsetWidth + 'px'; th.style.transform = `translateX(${b.offsetLeft}px)`; } };
  $$('.sp-b').forEach((b, j) => b.addEventListener('click', () => {
    spice = j; root.classList.toggle('hot', j === 1); root.classList.toggle('fire', j === 2);
    $$('.sp-b').forEach((x, k) => x.setAttribute('aria-pressed', String(k === j)));
    placeTh(); paint();
  }));
  addEventListener('resize', placeTh); requestAnimationFrame(placeTh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeTh);
  $$('[data-rv]').forEach((el) => el.classList.add('rv-in'));
  show(0);
}
