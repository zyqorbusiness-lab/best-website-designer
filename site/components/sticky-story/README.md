# Sticky storytelling

Pinned media with chapter wipes, progress line, numbered rail; same on phone.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/sticky-story/](https://zyqor-concepts.sites.tab.bot/components/sticky-story/) (desktop and phone)

## Files

- `index.html` (demo page)
- `media`
- `sticky-story.css`
- `sticky-story.js`

To use it, copy `sticky-story.js` and `sticky-story.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="sticky-story.css">

<div class="ss" data-sticky-story>
  <div class="ss-steps">
    <div class="ss-line"><div class="ss-fill"></div></div>
    <article class="ss-step"><h3>One idea</h3><p>...</p></article>
    <article class="ss-step"><h3>A real model</h3><p>...</p></article>
  </div>
  <div class="ss-media">
    <div class="ss-stage">
      <figure class="ss-frame"><img src="one.webp" alt=""></figure>
      <figure class="ss-frame"><img src="two.webp" alt=""></figure>
      <span class="ss-count"></span>
    </div>
    <nav class="ss-rail" aria-label="Story steps"></nav>
  </div>
</div>
<script type="module" src="sticky-story.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `--ss-ratio` | 16/10 | Aspect ratio of the pinned media (desktop and phone). |
| `.ss-frame` | one per step | Any content: image, video, canvas. The active one wipes up; earlier ones stay under it. |
| `.ss-rail` | optional | Numbered buttons that scroll to each step. |
| `.ss-count` | optional | 01 / 04 counter. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Pinning is pure CSS position: sticky; JavaScript only decides which step is active (IntersectionObserver at the middle of the screen), so it never jitters.
- Phone: the media pins under the top bar and the chapters scroll beneath it, with the same images and wipes.
- Rail buttons have labels and aria-current="step"; inactive frames are aria-hidden.
- prefers-reduced-motion: frames switch without the wipe and zoom; smooth scrolling is off.

## Credits

- Scroll storytelling as used by [Igloo Inc by abeto](https://www.igloo.inc/) (Awwwards SOTY 2024) and [Persepolis Reimagined by Monks](http://www.getty.edu/persepolis) (SOTY 2022). Written from scratch.
- Images are Zyqor's own concept renders (each model credited on its concept page).

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
