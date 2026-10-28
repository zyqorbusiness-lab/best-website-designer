// Functions that run INSIDE the page (passed to page.evaluate / addInitScript).
// Keep them self-contained: no imports, no closures over Node variables.

// Installed before any page script runs. Records WebGL context requests (so we know
// if a page asked for WebGL and got nothing), long tasks, and layout shifts.
export function initProbe() {
  const q = (window.__qa = { gl: [], longtasks: [], cls: 0 });
  try {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const ctx = orig.call(this, type, ...rest);
      if (/webgl|experimental-webgl/i.test(String(type))) q.gl.push({ type: String(type), ok: !!ctx });
      return ctx;
    };
  } catch {}
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) q.longtasks.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true });
  } catch {}
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) q.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
}

// Is WebGL available in this browser at all, and what renders it?
export function webglProbe() {
  const out = { webgl2: false, webgl1: false, renderer: null };
  try {
    const c = document.createElement('canvas');
    const g2 = c.getContext('webgl2');
    out.webgl2 = !!g2;
    const g = g2 || document.createElement('canvas').getContext('webgl');
    out.webgl1 = !!g;
    if (g) {
      const ext = g.getExtension('WEBGL_debug_renderer_info');
      out.renderer = ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      g.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch (e) { out.error = String(e); }
  out.pageRequests = (window.__qa && window.__qa.gl) || [];
  out.canvases = document.querySelectorAll('canvas').length;
  return out;
}

// The overflow finder. Returns null when the page does not scroll sideways.
// A "culprit" is an element that sticks out past the viewport AND past its own
// parent box: that is the element to fix. Elements that merely sit inside an
// overflowing parent are effects, not causes, and are left out.
export function overflowProbe(maxCulprits = 6) {
  const de = document.documentElement, se = document.scrollingElement || de;
  const vw = de.clientWidth;
  const sw = se.scrollWidth;
  const csHtml = getComputedStyle(de), csBody = getComputedStyle(document.body);
  const masked = /hidden|clip/.test(csHtml.overflowX) || /hidden|clip/.test(csBody.overflowX);
  const describe = el => {
    const parts = [];
    let e = el;
    for (let i = 0; e && e.nodeType === 1 && i < 4 && e !== document.body; i++, e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) { s += '#' + e.id; parts.unshift(s); break; }
      const cls = (typeof e.className === 'string' ? e.className : e.className?.baseVal || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      const sib = e.parentElement ? [...e.parentElement.children].filter(x => x.tagName === e.tagName) : [];
      if (sib.length > 1) s += `:nth-of-type(${sib.indexOf(e) + 1})`;
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const clippedByAncestor = el => {
    for (let a = el.parentElement; a && a !== document.body && a !== de; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.position === 'fixed') return true;               // fixed boxes never widen the page
      if (/hidden|clip|auto|scroll/.test(cs.overflowX)) {
        const r = a.getBoundingClientRect();
        if (r.right <= vw + 1 && r.left >= -1) return true;   // a clipping ancestor that itself fits
      }
    }
    return false;
  };
  const overflowing = sw > vw + 1;
  if (!overflowing && !masked) return null;
  const sx = scrollX;
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const right = r.right + sx, left = r.left + sx;
    if (right <= vw + 1 && left >= -1) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (clippedByAncestor(el)) continue;
    const p = el.parentElement ? el.parentElement.getBoundingClientRect() : null;
    const sticksOut = !p || r.right > p.right + 1 || r.left < p.left - 1;
    if (!sticksOut) continue;
    out.push({
      selector: describe(el),
      left: Math.round(left), right: Math.round(right), width: Math.round(r.width), top: Math.round(r.top + scrollY),
      past: Math.round(Math.max(right - vw, -left)),
      css: { width: cs.width, minWidth: cs.minWidth, position: cs.position, transform: cs.transform === 'none' ? '' : cs.transform.slice(0, 40), whiteSpace: cs.whiteSpace },
      text: (el.innerText || el.getAttribute?.('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60),
    });
  }
  out.sort((a, b) => b.past - a.past);
  if (!overflowing && !out.length) return null;
  // Where to fix it: the nearest ancestor of the worst culprit that itself fits the
  // screen — its children are wider than it, so the fix (wrap, shrink, or scroll) goes there.
  let fixAt = null;
  if (out.length) {
    const el = document.querySelector(out[0].selector);
    for (let a = el && el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const r = a.getBoundingClientRect();
      if (r.right <= vw + 1 && r.left >= -1) {
        const cs = getComputedStyle(a);
        const siblingsOut = out.filter(c => { const e = document.querySelector(c.selector); return e && a.contains(e); }).length;
        fixAt = { selector: describe(a), width: Math.round(r.width), display: cs.display, flexWrap: cs.flexWrap, overflowX: cs.overflowX, gridTemplateColumns: cs.display.includes('grid') ? cs.gridTemplateColumns.slice(0, 60) : '', culpritsInside: siblingsOut };
        fixAt.hint = /flex/.test(cs.display) && cs.flexWrap === 'nowrap' ? 'a flex row that does not wrap: let items shrink (flex: 1 1 auto; min-width: 0), wrap them, or make the row scroll (overflow-x: auto)'
          : /grid/.test(cs.display) ? 'a grid with fixed columns: use minmax(0, 1fr) or fewer columns on small screens'
          : out[0].css.whiteSpace === 'nowrap' ? 'text that may not wrap: allow wrapping or clamp the font size'
          : 'a child wider than its container: cap it with max-width: 100% or a clamp() width';
        break;
      }
    }
  }
  return { viewport: vw, scrollWidth: sw, overflowing, masked, culprits: out.slice(0, maxCulprits), totalCulprits: out.length, fixAt };
}

// Mark culprits with a visible outline and draw the screen edge, for the evidence
// screenshot (taken wider than the screen, so you see what sticks out).
export function outlineSelectors(sels) {
  const vw = document.documentElement.clientWidth;
  let top = Infinity, bottom = 0;
  for (const s of sels) {
    try {
      const el = document.querySelector(s);
      if (!el) continue;
      el.style.setProperty('outline', '3px solid #E0451F', 'important');
      el.style.setProperty('outline-offset', '-3px', 'important');
      const r = el.getBoundingClientRect();
      top = Math.min(top, r.top + scrollY); bottom = Math.max(bottom, r.bottom + scrollY);
    } catch {}
  }
  const edge = document.createElement('div');
  edge.setAttribute('data-qa-edge', '');
  edge.style.cssText = `position:absolute;left:${vw}px;top:0;width:0;height:${document.documentElement.scrollHeight}px;border-left:2px dashed #E0451F;z-index:2147483647;pointer-events:none`;
  const tag = document.createElement('div');
  tag.textContent = `screen edge ${vw}px`;
  tag.style.cssText = `position:absolute;left:${vw + 6}px;top:${Math.max(0, top - 30)}px;font:600 12px/1 ui-monospace,monospace;color:#fff;background:#E0451F;padding:5px 7px;border-radius:4px;z-index:2147483647;pointer-events:none`;
  document.body.append(edge, tag);
  return { top: isFinite(top) ? Math.round(top) : 0, bottom: Math.round(bottom), scrollWidth: document.scrollingElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, vw };
}

// After the whole page was scrolled: text that is still invisible is usually a
// scroll reveal that never fired (or a reveal that reduced motion broke).
export function stuckRevealProbe() {
  const out = [];
  const isHidden = el => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || e.hidden || e.getAttribute('aria-hidden') === 'true') return 'skip';
      if (e.closest('dialog:not([open]), [inert], details:not([open]) > :not(summary)')) return 'skip';
      if (parseFloat(cs.opacity) < 0.05) return 'invisible';
    }
    return null;
  };
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,figcaption,blockquote,a,button,label,dt,dd')) {
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (own.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    // Off to the side (a swipe row or carousel): its reveal fires when swiped in.
    if (r.left >= innerWidth - 1 || r.right <= 1) continue;
    if (isHidden(el) === 'invisible') out.push({ tag: el.tagName.toLowerCase(), text: own.replace(/\s+/g, ' ').slice(0, 60), top: Math.round(r.top + scrollY) });
    if (out.length >= 12) break;
  }
  return out;
}

// Images that failed, images without alt text, and running endless animations.
export function contentProbe() {
  const imgs = [...document.images];
  const broken = imgs.filter(i => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src) && i.loading !== 'lazy').map(i => (i.currentSrc || i.src).split('/').slice(-2).join('/'));
  const noAlt = imgs.filter(i => !i.hasAttribute('alt')).map(i => (i.currentSrc || i.src || '').split('/').slice(-2).join('/'));
  let endless = [];
  try {
    endless = document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming?.().iterations === Infinity)
      .map(a => { const t = a.effect?.target; return (a.animationName || a.constructor.name) + ' on ' + (t ? t.tagName.toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.split(' ')[0] : '') : '?'); });
  } catch {}
  const text = document.body.innerText || '';
  const emoji = (text.match(/\p{Extended_Pictographic}/gu) || []).filter(c => !/[\u00A9\u00AE\u2122]/.test(c));
  const lorem = /lorem ipsum|TODO|FIXME|\{\{/.test(text);
  const links = [...document.querySelectorAll('a[href]')].map(a => ({ href: a.href, raw: a.getAttribute('href'), target: a.target || '', rel: a.rel || '', text: (a.innerText || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40) }));
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  const title = document.title;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = performance.getEntriesByType('navigation')[0];
  return {
    broken, noAlt: noAlt.slice(0, 10), noAltCount: noAlt.length, endless: [...new Set(endless)].slice(0, 10),
    emoji: [...new Set(emoji)].slice(0, 10), lorem, links, ids, title, reduced,
    timing: nav ? { domContentLoaded: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), transferKB: Math.round((performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) + (nav.transferSize || 0)) / 1024) } : null,
    longtasks: (window.__qa && window.__qa.longtasks) || [], cls: Math.round(((window.__qa && (window.__qa.clsLoad ?? window.__qa.cls)) || 0) * 1000) / 1000,
    scrollHeight: document.documentElement.scrollHeight,
  };
}

// Frame timing while scrolling, used by the CPU-throttle smoke run.
export function frameProbe(ms) {
  return new Promise(resolve => {
    const d = [];
    let last = performance.now();
    const start = last;
    const H = document.documentElement.scrollHeight - innerHeight;
    const step = t => {
      d.push(t - last); last = t;
      const k = (t - start) / ms;
      window.scrollTo(0, Math.round(H * Math.min(1, k) * 0.6));
      if (t - start < ms) requestAnimationFrame(step);
      else {
        d.shift();
        const s = [...d].sort((a, b) => a - b);
        const pct = p => s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))] * 10) / 10 : null;
        resolve({ frames: d.length, fps: Math.round(d.length / (ms / 1000)), medianMs: pct(0.5), p95Ms: pct(0.95), over50ms: d.filter(x => x > 50).length });
      }
    };
    requestAnimationFrame(t => { last = t; requestAnimationFrame(step); });
  });
}
