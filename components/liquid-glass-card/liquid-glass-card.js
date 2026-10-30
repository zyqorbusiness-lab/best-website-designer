/* liquid-glass-card.js: Zyqor Components (MIT). No dependencies.
   Enhances .lg cards: injects one shared SVG displacement filter (real edge refraction in Chromium,
   a clean frosted blur everywhere else), a specular highlight that follows the pointer, a gentle tilt,
   and optional dragging ([data-lg-drag]) so you can watch the background bend through the glass. */
const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
let filterMade = false;

function makeFilter() {
  if (filterMade) return; filterMade = true;
  // displacement map: a soft rounded-rect ramp in red/green, strongest at the edges like a thick lens
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const nx = x / 255 * 2 - 1, ny = y / 255 * 2 - 1;
    const edge = Math.max(Math.abs(nx), Math.abs(ny)); const k = Math.pow(Math.max(0, (edge - 0.55) / 0.45), 2.2);
    const i = (y * 256 + x) * 4; img.data[i] = 128 + nx * k * 127; img.data[i + 1] = 128 + ny * k * 127; img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
  svg.innerHTML = `<filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feImage href="${c.toDataURL()}" preserveAspectRatio="none" result="map"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="soft"/>
    <feDisplacementMap in="soft" in2="map" scale="46" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
  document.body.append(svg);
  // Only Chromium applies SVG filters inside backdrop-filter; everyone else keeps the blur fallback.
  const ok = /Chrome\//.test(navigator.userAgent) && CSS.supports('backdrop-filter', 'url(#lg-refract)');
  document.documentElement.classList.toggle('lg-refract', ok);
}

export function liquidGlass(el) {
  makeFilter();
  const s = { tx: 0, ty: 0, raf: 0 };
  const set = (e) => {
    const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--lg-mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--lg-my', (py * 100).toFixed(1) + '%');
    if (!reduced() && fine() && !el.hasAttribute('data-lg-flat')) { el.style.setProperty('--lg-rx', ((0.5 - py) * 7).toFixed(2) + 'deg'); el.style.setProperty('--lg-ry', ((px - 0.5) * 9).toFixed(2) + 'deg'); }
  };
  el.addEventListener('pointermove', set, { passive: true });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--lg-rx', '0deg'); el.style.setProperty('--lg-ry', '0deg'); });
  if (el.hasAttribute('data-lg-drag')) {
    let d = null;
    el.addEventListener('pointerdown', (e) => { if (e.target.closest('a,button,input')) return; d = { x: e.clientX - s.tx, y: e.clientY - s.ty, id: e.pointerId }; el.setPointerCapture(e.pointerId); el.classList.add('is-drag'); });
    el.addEventListener('pointermove', (e) => {
      if (!d || e.pointerId !== d.id) return;
      const box = (el.offsetParent || document.body).getBoundingClientRect(), r = el.getBoundingClientRect();
      const minX = box.left - (r.left - s.tx), maxX = box.right - (r.right - s.tx), minY = box.top - (r.top - s.ty), maxY = box.bottom - (r.bottom - s.ty);
      s.tx = Math.min(maxX, Math.max(minX, e.clientX - d.x)); s.ty = Math.min(maxY, Math.max(minY, e.clientY - d.y));
      el.style.setProperty('--lg-dx', s.tx + 'px'); el.style.setProperty('--lg-dy', s.ty + 'px');
    });
    const end = () => { d = null; el.classList.remove('is-drag'); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', (e) => { const k = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key]; if (!k || e.target !== el) return; e.preventDefault(); s.tx += k[0]; s.ty += k[1]; el.style.setProperty('--lg-dx', s.tx + 'px'); el.style.setProperty('--lg-dy', s.ty + 'px'); });
  }
  return el;
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('.lg').forEach((el) => { if (!el.__lg) { el.__lg = 1; liquidGlass(el); } });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
