/* Services page: hover tilt on service cards, before/after compare, subtle parallax. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* before/after compare: pointer drag + keyboard range */
  document.querySelectorAll('[data-ba]').forEach(function (el) {
    var input = el.querySelector('input[type="range"]');
    function setP(p) { p = Math.max(0, Math.min(100, p)); el.style.setProperty('--x', p.toFixed(1) + '%'); if (input) input.value = Math.round(p); }
    if (input) input.addEventListener('input', function () { setP(+input.value); });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' && !e.buttons && !fine) return;
      var r = el.getBoundingClientRect(); setP((e.clientX - r.left) / r.width * 100);
    });
    if (!reduced && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        var t0 = performance.now();
        (function step(t) { var k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 4); setP(50 + Math.sin(e * Math.PI) * 28); if (k < 1) requestAnimationFrame(step); })(t0);
      }, { threshold: 0.5 });
      io.observe(el);
    }
  });
  /* tilt */
  if (fine && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(function (box) {
      var card = box.querySelector('.bcard'); if (!card) return;
      box.addEventListener('pointermove', function (e) {
        if (e.target.closest('[data-ba]')) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); return; }
        var r = box.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); card.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      });
      box.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }
  /* image parallax inside cards */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.svc-vis .bcard > img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12, yPercent: -4 }, { scale: 1.02, yPercent: 4, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var h1 = document.querySelector('.hero h1');
    if (h1) gsap.to(h1, { yPercent: -14, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
