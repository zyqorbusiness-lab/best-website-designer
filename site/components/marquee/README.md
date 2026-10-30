# Marquee

Seamless loop, speeds up with scroll velocity, flips with scroll direction, drag with inertia.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/marquee/](https://zyqor-concepts.sites.tab.bot/components/marquee/) (desktop and phone)

## Files

- `index.html` (demo page)
- `marquee.css`
- `marquee.js`

To use it, copy `marquee.js` and `marquee.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="marquee.css">

<div class="mq" data-marquee data-speed="70" data-scroll-flip aria-label="Our values">
  <div class="mq-track">
    <div class="mq-item">Loose leaf · slow brewed · small farms ·</div>
  </div>
</div>

<script type="module" src="marquee.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-speed` | 60 | Pixels per second at rest. |
| `data-direction` | left | left or right. |
| `data-boost` | 0.9 | How much page-scroll velocity speeds it up (0 = ignore scroll). |
| `data-scroll-flip` | off | Reverse direction while the page scrolls up. |
| `data-no-pause` | off | Keep moving under the mouse. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Clones are aria-hidden and their links get tabindex="-1", so keyboard and screen-reader users meet each item once.
- Drag works with mouse and touch (horizontal only; vertical swipes still scroll the page) and keeps inertia after release. A drag never fires a click on a link inside.
- Pauses when off-screen (IntersectionObserver), on mouse hover and while something inside has focus.
- Re-measures after web fonts load and when the width changes.
- prefers-reduced-motion: nothing moves; the row is a normal horizontal scroller.

## Credits

- Scroll-reactive marquees appear across award winners, for example [landonorris.com](https://landonorris.com/) (Awwwards Site of the Year 2025) and [Don't Board Me](https://dontboardme.com) (SOTY 2024). Written from scratch.
- Images are Zyqor's own renders from the concept library (models credited on each concept page). Kettle & Co. is fictional.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
