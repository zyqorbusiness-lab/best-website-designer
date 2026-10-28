# Starter files

- `qa.config.json` — copy into your site folder. Lists the pages to test, the profiles, and the few console messages you deliberately ignore.
- `qa.yml` — copy to `.github/workflows/qa.yml` to run the harness on every push. The verdict becomes the check's pass/fail, and the report is attached to the run.

Add these to your own `package.json` so anyone on the team runs the same thing:

```json
"scripts": {
  "qa": "node skills/qa-harness/qa.mjs site",
  "qa:full": "node skills/qa-harness/qa.mjs site --full --external"
}
```
