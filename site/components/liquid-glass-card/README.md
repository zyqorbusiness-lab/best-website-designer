# Liquid glass card

Edge refraction via SVG displacement (Chromium), blur fallback, specular highlight, tilt, draggable.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/liquid-glass-card/](https://zyqor-concepts.sites.tab.bot/components/liquid-glass-card/) (desktop and phone)

## Files

- `index.html` (demo page)
- `liquid-glass-card.css`
- `liquid-glass-card.js`

To use it, copy `liquid-glass-card.js` and `liquid-glass-card.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="liquid-glass-card.css">

<article class="lg" data-lg-drag tabindex="0">
  ...your content...
</article>
<nav class="lg" data-lg-flat>...</nav>  <!-- data-lg-flat: no tilt -->

<script type="module" src="liquid-glass-card.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `--lg-tint` | 255 255 255 | RGB of the glass body (use your light palette colour). |
| `--lg-r` | 22px | Corner radius. |
| `data-lg-drag` | off | Card can be dragged (pointer or arrow keys) inside its parent. |
| `data-lg-flat` | off | No tilt (for nav bars and pills). |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Real refraction (an SVG displacement map strongest at the edges, like thick glass) in Chromium browsers; everywhere else a frosted blur with the same rim and highlight, so it never looks broken.
- Rim light and highlight are inset lines and a soft light spot, not drop shadows.
- Tilt only with a mouse or trackpad; touch gets the same glass without movement.
- prefers-reduced-transparency: an opaque card. prefers-reduced-motion: no tilt.
- Draggable card also moves with the arrow keys when focused.

## Credits

- Look based on Apple's "Liquid Glass" design language (2025) and Sujon's own ask for premium liquid glass (Oct 27). Also see the fuller kit in [skills/liquid-glass-ui](https://github.com/zyqorbusiness-lab/best-website-designer/tree/main/skills/liquid-glass-ui).
- Rifugio Larice is a fictional hut. The background is plain type and shapes, no images.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
