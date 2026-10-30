# responsive-phone-pc-parity

Desktop-first composition that recomposes for phones with the same quality: the viewport matrix, content breakpoints, fluid type, container queries, svh and the iOS URL bar, safe areas, art direction, video and 3D per aspect, touch vs pointer, inputs, common bugs, and an automated parity checker.

- `SKILL.md`: the method.
- `scripts/parity-check.mjs`: `node parity-check.mjs <url> --cta "#cta"` runs 10 sizes (needs `npm i -D playwright`), reports overflow culprits, small text, small targets, inputs under 16px, CTA above the fold, console errors, screenshots; exits 1 on failure.
- `examples/index.html`: recomposition demo (passes all 10 sizes).

MIT. See `CREDITS.md`.
