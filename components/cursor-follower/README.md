# Cursor follower

Dot + lagging ring, label over work, sticky ring on links, hides over inputs, off on touch.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/cursor-follower/](https://zyqor-concepts.sites.tab.bot/components/cursor-follower/) (desktop and phone)

## Files

- `cursor-follower.css`
- `cursor-follower.js`
- `index.html` (demo page)

To use it, copy `cursor-follower.js` and `cursor-follower.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="cursor-follower.css">

<a href="/work/tapehead" data-cursor="View">...</a>
<a href="/studio" data-cursor-stick>Studio</a>
<video data-cursor-hide ...></video>

<script type="module">
  import { cursorFollower } from './cursor-follower.js';
  cursorFollower({ lerp: 0.16, hideNative: true }); // returns null on touch devices
</script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `lerp` | 0.16 | Ring lag: 1 = no lag, 0.08 = very floaty. Forced to 1 under reduced motion. |
| `hideNative` | true | Hide the system cursor (text fields always keep the caret). |
| `data-cursor="Word"` |   | Grow into a filled circle that shows the word. |
| `data-cursor-stick` |   | Ring wraps the element and leans with the pointer. |
| `data-cursor-color` | ink | Ring colour for that element. |
| `data-cursor-hide` |   | Hide the follower over this element. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Runs only with hover:hover and pointer:fine; on touch it returns null and adds nothing to the page.
- Over text fields the follower hides and the normal caret shows.
- The loop stops when the ring has caught up (no idle animation frames).
- prefers-reduced-motion: no lag, the ring sits exactly on the pointer.
- Decorative only: aria-hidden, never moves focus.

## Credits

- Spec from Sujon's Drive guide (MA 6.4: dot exact, ring lerp 0.16, context labels, off on touch).
- Seen on award sites such as [A24 by Ravi Klaassens](https://a24.raviklaassens.com/) (Awwwards SOTD Oct 26 2026) and [Lusion](https://lusion.co/). Written from scratch.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
