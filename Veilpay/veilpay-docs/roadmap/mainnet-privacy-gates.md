# Mainnet privacy gates

Privacy features require stricter gates than standard public-chain transfers.

**Authoritative process IDs:** [SEC-008 / SEC-011 ceremony and audit gates](../security/ceremony-and-audit-gates.md).

## Required gates

- External audit of privacy circuits and contracts (**SEC-011**).
- Trusted setup or proof-system ceremony review where applicable (**SEC-008**).
- Device proof-generation benchmarks.
- Note-secret backup and recovery UX.
- Backend indexing and monitoring.
- Relayer and abuse controls where applicable.
- Per-pool and per-transaction value caps.
- Kill-switch and incident response.
- Compliance and app-store policy review.
- Solana: multi-leaf Merkle (or keep single-leaf deploy gate).

## Private XLM on Stellar Mainnet

Private XLM is generally available in supported Veilpay releases. The controls above continue as release and operating requirements: invalid deployment configuration, incomplete private history, or unavailable native capabilities must stop private actions. Independent ceremony and audit evidence remains required before Veilpay describes a release as externally audited.

## Future chains

Monero, Zcash, and Midnight must each receive separate mainnet gate reviews before user-facing production launch.
