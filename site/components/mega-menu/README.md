# Mega menu

Desktop mega panels with hover intent + keyboard; phone full-screen accordion sheet with focus trap.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/mega-menu/](https://zyqor-concepts.sites.tab.bot/components/mega-menu/) (desktop and phone)

## Files

- `index.html` (demo page)
- `mega-menu.css`
- `mega-menu.js`

To use it, copy `mega-menu.js` and `mega-menu.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="mega-menu.css">
<nav class="mm" data-mega-menu aria-label="Main">
  <div class="mm-bar">
    <a class="mm-logo" href="/">Brand</a>
    <button class="mm-burger" type="button" aria-expanded="false" aria-controls="mm-list">
      <span class="mm-burger-label">Menu</span><i aria-hidden="true"></i></button>
    <ul class="mm-list" id="mm-list">
      <li class="mm-item">
        <button class="mm-trigger" type="button" aria-expanded="false" aria-controls="p1">Routes</button>
        <div class="mm-panel" id="p1"><div class="mm-inner"><div class="mm-grid">...columns...</div></div></div>
      </li>
      <li class="mm-item"><a class="mm-link" href="/about">About</a></li>
    </ul>
  </div>
  <div class="mm-scrim" aria-hidden="true"></div>
</nav>
<script type="module" src="mega-menu.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `.mm-trigger` |   | A button with aria-controls pointing at its .mm-panel. |
| `.mm-grid` | 3 columns + feature | Panel layout on desktop; a single column inside the phone sheet. |
| `breakpoint` | 899px | Change the media queries in the CSS and the mobile() test in the JS together. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Hover opens after a 90 ms intent delay and closes 220 ms after you leave, so crossing the bar diagonally does not flicker panels.
- Click and keyboard work without hover: Enter or Space toggles, ArrowDown moves into the panel, Esc closes and returns focus to the button.
- Phone: full-screen sheet with accordion groups, focus trapped inside, Esc closes, page scroll locked.
- Panels open with a height animation on grid-template-rows (no fixed heights), links stagger in.
- prefers-reduced-motion: panels and sheet appear without animation.

## Credits

- Navigation patterns studied on [ESR Bespoke by NIGHTJAR](https://www.esrbespoke.au/) (Awwwards SOTD Oct 23 2026, "ESR Navigation" element) and [Star Atlas by Hello Monday](https://staratlas.com) (SOTY 2021, overlay menu). Disclosure pattern per the WAI-ARIA Authoring Practices. Written from scratch.
- Accordion physics from Sujon's Drive guide (MA 8.9). Images are Zyqor concept renders. Saltmarsh Ferries is fictional.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
