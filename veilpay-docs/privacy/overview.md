# Privacy overview

Veilpay’s privacy architecture combines practical wallet privacy features with a longer-term native privacy-chain roadmap.

## Current privacy features

- Stealth-address utilities.
- Encrypted notes.
- ZK-oriented proof and privacy-pool components.
- Private XLM on Stellar Mainnet.

## Design goals

- Reduce unnecessary public linkability.
- Keep private material on-device.
- Avoid logging or storing secrets.
- Make privacy mode explicit and understandable.
- Apply release configuration, synchronization, value limits, monitoring, and incident controls to Mainnet privacy features.

## Privacy boundaries

Not every Veilpay payment is private by default. Standard chain transfers remain visible on the underlying network. Stronger privacy modes require additional protocol support and user-visible flow changes.

## In this section

- [Stealth addresses](stealth-addresses.md) — one-time recipient addresses that reduce linkability.
- [Encrypted notes](encrypted-notes.md) — recipient-only memo protection.
- [Zero-knowledge direction](zero-knowledge.md) — proof and privacy-pool scaffolding, and the gates before it is production-live.
- [Stellar Private Payments](stellar-spp.md) — the protocol behind Private XLM on Stellar Mainnet.
- [Privacy-chain roadmap](privacy-chain-roadmap.md) — staged plan across Stellar SPP, Monero, Zcash, and Midnight.
