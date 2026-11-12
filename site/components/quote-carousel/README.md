# Quote carousel

Native scroll-snap swipe, mouse drag with inertia, accessible autoplay with Pause; real quotes, no fake reviews.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/quote-carousel/](https://zyqor-concepts.sites.tab.bot/components/quote-carousel/) (desktop and phone)

## Files

- `index.html` (demo page)
- `quote-carousel.css`
- `quote-carousel.js`

To use it, copy `quote-carousel.js` and `quote-carousel.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="quote-carousel.css">
<section class="qc" data-quote-carousel data-autoplay="6500" aria-roledescription="carousel" aria-label="What clients said" tabindex="0">
  <div class="qc-track">
    <figure class="qc-slide"><blockquote>Real words from a real client.</blockquote><figcaption>Name<small>Company</small></figcaption></figure>
  </div>
  <div class="qc-ui">
    <button class="qc-prev" type="button" aria-label="Previous">...</button>
    <button class="qc-next" type="button" aria-label="Next">...</button>
    <div class="qc-bar"><i></i></div><span class="qc-count"></span>
    <button class="qc-play" type="button"><span>Pause</span></button>
  </div>
</section>
<script type="module" src="quote-carousel.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-autoplay` | off | Milliseconds between slides; omit for no autoplay. |
| `.qc-slide flex-basis` | min(78%,720px) | Slide width; the next slide peeks in so people know they can swipe. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Phone swipe is the browser's own scrolling with scroll-snap: no fighting with vertical page scroll.
- Mouse: drag with inertia that lands on the nearest slide; a drag never triggers a click.
- Autoplay has a visible Pause button, stops for good after any user action, and pauses on hover, focus, off screen and in hidden tabs (WCAG 2.2.2).
- Keyboard: focus the carousel and use the arrow keys; slides are labelled "1 of 4".
- prefers-reduced-motion: no autoplay, no smooth scrolling, no scale.

## Credits

- Quotes: Dieter Rams (from his ten principles for good design), Massimo Vignelli, Steve Jobs (The New York Times Magazine, 2003), Paul Rand. Used as short attributed quotations for demonstration.
- Carousel pattern after the WAI-ARIA Authoring Practices carousel guidance. Written from scratch.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
