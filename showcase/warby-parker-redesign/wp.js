/* wp.js - DOM layer of the Warby Parker redesign concept (unofficial). Finish swatches, the lens slider, reveals. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  requestAnimationFrame(() => document.documentElement.classList.add('ready'));
  const api = (fn) => { if (window.__wp3d) fn(window.__wp3d); else addEventListener('wp3d-api', () => fn(window.__wp3d), { once: true }); };
  // finishes
  const NAMES = ['Whiskey Tortoise', 'Jet Black', 'Crystal', 'Sea Glass'];
  const NOTE = ['acetate, polished', 'acetate, high gloss', 'clear acetate', 'translucent acetate'];
  $$('.sw').forEach((b) => b.addEventListener('click', () => {
    const i = +b.dataset.f;
    $$('.sw').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    $('.finish-name').innerHTML = `<span id="fname">${NAMES[i]}</span> · ${NOTE[i]}`;
    api((a) => a.setFinish(i));
  }));
  // lens slider
  const r = $('#lensr'), stops = $$('.stops button'), note = $('#lnote');
  const LN = ['Clear. Everyday lenses, anti-reflective, scratch-resistant.', 'Blue-light filtering. Made for long days at a screen.',
    'Light-responsive. Darkens outside, clears up indoors.', 'Sun. Cuts the glare on the brightest street.'];
  const LV = ['Clear', 'Blue-light', 'Light-responsive', 'Sun'];
  let tw = null;
  function paint(v) {
    const n = Math.round(v / 100); if (+r.value !== v) r.value = v;
    r.style.setProperty('--p', (v / 3) + '%');
    stops.forEach((b, i) => b.classList.toggle('on', i === n));
    note.textContent = LN[n]; r.setAttribute('aria-valuetext', LV[n]);
    api((a) => a.setLens(v / 100));
  }
  r.addEventListener('input', () => { tw = null; paint(+r.value); });
  function glide(to, ms = 900) {
    const from = +r.value, t0 = performance.now();
    tw = (now) => { const u = Math.min(1, (now - t0) / ms), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      r.value = from + (to - from) * e; paint(+r.value); if (u < 1 && tw) requestAnimationFrame(tw); };
    requestAnimationFrame(tw);
  }
  stops.forEach((b) => b.addEventListener('click', () => glide(+b.dataset.v)));
  window.__wp = { glide, paint };
  paint(0);
  // sample exam times
  $$('.times button').forEach((b) => b.addEventListener('click', () => { $$('.times button').forEach((x) => x.classList.toggle('on', x === b)); }));
  // reveals
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
  $$('.finish-in > *, .tryon-in > *, .cards article, .exam .h2').forEach((e) => { e.classList.add('rv'); io.observe(e); });
})();
