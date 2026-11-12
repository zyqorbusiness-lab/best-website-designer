# Split text reveal

Line-mask rise, letter flip and scroll-scrub reading highlight; re-measures lines, screen-reader safe.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/split-text/](https://zyqor-concepts.sites.tab.bot/components/split-text/) (desktop and phone)

## Files

- `index.html` (demo page)
- `split-text.css`
- `split-text.js`

To use it, copy `split-text.js` and `split-text.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="split-text.css">

<h1 data-split="lines">Maps for people who <span class="serif">walk</span> slowly.</h1>
<p data-split="chars">Hand-drawn. Printed in Porto.</p>
<p data-split="words">Long paragraph that lights up word by word as it scrolls.</p>

<script type="module" src="split-text.js"></script>

<!-- by hand -->
<script type="module">
  import { splitText, play } from './split-text.js';
  splitText(el, { by: 'lines', anim: 'rise' });
  play(el); // replay the reveal
</script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-split` | lines | lines (mask rise per line), chars (letters flip up) or words (scroll scrub). |
| `data-split-anim` | by type | Force an animation: rise, chars or scrub. |
| `data-split-repeat` | off | Hide again when the text leaves the screen, so it replays on the way back. |
| `--st-delay` | 0ms | CSS variable: delay before the first line or letter starts. |
| `--li / --ci / --wi` | set by JS | Index of each line, letter, word; use them for your own stagger maths. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Lines are measured after the web fonts load and again on width changes (not on phone address-bar resizes), so a line never breaks in the wrong place.
- One level of inline markup is kept: an italic serif word stays italic after the split.
- Screen readers read the sentence once from a visually hidden copy; the animated copy is aria-hidden.
- prefers-reduced-motion: text is shown at once, no movement, the scrub paragraph is full ink.
- Scroll scrub uses one passive scroll listener and one rAF for every paragraph on the page.

## Credits

- Line-mask reveals are a staple of award sites such as [FORMAT by Obys](https://format.obys.agency/) (Awwwards SOTD Oct 19 2026) and [Emotion Agency](https://emotion-agency.com/) (SOTD Oct 22 2026). The scroll reading highlight is common on product pages. Written from scratch; no code or text copied.
- Slowmap is a fictional brand for this demo.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
