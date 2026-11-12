/* fx/reveal.js - lazy reveals in Sujon's motion taste: opacity + 20px rise, 480 ms, expo-out, no bounce, no blur.
   Markup: <h2 data-rv>..</h2>  <p data-rv="fade|left|right|up">  stagger children: <ul data-rv-group> each <li data-rv>.
   CSS lives in concept.css (.js [data-rv]). Reduced motion or no IntersectionObserver: everything is shown at once. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function reveals(root = document, o = {}) {
  document.documentElement.classList.add('js');
  const els = [...root.querySelectorAll('[data-rv]')];
  root.querySelectorAll('[data-rv-group]').forEach((g) => [...g.querySelectorAll('[data-rv]')].forEach((e, i) => e.style.setProperty('--rv-i', i)));
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return () => {}; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); } }),
    { rootMargin: o.margin || '0px 0px -8% 0px', threshold: o.threshold ?? 0.12 });
  els.forEach((e) => io.observe(e));
  return () => io.disconnect();
}
