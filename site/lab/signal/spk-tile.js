/* Live 3D for the "04 3D" bento tile - the SAME speaker, materials and textures on desktop and phone.
   Loads three.js + the speaker only when the tile nears the viewport; renders only while visible (paused off-screen).
   The baked stills underneath show only until the first live frame lands (and stay if WebGL is unavailable). */
const host = document.querySelector('.t-3d .spk');
if (host) {
  const isM = document.documentElement.dataset.build === 'm';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debug = /[?&]spkdebug/.test(location.search);
  const start = async () => {
    try {
      const [THREE, { studioEnv, whenVisible }, { useHDRI }, { createStage }] = await Promise.all([
        import('three'), import('../_kit/kit.js'), import('../../assets/hdri/hdri.js'), import('./speaker.js')]);
      try { await document.fonts.load('700 30px Unbounded'); } catch (e) { /* badge falls back to the system face */ }
      // same renderer on both builds: antialias on, DPR capped at 2, ACES, sRGB
      const makeRenderer = (canvas, o = {}) => {
        const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: o.alpha ?? true, powerPreference: 'high-performance' });
        r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = o.exposure ?? 1;
        return r;
      };
      const cv = document.createElement('canvas'); cv.className = 'spk-gl'; cv.setAttribute('aria-hidden', 'true');
      if (isM) cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s ease';
      host.appendChild(cv);
      const st = createStage(cv, { makeRenderer, studioEnv, useHDRI, hdriSize: 512 });
      if (debug) window.__spk = st;
      const root = document.documentElement, tileEl = host.closest('.t-3d');
      const isLoud = () => root.classList.contains('loud');
      st.state.loudT = st.state.loud = isLoud() ? 1 : 0;
      st.look.yaw = -0.35;
      let w = 0, h = 0, on = false, raf = 0, last = 0, shown = false;
      const size = () => {
        const r = host.getBoundingClientRect(); if (!r.width || !r.height) return;
        w = r.width; h = r.height; st.renderer.setSize(w, h, false);
        if (isM) st.frame(w, h, { dist: Math.max(6.2, 3.0 / (w / h)), el: 0.36, y: 0.78, shiftY: 0.06 });
        else st.frame(w, h, { dist: Math.max(7.0, 3.4 / (w / h)), el: 0.36, y: 0.74, shiftY: 0.15 });
        if (debug && window.__spkLook) st.frame(w, h, window.__spkLook);
        if (!raf && on) raf = requestAnimationFrame(loop);
      };
      const show = () => {
        if (shown) return; shown = true; host.classList.add('is-on');
        if (isM) { cv.style.opacity = '1'; host.querySelectorAll('.spk-still,.spk-wave').forEach((el) => { el.style.transition = 'opacity .6s ease'; el.style.opacity = '0'; el.style.animation = 'none'; }); }
      };
      new ResizeObserver(size).observe(host); size();
      let tx = 0, ty = 0;
      if (!isM) {
        tileEl.addEventListener('pointerenter', () => { st.state.hoverT = 1; });
        tileEl.addEventListener('pointerleave', () => { st.state.hoverT = 0; tx = ty = 0; });
        tileEl.addEventListener('pointermove', (e) => {
          if (reduced) return; const r = tileEl.getBoundingClientRect();
          tx = ((e.clientY - r.top) / r.height - 0.5) * 0.16; ty = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
        });
      }
      new MutationObserver(() => { st.state.loudT = isLoud() ? 1 : 0; if (!raf && on) raf = requestAnimationFrame(loop); })
        .observe(root, { attributes: true, attributeFilter: ['class'] });
      st.hdri.then(() => { if (!raf && on) raf = requestAnimationFrame(loop); });
      st.state.hoverT = 0;
      const loop = (t) => {
        raf = 0; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
        const s = st.state;
        s.hover += ((s.hoverT || 0) - s.hover) * (1 - Math.exp(-6 * dt));
        s.tiltX += (tx - s.tiltX) * (1 - Math.exp(-5 * dt)); s.tiltY += (ty - s.tiltY) * (1 - Math.exp(-5 * dt));
        if (reduced || (debug && window.__spkFreeze)) {
          s.loud = s.loudT; st.step(0, { animate: false }); st.render(); show(); return;   // one still frame per change, no motion
        }
        st.step(dt); st.render(); show();
        if (on) raf = requestAnimationFrame(loop);
      };
      if (debug) {
        window.__spkRender = () => { st.step(0, { animate: false }); st.render(); };
        window.__spkReframe = () => { window.__spkFreeze = 0; st.look.yaw = -0.35; size(); };
        window.__spkStill = (sw, sh, look, loud) => {   // bake a transparent still of the live model (used for the loading posters)
          st.renderer.setPixelRatio(1); st.renderer.setSize(sw, sh, false); st.frame(sw, sh, look);
          st.state.loud = st.state.loudT = loud ? 1 : 0; st.state.spin = 0; st.look.yaw = look.yaw ?? -0.35; st.state.tiltX = st.state.tiltY = 0;
          st.step(0, { animate: false }); st.spk.setBars(1.2, loud ? 1 : 0, loud ? 0.6 : 0); st.render();
          const url = st.renderer.domElement.toDataURL('image/png');
          st.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); size(); return url;
        };
      }
      whenVisible(host, (v) => { on = v; if (v && !raf) { last = 0; raf = requestAnimationFrame(loop); } if (!v && raf) { cancelAnimationFrame(raf); raf = 0; } });
    } catch (e) { /* stills stay; nothing to report */ if (debug) console.warn('spk', e); }
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '400px 0px' });
    io.observe(host);
  } else start();
}
