# Veilpay — Deployment & Rollback Runbook

Short, operational guide for the Veilpay marketing site + waitlist API.
Production is deployed from `main` via Vercel; there is no separate staging
environment yet (Vercel preview deployments on PRs are the closest thing).

## 1. How a deploy happens

1. Push to `main` (or merge a PR).
2. GitHub Actions runs `ci.yml`: lint → type-check → tests (coverage-gated) → prod dependency audit.
   A failing gate does **not** block Vercel (the integration is not wired to require CI yet) — check the run manually.
3. Vercel builds `npm run build` (tsc + vite + SSG prerender of all 61 routes, with a post-build content audit that fails the build on soft-404s).
4. On success, the new revision goes live atomically on `veilpayapp.com` and `docs.veilpayapp.com`.

## 2. How to roll back

Vercel keeps every successful deployment. To revert:

1. Open the Vercel dashboard → project → **Deployments**.
2. Find the last **green** deployment (the one before the bad one).
3. Open its menu (⋯) → **Promote to Production**.

That is the fastest rollback (~30s). The site is static + serverless, so
promoting an old build is safe — no data migrations run.

### Alternative: git revert
If you also want the fix in `main` (so the next deploy doesn't re-ship the bug):

```bash
git checkout main && git pull
git revert <bad-commit-sha>        # or: git checkout <good-sha> -- src api
git push origin main
```

Vercel deploys the revert automatically.

## 3. Common failure modes

| Symptom | Likely cause | Action |
| --- | --- | --- |
| SSG audit fails (61 routes) | A route renders no `<h1>` (soft 404) | Fix the page content; the audit message names the route |
| Waitlist emails not sending | `RESEND_API_KEY` missing/revoked in Vercel env | Add the key in project Settings → Environment Variables, redeploy |
| `waitlist misconfigured` in function logs | `WAITLIST_SIGNING_SECRET` missing | Add it (must match between `waitlist-start` and `waitlist-verify`), redeploy |
| Discord signup pings missing | `DISCORD_WEBHOOK_URL` missing/rotated | Update the webhook URL, redeploy |
| CSP errors in browser console | Header in `vercel.json` blocks a new resource | Add the origin to the relevant `script-src`/`style-src`/`img-src` directive; test with `npm run build && node scripts/serve-dist-with-csp.mjs` |
| Rate-limit 429s during legitimate traffic | `RATE_MAX` too low or per-instance limiter thrashing | Bump the constants in `api/_utils.ts` or move to Vercel KV for a global limiter |

## 4. Secrets inventory

| Env var | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `api/waitlist-start.ts` | Transactional email provider |
| `WAITLIST_SIGNING_SECRET` | `api/_utils.ts` | HMAC token signing — rotate = all outstanding tokens invalid |
| `WAITLIST_FROM_EMAIL` | `api/waitlist-start.ts` | Optional sender override |
| `DISCORD_WEBHOOK_URL` | `api/waitlist-verify.ts` | Signup notifications; failure is swallowed by design |
| `VITE_SENTRY_DSN` | `src/lib/sentry.ts` | Optional; error tracking is a no-op without it |

## 5. Post-deploy smoke checks

1. `https://veilpayapp.com/` — hero renders, coins appear on desktop, fonts applied.
2. Waitlist: enter a Gmail address → code step appears; submit a wrong code → friendly error.
3. `https://veilpayapp.com/docs` and `https://veilpayapp.com/blogs` render content.
4. Function logs show no `waitlist_misconfigured` entries.
