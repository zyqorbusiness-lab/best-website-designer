---
name: seo-and-meta
description: Real search and sharing setup for a premium static site - titles and descriptions that earn the click, one H1, canonical URLs (including the desktop + separate phone build pattern), Open Graph and Twitter/X cards with a 1200x630 image, favicons, JSON-LD (LocalBusiness, Organization, Person, WebSite, BreadcrumbList) without fake reviews, sitemap.xml and robots.txt, and Google Search Console from adding the property to submitting the sitemap. Includes scripts/seo-check.mjs (static audit, exit 1 on errors), scripts/sitemap.mjs (writes sitemap.xml + robots.txt), a tested example page with live search/preview renderings, and what the audit found and fixed in this repo.
when_to_use: before any site goes live, when a client asks "why can't I find my site on Google", when connecting Google Search Console, when link previews on WhatsApp / iMessage / LinkedIn look wrong, when adding a sitemap or robots.txt, when a site has a separate phone build (m.html)
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# SEO and meta for premium websites

A premium site that nobody finds, or that shares as a grey box with no image, has failed at the last metre. SEO for a
small studio site is not tricks; it is **a correct head on every page, real headings, a sitemap, and Search Console
watching it**. Sharing is the same work: the Open Graph tags decide what a WhatsApp or iMessage link looks like before
anyone has opened the site.

```
page content (one H1, real headings, alt text)
  -> head: title, description, canonical, OG + Twitter, favicon, JSON-LD
  -> site: sitemap.xml + robots.txt (+ legal pages)
  -> seo-check.mjs (exit 0)  -> deploy  -> Search Console: verify, submit sitemap, inspect key URLs
```

Quick start (Node 18+, no install):

```bash
node scripts/sitemap.mjs ./site --base https://your-domain.com        # writes site/sitemap.xml + site/robots.txt
node scripts/seo-check.mjs ./site                                      # audit; base inferred from the home canonical
node scripts/seo-check.mjs ./site --base https://your-domain.com --json seo.json
```

`examples/index.html` is a complete head on a concept local-business page, with an approximate Google result and link
preview drawn from its own tags and a table of checks (`window.__skillTest`).

---

## 0. Desktop first, no compromise (and what SEO has to do with it)

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."* SEO never asks for a lesser desktop:

1. **Nothing visual is removed for SEO.** A scroll story or a 3D hero stays. What SEO needs is *also* there: real text
   in the HTML (not only painted into a canvas or baked into video), one H1, headings in order, alt text.
2. **Text that the 3D or video shows is also in the DOM.** Chapter titles drawn in WebGL get a real `<h2>` (visually
   hidden if the design shows them in the scene). Google reads HTML, not pixels.
3. **Speed is a ranking input through Core Web Vitals.** Keep the desktop art and meet the vitals by delivery work
   (`performance-desktop-max-and-mobile`), never by cutting the art.

### Phone parity

- Google indexes the **mobile version** of a page (mobile-first indexing). The phone build must carry the same content,
  headings, structured data and meta as desktop. A phone page with half the text is the page Google judges.
- **Responsive (one URL) is the setup Google recommends.** When a site has a separate phone build (this repo's `m.html`
  files), annotate the pair (section 4) so Google treats them as one page.
- Check the link preview **on a phone** (send the URL to yourself on WhatsApp): it is where most of Zyqor's clients will
  first see a site.

---

## 1. The numbers

| Thing | Target | Why / source |
|---|---|---|
| `<title>` | 30-60 characters, about 600 px at 20px Arial, unique per page | Google cuts title links by pixel width; it publishes no character limit ("Influencing title links"). 60 is the common practical ceiling. |
| Meta description | 120-160 characters, unique per page | Google may use it as the snippet and trims long ones to fit; no official limit. |
| H1 | exactly 1 per page, says what the page is | Headings are how Google and screen readers understand the page; one H1 is the convention this repo enforces. |
| Headings | in order, no skipped levels (h1 > h2 > h3) | Structure for both search and accessibility. |
| `og:image` | 1200 x 630 px (1.91:1), JPEG or PNG, absolute https URL, lean (100-300 KB) | Facebook's recommended size; X's `summary_large_image` uses 2:1, min 300x157, under 5 MB. A relative URL breaks the preview everywhere. |
| Favicon | a square that is a multiple of 48 px (48, 96, 144) or SVG | Google's favicon guideline for search results. |
| Sitemap | <= 50,000 URLs and <= 50 MB uncompressed per file; absolute URLs; canonical pages only | sitemaps.org protocol; Google's sitemap guide. |
| `<lastmod>` | only if accurate | Google uses lastmod when it is consistently accurate and ignores `<priority>` and `<changefreq>`. |
| robots.txt | at the root, plain text, with an absolute `Sitemap:` line | robots.txt controls crawling, **not indexing**. |
| Core Web Vitals | LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 | Google's "good" thresholds. |

