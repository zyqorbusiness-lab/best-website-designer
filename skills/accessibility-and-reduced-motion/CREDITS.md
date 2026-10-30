# Credits: accessibility-and-reduced-motion

No third-party code, images or fonts are included. The example uses system fonts; the canvas drawing is code.

| Idea / data | Source | Used in |
|---|---|---|
| Contrast 4.5/3:1, visible focus, alt text, no colour-only meaning, motion sensitivity | Sujon's Drive: *Website-Building-Guide-New-Site.md* §6 rule 6, §7; *Master-Award-Website-Guide-Improved-v4.2* Part B; *web-design-promo-checklist.txt* "Accessibility" (point A1) | sections 1, 3 |
| Reduced motion that still makes sense | Sujon's Drive, *boloflow-native-motion-design-system.txt* "ACCESSIBILITY / REDUCED MOTION" (point A2) | section 8 |
| Keyboard works, Escape closes overlays | MA Part B "Keyboard"; MA Part E §11 (point A3) | sections 4, 5 |
| Touch targets; every state designed | *web-design-promo-checklist.txt*; MA Part F item 13 §5, §7 (points A4, A5) | sections 1, 7 |
| Never pure white text on dark; never a blank canvas; sound opt-in | MA Part E §2 Step 2 item 4 (C4); WBG §3, §7 (D6); MA Part F item 13 §6 (I13) | sections 3, 6 |
| "PC me no compromise" | Sujon Hoque, WhatsApp 30 Oct 2026 | section 0 |
| Reduced motion = no video at all in the scroll engine | scroll-world by cyw, MIT, https://github.com/oso95/scroll-world (SW-T11) | section 8 |
| Success criteria and numbers | W3C WCAG 2.2, https://www.w3.org/TR/WCAG22/ (1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.2.2, 2.3.1, 2.3.3, 2.4.7, 2.4.11, 2.5.7, 2.5.8 incl. its spacing exception) | sections 1, 11b, `a11y-check.mjs` |
| Widget patterns (dialog, carousel, tabs) | W3C WAI-ARIA Authoring Practices Guide | sections 5, example |
| `prefers-reduced-motion`, `forced-colors`, `prefers-contrast`, `<dialog>` | MDN Web Docs | sections 8, 9, example |
| Relative luminance formula | W3C WCAG 2.2 definition | `a11y-check.mjs` |
