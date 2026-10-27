/* Verdant - desktop build: live 3D plant in the arched window + Lenis.
   Signature: the plant unfurls as the window opens, and the Sunlit / Dusk switch re-lights the room:
   the sun light swings low behind the leaves (gold, then ember), fireflies wake up with their own little lights,
   the leaves fold up for the night and the plant turns after the light. */
import { reveals, smooth } from '../_kit/kit.js';
import { startPlant } from './plant3d.js';
import { initUI, $ } from './ui.js';

const M = { target: 0, n: 0, from: 0, t0: 0, dur: 2200, kick: null };
let lenis = null;
initUI({ lenis: () => lenis, onMode: (on) => { M.from = M.n; M.target = on; M.t0 = performance.now(); M.kick && M.kick(); } });
reveals(); lenis = smooth();

const cv = $('.plantgl'), ph = $('.plant-img.ph'), arch = $('.arch');

const shownD = () => { cv.classList.add('on'); ph.classList.add('off'); };
const boot = () => startPlant({ cv, arch, M, onShown: shownD }).then(() => { window.__plantReady = true; }).catch(() => { ph.classList.add('fb'); });
setTimeout(() => { if (!window.__plantReady) ph.classList.add('fb'); }, 15000);
const ready = () => { window.__vReady = performance.now(); setTimeout(boot, 120); };
if (document.readyState === 'complete') ready(); else addEventListener('load', ready);
