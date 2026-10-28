// results.json -> report.md (pass/fail table, every problem, VERDICT, what was NOT
// verified) and report.html (a contact sheet of screenshots with badges).
import fs from 'node:fs';
import path from 'node:path';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function summarise(results) {
  const runs = results.pages.flatMap(p => Object.values(p.runs));
  const L = results.links || { internal: { broken: [] }, anchors: { missing: [] }, external: { broken: [], walled: [] }, newTab: [] };
  const zy = results.options?.preset === 'zyqor';
  const s = {
    pages: results.pages.length, runs: runs.length,
    runsPass: runs.filter(r => r.verdict === 'PASS').length,
    consoleErrors: runs.reduce((a, r) => a + r.console.length + r.pageErrors.length, 0),
    httpErrors: runs.reduce((a, r) => a + r.httpErrors.length + r.failedRequests.filter(f => !/ERR_ABORTED/.test(f)).length, 0),
    overflowRuns: runs.filter(r => r.overflow?.overflowing).length,
    warnings: runs.reduce((a, r) => a + r.warn.length, 0),
    linkProblems: L.internal.broken.length + L.external.broken.length + (zy ? L.newTab.length : 0),
  };
  const linkFail = L.internal.broken.length || L.external.broken.length || (zy && L.newTab.length);
  const strictFail = results.options?.strict && (s.warnings || L.newTab.length || L.anchors.missing.length || (results.throttle || []).some(t => t.warn?.length));
  s.pass = s.runsPass === s.runs && !linkFail && !strictFail;
  const reasons = [];
  if (s.runs - s.runsPass) reasons.push(`${s.runs - s.runsPass} of ${s.runs} page runs failed`);
  if (s.consoleErrors) reasons.push(`${s.consoleErrors} console/page error(s)`);
  if (s.overflowRuns) reasons.push(`horizontal overflow in ${s.overflowRuns} run(s)`);
  if (s.httpErrors) reasons.push(`${s.httpErrors} failed request(s)`);
  if (L.internal.broken.length) reasons.push(`${L.internal.broken.length} broken internal link(s)`);
  if (L.external.broken.length) reasons.push(`${L.external.broken.length} broken external link(s)`);
  if (zy && L.newTab.length) reasons.push(`${L.newTab.length} external link(s) not opening in a new tab`);
  if (strictFail && !reasons.length) reasons.push(`${s.warnings} warning(s) in --strict mode`);
  s.line = s.pass ? `VERDICT: PASS — ${s.pages} page(s), ${s.runs} runs, 0 console errors, 0 overflow, 0 broken links${s.warnings ? ` (${s.warnings} warning(s) to read)` : ''}`
    : `VERDICT: FAIL — ${reasons.join('; ')}`;
  return s;
}

export function notVerified(results) {
  const nv = [
    results.browser?.webkit
      ? 'A real phone. Phone runs used WebKit (Safari\'s engine) with a phone\'s size, pixel ratio and touch — closer to iOS Safari, but not an iPhone (no iOS GPU, memory limits or Safari UI bars). Open the live URL on a real iPhone and a real Android before calling it done.'
      : 'A real phone. Phone runs are desktop Chromium pretending to be a phone (size, pixel ratio, touch, user agent). iOS Safari is a different engine (WebKit; try --webkit): open the live URL on a real iPhone and a real Android before calling it done.',
    'Real-device frame rate. 3D was drawn by ' + (results.webglEnv?.renderer ? `"${results.webglEnv.renderer}"` : 'the test browser') + (/swiftshader|llvmpipe|software/i.test(results.webglEnv?.renderer || '') ? ' (software rendering on the CPU)' : '') + (results.browser?.webkit ? ' (WebKit hides the real renderer name)' : '') + '; the throttle numbers compare builds with each other, they are not a phone\'s fps.',
    'Design quality. The harness proves the page loads clean and fits; whether it looks premium is a human call — read the contact sheet.',
    'Lighthouse scores, keyboard-only use and screen readers (run Lighthouse in Chrome DevTools and record the real number).',
    'Slow or flaky networks (the pages were served locally or from your server as-is, not over 4G).',
  ];
  if (!results.options?.external) nv.push(`External links were listed (${results.links?.external?.found ?? 0}) but not fetched; run with --external to check them.`);
  if (!results.profiles.some(p => p.id === 'nowebgl')) nv.push('The no-WebGL fallback (poster) was not tested; add --profiles ...,nowebgl or --full.');
  if (!results.profiles.some(p => p.reduced)) nv.push('prefers-reduced-motion was not tested.');
  if (results.webglEnv && !results.webglEnv.webgl2) nv.push('This browser had no WebGL2, so 3D pages may have shown their fallback instead of the real scene.');
  return nv;
}

