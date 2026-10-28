# QA report

**VERDICT: PASS — 3 page(s), 18 runs, 0 console errors, 0 overflow, 0 broken links**

- Target: site-fixed (served locally)
- Browser: Playwright Chromium (153.0.8010.12), WebGL2 yes (ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver))
- Ran: 2026-10-28 02:57:47 UTC → 02:59:13 UTC
- Profiles: Desktop 1440 (1440x900) · Phone 390 (390x844) · Small 360 (360x740) · Reduced motion 1440 (1440x900, reduced motion) · Reduced motion 390 (390x844, reduced motion) · No WebGL 1440 (1440x900, WebGL off)
- Totals: 3 pages, 18 runs, 18 passed · console/page errors 0 · failed requests 0 · overflow runs 0 · warnings 0

## Pass/fail table

| Page | Desktop 1440 | Phone 390 | Small 360 | Reduced motion 1440 | Reduced motion 390 | No WebGL 1440 |
|---|---|---|---|---|---|---|
| `/` | PASS | PASS | PASS | PASS | PASS | PASS |
| `about.html` | PASS | PASS | PASS | PASS | PASS | PASS |
| `gallery.html` | PASS | PASS | PASS | PASS | PASS | PASS |

PASS = no console errors, no uncaught errors, no failed requests, no horizontal overflow, no broken images. (n) = number of problems, w = warnings.

## Problems, page by page

None.

## Links

- Internal URLs checked: 6 · broken: 0
- In-page anchors checked: 0 · no element with that id: 0
- External links found: 1 (not fetched; use --external)
- External links without target="_blank": 0 (house rule: FAIL)

## CPU-throttle smoke run (phone 390, CPU 4x slower)

| Page | Load | Scroll fps | Median frame | p95 frame | Frames > 50 ms | Long tasks | Notes |
|---|---|---|---|---|---|---|---|
| `/` | 53 ms | 60 | 16.7 ms | 16.8 ms | 0 | 0 (worst 0 ms) | ok |
| `about.html` | 59 ms | 60 | 16.7 ms | 16.7 ms | 0 | 0 (worst 0 ms) | ok |
| `gallery.html` | 40 ms | 60 | 16.7 ms | 16.8 ms | 0 | 0 (worst 0 ms) | ok |

A smoke test, not a benchmark: it catches pages that break or freeze on a slow CPU. Compare these numbers between builds, not with a phone.

## Not verified (say so, do not assume)

- A real phone. Phone runs are desktop Chromium pretending to be a phone (size, pixel ratio, touch, user agent). iOS Safari is a different engine (WebKit; try --webkit): open the live URL on a real iPhone and a real Android before calling it done.
- Real-device frame rate. 3D was drawn by "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)" (software rendering on the CPU); the throttle numbers compare builds with each other, they are not a phone's fps.
- Design quality. The harness proves the page loads clean and fits; whether it looks premium is a human call — read the contact sheet.
- Lighthouse scores, keyboard-only use and screen readers (run Lighthouse in Chrome DevTools and record the real number).
- Slow or flaky networks (the pages were served locally or from your server as-is, not over 4G).
- External links were listed (1) but not fetched; run with --external to check them.

**VERDICT: PASS — 3 page(s), 18 runs, 0 console errors, 0 overflow, 0 broken links**
