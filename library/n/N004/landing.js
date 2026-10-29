/* Shared landing-page plumbing for this concept (desktop + phone). Kept inside the concept folder: the kit is not edited. */
/* ---- landing-page plumbing: nav state, phone menu, honest form ---- */
export function landing() {
  const html = document.documentElement;
  const bar = document.querySelector('.zk-bar');
  const sync = () => html.classList.toggle('bar-tucked', !!bar && bar.classList.contains('is-tucked'));
  if (bar) new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ['class'] });
  /* current section in the nav */
  const links = [...document.querySelectorAll('.bnav-links a[href^="#"]')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (secs.length) {
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id))); }); }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach((s) => io.observe(s));
  }
  /* phone menu */
  const dlg = document.querySelector('.msheet'), open = document.querySelector('.menu-btn');
  if (dlg && open) {
    open.addEventListener('click', () => { dlg.showModal(); open.setAttribute('aria-expanded', 'true'); });
    dlg.addEventListener('close', () => { open.setAttribute('aria-expanded', 'false'); open.focus({ preventScroll: true }); });
    dlg.querySelector('.msheet-x').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => dlg.close()));
  }
  /* forms: validate, loading, then an honest success. Nothing is sent anywhere. */
  document.querySelectorAll('form[data-honest]').forEach((form) => {
    const btn = form.querySelector('[type=submit]'), ok = document.getElementById(form.dataset.success);
    const check = (el) => {
      const err = form.querySelector(`#${el.id}-err`); let msg = '';
      if (el.validity.valueMissing) msg = el.dataset.req || 'Please fill this in.';
      else if (el.validity.typeMismatch) msg = 'That does not look like an email address.';
      else if (el.validity.tooShort) msg = `At least ${el.minLength} characters, please.`;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (err) err.textContent = msg; return !msg;
    };
    const fields = [...form.querySelectorAll('input.input, select.input, textarea.input')];
    fields.forEach((el) => { el.addEventListener('blur', () => { if (el.value) check(el); }); el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); }); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = fields.filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      btn.classList.add('is-loading'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      setTimeout(() => {
        btn.classList.remove('is-loading'); btn.disabled = false; btn.removeAttribute('aria-busy');
        form.hidden = true; ok.classList.add('is-on'); ok.querySelector('[data-echo]') && (ok.querySelector('[data-echo]').textContent = form.dataset.echo ? form.dataset.echo.replace(/\{(\w+)\}/g, (_, k) => (form.elements[k] && form.elements[k].value) || '') : '');
        ok.focus();
      }, 700);
    });
    ok && ok.querySelector('[data-again]') && ok.querySelector('[data-again]').addEventListener('click', () => { form.reset(); fields.forEach((f) => f.setAttribute('aria-invalid', 'false')); ok.classList.remove('is-on'); form.hidden = false; fields[0].focus(); });
  });
}
