# Privacy overview

Veilpay's privacy architecture combines practical wallet privacy features with a longer-term native privacy-chain roadmap.

## Current primitives

- Stealth-address utilities.
- Encrypted notes.
- ZK-oriented proof and privacy-pool scaffolding.
- Stellar SPP testnet integration work.

## Design goals

- Reduce unnecessary public linkability.
- Keep private material on-device.
- Avoid logging or storing secrets.
- Make privacy mode explicit and understandable.
- Gate mainnet privacy features behind audits and operational controls.

## Privacy boundaries

Not every Veilpay payment is private by default. Standard chain transfers remain visible on the underlying network. Stronger privacy modes require additional protocol support and user-visible flow changes.

## In this section

- [Stealth addresses](/docs/privacy/stealth-addresses) — one-time recipient addresses that reduce linkability.
- [Encrypted notes](/docs/privacy/encrypted-notes) — recipient-only memo protection.
- [Zero-knowledge direction](/docs/privacy/zero-knowledge-direction) — proof and privacy-pool scaffolding, and the gates before it is production-live.
- [Stellar Private Payments](/docs/privacy/stellar-spp) — the first native privacy-chain track, testnet-first and mainnet-gated.
- [Privacy-chain roadmap](/docs/privacy/privacy-chain-roadmap) — staged plan across Stellar SPP, Monero, Zcash, and Midnight.
