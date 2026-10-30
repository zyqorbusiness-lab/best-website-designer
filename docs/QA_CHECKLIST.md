# Ship checklist (one page)

Run this before every push that changes a page, and before any site goes to a client. Each line is pass/fail with a
number or a file as evidence. "Looks fine" is not evidence. The detailed how-to for each check lives in the skill
named in brackets.

Project: ________  Page(s): ________  Commit: ________  Checked by: ________  Date: ________

## 1. Phone = PC
- [ ] Phone (`m.html` or the responsive page) shows the **same** content, product, model and effects as desktop,
      recomposed for the screen, not cut down or swapped for a cheaper asset. [responsive-phone-pc-parity]
- [ ] Same assets on both (no phone-only low-res model); `parity-check.mjs` reports 0 horizontal overflow at every size.
- [ ] Tested by touch on a phone-sized viewport: tap targets ≥ 44 px, nothing depends on hover.
- [ ] Say whether a real phone was used. If not, write "emulated only".

## 2. Zero console errors
- [ ] 0 errors and 0 failed requests at **1440 x 900**, **390 x 844** and **360 x 740**. [qa-harness: `node qa.mjs <url>`]
- [ ] The same three sizes with `prefers-reduced-motion: reduce`.
- [ ] Checked on the live URL after deploy, not only on localhost.

## 3. Reduced motion
- [ ] With reduced motion on: no scroll-jacking, no parallax, no auto-playing intro; every section shows its final state;
      interactive controls still work. [accessibility-and-reduced-motion]
- [ ] Nothing flashes more than 3 times a second.

## 4. Speed and stability
- [ ] **CLS < 0.1** on a cold load (desktop and phone). Fonts, images and canvases have reserved sizes.
- [ ] **LCP < 2.5 s**; the LCP element is a real image or text, not a 3D canvas that has not drawn yet.
      [performance-desktop-max-and-mobile: `budget-check.mjs <url>`]
- [ ] **Initial weight: desktop < 6 MB, phone < 3 MB** (transferred, before scrolling). Below-the-fold models, video
      and images load lazily.
- [ ] No long task over 200 ms during scroll; scroll stays smooth with the 3D running.

## 5. Palette rule
- [ ] No black (`#000000`), no purple or violet, no decorative gradients anywhere in the UI. Tinted dark inks are fine;
      real light and shadow inside a 3D scene or photo are fine. [colour-systems]
- [ ] Text contrast ≥ 4.5 : 1 (body) and ≥ 3 : 1 (large text, icons, focus rings).

## 6. Credits and honesty
- [ ] `node tools/credits-check.mjs` prints `"fail": 0`. Every asset has a credit file. [asset-sources-and-licence-check]
- [ ] Every CC BY asset shows author + licence as visible text on the page that uses it.
- [ ] No AI-generated images. No fake reviews, testimonials, client logos, ratings or "trusted by" lines.
- [ ] Concepts are labelled as concepts; forms say nothing is sent.

## 7. Search and ownership
- [ ] The `google-site-verification` meta tag in `site/index.html` is **still there, unchanged** (Search Console stops
      trusting the property without it).
- [ ] Title, description, one H1, canonical and Open Graph tags are present and point at the live host. [seo-and-meta]
- [ ] `sitemap.xml` and `robots.txt` return 200 and list the new page.
- [ ] No secrets, tokens or private keys in the diff. [web-security: `check.mjs`]

## 8. Screenshots before / after
- [ ] Before and after screenshots at 1440 x 900 and 390 x 844 saved next to the work (for example
      `work/<project>/qa/before_desktop.jpg`, `after_desktop.jpg`, `after_phone.jpg`).
- [ ] Looked at side by side at 100 %: the after is clearly better, not just different. If not, keep working.
- [ ] For a page with a storyboard: the live page matches the approved frames. [build-spec-and-storyboard]

## Verdict
- [ ] All boxes ticked, or each open box has a written reason and a fix date.
- [ ] Numbers recorded in the commit message or `qa.json`: weight (desktop / phone), LCP, CLS, console errors.

Result: PASS / FAIL    Notes: ____________________________________________