---

## 2. The head, copy-paste (fill every value; delete nothing)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kessler Tire &amp; Auto, Canton OH · Same-day tires and alignment</title>
<meta name="description" content="Tire fitting, balancing and wheel alignment in Canton, Ohio. Walk in Monday to Saturday, 8 am to 6 pm, or book a time online.">
<link rel="canonical" href="https://kessler-tire.example/">
<meta name="theme-color" content="#F3EDE1">

<!-- Open Graph: WhatsApp, iMessage, Facebook, LinkedIn, Slack, Discord read these -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kessler Tire &amp; Auto">
<meta property="og:title" content="Kessler Tire &amp; Auto, Canton OH">
<meta property="og:description" content="Same-day tire fitting and alignment. Open Monday to Saturday, 8 am to 6 pm.">
<meta property="og:url" content="https://kessler-tire.example/">
<meta property="og:image" content="https://kessler-tire.example/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kessler Tire and Auto, same-day tire fitting in Canton, Ohio">
<meta property="og:locale" content="en_US">

<!-- X / Twitter (falls back to OG for title/description/image, but the card type must be set) -->
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png"><!-- 180x180 -->

<script type="application/ld+json">{ "@context": "https://schema.org", "@type": "AutoRepair", "name": "Kessler Tire & Auto", "url": "https://kessler-tire.example/" }</script>
</head>
```

Rules for the values:

- **Title formula**: `[What this page is], [where or for whom] · [brand]` for inner pages; `[Brand], [what you do, where]`
  for the home page. Front-load the words people type. Never the same title on two pages.
- **Description**: one or two plain sentences: what, where, the one fact that makes someone click (hours, price from,
  same day). No keyword lists. The copywriting skill's rules apply (no "elevate", no "seamless").
- **Canonical**: the one URL you want in Google, absolute, https, with the trailing slash style the host actually
  serves. Every indexable page has one, including the home page.
- **og:url** = canonical. **og:title** may be shorter than `<title>` (no brand suffix needed).
- **One `lang`**, the language the copy is in (`en` for Zyqor's US clients). `og:locale` matches.

---

## 3. Content signals that matter more than tags

1. **One H1 that names the page.** On a design-led hero where the big words are a slogan, keep the slogan visual and
   make the H1 say what the business is ("Kessler Tire & Auto, Canton"). If the hero text is painted in a canvas,
   put a visually hidden H1 in the DOM (`.sr-only`, the accessibility skill has the CSS).
2. **Real text, not text in images.** Hours, address, services, prices: HTML text. A screenshot of a price list is
   invisible to search and to screen readers.
3. **Alt text describes the image's job** ("Mechanic balancing a front tire"), not "image1.jpg", never "AI-generated".
   Decorative images get `alt=""`.
4. **Links have words.** "See alignment prices", not "click here". Internal links connect the pages you want found.
5. **Legal and trust pages exist**: privacy policy, contact, and terms when anything is sold (Sujon's Drive, avoid list
   "no TOS", "no privacy policy"; checklist "Trust + legal"). A site without them reads as unfinished to people and to
   reviewers alike.
6. **No hidden keyword text, no doorway pages**, no copied text from other sites. Google's spam policies cover all three.

---

## 4. Canonicals and the separate phone build (this repo's pattern)

Zyqor's portfolio and concepts ship a desktop page (`index.html`) and a phone page (`m.html`) at different URLs.
Google supports this "separate URLs" setup when the pair is annotated both ways:

```html
<!-- on the desktop page: https://site/library/p/P041/ -->
<link rel="canonical" href="https://site/library/p/P041/">
<link rel="alternate" media="only screen and (max-width: 640px)" href="https://site/library/p/P041/m.html">

