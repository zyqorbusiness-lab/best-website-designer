# client-site-delivery-workflow

Deliver a website from brief to handover: interview, facts sheet, brief and scope line with a written yes, build loop, QA table, preview and one round of changes, deploy to Vercel from Git or a static preview host (sites.tab.bot), domain, Search Console, and a handover that leaves the client owning everything.

- `SKILL.md`: the six stages, rules, QA table, deploy steps, handover checklist, tiers.
- `scripts/brief.mjs`: `--new`, `--check`, `--quote`.
- `scripts/handover.mjs`: `node scripts/handover.mjs site --url https://... --out HANDOVER.md`.
- `examples/`: a filled brief, the real handover note for this portfolio, and a delivery tracker page.

MIT. Sources in `CREDITS.md`.
