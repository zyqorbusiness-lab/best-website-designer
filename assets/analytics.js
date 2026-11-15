/* Zyqor Studio - privacy-minimal, opt-in usage analytics.
   Nothing is collected or sent until the visitor taps Allow.
   The choice itself is saved in this browser (needed to honour it).
   Session-only id in sessionStorage; no persistent identifier, no IP,
   no UA string, referring site host only, coarse device class only.
   A persistent "Usage stats" control lets the visitor withdraw or change
   the choice at any time; withdrawing stops collection immediately and
   discards pending events. Worker keeps events 35 days, then deletes.
   QA traffic is tagged with ?an_test=1 and excluded from visitor totals. */
(function () {
  'use strict';
  var ENDPOINT = 'https://zyqor-portfolio-cms.zyqor-assistant.workers.dev/t';
  var CHOICE_KEY = 'z-an';
  var VID_KEY = 'z-vid';
  var choice = null;
  try { choice = localStorage.getItem(CHOICE_KEY); } catch (e) { return; }

  var ctrl = null; // active tracking controller while allowed

  function startTrack() {
    var vid = '';
    try {
      vid = sessionStorage.getItem(VID_KEY) || '';
      if (!vid) {
        vid = Math.random().toString(16).slice(2, 14) + Math.random().toString(16).slice(2, 14);
        sessionStorage.setItem(VID_KEY, vid);
      }
    } catch (e) {
      vid = 'nosess';
    }
    if (/[?&]an_test=1/.test(location.search)) vid = 'test-' + vid;
    var dev = (window.innerWidth < 768 || /\/m\//.test(location.pathname)) ? 'm' : 'd';
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).host : ''; } catch (e) {}
    var queue = [];
    var sent = 0;
    var CAP = 60;
    var stopped = false;

    function push(t, k) {
      if (stopped || sent + queue.length >= CAP) return;
      queue.push({ t: t, k: String(k).slice(0, 80) });
      if (queue.length >= 12) flush();
    }
    function flush() {
      if (stopped || !queue.length) return;
      var batch = queue.splice(0, 24);
      sent += batch.length;
      var body;
      try {
        body = JSON.stringify({ vid: vid, dev: dev, ref: ref, pg: location.pathname, events: batch });
      } catch (e) { return; }
      if (body.length > 8000) return;
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }));
        } else {
          fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'cors', headers: { 'content-type': 'text/plain' } }).catch(function () {});
        }
      } catch (e) {}
    }

    push('pv', location.pathname); // path only, never query strings

    var io = null;
    var SEC = { about: 1, contact: 1, lab: 1, pricing: 1, real: 1, work: 1, world: 1, worlds: 1 };
    if (window.ZAN_SECTIONS && window.ZAN_SECTIONS.length) { SEC = {}; window.ZAN_SECTIONS.forEach(function (id) { SEC[id] = 1; }); }
    try {
      var seen = {};
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var id = en.target && en.target.id;
          if (en.isIntersecting && id && SEC[id] && !seen[id]) { seen[id] = 1; push('sec', '#' + id); }
        });
      }, { threshold: 0.35 });
      document.querySelectorAll('section[id]').forEach(function (s) { if (SEC[s.id]) io.observe(s); });
    } catch (e) {}

    function onClick(ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest('a[href],button') : null;
      if (!el) return;
      if (el.closest('form, input, textarea, select')) return; // never near form values
      if (el.closest('#zan-bar,#zan-ctl,#zan-panel')) return; // not our own UI
      // Generic targets only: no element text, no arbitrary hashes (both can carry private tokens).
      var k = null;
      if (el.tagName === 'A') {
        try {
          var u = new URL(el.getAttribute('href'), location.href);
          if (u.origin !== location.origin) {
            k = 'ext:' + u.host;
          } else if (u.hash && u.pathname === location.pathname) {
            k = 'nav:' + (SEC[u.hash.slice(1)] ? '#' + u.hash.slice(1) : 'other');
          } else {
            k = 'link:' + u.pathname; // own static paths only, never query strings
          }
        } catch (e) {}
      } else {
        k = 'button';
      }
      if (k) push('click', k);
    }
    function onVis() { if (document.visibilityState === 'hidden') flush(); }
    function onHide() { flush(); }
    document.addEventListener('click', onClick, true);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    var iv = setInterval(flush, 20000);

    return {
      stop: function () {
        stopped = true;
        queue.length = 0; // discard pending events
        clearInterval(iv);
        try { if (io) io.disconnect(); } catch (e) {}
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pagehide', onHide);
      }
    };
  }

  function css() {
    var st = document.createElement('style');
    st.id = 'zan-style';
    st.textContent =
      '#zan-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#FAF6EE;color:#17423C;' +
      'border:1px solid #17423C33;border-radius:14px;box-shadow:0 8px 30px rgba(23,66,60,.18);padding:14px 16px;' +
      'font-family:"Inter Tight",system-ui,sans-serif;font-size:13px;line-height:1.45;max-width:640px;margin:0 auto}' +
      '#zan-bar p{margin:0 0 10px}#zan-bar b{font-family:"Fraunces",serif;font-weight:600}' +
      '#zan-bar .zan-btns{display:flex;gap:8px}' +
      '#zan-bar button,#zan-panel button{font-family:inherit;font-size:13px;border-radius:999px;padding:8px 16px;cursor:pointer;border:1px solid #17423C}' +
      '#zan-yes,#zan-on{background:#8F6420;border-color:#8F6420;color:#FAF6EE}' +
      '#zan-no,#zan-off{background:transparent;color:#17423C}' +
      '#zan-bar details{margin:0 0 10px;font-size:12px;color:#4D6863}#zan-bar summary{cursor:pointer;color:#17423C}' +
      '#zan-ctl{position:fixed;left:12px;bottom:12px;z-index:9998;background:transparent;color:#4D6863;border:1px solid #17423C33;' +
      'border-radius:999px;padding:5px 12px;font-family:"Inter Tight",system-ui,sans-serif;font-size:11px;cursor:pointer}' +
      '#zan-panel{position:fixed;left:12px;bottom:46px;z-index:9999;background:#FAF6EE;color:#17423C;border:1px solid #17423C33;' +
      'border-radius:14px;box-shadow:0 8px 30px rgba(23,66,60,.18);padding:14px 16px;max-width:340px;' +
      'font-family:"Inter Tight",system-ui,sans-serif;font-size:13px;line-height:1.45}' +
      '#zan-panel p{margin:0 0 10px}#zan-panel .zan-btns{display:flex;gap:8px}';
    document.head.appendChild(st);
    return st;
  }

  var styleEl = null;
  function ensureStyle() { if (!styleEl) styleEl = css(); }

  /* Small always-available control: shows current state, allows change/withdraw. */
  function mountCtl() {
    if (document.getElementById('zan-ctl')) return;
    ensureStyle();
    var c = document.createElement('button');
    c.id = 'zan-ctl';
    c.type = 'button';
    c.textContent = 'Usage stats';
    c.setAttribute('aria-label', 'Usage stats settings');
    c.addEventListener('click', openPanel);
    document.body.appendChild(c);
  }

  function openPanel() {
    var old = document.getElementById('zan-panel');
    if (old) { old.remove(); return; }
    ensureStyle();
    var on = false;
    try { on = localStorage.getItem(CHOICE_KEY) === '1'; } catch (e) {}
    var panel = document.createElement('div');
    panel.id = 'zan-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Usage stats settings');
    var p = document.createElement('p');
    var b = document.createElement('b');
    b.textContent = 'Usage stats: ' + (on ? 'On' : 'Off') + '. ';
    p.appendChild(b);
    p.appendChild(document.createTextNode('Records page and section views, clicks, device type and referring site. No names or IP addresses stored. Session IDs reset when the tab closes. Events are kept 35 days, then deleted. Your choice is saved on this browser.'));
    var btns = document.createElement('div');
    btns.className = 'zan-btns';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = on ? 'zan-off' : 'zan-on';
    toggle.textContent = on ? 'Turn off' : 'Turn on';
    toggle.addEventListener('click', function () {
      panel.remove();
      pick(on ? '0' : '1');
    });
    btns.appendChild(toggle);
    panel.appendChild(p);
    panel.appendChild(btns);
    document.body.appendChild(panel);
  }

  function pick(v) {
    try { localStorage.setItem(CHOICE_KEY, v); } catch (e) {}
    var bar = document.getElementById('zan-bar');
    if (bar) bar.remove();
    if (v === '1') {
      if (!ctrl) ctrl = startTrack();
    } else {
      if (ctrl) { ctrl.stop(); ctrl = null; } // stop immediately, discard pending
    }
    mountCtl();
  }

  function bar() {
    ensureStyle();
    var el = document.createElement('div');
    el.id = 'zan-bar';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Usage stats choice');
    var p = document.createElement('p');
    var b = document.createElement('b');
    b.textContent = 'Allow usage stats? ';
    p.appendChild(b);
    p.appendChild(document.createTextNode('Records page and section views, clicks, device type and referring site. No names or IP addresses stored. Session IDs reset when the tab closes. Your choice is saved on this browser. Off unless you allow.'));
    var det = document.createElement('details');
    var sum = document.createElement('summary');
    sum.textContent = 'What exactly is recorded?';
    det.appendChild(sum);
    var dp = document.createElement('p');
    dp.textContent = 'Which pages and sections were viewed, which links and buttons were clicked, whether the visit was on phone or desktop, and which site the visit came from. Events are kept 35 days, then deleted. Counts are anonymous and show how pages are used, not who visited.';
    det.appendChild(dp);
    var btns = document.createElement('div');
    btns.className = 'zan-btns';
    var no = document.createElement('button');
    no.id = 'zan-no';
    no.type = 'button';
    no.textContent = 'No thanks';
    var yes = document.createElement('button');
    yes.id = 'zan-yes';
    yes.type = 'button';
    yes.textContent = 'Allow';
    btns.appendChild(no);
    btns.appendChild(yes);
    el.appendChild(p);
    el.appendChild(det);
    el.appendChild(btns);
    no.addEventListener('click', function () { pick('0'); });
    yes.addEventListener('click', function () { pick('1'); });
    document.body.appendChild(el);
  }

  function init() {
    if (choice === '1') { ctrl = startTrack(); mountCtl(); return; }
    if (choice === '0') { mountCtl(); return; }
    bar();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
