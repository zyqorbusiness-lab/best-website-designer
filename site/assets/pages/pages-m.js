/* Zyqor Studio pages, phone build: light reveals, palette switch, drag wipes. No libraries. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rv = document.querySelectorAll('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }
  /* palette switcher */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pal]');
    if (!b) return;
    var box = b.closest('[data-palette]'); if (!box) return;
    var c = b.getAttribute('data-pal').split('|'), cells = box.querySelectorAll('.pal-sw > div');
    cells[0].style.backgroundColor = c[0]; cells[0].style.color = c[1];
    cells[1].style.backgroundColor = c[1]; cells[1].style.color = c[0];
    cells[2].style.backgroundColor = c[2];
    box.querySelectorAll('[data-hx]').forEach(function (h) { h.textContent = c[+h.getAttribute('data-hx')]; });
    box.querySelectorAll('[data-pal]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  });
  /* drag-to-wipe: wireframe and before/after */
  function wipe(el) {
    function set(clientX) {
      var r = el.getBoundingClientRect();
      var p = Math.max(0, Math.min(100, (clientX - r.left) / r.width * 100));
      el.style.setProperty('--x', p.toFixed(1) + '%');
    }
    el.addEventListener('pointerdown', function (e) { set(e.clientX); el.setPointerCapture && el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') set(e.clientX); });
    var input = el.querySelector('input[type="range"]');
    if (input) input.addEventListener('input', function () { el.style.setProperty('--x', input.value + '%'); });
  }
  document.querySelectorAll('[data-wf],.ba').forEach(wipe);
})();
