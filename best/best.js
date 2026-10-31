// Best concepts: picks the desktop or phone recording, plays each clip only while it is on screen.
(function () {
  var doc = document.documentElement; doc.classList.add('js');
  var phone = matchMedia('(max-width: 860px)').matches, rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = [].slice.call(document.querySelectorAll('.card video'));
  vids.forEach(function (v) { v.poster = phone ? v.dataset.pm : v.dataset.pd; if (phone) { v.width = 480; v.height = 600; } });
  function load(v) { if (!v.dataset.ok) { v.src = phone ? v.dataset.m : v.dataset.d; v.dataset.ok = '1'; } }
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }); }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { rev.observe(el); });
    if (!rm) {
      var play = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.4) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); } else if (!v.paused) v.pause(); }); }, { threshold: [0, 0.4] });
      vids.forEach(function (v) { play.observe(v); });
    }
  } else { document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); }
})();
