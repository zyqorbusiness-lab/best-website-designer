# Example: a site with two bugs, and the report that caught them

`site-buggy/` is a three-page concept site (Halden, a fictional copper kettle; the ring is drawn live in WebGL by hand, no images). Two bugs were put in on purpose, the kind that happen every week:

1. **Horizontal overflow on phones** — `gallery.html`: the finish swatches sit in a flex row with `flex: 0 0 380px` and no wrapping or scrolling. Fine at 1440, the page is 1200px wide on a 390px phone.
2. **A JavaScript error** — `about.html`: the click effect looks for `.whistle-btn`, but the button is `#whistle`. `querySelector` returns `null` and the script throws on load at every size.

(Bonus: the "Source on GitHub" link opens in the same tab; that is a warning by default and a FAIL with `--preset zyqor`.)

## Run it yourself

```
node ../qa.mjs site-buggy --out report-buggy
node ../qa.mjs site-fixed --out report-fixed --full --preset zyqor
```

## What the harness said (real output, committed)

`report-buggy/` → **VERDICT: FAIL** — see `report-buggy/report.md` and open `report-buggy/report.html`.
- `about.html` failed at all four sizes: `uncaught error: Cannot read properties of null (reading 'addEventListener') (about.html:31)`.
- `gallery.html` failed at 390 and 360: the overflow finder named `div.swatch.s3` (810px past the edge at 390), told you to fix it at `div.strip` ("a flex row that does not wrap"), and saved `shots/gallery__phone__overflow.jpg`, a screenshot wider than the phone with the screen edge drawn as a dashed line.
- the home page passed everywhere.

`site-fixed/` changes three lines (`diff -r site-buggy site-fixed`): the swatch row scrolls sideways with snap points, the swatches are `min(380px, 78vw)`, the script uses `#whistle`, the external link gets `target="_blank" rel="noopener"`.

`report-fixed/` → **VERDICT: PASS** with every profile (desktop, phone, small, reduced motion at 1440 and 390, no-WebGL) and the CPU-throttle smoke run on every page, under the stricter `--preset zyqor`.
