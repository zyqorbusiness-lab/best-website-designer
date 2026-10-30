# accessibility-and-reduced-motion

Accessibility for premium, motion-heavy websites without dumbing them down: WCAG 2.2 AA as numbers, semantics, keyboard and focus, custom widgets, accessible 3D/canvas/video, forms, reduced motion designed per scene, forced colours.

- `SKILL.md`: the method, numbers, patterns, reduced-motion table, testing, tiers, what the checker found in this repo, checklist.
- `scripts/a11y-check.mjs`: `node scripts/a11y-check.mjs <url|folder> [--pages a.html,b.html]` at 1440 and 390 (+ reduced motion); exit 1 on failures. Needs Playwright.
- `examples/index.html`: skip link, menu dialog, pausable carousel, accessible canvas, form errors, reduced motion and forced colours, with self-tests.

MIT. Sources in `CREDITS.md`.
