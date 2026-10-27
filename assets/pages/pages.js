/* Zyqor Studio pages: shared desktop behaviour (smooth scroll, reveals, split type, header, cursor, magnetic buttons). */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.ZQ = window.ZQ || {};
  ZQ.reduced = reduced;

  /* split headings into words (keeps <em>) */
  function splitEl(el) {
    var out = [];
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) out.push(document.createTextNode(' '));
          else { var w = document.createElement('span'); w.className = 'w'; var i = document.createElement('span'); i.textContent = t; w.appendChild(i); out.push(w); }
        });
      } else if (n.nodeType === 1) {
        var w2 = document.createElement('span'); w2.className = 'w'; var i2 = document.createElement('span'); i2.appendChild(n.cloneNode(true)); w2.appendChild(i2); out.push(w2);
      }
    });
    el.textContent = '';
    out.forEach(function (n) { el.appendChild(n); });
    el.querySelectorAll('.w > span').forEach(function (s, k) { s.style.transitionDelay = (k * 0.055) + 's'; });
  }
  if (!reduced) document.querySelectorAll('[data-split]').forEach(splitEl);

  /* reveals */
  var targets = document.querySelectorAll('[data-rv],[data-split],[data-gantt]');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in', 'is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in', 'is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
    // hero words go in right away
    requestAnimationFrame(function () { document.querySelectorAll('.hero [data-split],.hero [data-rv]').forEach(function (el) { el.classList.add('in', 'is-in'); }); });
  }

  /* smooth scroll */
  var lenis = null;
  if (!reduced && window.Lenis) {
    try {
      lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      ZQ.lenis = lenis;
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    } catch (e) { lenis = null; }
  } else if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); }

  /* anchor links through lenis */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: id.indexOf('#s-') === 0 ? 0 : -80, duration: 1.4 });
    else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  /* header */
  var hd = document.getElementById('hd'), lastY = 0;
  function onScroll() {
    var y = window.scrollY || doc.scrollTop;
    if (hd) {
      hd.classList.toggle('is-scrolled', y > 30);
      hd.classList.toggle('is-hidden', y > 400 && y > lastY + 2);
      if (y < lastY - 2) hd.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* cursor dot + magnetic buttons (fine pointers only, motion allowed) */
  if (fine && !reduced) {
    var dot = document.querySelector('.cur-dot');
    if (dot) {
      var x = -100, y = -100, cx = -100, cy = -100;
      window.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; dot.classList.add('on'); }, { passive: true });
      document.addEventListener('pointerleave', function () { dot.classList.remove('on'); });
      document.addEventListener('pointerover', function (e) { dot.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,summary,.ba'))); });
      (function loop() { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(loop); })();
    }
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = 'translate(' + (dx * 10).toFixed(1) + 'px,' + (dy * 8).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* FAQ: smooth height on open/close */
  document.querySelectorAll('details.qa-item').forEach(function (d) {
    var s = d.querySelector('summary'), body = d.querySelector('.qa-a');
    if (!s || !body || reduced || !body.animate) return;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        var h = body.offsetHeight;
        var an = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.19,1,.22,1)' });
        an.onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.19,1,.22,1)' });
      }
    });
  });
})();
