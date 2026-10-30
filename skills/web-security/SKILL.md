---
name: web-security
description: Build security into a website from the first file, the way a senior web developer would, and check it with one command. Covers secrets, security headers, a Content-Security-Policy that works with three.js / GSAP / WebGL sites, forms and spam, third-party scripts and embeds, dependencies, cookies and sessions, hosting and HTTPS, plus a scanner (check.mjs) for a folder or a live URL.
when_to_use: "make my site secure", "add security", "check this site for security problems", before deploying any site, before handing a site to a client, when adding a form, a payment, a login, an API key or a third-party script
license: MIT
version: 1.0.0
---

# Web security for creative websites

Most portfolio, brand and 3D sites are static: HTML, CSS, JS and assets on a CDN. They have no database to steal, so the real risks are different from an app's: **a secret shipped to the browser, a script from somewhere else that turns hostile, a form that becomes a spam cannon, a page framed by a phishing site, and a link that lets another tab take over yours.** This skill fixes those first, then covers what changes when a site gets a backend (forms, payments, logins).

Run the checker at the start and before every deploy:

```bash
node skills/web-security/check.mjs site          # scan a folder (repo or build output)
node skills/web-security/check.mjs --url https://your-site.com   # live headers, cookies, https redirect
```

It prints each finding with HIGH / MEDIUM / LOW, where it is, and the fix, and exits with code 1 if anything is HIGH (so it can block a deploy). A clean scan is a good sign, not a guarantee: section 7 lists what it cannot see.

## For AI agents: the order to work in

1. Run `check.mjs` on the folder. Fix every HIGH before anything else.
2. Never put a secret in a file that reaches the browser (section 1). If one is there, remove it AND tell the owner to rotate it.
3. Add the headers from `examples/` for the host in use (section 2). Start CSP in Report-Only if the site has inline scripts.
4. Every `target="_blank"` link gets `rel="noopener noreferrer"`; every third-party script is pinned or self-hosted (section 4).
5. Forms: server-side validation, honeypot, rate limit, https only (section 3).
6. Run `check.mjs --url` after deploy and report the counts to the owner in plain words.

## 1. Secrets

- **Anything the browser downloads is public.** That includes JS bundles, JSON, source maps and `.env` files that slip into the deploy folder. An API key in front-end code is a published key.
- Keys that must stay private (payment secret keys, email API keys, AI API keys, database URLs) live only in the host's environment settings and are used from a serverless function or backend.
- Public keys are designed to be public (Stripe publishable `pk_live_`, a maps key restricted to your domain). Restrict them at the provider by domain anyway.
- `.gitignore` must contain `.env` and `.env.*` (keep `.env.example` with fake values). The checker flags a missing rule.
- If a secret was ever committed, deleting it is not enough: git history keeps it. **Rotate it** at the provider.

## 2. Security headers

Headers are set by the host, not in HTML. Copy the one for your host from `examples/`:

| Header | Value that is safe for almost every site | What it stops |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Downgrade to http on later visits |
| `X-Content-Type-Options` | `nosniff` | The browser guessing a file is a script |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Leaking full URLs (with tokens) to other sites |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Embedded code using hardware you never use (remove an item if the site needs it) |
| `X-Frame-Options` | `SAMEORIGIN` (or CSP `frame-ancestors 'self'`) | Your page inside a phishing site's iframe (clickjacking) |
| `Content-Security-Policy` | see below | Injected or hijacked scripts running at all |

