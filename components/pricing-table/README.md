# Pricing switcher

Zyqor's real $300 / $1k / $10k tiers: squish pill, odometer price, ARIA tabs.

**Live demo:** [zyqor-concepts.sites.tab.bot/components/pricing-table/](https://zyqor-concepts.sites.tab.bot/components/pricing-table/) (desktop and phone)

## Files

- `index.html` (demo page)
- `pricing-table.css`
- `pricing-table.js`

To use it, copy `pricing-table.js` and `pricing-table.css`. Everything else is the demo. No framework and no build step. The CSS below the line `/* demo page only */` styles the demo and can be deleted.

## Usage

```html
<link rel="stylesheet" href="pricing-table.css">
<div class="pr" data-pricing data-start="0">
  <div>
    <div class="pr-seg" role="tablist" aria-label="Plans">
      <span class="pr-pill" aria-hidden="true"></span>
      <button type="button" role="tab" id="t1" aria-controls="p1" data-price="300">Simple</button>
      <button type="button" role="tab" id="t2" aria-controls="p2" data-price="1000">Scroll 3D</button>
    </div>
    <p class="pr-price" aria-live="polite"></p><p class="pr-unit"></p>
  </div>
  <div>
    <section class="pr-plan" role="tabpanel" id="p1" aria-labelledby="t1" hidden>...</section>
    <section class="pr-plan" role="tabpanel" id="p2" aria-labelledby="t2" hidden>...</section>
  </div>
</div>
<script type="module" src="pricing-table.js"></script>
```

## Options

| Option | Default | What it does |
|---|---|---|
| `data-price` |   | Price for that plan (a number); the odometer formats it as $1,000. |
| `data-unit` | "starting price" | Small label under the price for that plan. |
| `data-start` | 0 | Plan selected on load. |

## Behaviour (desktop, phone, keyboard, reduced motion)

- Real ARIA tabs: arrow keys, Home and End move between plans; only the selected tab is in the tab order.
- The price rolls digit by digit; screen readers hear the plain price once (aria-label + polite live region).
- Feature rows use a short SVG dash, not checkmarks (Sujon's avoid list).
- Phone: the switcher spans the width and the plan sits under the price; same animation.
- prefers-reduced-motion: no slide, no roll, no squish.

## Credits

- Prices and plan descriptions: Sujon Hoque, Zyqor Studio (Oct 2026). Exact scope is agreed per project.
- Spec from his Drive guide: liquid squish segmented toggle (MA 6.2 item 1) and rolling odometer numbers for real numbers only (MA 6.2 item 4). Written from scratch.

## Licence

MIT, Zyqor Studio (Sujon Hoque). Third-party models, HDRIs and fonts keep their own licences (see the `.credit.json` file next to each, and the root `CREDITS.md`).
