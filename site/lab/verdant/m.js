/* Verdant - phone build: the SAME live 3D plant as desktop (same GLB, 2K textures, HDRI, leaf shaders, mulch),
   lazy-loaded when the arched window nears the viewport and paused off-screen; the baked still shows only while it loads. */
import { initUI, revealsLite, $ } from './ui.js';
const M = { target: 0, n: 0, from: 0, t0: 0, dur: 2200, kick: null };
initUI({ onMode: (on) => { M.from = M.n; M.target = on; M.t0 = performance.now(); M.kick && M.kick(); } });
revealsLite();
const arch = $('.arch');
if (arch && window.WebGLRenderingContext) {
  const imgs = [...arch.querySelectorAll('.plant-img')];
  const cv = document.createElement('canvas'); cv.className = 'plantgl'; cv.setAttribute('aria-hidden', 'true');
  const rim = arch.querySelector('.rim'); if (rim) arch.insertBefore(cv, rim); else arch.appendChild(cv);
  const onShown = () => { cv.classList.add('on'); imgs.forEach((i) => { i.style.transition = 'opacity .9s'; i.style.opacity = '0'; }); };
  let started = false;
  const start = () => {
    if (started) return; started = true; window.__vReady = performance.now();
    import('./plant3d.js').then((m) => m.startPlant({ cv, arch, M, onShown })).then(() => { window.__plantReady = true; }).catch(() => { cv.remove(); });
  };
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '400px 0px' });
  io.observe(arch);
}
