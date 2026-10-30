// layout-audit.js: paste into the DevTools console, or load with <script src> / page.addScriptTag, then call
//   layoutAudit()            -> returns a report object and prints a table
// Checks: horizontal overflow (and which elements cause it), tap targets under 44x44 px (pointer: coarse rule,
// WCAG 2.5.5 / Apple HIG), body text lines over 75 characters, how many DISTINCT spacing values the page uses
// (random margins show up as a long tail), and elements wider than the viewport. No dependencies.
(function (root) {
  function px(v) { return Math.round(parseFloat(v) || 0); }
  function layoutAudit(opts = {}) {
    const vw = document.documentElement.clientWidth; const out = { viewport: vw, overflowX: false, overflowCulprits: [], smallTargets: [], longLines: [], spacing: {}, distinctSpacing: 0 };
    out.overflowX = document.documentElement.scrollWidth > vw + 1;
    const all = [...document.body.querySelectorAll('*')];
    for (const el of all) {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      // overflow culprits: boxes that stick out of the viewport sideways and are not inside a clipping/scrolling parent
      if ((r.right > vw + 1 || r.left < -1) && r.width > 0) {
        let p = el.parentElement, clipped = false; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') { clipped = true; break; } p = p.parentElement; }
        if (!clipped && cs.position !== 'fixed') out.overflowCulprits.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')).slice(0, 80) + ` (${Math.round(r.left)}..${Math.round(r.right)})`);
      }
      // tap targets
      if (el.matches('a[href],button,input,select,textarea,[role=button],[tabindex]:not([tabindex="-1"])') && r.width > 0 && r.height > 0) {
        const inline = el.tagName === 'A' && cs.display === 'inline' && el.closest('p,li');   // links inside running text are exempt (WCAG 2.5.8 inline exception)
        if (!inline && (r.width < 44 || r.height < 44)) out.smallTargets.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      // long lines in paragraphs: width / average character width
      if (el.tagName === 'P' && el.textContent.trim().length > 120) {
        const ch = parseFloat(cs.fontSize) * 0.5; const chars = Math.round(r.width / ch);
        if (chars > (opts.maxChars || 80)) out.longLines.push(`p "${el.textContent.trim().slice(0, 40)}..." ~${chars} chars/line`);
      }
      // spacing values actually used
      for (const prop of ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'rowGap', 'columnGap']) {
        const v = px(cs[prop]); if (v > 0) out.spacing[v] = (out.spacing[v] || 0) + 1;
      }
    }
    out.distinctSpacing = Object.keys(out.spacing).length;
    out.overflowCulprits = out.overflowCulprits.slice(0, 20);
    out.verdict = !out.overflowX && out.smallTargets.length === 0 && out.longLines.length === 0 && out.distinctSpacing <= (opts.maxDistinct || 24) ? 'PASS' : 'CHECK';
    if (!opts.quiet) { console.log('layoutAudit', out.verdict); console.table({ overflowX: out.overflowX, smallTargets: out.smallTargets.length, longLines: out.longLines.length, distinctSpacing: out.distinctSpacing }); }
    return out;
  }
  root.layoutAudit = layoutAudit;
})(typeof window !== 'undefined' ? window : globalThis);
