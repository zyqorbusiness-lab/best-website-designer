# Image trail and hover reveal

Pointer image trail and a hover-reveal project list that turns into a tap accordion on phones.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/image-trail/](https://zyqor-concepts.sites.tab.bot/components/image-trail/) (desktop and phone)

## Files

- `image-trail.css`
- `image-trail.js`
- `index.html` (demo page)

To use it, copy `image-trail.js` and `image-trail.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="image-trail.css">

<div class="it" data-image-trail data-images='["a.webp","b.webp","c.webp"]'>...</div>

<ul class="hr" data-hover-reveal>
  <li class="hr-row" data-img="tapehead.webp" data-alt="Tapehead page">
    <button class="hr-toggle" type="button" aria-expanded="false">
      <span class="hr-n">01</span><span class="hr-t">Tapehead Hi-Fi</span><span class="hr-m">Premium</span>
    </button>
    <div class="hr-pane"><div></div></div>
  </li>
</ul>
<script type="module" src="image-trail.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-images` | [] | JSON list of image URLs for the trail (preloaded once). |
| `data-step` | 90 | Pointer travel in px between two images. |
| `life / max (JS)` | 900 / 9 | How long an image stays (ms) and how many can be on screen. |
| `--it-w` | clamp(140px,16vw,240px) | Trail image width. |
| `data-img (row)` |   | Image for that list row. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Trail images are preloaded once and cloned, so the first pass never flashes empty boxes.
- Hover list: the floating image eases after the pointer and leans with its speed; the images wipe between rows.
- Touch and reduced motion: the list becomes an accordion (tap a row to open its image inline, one open at a time); the trail area shows one still image instead of the effect under reduced motion.
- Rows are real buttons with aria-expanded; floating images are decorative and aria-hidden.

## Credits

- Hover-reveal project lists are a signature of studio portfolios such as [Brandon Yasin](https://brandonyasin.com) (Awwwards SOTD Oct 24 2026) and [G. Colombel](https://guillaumecolombel.fr/) (SOTD Oct 28 2026); image trails are a long-running award-site motif. Written from scratch.
- Images are Zyqor's own concept renders (models credited on each concept page).

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
