# Preloader

Counts real bytes of the model/HDRI/images, never flashes on cached loads, panel-wipe exit.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/preloader/](https://zyqor-concepts.sites.tab.bot/components/preloader/) (desktop and phone)

## Files

- `index.html` (demo page)
- `preloader.css`
- `preloader.js`

To use it, copy `preloader.js` and `preloader.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="preloader.css">
<div class="pl" role="status" aria-live="polite" aria-label="Loading"
     data-assets='["/models/hero.glb","/hdri/studio_1k.hdr"]' data-once>
  <div class="pl-panel top"></div><div class="pl-panel bot"></div>
  <div class="pl-inner">
    <div class="pl-word">Brand</div><div class="pl-num" aria-hidden="true">000</div>
    <div class="pl-bar"><i></i></div><div class="pl-status">Loading</div>
  </div>
</div>
<main class="pl-rise">...</main>
<script type="module">
  import { preloader } from './preloader.js';
  await preloader();           // then start your 3D scene: the files are in the HTTP cache
</script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-assets` | [] | Files to wait for (models, HDRIs, hero images). Fonts can be added too. |
| `data-once` | off | Show only once per browser session. |
| `minTime (JS)` | 900 | Minimum time on screen once it is visible, so it never blinks. |
| `.pl-rise` |   | Add to content that should rise in after the loader leaves. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Progress is real: bytes received out of the total, streamed with fetch; it holds at 92 until every file reports its size, so it never runs backwards.
- Never flashes: fast or cached loads skip the loader entirely.
- Uses the normal HTTP cache, so your 3D code that loads the same files afterwards gets them instantly.
- Announced politely to screen readers (role="status", aria-busy); the moving number is aria-hidden.
- prefers-reduced-motion: no counting animation, a short fade instead of the wipe.

## Credits

- Real-progress loaders with a panel exit are common on WebGL award sites such as [Lusion](https://lusion.co/) and [Igloo Inc](https://www.igloo.inc/). Sujon's Drive guide asks for loaders that show real progress, never a fake bar. Written from scratch.
- Files loaded: "Binoculars" by Derek Wight and the studio HDRI, both Poly Haven CC0 1.0; images are Zyqor renders.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
