<div align="center">
  <img src="public/logo.webp" alt="Veilpay logo" width="120" />
  <h1>Veilpay</h1>
  <p><strong>Private by Default. Multi-Chain by Design.</strong></p>
  <p>Marketing site, public documentation, blog, and double opt-in waitlist for Veilpay.</p>
  <p>
    <a href="https://veilpayapp.com/">Website</a> ·
    <a href="https://docs.veilpayapp.com/">Documentation</a> ·
    <a href="https://veilpayapp.com/waitlist">Waitlist</a> ·
    <a href="https://veilpayapp.com/blogs">Blog</a>
  </p>
</div>

---

## What this repository contains

This repository contains the Veilpay public launch site:

- Vite + React frontend with prerendered public routes.
- Product, privacy, legal, blog, and waitlist pages.
- Serverless waitlist endpoints under `api/`.
- Markdown documentation sourced from [`veilpay-docs/`](veilpay-docs/README.md) and served canonically at [`docs.veilpayapp.com`](https://docs.veilpayapp.com/).
- Build-time SSR/prerendering for crawlable HTML and generated sitemap output.

This repository is the website surface. It is not the mobile wallet or backend monorepo.

## Public links

| Surface | URL |
| --- | --- |
| Main site | [veilpayapp.com](https://veilpayapp.com/) |
| Documentation | [docs.veilpayapp.com](https://docs.veilpayapp.com/) |
| Waitlist | [veilpayapp.com/waitlist](https://veilpayapp.com/waitlist) |
| Blog | [veilpayapp.com/blogs](https://veilpayapp.com/blogs) |
| Sitemap | [sitemap.xml](https://veilpayapp.com/sitemap.xml) |
| Site index | [index.md](https://veilpayapp.com/index.md) |
| AI-readable summary | [llms.txt](https://veilpayapp.com/llms.txt) |

## Local development

### Requirements

- Node.js compatible with the versions declared by the project dependencies.
- npm.

### Install and run

```bash
npm install
npm run dev
```

The local site is available at `http://localhost:5173`.

The Vite development server also adapts the waitlist API handlers locally. Server-side configuration belongs in the local environment file described by [`.env.example`](.env.example); never commit secret values.

### Quality checks

```bash
npm run lint
npx tsc -b
npm test
npm run docs:check
npm run build
```

`npm run build` creates the client bundle, prerenders the public routes, generates the sitemap, and runs the prerender SEO audit.

## Waitlist

The visible waitlist uses a two-step double opt-in flow:

1. `POST /api/waitlist-start` validates the address and sends a six-digit code through Resend.
2. `POST /api/waitlist-verify` verifies the code and records the verified signup notification.

The browser never receives the Resend credential or the raw signing secret. Configure the required server-side variables in the deployment environment using [`.env.example`](.env.example).

## Documentation

Documentation source files live in [`veilpay-docs/`](veilpay-docs/README.md). The route manifest is generated from [`src/generated/docsManifest.generated.ts`](src/generated/docsManifest.generated.ts).

When adding or renaming an article:

1. Add or update the Markdown file under `veilpay-docs/`.
2. Update [`veilpay-docs/SUMMARY.md`](veilpay-docs/SUMMARY.md) when the navigation or article inventory changes.
3. Regenerate the manifest with `npm run docs:manifest` when routes change.
4. Run `npm run docs:check` and `npm run build`.

The Vercel deployment must have `docs.veilpayapp.com` configured as a custom domain for the docs host to resolve publicly. Middleware maps that host to the `/docs` route tree and keeps canonical documentation URLs on the docs subdomain.

## Repository map

| Path | Purpose |
| --- | --- |
| [`src/`](src/) | React application, pages, components, and client utilities |
| [`api/`](api/) | Vercel waitlist handlers and API tests |
| [`veilpay-docs/`](veilpay-docs/) | Documentation Markdown source |
| [`public/`](public/) | Static SEO assets, robots, sitemap, OpenAPI, and crawler files |
| [`scripts/`](scripts/) | Documentation validation, route generation, prerendering, and SEO audits |
| [`middleware.ts`](middleware.ts) | Docs-subdomain routing and Markdown negotiation |
| [`vercel.json`](vercel.json) | Vercel deployment rewrites and configuration |
| [`docs/runbooks/`](docs/runbooks/) | Deployment and rollback runbooks |

## Deployment notes

Production deployment is configured for Vercel. Before deploying:

- Configure the custom domain `docs.veilpayapp.com` on the same Vercel project.
- Set the server-side waitlist variables in Vercel Project Settings.
- Run `npm run build` and confirm the prerender audit passes.
- Submit `https://veilpayapp.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

Do not commit `.env`, API keys, signing secrets, webhook URLs, or other credentials.

## Status

Veilpay is actively developing its privacy-first payment experience. Product capabilities and network availability can change by release. See the [public site](https://veilpayapp.com/), [documentation](https://docs.veilpayapp.com/), and [current-status documentation](veilpay-docs/getting-started/current-status.md) for the latest published information.