export function writeReports(results, opts) {
  const s = summarise(results);
  results.summary = s;
  results.verdict = s.pass ? 'PASS' : 'FAIL';
  results.notVerified = notVerified(results);
  fs.writeFileSync(path.join(opts.out, 'results.json'), JSON.stringify(results, null, 1));
  const profs = results.profiles.map(p => p.id);
  const L = results.links;
  const out = [];
  out.push(`# QA report`, '');
  out.push(`**${s.line}**`, '');
  out.push(`- Target: ${results.base}`);
  out.push(`- Browser: ${results.browser.how} (${results.browser.version})${results.browser.webkit ? `; phone sizes in WebKit ${results.browser.webkit}` : ''}${results.webglEnv ? `, WebGL2 ${results.webglEnv.webgl2 ? 'yes' : 'no'} (${results.webglEnv.renderer || 'unknown renderer'})` : ''}`);
  out.push(`- Ran: ${results.startedAt.replace('T', ' ').slice(0, 19)} UTC → ${results.finishedAt.slice(11, 19)} UTC`);
  out.push(`- Profiles: ${results.profiles.map(p => `${p.label} (${p.w}x${p.h}${p.reduced ? ', reduced motion' : ''}${p.noWebGL ? ', WebGL off' : ''})`).join(' · ')}`);
  out.push(`- Totals: ${s.pages} pages, ${s.runs} runs, ${s.runsPass} passed · console/page errors ${s.consoleErrors} · failed requests ${s.httpErrors} · overflow runs ${s.overflowRuns} · warnings ${s.warnings}`, '');
  out.push('## Pass/fail table', '');
  out.push(`| Page | ${results.profiles.map(p => p.label).join(' | ')} |`);
  out.push(`|---|${profs.map(() => '---').join('|')}|`);
  for (const p of results.pages) out.push(`| \`${md(p.path)}\` | ${profs.map(id => { const r = p.runs[id]; return r ? `${r.verdict}${r.fail.length ? ` (${r.fail.length})` : ''}${r.warn.length ? ` · ${r.warn.length}w` : ''}` : '—'; }).join(' | ')} |`);
  out.push('', 'PASS = no console errors, no uncaught errors, no failed requests, no horizontal overflow, no broken images. (n) = number of problems, w = warnings.', '');
  const problems = results.pages.filter(p => Object.values(p.runs).some(r => r.fail.length || r.warn.length));
  out.push('## Problems, page by page', '');
  if (!problems.length) out.push('None.', '');
  for (const p of problems) {
    out.push(`### \`${p.path}\``, '');
    for (const id of profs) {
      const r = p.runs[id]; if (!r || (!r.fail.length && !r.warn.length)) continue;
      out.push(`**${r.label}** — ${r.verdict}${r.finalUrl && r.finalUrl !== r.url ? ` (redirected to ${r.finalUrl})` : ''}`, '');
      for (const f of r.fail) out.push(`- FAIL: ${md(f)}`);
      for (const w of r.warn) out.push(`- warn: ${md(w)}`);
      if (r.overflow?.culprits?.length) {
        out.push('', `  Overflow finder (page ${r.overflow.scrollWidth}px in ${r.overflow.viewport}px, worst at scrollY ${r.overflow.atScrollY}):`, '');
        for (const c of r.overflow.culprits.slice(0, 4)) out.push(`  - \`${md(c.selector)}\` — ${c.past}px past the edge (left ${c.left}, right ${c.right}, width ${c.width}; css width ${c.css.width}${c.css.minWidth !== 'auto' && c.css.minWidth !== '0px' ? `, min-width ${c.css.minWidth}` : ''}${c.css.whiteSpace === 'nowrap' ? ', nowrap' : ''}${c.css.transform ? `, transform ${c.css.transform}` : ''})${c.text ? ` “${md(c.text)}”` : ''}`);
        const fx = r.overflow.fixAt;
        if (fx) out.push('', `  Fix at: \`${md(fx.selector)}\` (${fx.width}px wide, display ${fx.display}${/flex/.test(fx.display) ? `, flex-wrap ${fx.flexWrap}` : ''}${fx.gridTemplateColumns ? `, columns ${fx.gridTemplateColumns}` : ''}, overflow-x ${fx.overflowX}) holds ${fx.culpritsInside} of the culprits: ${fx.hint}.`);
        if (r.overflow.evidence) out.push('', `  Evidence (culprits outlined in orange): ![overflow](${r.overflow.evidence})`);
      }
      out.push('');
    }
  }
  out.push('## Links', '');
  if (L) {
    out.push(`- Internal URLs checked: ${L.internal.checked} · broken: ${L.internal.broken.length}`);
    for (const b of L.internal.broken.slice(0, 30)) out.push(`  - FAIL ${b.status} \`${md(b.url)}\` (from ${b.from.join(', ')})`);
    out.push(`- In-page anchors checked: ${L.anchors.checked} · no element with that id: ${L.anchors.missing.length}${L.anchors.missing.length ? ' (warning: fine only if a script handles the click, e.g. a smooth-scroll to a pinned section; otherwise the link does nothing)' : ''}`);
    for (const b of L.anchors.missing.slice(0, 20)) out.push(`  - warn \`${md(b.url)}\` (from ${b.from.join(', ')})`);
    out.push(`- External links found: ${L.external.found}${results.options.external ? ` · fetched ${L.external.checked}: ${L.external.ok} OK, ${L.external.broken.length} broken, ${L.external.walled.length} walled (the site refuses bots; open by hand)` : ' (not fetched; use --external)'}`);
    for (const b of L.external.broken.slice(0, 30)) out.push(`  - FAIL ${b.status} ${b.url} (from ${b.from.join(', ')})`);
    for (const b of L.external.walled.slice(0, 30)) out.push(`  - walled ${b.status} ${b.url}`);
    out.push(`- External links without target="_blank": ${L.newTab.length}${results.options.preset === 'zyqor' ? ' (house rule: FAIL)' : ''}`);
    for (const n of L.newTab.slice(0, 20)) out.push(`  - ${md(n.from)} → ${n.href}${n.text ? ` (“${md(n.text)}”)` : ''}`);
    out.push('');
  }
  if (results.throttle?.length) {
    out.push('## CPU-throttle smoke run (phone 390, CPU 4x slower)', '');
    out.push('| Page | Load | Scroll fps | Median frame | p95 frame | Frames > 50 ms | Long tasks | Notes |', '|---|---|---|---|---|---|---|---|');
    for (const t of results.throttle) out.push(`| \`${md(t.path)}\` | ${t.loadMs ?? '?'} ms | ${t.frames?.fps ?? '?'} | ${t.frames?.medianMs ?? '?'} ms | ${t.frames?.p95Ms ?? '?'} ms | ${t.frames?.over50ms ?? '?'} | ${t.longTasks ? `${t.longTasks.count} (worst ${t.longTasks.worstMs} ms)` : '?'} | ${md((t.warn || []).join('; ') || t.error || 'ok')} |`);
    out.push('', 'A smoke test, not a benchmark: it catches pages that break or freeze on a slow CPU. Compare these numbers between builds, not with a phone.', '');
  }
  out.push('## Not verified (say so, do not assume)', '');
  for (const n of results.notVerified) out.push(`- ${n}`);
  out.push('', `**${s.line}**`, '');
  fs.writeFileSync(path.join(opts.out, 'report.md'), out.join('\n'));

  // HTML contact sheet
  const card = (p, id) => {
    const r = p.runs[id]; if (!r) return '<td></td>';
    const img = r.shots[0];
    const tip = [...r.fail.map(f => 'FAIL: ' + f), ...r.warn.map(w => 'warn: ' + w)].join('\n');
    return `<td><figure class="${r.verdict === 'PASS' ? 'ok' : 'bad'}${id === 'desktop' || id === 'reduced' || id === 'nowebgl' ? ' wide' : ''}">${img ? `<a href="${esc(img)}"><img loading="lazy" src="${esc(img)}" alt="${esc(p.path)} ${esc(r.label)}"></a>` : '<div class="noimg">no screenshot</div>'}
<figcaption><b>${r.verdict}</b> ${r.fail.length ? `${r.fail.length} problem${r.fail.length > 1 ? 's' : ''}` : ''}${r.warn.length ? ` · ${r.warn.length} warn` : ''}${r.overflow?.evidence ? ` · <a href="${esc(r.overflow.evidence)}">overflow</a>` : ''}${r.shots.length > 1 ? ` · ${r.shots.slice(1).filter(s => !/overflow/.test(s)).map((s, i) => `<a href="${esc(s)}">${i + 1}</a>`).join(' ')}` : ''}</figcaption>
${tip ? `<details><summary>details</summary><pre>${esc(tip)}</pre></details>` : ''}</figure></td>`;
  };
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QA contact sheet · ${s.pass ? 'PASS' : 'FAIL'}</title>
<style>
:root{--paper:#F4F1EA;--ink:#1E2A2B;--ok:#2F6B4F;--bad:#B3361B;--line:rgba(30,42,43,.14)}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:28px 28px 8px}h1{font-size:28px;letter-spacing:-.02em;margin:0 0 6px}
.v{display:inline-block;padding:6px 12px;border-radius:999px;color:var(--paper);background:${s.pass ? 'var(--ok)' : 'var(--bad)'};font-weight:700;letter-spacing:.02em}
.meta{opacity:.72;margin:8px 0 0}.wrap{overflow-x:auto;padding:12px 28px 40px}
table{border-collapse:separate;border-spacing:14px 10px}th{font-weight:600;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.7}
td{vertical-align:top}th.p{position:sticky;left:0;background:var(--paper);max-width:180px;text-transform:none;letter-spacing:0;font-size:13px;opacity:1;word-break:break-all}
figure{margin:0;width:150px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}figure.wide{width:260px}
figure img{display:block;width:100%;height:auto;max-height:320px;object-fit:cover;object-position:top}
figure.ok{box-shadow:inset 0 3px 0 var(--ok)}figure.bad{box-shadow:inset 0 3px 0 var(--bad);border-color:var(--bad)}
figcaption{padding:7px 9px;font-size:12px}figure.ok b{color:var(--ok)}figure.bad b{color:var(--bad)}
details{padding:0 9px 8px;font-size:11px}pre{white-space:pre-wrap;margin:6px 0 0;max-height:180px;overflow:auto}
.noimg{height:120px;display:grid;place-items:center;opacity:.5}ul{margin:6px 0 0 18px;padding:0}footer{padding:0 28px 40px;opacity:.75;max-width:900px}
</style></head><body>
<header><h1>QA contact sheet</h1><span class="v">${esc(s.line)}</span>
<p class="meta">${esc(results.base)} · ${esc(results.browser.how)} · ${esc(results.startedAt.slice(0, 16).replace('T', ' '))} UTC · <a href="report.md">report.md</a> · <a href="results.json">results.json</a></p></header>
<div class="wrap"><table><tr><th class="p">Page</th>${results.profiles.map(p => `<th>${esc(p.label)}</th>`).join('')}</tr>
${results.pages.map(p => `<tr><th class="p">${esc(p.path)}</th>${profs.map(id => card(p, id)).join('')}</tr>`).join('\n')}
</table></div>
<footer><b>Not verified:</b><ul>${results.notVerified.map(n => `<li>${esc(n)}</li>`).join('')}</ul></footer>
</body></html>`;
  fs.writeFileSync(path.join(opts.out, 'report.html'), html);
  return s;
}
