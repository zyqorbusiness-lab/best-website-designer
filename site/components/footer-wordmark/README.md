# Footer with wordmark

Giant per-letter rising wordmark, Gmail-on-desktop / mailto-on-phone, copy email, local time, legal links.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/footer-wordmark/](https://zyqor-concepts.sites.tab.bot/components/footer-wordmark/) (desktop and phone)

## Files

- `footer-wordmark.css`
- `footer-wordmark.js`
- `index.html` (demo page)

To use it, copy `footer-wordmark.js` and `footer-wordmark.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="footer-wordmark.css">
<footer class="fw" data-footer-wordmark>
  <div class="fw-top">
    <div><p class="fw-big">Have a site in mind?</p>
      <a class="fw-btn fw-main" href="mailto:you@studio.com" data-email="you@studio.com">Email</a>
      <button class="fw-btn" type="button" data-copy="you@studio.com"><span>Copy email</span></button></div>
    <div><h3>Local time</h3><b data-tz="Asia/Kolkata"></b></div>
  </div>
  <div class="fw-mark">STUDIO</div>
  <div class="fw-base">... <button class="fw-up" type="button" data-top="#main">Back to top</button></div>
</footer>
<script type="module" src="footer-wordmark.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `.fw-mark` |   | The wordmark text; split into letters by JS (screen readers read the word once). |
| `data-email` |   | Gmail compose on desktop, mailto: on phones. |
| `data-copy` |   | Text to copy; the button says "Copied" for 1.4 s. |
| `data-tz` |   | IANA time zone for the live clock. |
| `data-top` | #main | Element that gets focus after Back to top. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Wordmark letters rise in a stagger when the footer is a quarter visible, and the whole mark drifts up slightly with scroll.
- Email opens Gmail compose on a desktop and the phone's mail app on touch (Sujon's contact rule).
- Copy feedback is short and quiet; if the clipboard is blocked, the address is shown instead.
- Real Privacy and Terms links (his avoid list says a site without them is a mistake).
- prefers-reduced-motion: the wordmark is simply there, no rise, no drift.

## Credits

- Per-letter footer wordmarks: [Emotion Agency](https://emotion-agency.com/) (Awwwards SOTD Oct 22 2026, "Emotion Agency Footer" element) and [Mana Yerba Mate](https://en.manayerbamate.com/) (SOTY 2023, Footer Design). Also pattern G in the @ayzz.thedesigner study. Written from scratch.
- Contact details are Zyqor Studio's real ones.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
