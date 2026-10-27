/* Plinth (Concept) - desktop build. Editorial motion: kinetic variable-weight masthead, clip-path reveals,
   cursor-follow index preview, pinned horizontal gallery with a WebGL hover-distortion, scroll-driven kinetic type.
   No three.js here: the distortion is ~90 lines of raw WebGL so the page stays light. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function reveals() {
  const els = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/* Concept CTA: never goes anywhere real */
$$('[data-concept]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const n = $('.i-note'); n.textContent = 'Thanks. This is a concept: Plinth is not a real magazine, so nothing was sent.'; n.classList.add('hi');
}));

function start() {
  reveals();
  if (reduced) { $$('.mast .ch').forEach((c) => (c.style.fontVariationSettings = '"wght" 700')); return; }
  const gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* smooth scroll */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href'); if (id.length < 2 || a.hasAttribute('data-concept')) return;
      const t = document.querySelector(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    }));
  }

  /* ---------- 1. intro: cover wipes up, masthead letters rise and gain weight ---------- */
  const chars = $$('.mast .ch');
  const W = { v: chars.map(() => 100) };
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.cover-in', { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'power4.inOut' }, 0.1)
    .to('.cover img', { scale: 1.04, duration: 2.4, ease: 'power3.out' }, 0.3)
    .to(chars, { y: 0, duration: 1.4, stagger: 0.07 }, 0.35)
    .to(W.v, { endArray: chars.map((_, i) => (i % 2 ? 380 : 820)), duration: 2.2, ease: 'power3.inOut', onUpdate: () => chars.forEach((c, i) => (c.style.fontVariationSettings = `"wght" ${W.v[i].toFixed(0)}`)) }, 0.55);
  /* kinetic masthead: weight follows the cursor across the letters */
  let mx = -1, live = false, inHero = true;
  const cw = chars.map((_, i) => (i % 2 ? 380 : 820));
  tl.eventCallback('onComplete', () => { live = true; chars.forEach((c, i) => (cw[i] = W.v[i])); });
  addEventListener('pointermove', (e) => { mx = e.clientX; }, { passive: true });
  $('.hero').addEventListener('pointerleave', () => { mx = -1; });
  new IntersectionObserver(([e]) => { inHero = e.isIntersecting; }).observe($('.hero'));
  gsap.ticker.add(() => {
    if (!live || !inHero) return;
    const s = innerWidth * 0.13;
    chars.forEach((c, i) => {
      let t = i % 2 ? 380 : 820;
      if (mx >= 0) { const r = c.getBoundingClientRect(); const dx = (r.left + r.width / 2 - mx) / s; t = 120 + 780 * Math.exp(-dx * dx); }
      cw[i] = lerp(cw[i], t, 0.09); c.style.fontVariationSettings = `"wght" ${cw[i].toFixed(1)}`;
    });
  });
  /* hero parallax on scroll */
  gsap.to('.cover img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.mast', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- 2. contents: cursor-follow preview ---------- */
  const peek = $('.peek'), pimg = $('.peek img');
  let px = innerWidth / 2, py = innerHeight / 2, tx = px, ty = py, vx = 0, on = false;
  $$('.row').forEach((row) => {
    row.addEventListener('pointerenter', () => { const src = row.dataset.img; if (!pimg.src.endsWith(src.split('/').pop())) pimg.src = src; peek.classList.add('on'); on = true; });
    row.addEventListener('pointerleave', () => { peek.classList.remove('on'); on = false; });
  });
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    const nx = lerp(px, tx, 0.14), ny = lerp(py, ty, 0.14); vx = lerp(vx, nx - px, 0.2); px = nx; py = ny;
    if (on || peek.classList.contains('on')) peek.style.transform = `translate3d(${px + 28}px,${py - peek.offsetHeight / 2}px,0) rotate(${clamp(vx * 0.35, -8, 8)}deg)`;
  });

  /* ---------- 3. feature: title lines and clip-path image reveals ---------- */
  gsap.from('.f-title .ln > span', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.f-title', start: 'top 82%' } });
  gsap.fromTo('.f-title', { fontVariationSettings: '"wght" 120' }, { fontVariationSettings: '"wght" 520', ease: 'none', scrollTrigger: { trigger: '.feature', start: 'top 80%', end: 'center center', scrub: true } });
  $$('.clip').forEach((f, i) => {
    const from = ['inset(0 0 100% 0)', 'inset(100% 0 0 0)', 'inset(0 100% 0 0)'][i % 3];
    gsap.fromTo(f, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut', scrollTrigger: { trigger: f, start: 'top 85%' } });
    gsap.fromTo(f.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 85%' } });
  });
  gsap.to('.f-b', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.feature', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- 4. pinned horizontal gallery ---------- */
  const track = $('.g-track'), items = $$('.g-it'), cur = $('.g-cur'), bar = $('.g-bar i');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  let skew = 0;
  const gst = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.gallery', start: 'top top', end: () => '+=' + dist(), pin: '.g-pin', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
        const c = innerWidth * 0.5; let best = 0, bd = 1e9;
        items.forEach((it, i) => { const r = it.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - c); if (d < bd) { bd = d; best = i; } });
        cur.textContent = String(best + 1).padStart(2, '0');
        skew = clamp(self.getVelocity() / -320, -6, 6);
      },
    },
  });
  gsap.ticker.add(() => { skew = lerp(skew, 0, 0.08); items.forEach((it) => (it.style.transform = `skewX(${skew.toFixed(2)}deg)`)); });

  /* ---------- 5. kinetic rows: opposite drift + weight swells near centre ---------- */
  gsap.to('.k1', { xPercent: -22, ease: 'none', scrollTrigger: { trigger: '.kinetic', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.k2', { xPercent: -24 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.kinetic', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.k3', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.kinetic', start: 'top bottom', end: 'bottom top', scrub: true } });
  const kspans = $$('.k-row span:not(.k-sep)'); let kOn = false;
  new IntersectionObserver(([e]) => { kOn = e.isIntersecting; }).observe($('.kinetic'));
  const kw = kspans.map(() => 200);
  gsap.ticker.add(() => {
    if (!kOn) return; const c = innerWidth / 2, s = innerWidth * 0.32;
    kspans.forEach((sp, i) => { const r = sp.getBoundingClientRect(); const d = (r.left + r.width / 2 - c) / s; kw[i] = lerp(kw[i], 110 + 790 * Math.exp(-d * d), 0.12); sp.style.setProperty('--w', kw[i].toFixed(0)); });
  });

  /* ---------- 6. issue image reveal + magnetic pills ---------- */
  $$('.mag').forEach((b) => {
    const qx = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), qy = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.32); qy((e.clientY - r.top - r.height / 2) * 0.45); });
    b.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });

  distortion(gsap);
  addEventListener('load', () => ST.refresh());
}

