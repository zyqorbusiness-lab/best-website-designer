/* Process page: sticky stage that follows the steps, wireframe wipe, palette switcher, rail. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var rail = document.getElementById('rail');
  var railLinks = rail ? Array.prototype.slice.call(rail.querySelectorAll('a')) : [];
  var tEl = document.getElementById('stage-t'), nEl = document.getElementById('stage-n'), pEl = document.getElementById('stage-p');
  var names = steps.map(function (s) { var t = s.querySelector('.step-n'); return t ? t.textContent.split('\u00b7').pop().trim() : ''; });
  var cur = -1;

  /* palette switcher (delegated so clones work too) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pal]');
    if (!b) return;
    var box = b.closest('[data-palette]'); if (!box) return;
    var c = b.getAttribute('data-pal').split('|');
    var cells = box.querySelectorAll('.pal-sw > div');
    cells[0].style.backgroundColor = c[0]; cells[0].style.color = c[1];
    cells[1].style.backgroundColor = c[1]; cells[1].style.color = c[0];
    cells[2].style.backgroundColor = c[2];
    box.querySelectorAll('[data-hx]').forEach(function (h) { h.textContent = c[+h.getAttribute('data-hx')]; });
    box.querySelectorAll('[data-pal]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  });

  /* reduced motion: no sticky stage; each visual sits inline under its step */
  if (reduced) {
    document.documentElement.classList.add('rm');
    slides.forEach(function (sl, i) {
      var box = document.querySelector('[data-inline="' + i + '"]');
      if (!box) return;
      var c = sl.cloneNode(true); c.classList.add('on'); box.appendChild(c);
    });
    return;
  }

  function setActive(i) {
    if (i === cur || i < 0 || i >= steps.length) return;
    cur = i;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    steps.forEach(function (s, k) { s.classList.toggle('act', k === i); });
    railLinks.forEach(function (a, k) { a.classList.toggle('act', k === i); });
    if (tEl) tEl.textContent = names[i] || '';
    if (nEl) nEl.textContent = (i < 9 ? '0' : '') + (i + 1);
  }
  setActive(0);

  var wf = document.querySelector('.stage [data-wf]');
  var wfFinal = wf && wf.querySelector('.final'), wfKnife = wf && wf.querySelector('.knife');
  function setWipe(p) {
    if (!wfFinal) return;
    p = Math.max(0, Math.min(1, p));
    var left = (1 - p) * 100;
    wfFinal.style.clipPath = 'inset(0 0 0 ' + left.toFixed(2) + '%)';
    wfKnife.style.left = left.toFixed(2) + '%';
    wfKnife.style.opacity = p > 0.995 || p < 0.005 ? '0' : '1';
  }
  setWipe(0);

  var story = document.querySelector('.story');
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    steps.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) setActive(i); } });
    });
    ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) { if (pEl) pEl.style.width = (self.progress * 100).toFixed(2) + '%'; },
      onToggle: function (self) { if (rail) rail.classList.toggle('on', self.isActive); } });
    var wfStep = document.getElementById('s-wireframe');
    if (wfStep) ScrollTrigger.create({ trigger: wfStep, start: 'top 60%', end: 'bottom 45%', scrub: true, onUpdate: function (self) { setWipe(self.progress * 1.25 - 0.1); } });
    /* stage card breathes with scroll */
    var stageIn = document.getElementById('stage');
    if (stageIn) gsap.fromTo(stageIn, { rotate: -1.2, scale: 0.94 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: story, start: 'top 90%', end: 'top 10%', scrub: true } });
    /* hero title drifts */
    var h1 = document.querySelector('.hero h1');
    if (h1) gsap.to(h1, { yPercent: -18, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(steps.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
    if (rail) rail.classList.add('on');
    setWipe(1);
  }
  /* keyboard: rail links are anchors; nothing else needed */
})();