<!-- on the phone page: https://site/library/p/P041/m.html -->
<link rel="canonical" href="https://site/library/p/P041/">
```

- The phone page's canonical points at the **desktop** URL (not at itself).
- Only the desktop URLs go in the sitemap; `sitemap.mjs` leaves `m.html` out.
- Both pages carry the same title, description, headings, OG tags and JSON-LD.
- If you are starting fresh: build one responsive page instead. It is simpler and it is what Google recommends.

**Two hosts, one canonical.** This portfolio is served at `zyqor-portfolio.sites.tab.bot` and at
`zyqor-portfolio.vercel.app`. Every page's canonical names one host (today: sites.tab.bot), so Google indexes that one
and treats the other as a duplicate. To switch the main host, change the canonical/og:url host on every page and
regenerate the sitemap with the new `--base`; never mix hosts in canonicals.

---

## 5. Open Graph and link previews

What each app does with the tags is the app's own decision, and they cache. Practical rules:

| Rule | Reason |
|---|---|
| `og:image` is an **absolute** https URL | A relative path (`thumb.webp`) shows no image in most apps. 51 pages in this repo had this bug (section 11). |
| 1200x630 JPEG (or PNG), text kept inside the middle ~80% | Apps crop differently (some square, some 1.91:1); centre the important part. |
| Real image of the work, the brand's own type and colours | The preview is the first design impression; a stock gradient or a generated image reads as a template. |
| One image per page that matches the page | A concept page shares its own hero, not the studio logo. |
| Set `og:image:alt` | Screen readers in some apps read it. |
| After changing the image, change its URL (`og-card.jpg?v=2` or a new filename) | Apps cache previews; a new URL is the reliable way to get a fresh one. |

Make the card from the real site: screenshot the hero at 1200x630 with headless Chrome
(`page.setViewportSize({width:1200,height:630}); page.screenshot({type:'jpeg',quality:85})`) or draw it with the
site's own fonts. Check it with each platform's own debugger: Facebook Sharing Debugger, LinkedIn Post Inspector, and
a message to yourself on WhatsApp and iMessage.

---

## 6. Structured data (JSON-LD)

JSON-LD in a `<script type="application/ld+json">` is the format Google recommends. Use the most specific
schema.org type that is true.

| Site | Type(s) | Must-have properties |
|---|---|---|
| Local business client (Zyqor's main US market) | the specific type (`AutoRepair`, `HairSalon`, `Bakery`, `Restaurant`, `DryCleaningOrLaundry`...) or `LocalBusiness` | `name`, `address` (PostalAddress), `telephone`, `url`, `image`, `openingHoursSpecification`; `priceRange`, `geo`, `sameAs` (Google Business Profile, Instagram) when true |
| Studio / company | `Organization` or `ProfessionalService` | `name`, `url`, `logo`, `sameAs`, `contactPoint` |
| Portfolio of a person | `Person` (+ `WebSite`) | `name`, `url`, `jobTitle`, `sameAs` (GitHub, Instagram) |
| Every site | `WebSite` | `name`, `url` |
| Deep pages | `BreadcrumbList` | `itemListElement` with `position`, `name`, `item` |
| Shop product | `Product` + `Offer` | `name`, `image`, `offers.price`, `offers.priceCurrency`, `offers.availability` |

Hard rules:

- **Only mark up what is visible and true on the page.** Hours in JSON-LD must match the hours in the text.
- **No review stars about yourself.** Google does not show review rich results for reviews a LocalBusiness or
  Organization publishes about itself, and invented reviews break Sujon's rule H1 ("real proof or nothing").
- **Concept sites are labelled concepts.** A fictional brand gets no `LocalBusiness` with a fake address passed off as
  real; keep it as a portfolio page (`CreativeWork`) or describe it as a concept, as the example does.
- Use `@graph` with `@id`s to link items (business, website) instead of repeating them.
- Validate with Google's Rich Results Test and the Schema Markup Validator (validator.schema.org).

---

## 7. sitemap.xml and robots.txt

```bash
node scripts/sitemap.mjs ./site --base https://zyqor-portfolio.sites.tab.bot
```

What it writes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://zyqor-portfolio.sites.tab.bot/</loc></url>
  <url><loc>https://zyqor-portfolio.sites.tab.bot/library/p/P041/</loc></url>
</urlset>
```

```
# robots.txt for https://zyqor-portfolio.sites.tab.bot
User-agent: *
Allow: /

Sitemap: https://zyqor-portfolio.sites.tab.bot/sitemap.xml
```

Rules:

- **Canonical URLs only**: no `m.html`, no 404 page, no `noindex` pages, no redirect stubs, no `_template` folders.
- **Absolute URLs** on the canonical host, in the style the host serves (`/folder/`, not `/folder/index.html`).
- `<lastmod>` only when you can stand behind the date (`--lastmod 2026-10-30` after a full rebuild); otherwise leave it
  out. `<priority>` and `<changefreq>` are ignored by Google, so the script never writes them.