/* ---------- WebGL hover distortion: one shared canvas follows the hovered plate ---------- */
function distortion(gsap) {
  const cv = $('.dist-gl');
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false, alpha: true });
  if (!gl) return;
  const vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const fs = `precision mediump float;varying vec2 v;uniform sampler2D t;uniform vec2 uR,uI,uM,uV;uniform float uH,uT;
  void main(){
    vec2 r=vec2(min((uR.x/uR.y)/(uI.x/uI.y),1.),min((uR.y/uR.x)/(uI.y/uI.x),1.));
    float d=distance(v,uM);float m=smoothstep(.55,0.,d)*uH;
    vec2 uv=v;
    uv+=vec2(sin(v.y*11.+uT*1.7),cos(v.x*9.-uT*1.3))*.011*uH;
    uv+=(v-uM)*-.10*m;
    uv=(uv-.5)*(1.-.05*uH)+.5;
    vec2 tc=uv*r+(1.-r)*.5;
    vec2 sh=uV*.018*m+vec2(.004,0.)*uH;
    float cr=texture2D(t,tc+sh).r,cg=texture2D(t,tc).g,cb=texture2D(t,tc-sh).b;
    gl_FragColor=vec4(cr,cg,cb,1.);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['t', 'uR', 'uI', 'uM', 'uV', 'uH', 'uT'].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.t, 0);
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  let el = null, img = null, H = { v: 0 }, m = [0.5, 0.5], mt = [0.5, 0.5], vel = [0, 0], drawn = false, t0 = performance.now();
  const upload = (im) => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); };
  $$('.dist').forEach((d) => {
    const im = d.querySelector('img');
    d.addEventListener('pointerenter', () => {
      if (!im.complete || !im.naturalWidth) return;
      if (el && el !== d) el.classList.remove('is-gl');
      el = d; img = im; drawn = false; upload(im); cv.classList.add('on');
      gsap.to(H, { v: 1, duration: 0.9, ease: 'expo.out', overwrite: true });
    });
    d.addEventListener('pointermove', (e) => { const r = d.getBoundingClientRect(); mt = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; });
    d.addEventListener('pointerleave', () => {
      gsap.to(H, { v: 0, duration: 0.7, ease: 'power3.out', overwrite: true, onComplete: () => { if (el === d) { d.classList.remove('is-gl'); cv.classList.remove('on'); el = null; } } });
    });
  });
  gsap.ticker.add(() => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; }
    cv.style.transform = `translate3d(${r.left}px,${r.top}px,0) skewX(${el.parentElement.style.transform.match(/-?[\d.]+/) ? el.parentElement.style.transform.match(/-?[\d.]+/)[0] : 0}deg)`;
    const nm = [lerp(m[0], mt[0], 0.12), lerp(m[1], mt[1], 0.12)]; vel = [lerp(vel[0], (nm[0] - m[0]) * 40, 0.2), lerp(vel[1], (nm[1] - m[1]) * 40, 0.2)]; m = nm;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uR, r.width, r.height); gl.uniform2f(U.uI, img.naturalWidth, img.naturalHeight);
    gl.uniform2f(U.uM, m[0], m[1]); gl.uniform2f(U.uV, vel[0], vel[1]); gl.uniform1f(U.uH, H.v); gl.uniform1f(U.uT, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!drawn) { drawn = true; el.classList.add('is-gl'); }
  });
}

if (document.readyState === 'complete' || window.gsap) start();
else addEventListener('DOMContentLoaded', () => (window.gsap ? start() : addEventListener('load', start, { once: true })), { once: true });
