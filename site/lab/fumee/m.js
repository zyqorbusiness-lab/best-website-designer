// Fumée (Concept) - phone build. Small: observers and taps only; motion lives in m.css.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = /^(moves|smoke|dark)/i;
// manifesto: wrap words so CSS can light them in order
const mf = $('[data-words]');
if (mf) {
  mf.innerHTML = mf.textContent.trim().split(/\s+/).map((w, i) =>
    `<span class="w${KEY.test(w) ? ' k' : ''}" style="--i:${i}">${w}</span>`).join(' ');
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.3 }) : null;
$$('[data-rv], [data-words], .fl-art').forEach(el => io ? io.observe(el) : el.classList.add('in'));
// rail: mark the card in view, sync dots, dots scroll the rail
const rail = $('.m-rail'), cards = $$('.mc'), dots = $$('.dot');
function setOn(i) {
  cards.forEach((c, k) => c.classList.toggle('on', k === i));
  dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
}
if (rail && cards.length) {
  setOn(0);
  let raf = 0;
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const x = rail.scrollLeft, w = cards[0].offsetWidth + 14;
      setOn(Math.max(0, Math.min(cards.length - 1, Math.round(x / w))));
    });
  }, { passive: true });
  dots.forEach((d, i) => d.addEventListener('click', () => {
    rail.scrollTo({ left: cards[i].offsetLeft - rail.offsetLeft - 22, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setOn(i);
  }));
}
// concept toast
$$('[data-concept]').forEach(a => a.addEventListener('click', (e) => {
  e.preventDefault();
  const t = $('.cta-toast'); if (t) t.textContent = 'Fumée is a concept. There is nothing to sample, but thank you for asking.';
}));
