# Liquid Glass UI · checklist

Done means every box is ticked on the real page, not on the kit demo.

## Look
- [ ] Glass sits on something worth bending (photo, video, 3D, rich gradient). No glass on flat single colour without a reason.
- [ ] Three colours only: `--c1` light (warm paper, not #fff), `--c2` coloured dark (not #000), `--c3` accent for the one main action. No purple/AI gradients.
- [ ] Every glass element shows the rim: glint top-left, weaker glint bottom-right, hairline. No hard black drop shadows.
- [ ] Refraction visible on nav, buttons, segmented control and tab bar in Chrome desktop (`LiquidGlass.supportsRefraction === true`).
- [ ] Safari / iPhone / Firefox show the frosted fallback and still look finished (check one real iPhone if you can).
- [ ] Glass is on chrome and controls, not on long reading text.
- [ ] Icons are inline SVG. No emoji anywhere.

## Readability
- [ ] Every label on glass is 4.5:1 against the worst backdrop it can sit on (large text 3:1).
- [ ] Cards with text use `--lg-alpha` 0.5+ and `--lg-blur` 20px+.
- [ ] Floating bars carry `data-lg-adapt`; flat sections carry `data-lg-backdrop="paper"` or `"ink"`.
- [ ] Accent button text passes 4.5:1 on the accent.

## Behaviour
- [ ] Every control is a real `<button>`, `<a>`, `<input type="range">` or `<dialog>`; keyboard works (Tab, Space/Enter, arrows in segmented controls and tab bars, Esc closes sheets).
- [ ] Nothing is hover-only: tooltips open on focus and tap; hover effects have a visible resting state.
- [ ] Press state: scale .965 + brighter sheen, expo-out. No bounce, no overshoot, no blur-in.
- [ ] Reveals are opacity + 16–24 px rise, 400–520 ms, expo-out.

## Fallbacks
- [ ] `prefers-reduced-motion`: no pointer light, no sliding lens animation, no rise; content visible at once.
- [ ] `prefers-reduced-transparency` (or `?lg=solid`): solid surfaces, text still 4.5:1.
- [ ] `?lg=flat`: refraction off, layout unchanged.
- [ ] Forced colours: borders visible, decorations off.

## Performance
- [ ] At most 6–8 blurred layers visible at once on desktop, 3–4 on phone.
- [ ] No animated `backdrop-filter` or blur radius; only `transform` / `opacity` move.
- [ ] Big surfaces (cards, sheets) do not refract unless they need to.
- [ ] Images lazy-load below the fold; the hero image has `fetchpriority="high"`.

## QA
- [ ] 0 console errors and 0 failed requests at 1440×900, 390×844 and 360×740.
- [ ] No horizontal overflow at any of the three sizes (hidden tooltips included).
- [ ] Desktop and phone builds load the same photos/models (phone = compressed copies only).
- [ ] Screenshots of every state (rest, pressed, sheet open, tooltip open) checked by eye.
- [ ] Text contrast measured on real pixels behind each label (see SKILL.md §7b), every label ≥ 4.5:1.
- [ ] Credits for every photo, model, font and borrowed snippet are on the page and in the README.
