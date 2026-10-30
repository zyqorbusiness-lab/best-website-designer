# performance-desktop-max-and-mobile

Speed without lowering quality: tier weight budgets, Core Web Vitals targets, the critical path, image/video/3D recipes, JS/CSS diet, 60-120 fps rules, pausing off-screen, long-task chunking, caching on Vercel, honest Lighthouse reporting.

- `SKILL.md`: the method.
- `scripts/budget-check.mjs`: `node budget-check.mjs <url> --tier advanced [--size 390x844]` measures bytes by type (own vs vendor; gzip size when the server sends text uncompressed), LCP, load CLS, long tasks and scroll fps against the tier (needs `npm i -D playwright`).
- `examples/index.html`: performance lab with self-tests (pause off-screen, chunked work under 50 ms per block).

MIT. See `CREDITS.md`.
