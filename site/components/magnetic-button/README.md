# Magnetic button

Leans toward the pointer, fills from the entry point, rolls its label; tap ripple on phones.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/magnetic-button/](https://zyqor-concepts.sites.tab.bot/components/magnetic-button/) (desktop and phone)

## Files

- `index.html` (demo page)
- `magnetic-button.css`
- `magnetic-button.js`

To use it, copy `magnetic-button.js` and `magnetic-button.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="magnetic-button.css">
<a class="mb" href="/contact" data-magnetic>Start a project
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
</a>
<button class="mb mb--outline" type="button" data-magnetic data-strength="0.35">Book a call</button>
<script type="module" src="magnetic-button.js"></script>

<!-- or by hand -->
<script type="module">
  import { magnetic } from './magnetic-button.js';
  const ctl = magnetic(document.querySelector('#cta'), { strength: 0.3, radius: 100 });
  // ctl.destroy() removes the listeners
</script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-strength` | 0.28 | How far the button follows the pointer (0 = no pull, fill and roll only). |
| `data-radius` | 80 | Extra px around the button where the pull starts, so it leans toward you before contact. |
| `data-label` | button text | Label text when the button has only an icon (it also becomes the rolled label). |
| `.mb--outline / --round / --small` |   | Variants. Colours come from --mb-bg, --mb-fg, --mb-fill, --mb-fill-fg. |
| `label (JS)` | 0.5 | Label parallax as a share of the button move (the Drive spec: 0.28 button, 0.14 label). |
| `stiffness / damping (JS)` | 0.14 / 0.72 | Spring feel. Higher stiffness snaps faster; lower damping wobbles more. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Pull, label roll and arrow turn run only on a mouse or trackpad (hover:hover and pointer:fine).
- Touch: a short press (scale .96) and a fill ripple from the tap point; nothing depends on hover.
- Keyboard: :focus-visible shows the fill and the rolled label, so focus is as visible as hover.
- prefers-reduced-motion: no movement at all, the fill appears without animation.
- The duplicate label is aria-hidden, so screen readers read the text once.
- One rAF spring per button, and it stops when the button is at rest (no idle loop).

## Credits

- Spec from Sujon's own Drive guide (Master Award Web Design System, section 6.1: radius pull 0.28, label 0.14, entry-point fill, label slot roll).
- Technique seen on many award sites, for example [Lusion](https://lusion.co/) and [landonorris.com by OFF+BRAND](https://landonorris.com/). Written from scratch; no code copied.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
