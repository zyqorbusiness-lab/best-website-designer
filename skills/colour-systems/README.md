# colour-systems

Premium 3-colour palettes that never read as "AI": one seed hue, OKLCH maths, fixed jobs, WCAG checks, no black / purple / neon / decorative gradients.

- `SKILL.md`: the method (rules with reasons, decision tables, procedure, tokens, worked palettes, tiers, checklist).
- `scripts/palette.mjs`: generator and checker. `node scripts/palette.mjs --seed 170 --mode light --css` or `--check "#F3EDE1,#17423C,#8C611C"` (exit 1 on FAIL).
- `examples/index.html`: live playground (serve the folder with any static server, e.g. `npx serve .`).

MIT. Sources in `CREDITS.md`.
