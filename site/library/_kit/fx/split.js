/* fx/split.js - split a heading into word masks for a line-rise reveal; screen readers still read the original text.
   split(el) -> spans. Pair with data-rv on the same element: <h1 data-rv data-split>..</h1> (concept.css animates .split-w > span). */
export function split(el, { by = 'word' } = {}) {
  if (!el || el.dataset.splitDone) return [];
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text); el.dataset.splitDone = '1';
  const parts = by === 'char' ? [...text] : text.split(' ');
  el.innerHTML = parts.map((p, i) => p === ' ' ? ' ' : `<span class="split-w" aria-hidden="true"><span style="--i:${i}">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`).join(by === 'char' ? '' : ' ');
  return [...el.querySelectorAll('.split-w > span')];
}
export function splitAll(root = document) { root.querySelectorAll('[data-split]').forEach((el) => split(el, { by: el.dataset.split === 'char' ? 'char' : 'word' })); }
