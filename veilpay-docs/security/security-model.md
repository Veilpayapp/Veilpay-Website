# Security model

Veilpay is designed around explicit trust boundaries.

## User device boundary

- Holds wallet mnemonic material in SecureStore.
- Performs transaction signing.
- Displays user confirmation.
- Must not leak private keys or raw signatures to logs or backend APIs.

## Backend boundary

- Proxies infrastructure RPC calls while keeping provider credentials server-side.
- Runs chain-indexing workers and queues.
- Serves fiat-ramp and health endpoints.
- Must not receive user mnemonics, private keys, or raw signatures.

## Chain boundary

The underlying chain is the source of transaction finality. The app tracks confirmation through chain-specific status polling rather than assuming a single client-side screen is authoritative.

## Privacy / ZK boundary

Zero-knowledge pools and circuits introduce additional trust surfaces: deployment integrity, ceremony integrity (SEC-008), independent review (SEC-011), private-state recovery, and incident response. Private XLM is available on Stellar Mainnet in supported releases, but the app still fails closed when required configuration, synchronization, or transaction readiness cannot be verified. Availability is not an assertion that an external audit is complete. See [Ceremony and external audit gates](ceremony-and-audit-gates.md).
