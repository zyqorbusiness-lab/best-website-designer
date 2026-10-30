# seo-and-meta

Search and sharing setup for premium static sites: titles, descriptions, one H1, canonicals (incl. the desktop + m.html pattern), Open Graph and X cards, favicons, JSON-LD, sitemap.xml, robots.txt and Google Search Console step by step.

- `SKILL.md`: the method, numbers, copy-paste head, Search Console steps, local-business SEO, tiers, what the audit found in this repo, checklist.
- `scripts/seo-check.mjs`: `node scripts/seo-check.mjs ./site` (exit 1 on errors; `--json out.json`).
- `scripts/sitemap.mjs`: `node scripts/sitemap.mjs ./site --base https://your-domain.com` writes sitemap.xml + robots.txt.
- `examples/index.html`: complete head with live previews and self-tests.

MIT. Sources in `CREDITS.md`.
