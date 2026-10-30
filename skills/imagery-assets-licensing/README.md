# imagery-assets-licensing

Finding, licensing, crediting and treating real images, video, 3D, icons, fonts and animations: the free-source table with each licence's limits, the "unclear means skip" rule, credit files that pass the repo gate, photo direction, grading into the palette, crops for desktop and portrait, knockouts, own renders instead of AI images.

- `SKILL.md`: the method.
- `scripts/credit.mjs`: `new` writes a credit file; `check <dir>` validates every asset (same rules as `tools/credits-check.mjs`).
- `scripts/knockout.py`: border-connected flood-fill knockout that keeps inner same-colour areas and the contact shadow (Pillow).
- `examples/index.html`: grade, duotone, grain, crops and a credits block on two real CC0 photos (loaded from this repo).

MIT. See `CREDITS.md`.
