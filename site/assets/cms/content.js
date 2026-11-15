/* Zyqor Studio portfolio - saved-content loader.
 *
 * Applies admin-saved text over the hardcoded copy, at runtime, on every
 * host (Vercel + GitHub Pages mirror). Pure client-side, no build change.
 * Backend: zyqor-portfolio-cms Cloudflare Worker (read-only endpoint).
 *
 * Contract:
 *   - Set window.ZYQOR_CMS_URL to the worker origin in assets/cms/config.js.
 *   - Tag editable elements with data-cms="<key>".
 *   - If the backend is unreachable or slow, nothing happens: the page
 *     keeps its built-in (hardcoded) text. No errors surface to visitors.
 *
 * Load with `defer`:
 *   <script src="assets/cms/config.js"></script>
 *   <script src="assets/cms/content.js" defer></script>
 */
(function () {
  'use strict';

  var base = window.ZYQOR_CMS_URL;
  if (!base) return; // CMS not configured: static site, nothing to do.

  var endpoint = base.replace(/\/+$/, '') + '/content';

  function apply(map) {
    var nodes = document.querySelectorAll('[data-cms]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-cms');
      if (Object.prototype.hasOwnProperty.call(map, key) && typeof map[key] === 'string' && map[key] !== '') {
        nodes[i].textContent = map[key];
      }
    }
    document.documentElement.classList.add('cms-ready');
  }

  function run() {
    fetch(endpoint)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) { apply(data.values || {}); })
      .catch(function () { /* keep hardcoded content silently */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