- robots.txt is about **crawling**. To keep a page out of results use `<meta name="robots" content="noindex">` and do
  **not** block that page in robots.txt (Google must crawl it to see the noindex).
- Never ship `Disallow: /` from a staging copy to production. `seo-check.mjs` fails on it.
- Regenerate the sitemap whenever pages are added; it is part of the build, not a one-off.

---

## 8. Google Search Console, step by step

Search Console is free and is the only place Google tells you what it sees. Do this on launch day.

**Pick the property type.**

| You control | Property | Verify with |
|---|---|---|
| a domain you own (`kessler-tire.com`) | **Domain** property (covers http/https, www and every subdomain) | a DNS TXT record at the registrar |
| a host you do not own (`*.vercel.app`, `*.sites.tab.bot`, `*.github.io`) | **URL-prefix** property (`https://zyqor-portfolio.vercel.app/`) | HTML tag or HTML file (DNS is not possible) |

**Steps (URL-prefix, the common case for Zyqor's hosted sites):**

1. Open https://search.google.com/search-console and sign in with the Google account that should own it (for Zyqor
   Studio: the studio account). Add property -> URL prefix -> paste the exact home URL with `https://` and the trailing `/`.
2. Choose **HTML tag**. Copy `<meta name="google-site-verification" content="...">` into the `<head>` of the home page
   (`index.html`, and `m.html` too if the phone build is served at a different URL), commit, wait for the deploy.
   Or choose **HTML file**: put the downloaded `google....html` file in the site root unchanged.
3. Click **Verify**. Keep the tag or file forever; removing it can un-verify the property.
4. **Indexing -> Sitemaps**: enter `sitemap.xml`, Submit. The status should read *Success* with a count of discovered
   pages. *Couldn't fetch* usually means a wrong URL or a robots.txt block.
5. **URL Inspection**: paste the home URL and the 2-5 most important pages, then *Request indexing* for each. There is
   a daily limit on requests; do not loop it.
