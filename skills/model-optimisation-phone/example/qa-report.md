# QA report

**VERDICT: PASS — 1 page(s), 4 runs, 0 console errors, 0 overflow, 0 broken links**

- Target: . (served locally)
- Browser: Playwright Chromium (153.0.8010.12), WebGL2 yes (ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver))
- Ran: 2026-10-28 03:04:32 UTC → 03:05:53 UTC
- Profiles: Desktop 1440 (1440x900) · Phone 390 (390x844) · Small 360 (360x740) · Reduced motion 1440 (1440x900, reduced motion)
- Totals: 1 pages, 4 runs, 4 passed · console/page errors 0 · failed requests 0 · overflow runs 0 · warnings 0

## Pass/fail table

| Page | Desktop 1440 | Phone 390 | Small 360 | Reduced motion 1440 |
|---|---|---|---|---|
| `index.html` | PASS | PASS | PASS | PASS |

PASS = no console errors, no uncaught errors, no failed requests, no horizontal overflow, no broken images. (n) = number of problems, w = warnings.

## Problems, page by page

None.

## Links

- Internal URLs checked: 6 · broken: 0
- In-page anchors checked: 2 · no element with that id: 0
- External links found: 1 (not fetched; use --external)
- External links without target="_blank": 0 (house rule: FAIL)

## Not verified (say so, do not assume)

- A real phone. Phone runs are desktop Chromium pretending to be a phone (size, pixel ratio, touch, user agent). iOS Safari is a different engine (WebKit; try --webkit): open the live URL on a real iPhone and a real Android before calling it done.
- Real-device frame rate. 3D was drawn by "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)" (software rendering on the CPU); the throttle numbers compare builds with each other, they are not a phone's fps.
- Design quality. The harness proves the page loads clean and fits; whether it looks premium is a human call — read the contact sheet.
- Lighthouse scores, keyboard-only use and screen readers (run Lighthouse in Chrome DevTools and record the real number).
- Slow or flaky networks (the pages were served locally or from your server as-is, not over 4G).
- External links were listed (1) but not fetched; run with --external to check them.
- The no-WebGL fallback (poster) was not tested; add --profiles ...,nowebgl or --full.

**VERDICT: PASS — 1 page(s), 4 runs, 0 console errors, 0 overflow, 0 broken links**