### A CSP that works with three.js, GSAP and WebGL

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
media-src 'self' blob:;
font-src 'self';
connect-src 'self';
worker-src 'self' blob:;
frame-ancestors 'self';
base-uri 'self';
form-action 'self' https://formspree.io;
object-src 'none';
upgrade-insecure-requests
```

Notes from building 3D sites:
- **three.js loaders** read models with `fetch`, so the model's host must be in `connect-src` (self-host models and it is just `'self'`).
- **Draco / KTX2 / Basis decoders** run WebAssembly in workers: add `'wasm-unsafe-eval'` to `script-src` and keep `worker-src 'self' blob:`.
- **GSAP, Lenis and three.js** need no `unsafe-eval`. If something breaks only with `unsafe-eval`, find the library that evals; do not loosen the policy for everything.
- **Inline `<script>` blocks** are blocked by `script-src 'self'`. Move them to files, or add their `sha256-...` hashes. Inline `style=""` attributes are why `style-src` keeps `'unsafe-inline'` on most animated sites; that is a small risk compared with scripts.
- **Roll out safely:** send it first as `Content-Security-Policy-Report-Only`, open every page with DevTools open, fix the violations, then switch to the enforcing header.

## 3. Forms

- A static site's form posts somewhere: a form service (Formspree, Basin, Netlify Forms), a serverless function, or a mail link. Post only to `https://`.
- **Validate on the server.** Browser `required` and `pattern` are for the user's convenience, not security.
- **Spam:** a hidden honeypot field that humans never fill (see `examples/honeypot-form.html`), a minimum time between page load and submit, and a rate limit per IP at the function or service. Add a challenge (Cloudflare Turnstile) only if spam gets through.
- Never send the form's text into `innerHTML` anywhere (a thank-you message, an admin page). Use `textContent`.
- Email headers: if a function builds an email from form fields, strip newlines from name and subject (header injection).

## 4. Third-party code and embeds

- **Self-host libraries** (three.js, GSAP, fonts) where the licence allows. Fewer origins, a stricter CSP, no surprise updates.
- If you must use a CDN, pin the exact version (`three@0.170.0`, not `three@latest`) and add Subresource Integrity: `<script src="..." integrity="sha384-..." crossorigin="anonymous">`. Import maps cannot carry integrity for every module, which is another reason to self-host modules.
- Every `target="_blank"` link: `rel="noopener noreferrer"`.
- iframes (maps, video, booking widgets): `sandbox` with only the permissions needed, `loading="lazy"`, and `referrerpolicy="strict-origin-when-cross-origin"`.
- Analytics and chat widgets run with full access to the page. Add them last, and only ones the client actually uses.

## 5. Dependencies and the build

- Commit the lockfile. Run `npm audit --omit=dev` before release; fix HIGH and CRITICAL.
- Remove packages you do not use; each one is code from a stranger.
- Do not deploy `.git`, `node_modules`, `.env` or source maps of client work. Deploy the build folder only (`outputDirectory` on Vercel).
- `postinstall` scripts run on your machine: install new packages from known authors only.

## 6. When the site gets a backend (logins, payments, dashboards)

- Sessions in cookies with `Secure; HttpOnly; SameSite=Lax`, never tokens in `localStorage`.
- Passwords: never store them yourself if you can avoid it (use the auth provider). If you must, hash with Argon2id or bcrypt.
- Payments: use the provider's hosted checkout (Stripe Checkout, Razorpay Standard). Card numbers should never touch your server. Verify webhooks with the signature secret.
- Every API route checks who is asking (authentication) and whether they may (authorisation), even if the button is hidden in the UI.
- Rate limit login, signup, password reset and contact endpoints.
- Validate every input server-side with a schema; parameterised queries only (no string-built SQL).

## 7. What check.mjs can and cannot see

It finds: committed secrets (AWS, Google, Stripe, GitHub, Slack, AI keys, private keys, passwords in URLs, generic `apiKey = "..."`), `.env` and key files, a `.git` folder in the deploy, source maps, missing security headers in `vercel.json` / `_headers` / `netlify.toml` / `.htaccess`, `target=_blank` without `noopener`, http resources on pages, third-party scripts without integrity, http form actions, iframes without sandbox, forms that post without spam protection, `eval` / `new Function`, `innerHTML` fed from data, secrets in `localStorage`, `.gitignore` without `.env`; and for a live URL: missing headers, weak CSP, version leaks, cookie flags, and whether http redirects to https.

It cannot see: logic bugs in a backend, secrets in the host's settings, what a third-party script will do tomorrow, or a vulnerable dependency (use `npm audit`). For anything with logins or payments, get a human review as well.

## Files

- `check.mjs`: the scanner (Node 18+, no dependencies).
- `examples/vercel.json`, `examples/_headers` (Netlify, Cloudflare Pages), `examples/netlify.toml`: copy-paste headers.
- `examples/honeypot-form.html`: an accessible form with a honeypot and a time trap.

## Credits

Based on the OWASP Secure Headers Project and OWASP Cheat Sheet Series (Content Security Policy, Cross Site Scripting Prevention, HTML5 Security), MDN Web Docs on CSP and Subresource Integrity, and the lessons of shipping the Zyqor portfolio. Written by Zyqor Studio, MIT.
