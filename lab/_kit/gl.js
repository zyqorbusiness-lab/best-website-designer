/* Zyqor Lab - safe WebGL renderer (v3 gaps, Oct 28).
   glRenderer(params) == new THREE.WebGLRenderer(params), except that when WebGL is missing or the context
   cannot be made it never throws: the canvas shows its still (nogl.js) and the demo gets a stand-in
   renderer whose every call is a no-op, so the rest of the page (text, nav, CTAs, reveals) keeps working.
   A context lost at runtime shows the still until the context comes back.
   Import from here (tiny) or from kit.js (re-exported). */
import * as THREE from 'three';
import { hasWebGL, showPoster, hidePoster } from './nogl.js';
export { hasWebGL, showPoster, hidePoster };

/* a renderer that does nothing: any property is the stand-in again, any call returns it, numbers read as 0 */
export function stubRenderer(canvas) {
  const el = canvas || document.createElement('canvas');
  showPoster(el);
  const own = {
    domElement: el, isStub: true, isWebGLRenderer: true,
    compileAsync: () => Promise.resolve(), initTextureAsync: () => Promise.resolve(),
    getPixelRatio: () => 1, getContext: () => null,
    getSize: (v) => (v ? (v.set ? v.set(el.clientWidth, el.clientHeight) : v) : { x: 0, y: 0, width: 0, height: 0 }),
    getDrawingBufferSize: (v) => (v && v.set ? v.set(el.clientWidth, el.clientHeight) : v),
    getClearColor: (c) => c, getClearAlpha: () => 0, getRenderTarget: () => null,
    dispose: () => {}, setAnimationLoop: () => {},
  };
  const nop = function () {};
  const P = new Proxy(nop, {
    get(t, k) {
      if (k in own) return own[k];
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'then' || typeof k === 'symbol') return undefined;
      return P;
    },
    set(t, k, v) { own[k] = v; return true; },
    apply() { return P; },
    construct() { return P; },
  });
  return P;
}

export function glRenderer(params = {}) {
  if (!hasWebGL()) return stubRenderer(params.canvas);
  let r;
  try { r = new THREE.WebGLRenderer(params); } catch (e) { return stubRenderer(params.canvas); }
  const el = r.domElement;
  el.addEventListener('webglcontextlost', () => showPoster(el));
  el.addEventListener('webglcontextrestored', () => hidePoster(el));
  return r;
}
