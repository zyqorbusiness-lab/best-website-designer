/* Zyqor Lab chrome: concept label bar + footer (honest label, credits, prev/next).
   Include on every demo page:  <script type="module" src="../_kit/chrome.js"></script>
   Reads <body data-slug="stride">. Credits: put <template id="credits"><li>...</li></template> in the page.
   Colours come from the page's own CSS variables --c1 (light), --c2 (dark), --c3 (accent). */
import { CONCEPTS } from './registry.js';
const slug = document.body.dataset.slug;
const i = CONCEPTS.findIndex((c) => c.slug === slug);
const c = CONCEPTS[i] || { n: '00', brand: 'Concept', kind: '', pattern: '' };
const m = document.documentElement.dataset.build === 'm';
const home = m ? '../../m/#lab' : '../../#lab';
/* design pass v2 (Oct 27): shared UI layer. Additive; a missing file is a quiet no-op (onerror removes the link). */
if (!document.querySelector('link[href*="lab-ui.css"]')) {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('./lab-ui.css', import.meta.url).href;
  l.onerror = () => l.remove();
  document.head.append(l);
}
/* liquid glass v1 (Oct 27): shared material from assets/glass/. Additive; missing files are quiet no-ops. */
const glassBase = new URL('../../assets/glass/', import.meta.url).href;
for (const f of ['liquid-glass.css', 'glass-lab.css']) {
  if (document.querySelector(`link[href$="${f}"]`)) continue;
  const g = document.createElement('link');
  g.rel = 'stylesheet'; g.href = glassBase + f; g.onerror = () => g.remove();
  document.head.append(g);
}
if (!window.ZyqorGlass && !document.querySelector('script[src$="liquid-glass.js"]')) {
  const s = document.createElement('script');
  s.src = glassBase + 'liquid-glass.js'; s.defer = true; s.onerror = () => s.remove();
  document.head.append(s);
}
const lab = m ? '../m.html' : '../';
const page = (s) => (m ? `../${s}/m.html` : `../${s}/`);
const prev = CONCEPTS[(i - 1 + CONCEPTS.length) % CONCEPTS.length];
const next = CONCEPTS[(i + 1) % CONCEPTS.length];
const arrow = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const Z = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6.5h12L6 17.5h12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const bar = document.createElement('div');
bar.className = 'zl-bar';
bar.innerHTML = `<a class="zl-pill zl-home lg lg-round lg-btn" href="${home}" aria-label="Back to Zyqor Studio portfolio">${arrow('M15 18l-6-6 6-6')}<span>Portfolio</span></a>
<div class="zl-pill zl-tag lg lg-refract" role="note"><span class="zl-z">${Z}</span><span>Zyqor Lab</span><b>Concept&nbsp;${c.n}</b></div>`;
document.body.prepend(bar);

const tpl = document.getElementById('credits');
const foot = document.createElement('footer');
foot.className = 'zl-foot';
foot.innerHTML = `<div class="zl-foot-in">
 <p class="zl-honest"><b>Concept ${c.n} &middot; ${c.brand}</b> is not a real company. Sujon at Zyqor Studio designed and hand-coded this page to test one idea: ${c.pattern.toLowerCase()}. Nothing here is for sale.</p>
 ${tpl ? `<details class="zl-cred"><summary class="lg lg--dark lg-pill">Credits &amp; licences</summary><ul>${tpl.innerHTML}</ul></details>` : ''}
 <nav class="zl-nav" aria-label="More concepts">
  <a class="zl-pill lg lg--dark lg-btn" href="${page(prev.slug)}">${arrow('M15 18l-6-6 6-6')}<span><small>Previous</small>${prev.brand}</span></a>
  <a class="zl-pill zl-all lg lg--dark lg-btn" href="${lab}"><span>All ${CONCEPTS.length} concepts</span></a>
  <a class="zl-pill" href="${page(next.slug)}"><span><small>Next concept &middot; ${next.n}</small>${next.brand}</span>${arrow('M9 18l6-6-6-6')}</a>
 </nav>
</div>`;
document.body.append(foot);
