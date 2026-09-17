# Veilpay — Site Index

> **Canonical domain:** https://veilpayapp.com
> **Tagline:** Private by Default. Multi-Chain by Design.
> **Language:** English (en)
> **Site type:** Web application (React 19 + Vite SPA, prerendered with Puppeteer for crawlers)
> **Category:** Cryptocurrency wallet · Decentralized finance · Privacy infrastructure
> **Founded:** 2025

This file is a human- and crawler-readable master index of every public page,
content section, and documentation article on the Veilpay website. It is published
at `https://veilpayapp.com/index.md` and is intended to give Googlebot, Bingbot,
DuckDuckBot, and other crawlers (as well as AI assistants that follow the
[`llms.txt`](https://llmstxt.org) convention) a single, complete map of the site.

For machine-readable crawl directives see:

- `https://veilpayapp.com/robots.txt` — User-agent rules + sitemap + llms.txt pointer
- `https://veilpayapp.com/sitemap.xml` — XML sitemap with lastmod / changefreq / priority
- `https://veilpayapp.com/llms.txt` — AI-assistant summary (companion to this file)

---

## 1. What Veilpay is

Veilpay is a **non-custodial multi-chain crypto vault** that makes private
payments practical for everyday use. It combines:

- **EIP-5564 stealth addresses** — a unique one-time address is generated for
  every incoming payment, breaking on-chain linkability across EVM, Solana, and
  Stellar.
- **Zero-knowledge proofs** (zk-SNARKs on Zcash, Bulletproofs on Monero-style
  chains, ZK-rollup integration on L2s) — verify a payment is valid without
  revealing sender, receiver, or amount.
- **Native privacy assets** — Monero (XMR), Zcash (ZEC), Midnight (roadmap),
  and Stellar Private Payments (SPP) — alongside stealth-addressed transparent
  chains (Ethereum, Solana, Stellar, Base, Arbitrum, Polygon, Optimism, BSC).
- **Fiat on/off-ramps** via Transak (and Stellar anchors / Onramp.money /
  MoonPay where applicable) so users can move between local currency and the
  private ecosystem without a separate exchange.
- **Self-custody by design** — private keys are generated on the user's device
  using BIP-39 mnemonics and Ed25519 / secp256k1 curves and never transmitted
  to Veilpay servers. The backend never receives signing material.
- **No KYC required** to create a vault or receive payments. Third-party
  identity checks may apply only to the fiat on/off-ramp partner.

Veilpay lets users **accept anonymous crypto donations** without exposing their
public wallet address, send and receive across 7+ blockchains from one vault,
and choose a privacy tier per payment (stealth-only, ZK-wrapped, or fully native
privacy). The web app at `veilpayapp.com` is the marketing and documentation
surface for the consumer wallet (built with Expo / React Native).

---

## 2. Public URL inventory

| Route | Page / Section | Priority | Change frequency |
| --- | --- | --- | --- |
| `/` | Home — hero, feature bento grid, waitlist, footer | 1.0 | weekly |
| `/waitlist` | Waitlist landing (`/#waitlist` anchor) | 0.9 | monthly |
| `/private-wallet` | Long-form SEO page: private crypto wallet, stealth addresses, ZK proofs, FAQs | 0.9 | weekly |
| `/how-it-works` | Technical deep-dive: stealth addresses & ZK proofs (HowTo, TechArticle) | 0.9 | weekly |
| `/features` | Features section (`/#features` anchor) | 0.9 | monthly |
| `/docs` | Documentation index | 0.8 | weekly |
| `/docs/*` | Individual docs articles (markdown-rendered) | 0.8 | weekly |
| `/blogs` | Blog index (aggregated from Blogger) | 0.7 | weekly |
| `/blog/:slug` | Individual blog post | 0.7 | weekly |
| `/about` | About Us | 0.9 | monthly |
| `/contact` | Contact (`/#footer` anchor) | 0.9 | monthly |
| `/privacy` | Privacy Policy | 0.4 | yearly |
| `/terms` | Terms of Service | 0.4 | yearly |
| `/api/*` | Serverless endpoints (waitlist double opt-in) — **disallowed** in robots.txt | — | — |

### In-page section anchors on the home page

- `#features` — Bento Grid (ZK Proofs, Stealth Addresses, Privacy Tokens)
- `#download` / `#waitlist` — double opt-in waitlist form (email → 6-digit code)
- `#footer` — company links column, community links, social icons

---

## 3. Page-by-page content summary

### Home (`/`)

- **Hero:** "Private by default. Multi-chain by design." with iPhone mockup and
  cinematic GSAP scroll sequence.
- **Intro reveal:** "Introducing VEILPAY" — phone rises and shrinks past the
  bento grid.
- **Feature bento grid:** three cards —
  1. **ZK Proofs** — prove a payment is valid without revealing sender,
     receiver, or amount.
  2. **Stealth Addresses** — EIP-5564 dual-key stealth addresses generate a
     fresh one-time address per transaction across Stellar, EVM, and Solana.
  3. **Privacy Tokens** — Stellar privacy payments, Monero, Zcash, Midnight
     alongside Ethereum, Solana, Base, Arbitrum, Polygon — one vault, full
     privacy.
- **Massive text scroll:** "SECURE & PRIVATE" scroll-reveal.
- **Waitlist section:** email + 6-digit code verification (double opt-in), with
  social links to X, Discord, Telegram, Instagram, LinkedIn, Medium, and Blog.
- **Footer:** "Privacy is the new standard." + link columns (Platform, Company,
  Community) + wordmark + copyright.

The home page emits four connected JSON-LD entities in `src/App.tsx`:
`SoftwareApplication`, `Organization`, `Product`, and `WebSite` (with a
`SearchAction` pointing at `/docs?q={search_term_string}`). Aggregate rating is
4.9 / 5 across 150 reviews (declared for rich-result eligibility).

### Private Wallet (`/private-wallet`)

Long-form product page covering:

- Why public wallets expose everything vs. how stealth addresses solve it.
- A 3-step "How Veilpay's privacy wallet works" diagram (Key Generation →
  Stealth Address Per Payment → ZK Proof Verification).
- **Supported privacy chains** — Stellar (XLM, SEP-0041), Monero (XMR),
  Zcash (ZEC, Sapling/Orchard), Ethereum (ETH), Solana (SOL), Base, Arbitrum.
- **6-item FAQ** (rich-result eligible via `FAQPage` JSON-LD): what is a
  private crypto wallet, stealth vs. regular addresses, custodial vs.
  non-custodial, KYC requirements, supported chains, what ZK proofs are.
- BreadcrumbList JSON-LD plus internal-link nav to Home / How It Works / Docs /
  Blog / About.

### How It Works (`/how-it-works`)

Technical article deep-diving into the privacy payment lifecycle:

1. **Key Generation** — BIP-39 mnemonics, Ed25519 / secp256k1 spending +
   viewing keys kept on device.
2. **Stealth Meta-Address Publication** — compressed public key pair that
   derives unlimited one-time addresses for the recipient.
3. **Payment Derivation** — Diffie-Hellman ephemeral key exchange between
   sender's ephemeral key and the recipient's stealth meta-address.
4. **Scanning & Discovery** — lightweight per-announcement trial computation
   using the viewing key.
5. **Zero-Knowledge Verification** — zk-SNARKs / zk-STARKs prove validity
   without exposing amounts or participants.

Includes a "What is EIP-5564?" primer (authored by Vitalik Buterin et al.) and
a comparison table (Veilpay vs. mixers/tumblers vs. single-chain privacy) across
multi-chain, non-custodial, stealth addresses, ZK proofs, no-KYC, and fiat
on-ramps. Emits `HowTo` + `TechArticle` + `BreadcrumbList` JSON-LD.

### Documentation (`/docs` and `/docs/*`)

Rendered from markdown in `veilpay-docs/` via `DocsPage` (sticky sidebar + table
of contents + heading anchors). The documentation is served canonically from the subdomain `docs.veilpayapp.com`. Full article inventory in
[§4 below](#4-documentation-article-inventory).

### Blog (`/blogs` and `/blog/:slug`)

Aggregated from `https://veilpay.blogspot.com` via JSONP in `src/lib/blog.ts`.
Blog index emits `CollectionPage` + `BreadcrumbList` JSON-LD. Individual posts
are rendered at `/blog/:slug` through `BlogPostPage`.

### Legal pages (`/about`, `/privacy`, `/terms`)

Markdown-rendered through `LegalPage` from the repo-root files:

- `about-us.md` — mission, what Veilpay does, why privacy matters, who Veilpay
  is for.
- `privacy-policy.md` — non-custodial data model, what providers collect
  (account, wallet metadata, device data, fiat ramp data via Transak), cookie
  usage, and user rights.
- `terms-of-service.md` — acceptance, eligibility, acceptable use, supported
  chains, and the explicit disclaimer that Veilpay cannot recover lost seed
  phrases or reverse transactions.

Each legal page emits a `BreadcrumbList` plus canonical + OpenGraph + Twitter
metadata.

---

## 4. Documentation article inventory

Sourced from `veilpay-docs/SUMMARY.md`. Every article is served under
`/docs/<category>/<slug>` and is markdown-rendered for crawlers.

### Start Here
- [Overview](https://docs.veilpayapp.com/) — `veilpay-docs/README.md`
- [What is Veilpay?](https://docs.veilpayapp.com/start-here/what-is-veilpay) — product surfaces & differentiators
- [Core concepts](https://docs.veilpayapp.com/start-here/core-concepts) — wallet, payment, privacy level, chain key, RPC proxy
- [Quickstart](https://docs.veilpayapp.com/start-here/quickstart)
- [Current status](https://docs.veilpayapp.com/start-here/current-status)

### Protocol
- [How Veilpay works](https://docs.veilpayapp.com/protocol/how-veilpay-works)
- [Payment lifecycle](https://docs.veilpayapp.com/protocol/payment-lifecycle)
- [Privacy levels](https://docs.veilpayapp.com/protocol/privacy-levels) — standard, enhanced primitives, private Stellar track, roadmap privacy chains

### Architecture
- [System architecture](https://docs.veilpayapp.com/architecture/system-architecture)
- [Consumer app architecture](https://docs.veilpayapp.com/architecture/consumer-app)
- [Backend architecture](https://docs.veilpayapp.com/architecture/backend)
- [Indexer and jobs](https://docs.veilpayapp.com/architecture/indexer-and-jobs)
- [Infrastructure](https://docs.veilpayapp.com/architecture/infrastructure)

### Consumer App
- [Wallet model](https://docs.veilpayapp.com/consumer-app/wallet-model)
- [Send and receive](https://docs.veilpayapp.com/consumer-app/send-and-receive)
- [Balances and assets](https://docs.veilpayapp.com/consumer-app/balances-and-assets)
- [WalletConnect](https://docs.veilpayapp.com/consumer-app/walletconnect)
- [Fiat ramps](https://docs.veilpayapp.com/consumer-app/fiat-ramps)

### Chains
- [Supported networks](https://docs.veilpayapp.com/chains/supported-networks) — Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Solana, Stellar; Sepolia / Solana devnet / Stellar testnet
- [EVM networks](https://docs.veilpayapp.com/chains/evm-networks)
- [Solana](https://docs.veilpayapp.com/chains/solana)
- [Stellar](https://docs.veilpayapp.com/chains/stellar)

### Privacy
- [Privacy overview](https://docs.veilpayapp.com/privacy/overview)
- [Stealth addresses](https://docs.veilpayapp.com/privacy/stealth-addresses) — ECDH shared secret derivation, per-payment ephemeral keys
- [Encrypted notes](https://docs.veilpayapp.com/privacy/encrypted-notes)
- [Zero-knowledge direction](https://docs.veilpayapp.com/privacy/zero-knowledge)
- [Stellar Private Payments](https://docs.veilpayapp.com/privacy/stellar-spp) — the first native privacy-chain track (testnet-gated)
- [Privacy-chain roadmap](https://docs.veilpayapp.com/privacy/privacy-chain-roadmap) — Monero, Zcash, Midnight

### Security
- [Security model](https://docs.veilpayapp.com/security/security-model)
- [Secrets and keys](https://docs.veilpayapp.com/security/secrets-and-keys)
- [API hardening](https://docs.veilpayapp.com/security/api-hardening)
- [Production checklist](https://docs.veilpayapp.com/security/production-checklist)

### Roadmap
- [Product roadmap](https://docs.veilpayapp.com/roadmap/product-roadmap)
- [Mainnet privacy gates](https://docs.veilpayapp.com/roadmap/mainnet-privacy-gates)

### Reference
- [Environment variables](https://docs.veilpayapp.com/reference/environment-variables)
- [API route reference](https://docs.veilpayapp.com/reference/api-routes)
- [Glossary](https://docs.veilpayapp.com/reference/glossary)

---

## 5. Supported chains and assets (SEO context)

### Native privacy assets
- **Monero (XMR)** — ring signatures + stealth addresses, mandatory privacy.
- **Zcash (ZEC)** — zk-SNARKs (Sapling / Orchard) fully shielded transactions.
- **Midnight** — planned privacy-chain track (roadmap).
- **Stellar Private Payments (SPP)** — SEP-0041 confidential assets, memo-free
  stealth addresses; first native privacy-chain track, testnet-gated.

### Transparent chains with stealth addressing
- Ethereum (ETH) — EIP-5564 stealth addresses on the base layer.
- Solana (SOL) — high-speed stealth addressing, sub-second finality.
- Stellar (XLM) — SEP-0041 confidential assets.
- Base — L2 stealth addresses on Coinbase's Ethereum rollup.
- Arbitrum — private payments on Ethereum's optimistic rollup.
- Polygon — EVM stealth addressing.
- Optimism — EVM stealth addressing.
- BSC — EVM stealth addressing.

### Test networks
- Sepolia (EVM), Solana devnet, Stellar testnet — testing only.

---

## 6. Target keywords

- **Primary:** privacy wallet, private crypto wallet, stealth addresses,
  EIP-5564, non-custodial wallet, anonymous crypto donations, crypto vault.
- **Secondary:** multi-chain wallet, zero-knowledge proofs, ZK proofs, Monero
  XMR, Zcash ZEC, Stellar XLM private payments, Midnight, Solana privacy,
  Ethereum privacy, Base L2 privacy, Arbitrum private payments, crypto
  donations, Web3 payments, self-custody wallet, no KYC crypto wallet, fiat
  on-ramp crypto.
- **Long tail:** accept crypto donations without exposing wallet address,
  EIP-5564 stealth address tutorial, how stealth addresses work, how
  zero-knowledge proofs verify payments, private Stellar SEP-0041 payments,
  multi-chain privacy wallet no KYC, non-custodial multi-chain vault.

---

## 7. Structured data (JSON-LD) summary

Per-page schema.org entities emitted alongside the prerendered HTML:

| Page | Entities |
| --- | --- |
| `/` | `SoftwareApplication`, `Organization`, `Product`, `WebSite` (SearchAction) |
| `/private-wallet` | `WebPage`, `FAQPage` (6 Q&As), `BreadcrumbList` |
| `/how-it-works` | `HowTo` (5 steps), `TechArticle`, `BreadcrumbList` |
| `/blogs` | `CollectionPage`, `BreadcrumbList` |
| `/about`, `/privacy`, `/terms` | `BreadcrumbList` + canonical/OG/Twitter metadata |

Home page `SoftwareApplication` declares `applicationCategory FinanceApplication`,
`operatingSystem Web/Android/iOS`, a 6-item `featureList`, and an
`aggregateRating` of 4.9 / 5 across 150 reviews. `Product` carries an `Offer`
(price 0, `PreOrder` availability), `Brand`, `MerchantReturnPolicy`, and
`OfferShippingDetails`. `WebSite` exposes a `SearchAction` targeting
`/docs?q={search_term_string}` so the documentation is findable from rich
search results.

All rich results are eligible for Google's product, FAQ, how-to, breadcrumb, and
sitelinks searchbox enhancements.

---

## 8. Crawl & technical notes

- **Prerendering:** every public route is rendered with Puppeteer at build time
  (`scripts/prerender.ts`, triggered by `npm run postbuild`) so crawlers receive
  fully-rendered HTML — real headings, text, structured data, and links — even on
  first fetch without executing JavaScript. Routes prerendered: `/`,
  `/waitlist`, `/private-wallet`, `/how-it-works`, `/features`, `/contact`,
  `/about`, `/privacy`, `/terms`, `/blogs`, `/docs`.
- **`<noscript>` fallback** on the home page renders a semantic H1/H2 outline
  with internal links to `/private-wallet`, `/how-it-works`, `/docs`, `/blogs`,
  `/about`, `/privacy`, `/terms`.
- **Robots meta** allows `index, follow, max-image-preview:large,
  max-snippet:-1, max-video-preview:-1` for both `robots` and `googlebot`.
- **Fonts** preload with `display=swap` to keep CLS at 0; the hero phone mockup
  (`/MOCKUP2.webp`) is preloaded with `fetchpriority=high` as the LCP candidate.
- **Images** are served in WebP where possible with PNG fallbacks.
- **Theme color** is `#000000` (dark, brand-native); brand accent is `#F2C572`
  (amber/gold) used for CTAs and highlight text.
- **Documentation subdomain:** `docs.veilpayapp.com` is the canonical domain for all docs pages.
- **API gate:** all `/api/*` endpoints (waitlist double opt-in) are disallowed
  in `robots.txt` and are not part of the public content surface.

---

## 9. Internal linking strategy

Every long-form page ends with an internal-link nav block (Home, Private Wallet,
How It Works, Documentation, Blog, About). The `GlassNavbar` (top) and
`BrutalistFooter` (bottom) duplicate these links site-wide, keeping crawl depth
≤ 2 from the home page. `BreadcrumbList` JSON-LD on sub-pages reinforces the
hierarchy for rich results.

---

## 10. Official sameAs profiles

- Discord: https://discord.veilpayapp.com
- X (Twitter): https://x.veilpayapp.com
- Telegram: https://telegram.veilpayapp.com
- Instagram: https://instagram.veilpayapp.com
- LinkedIn: https://linkedin.veilpayapp.com
- Medium: https://veilpay.medium.com
- Blog feed (Blogger): https://veilpay.blogspot.com

---

## 11. Files of record on the site

| File | Purpose | URL |
| --- | --- | --- |
| `public/index.md` (this file) | Comprehensive site index for crawlers & AI | https://veilpayapp.com/index.md |
| `public/llms.txt` | AI-assistant summary (companion to this index) | https://veilpayapp.com/llms.txt |
| `public/robots.txt` | Crawl directives, sitemap pointer, llms-txt pointer | https://veilpayapp.com/robots.txt |
| `public/sitemap.xml` | XML sitemap (lastmod / changefreq / priority) | https://veilpayapp.com/sitemap.xml |
| `public/og.jpg`, `public/logo.webp`, `public/MOCKUP2.webp` | OpenGraph, logo, LCP hero image | served from web root |
| `about-us.md`, `privacy-policy.md`, `terms-of-service.md` | Legal source markdown rendered at `/about`, `/privacy`, `/terms` | repo root (not served directly) |
| `veilpay-docs/**/*.md` | Documentation source rendered under `/docs/*` | rendered through `DocsPage` |

---

## 12. Submission & verification

- Submit `https://veilpayapp.com/sitemap.xml`, `https://veilpayapp.com/index.md`,
  and `https://veilpayapp.com/llms.txt` in Google Search Console and Bing
  Webmaster Tools.
- Google Search Console verification file: `public/google0f3f0b59a8fd2cdf.html`.
- Keep `public/sitemap.xml` `<lastmod>` dates in sync on each deploy.
- Consider adding static prerender targets for individual `/docs/*` and
  `/blog/*` slugs in `scripts/prerender.ts` once their manifests stabilize.

---

© 2026 Veilpay. All rights reserved.
Brand spelling: **Veilpay**. Canonical domain: **https://veilpayapp.com**.