6. Settings -> **Users and permissions**: add the client (or Sujon) as Owner so the property does not depend on one login.
7. After a few days: **Indexing -> Pages** shows which URLs are indexed and why the others are not ("Alternate page with
   proper canonical tag" is expected for `m.html` and for the non-canonical host). **Performance** shows clicks,
   impressions, CTR and position once data arrives.

**For an agent working through an API.** The Search Console API can list sites, add a site, submit and list sitemaps,
and inspect a URL (`urlInspection.index.inspect`). It cannot press *Request indexing*: that is UI-only (Google's
Indexing API is limited to job-posting and livestream pages). Verification itself goes through the Site Verification API
or the UI.

**Bing** (also feeds DuckDuckGo and others): Bing Webmaster Tools can import verified sites straight from Search Console.
Bing and some other engines support IndexNow for instant URL pings; Google does not use it.

---

## 9. SEO for a $300 local-business client (the job Zyqor sells most)

1. Title and H1 carry **business type + city** ("Tire shop in Canton, OH"). That is what people type.
2. NAP (name, address, phone) written the **same way** on the site, in JSON-LD, and on the client's Google Business
   Profile. Click-to-call link: `<a href="tel:+13305550142">`.
3. Hours as text and in `openingHoursSpecification`; holiday hours updated.
4. A page or section per main service, each with its own heading.
5. Link the site from the Google Business Profile (the client does this in their profile, or adds you as a manager).
6. Real photos of the shop, the team, the work, with alt text. No stock "handshake" photos.
7. Embed the map from the business's own Google Maps place, lazy-loaded below the fold.
8. Search Console set up on launch day, ownership given to the client at handover.

---

## 10. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Head | full head on every page | + per-page OG images | + per-page OG images made from the real scenes |
| Structured data | LocalBusiness / Organization + WebSite | + BreadcrumbList on deep pages | + Product / Event / FAQ where true, `@graph` linked |
| Sitemap / robots | generated, submitted | regenerated in the build | + image entries where images matter |
| Search Console | set up, sitemap submitted, owner added | + key URLs inspected, Pages report checked at week 1 | + monthly Performance note to the client |
| Content | one H1, real text, alt text | + service pages with their own headings | + copy written for search intent per page (copywriting skill) |
| Phone build | responsive | responsive or annotated m.html pair | same, plus parity of every tag |

---

## 11. What seo-check found in this repo (30 Oct 2026)

Run on `site/` (110 HTML pages) before and after the fixes pushed with this skill:

| Finding | Before | After |
|---|---|---|
| `og:image` relative (`thumb.webp`, `poster.webp`, `../og.jpg`): no image in link previews | 51 pages (error) | 0 |
| Home page (desktop and phone) with no `<h1>` | 2 (error) | 0: a visually hidden H1 naming the studio |
| `robots.txt` / `sitemap.xml` missing | both (error) | both present, 63 canonical URLs |
| A demo page with no meta description | 1 (error) | 0 |
| Pages without `rel=canonical` (library concepts, components) | 56 | 0 (except error pages) |
| Phone `m.html` canonical pointing at itself instead of the desktop page | 24 | 2 (`lab/hush`, `lab/signal`: held back, local copies differ from main) |
| Desktop pages with an `m.html` but no `rel=alternate` | 45 | 2 (same two) |
| Missing `twitter:card`, `og:type`, `og:url` | 61 / 57 / 69 | 18 / 1 / 1 |
| Errors / warnings overall | 56 / 526 | 0 / 237 (mostly descriptions outside 120-160 and 16:10 thumbnails used as OG images) |

What is left (warnings, not errors): 54 descriptions outside 120-160 characters, 39 OG images smaller than 1200x630
(concept thumbnails at 720x450). Both are content work: rewrite the descriptions with the copywriting skill and render
1200x630 cards per concept.

---

## 12. Do and don't

Do:
- Write the title and description for a person deciding whether to click.
- Keep the H1, the title and the OG title saying the same thing in different lengths.
- Use absolute https URLs for canonical, og:url, og:image and every sitemap `<loc>`.
- Regenerate the sitemap in the build; submit it once in Search Console; let Google re-read it.
- Give the client Owner access in Search Console at handover.
- Put the same content on the phone build (Google indexes the phone version).

Don't:
- Stuff keywords into titles, alt text or hidden text.
- Block a page in robots.txt to "hide" it (use noindex) or ship a staging `Disallow: /`.
- Mark up reviews about yourself or invent ratings, addresses or awards.
- Put `m.html` or duplicate hosts in the sitemap.
- Use a relative `og:image` or a 300 px thumbnail as the preview image.
- Mention AI anywhere in titles, descriptions or alt text (Sujon's rule H4).

---

## 13. Pre-ship checklist

- [ ] `node scripts/seo-check.mjs ./site` prints `VERDICT: PASS` (paste the summary into the notes).
- [ ] Every page: unique title (30-60 chars) and description (120-160), one H1, canonical, `lang`.
- [ ] OG + `twitter:card` on every page; `og:image` absolute, 1200x630; preview checked on WhatsApp and iMessage.
- [ ] Phone build: same content and tags; `m.html` canonical -> desktop; desktop has `rel=alternate media`.
- [ ] JSON-LD validates in the Rich Results Test; only true, visible facts; no self-reviews.
- [ ] `sitemap.xml` lists canonical URLs only; `robots.txt` has the absolute `Sitemap:` line and no `Disallow: /`.
- [ ] Privacy page (and terms when selling) linked from the footer.
- [ ] Favicon (SVG + 48 px PNG) and apple-touch-icon (180 px).
- [ ] After deploy: Search Console property verified, sitemap submitted (*Success*), key URLs inspected, client added as Owner.
- [ ] Core Web Vitals inside "good" (performance skill).

---

## 14. Files

| File | What |
|---|---|
| `scripts/seo-check.mjs` | static audit: per-page head, H1, canonicals incl. phone variants, OG/Twitter, OG image size and weight, JSON-LD parse, img alt; site-level robots/sitemap checks, duplicates, canonicals missing from the sitemap; summary by kind; `--json`; exit 1 on errors |
| `scripts/sitemap.mjs` | writes `sitemap.xml` + `robots.txt` from the folder: canonical pages only, home first, optional `--lastmod`, `--dry` |
| `examples/index.html` | complete head on a concept page with approximate Google result + link preview from its own tags; 12 self-tests |
| `examples/og-card.jpg` | 1200x630 example card (own work, MIT, credit file beside it) |
| `examples/robots.txt`, `examples/sitemap.xml` | minimal correct files |
| `CREDITS.md` | sources |


## Switching the canonical host (Oct 30 2026, zyqor-portfolio)
The same files were served from two hosts (`zyqor-portfolio.sites.tab.bot` and `zyqor-portfolio.vercel.app`) and every page said the first was canonical. Search Console was verified on the second. Two hosts that both claim to be the real one split ranking; a canonical that points away from the verified property means the verified property is told "do not index me".

What changed (one commit, 112 HTML files + `sitemap.xml` + `robots.txt`):
| where | before | after |
|---|---|---|
| `<link rel="canonical">` | sites.tab.bot URL | vercel.app URL, same path |
| `<link rel="alternate">` (phone `m.html` <-> desktop) | sites.tab.bot | vercel.app |
| `og:url`, `og:image`, `twitter:image` | sites.tab.bot | vercel.app |
| JSON-LD `url`, `@id`, `image`, `logo` | sites.tab.bot | vercel.app |
| `sitemap.xml` `<loc>` | sites.tab.bot | vercel.app |
| `robots.txt` `Sitemap:` line | sites.tab.bot | vercel.app |
| visible text and in-page links | unchanged | unchanged |
| `google-site-verification` meta | kept | kept |

The script only touches `<link>` / `<meta>` tags and JSON-LD keys, never body text:
```python
OLD, NEW = 'https://zyqor-portfolio.sites.tab.bot', 'https://zyqor-portfolio.vercel.app'
tag = re.compile(r'<(link|meta)\b[^>]*>', re.I)
def fix(m):
    t = m.group(0)
    if re.search(r'rel="(canonical|alternate)"|property="og:(url|image)"|name="twitter:image"', t):
        return t.replace(OLD, NEW)
    return t
html = tag.sub(fix, html)
html = re.sub(r'("(?:url|@id|image|logo)"\s*:\s*")' + re.escape(OLD), r'\1' + NEW, html)
```
Checks after the push:
- `grep -rl 'rel="canonical" href="https://zyqor-portfolio.sites.tab.bot' site | wc -l` gives 0;
- the live `robots.txt` names the new sitemap; the live home `<link rel="canonical">` is the new host;
- the verification meta is still in `site/index.html` (a lost verification tag un-verifies the property);
- then in Search Console: submit the sitemap on the verified property and request indexing for the home page.

The second host keeps serving the same files. That is fine: its pages now point their canonical at the verified host, which is exactly what a mirror should do.

### Adding a page later
Every new concept page needs its canonical, alternate and `og:url` on the canonical host from day one, plus one `<url>` line in `sitemap.xml`. P042 (Tally Pad) was the first page written this way.

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 10:51 IST ("Google search console par login karo"); 30 Oct 2026 "PC me no compromise"; no AI wording anywhere.
- Sujon's Drive: *Website-Building-Guide-New-Site.md* §1 step 8 and §6 rule 8 ("SEO basics": one H1, unique title and description, alt text, sitemap.xml, robots.txt, social preview image, real headings) = Drive point Q12; MA Part F item 1 and *web-design-promo-checklist.txt* "Trust + legal" (legal pages, H6); real proof only (H1); labelled concepts (H5). Mapping: `docs/beast/SKILLS_SOURCE_MAP.md`.
- Google Search Central documentation: SEO Starter Guide; Influencing title links; Control your snippets (meta description); Consolidate duplicate URLs (rel=canonical); Separate URLs for mobile (rel=alternate media / canonical); Mobile-first indexing; Build and submit a sitemap (50,000 URLs / 50 MB, lastmod use, priority/changefreq ignored); Introduction to robots.txt (crawling, not indexing); Block indexing with noindex; Define a favicon (multiple of 48 px); Intro to structured data (JSON-LD recommended); Review snippet guidelines (self-serving reviews); Spam policies; Search Console Help (add a property, verification methods, Sitemaps report, URL Inspection, Users and permissions); Search Console API reference; Indexing API scope. https://developers.google.com/search/docs
- Google, Core Web Vitals thresholds, https://web.dev/articles/vitals.
- The Open Graph protocol, https://ogp.me/ ; Meta for Developers, sharing best practices (1200x630); X Developer docs, Summary Card with Large Image (2:1, 300x157 minimum, 5 MB).
- sitemaps.org protocol 0.9, https://www.sitemaps.org/protocol.html ; schema.org types LocalBusiness, AutoRepair, Organization, Person, WebSite, BreadcrumbList, Product.
- Bing Webmaster Tools (import from Search Console); IndexNow, https://www.indexnow.org/.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: its engine builds the story copy as real DOM text (eyebrow, title, one sentence) over the video with a readability scrim, which is the pattern section 0 asks for (SW-T15 copy choreography, engine L244-256).
- This repo, `seo-check.mjs` runs on `site/`, 30 Oct 2026 (section 11).
