# Page transition

Circle reveal from the click point between pages (native View Transitions + fallback) and for a theme switch.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/page-transition/](https://zyqor-concepts.sites.tab.bot/components/page-transition/) (desktop and phone)

## Files

- `index.html` (demo page)
- `page-transition.css`
- `page-transition.js`
- `project.html` (demo page)

To use it, copy `page-transition.js` and `page-transition.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="page-transition.css">   <!-- on BOTH pages -->
<a href="/work/rowing" data-pt data-pt-color="#E46C4A">Harbour Rowing Club</a>
<script type="module" src="page-transition.js"></script>       <!-- on BOTH pages -->

<!-- theme switch with the same circle -->
<script type="module">
  import { themeReveal } from './page-transition.js';
  themeReveal(document.querySelector('#theme'), () => document.documentElement.classList.toggle('night'));
</script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-pt` |   | Animate this link (or put links inside [data-pt-scope]). |
| `data-pt-color` | accent | Colour of the fallback cover for that link. |
| `themeReveal(btn, fn)` |   | Run fn inside a view transition and grow the new state from the click point. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Chrome and Edge use native cross-document View Transitions: the old page stays on screen until the new one is ready, so there is no white flash.
- Other browsers get a circle cover that grows, navigates, and shrinks away on the next page; the link is a normal link, so it always works.
- Ignored for external links, new tabs, downloads, hash links and Ctrl/Cmd/Shift clicks.
- Back/forward cache safe: a page you return to is never left covered.
- prefers-reduced-motion: plain navigation and an instant theme change.

## Credits

- Spec from Sujon's Drive guide (MA 6.2 item 3: circular clip-path reveal from the click point, 650 ms, fallback = plain switch).
- Seamless page changes are a hallmark of [A24 by Ravi Klaassens](https://a24.raviklaassens.com/) (built with Barba.js) and [Belgrade Arbor by Square43](https://belgradearbor.rs/en) (Awwwards SOTD Oct 2026). This one uses the browser's View Transitions API instead of a library.
- Harbour Rowing Club and Saltmarsh Ferries are fictional.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
