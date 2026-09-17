# Current status

This page distinguishes generally available, controlled, and planned areas.

## Implemented core architecture

- Expo React Native consumer wallet.
- Express and TypeScript backend services.
- Redis-backed infrastructure and BullMQ jobs.
- Health, readiness, and liveness routes.
- Backend RPC proxy for selected networks.
- Chain indexing and transaction-status detection.
- EVM, Solana, and Stellar consumer-wallet flows.
- Private XLM on Stellar Mainnet.
- Fiat ramp screens and provider integrations.
- WalletConnect v2 integration.
- Sentry hooks for observability.

## Generally available privacy features

- Stealth address utilities.
- Encrypted notes.
- Private XLM on Stellar Mainnet with shield, private send and receive, and unshield flows.
- Native proof generation and on-device private-state recovery for supported releases.
- Explicit setup, synchronization, and ready states so private actions do not run against incomplete state.

## Controlled availability

- Private XLM is available in supported Veilpay releases. A release must include a valid Mainnet deployment configuration and the native private-payment module.
- Private actions pause when account setup, private-history synchronization, or transaction readiness cannot be verified.
- Operational limits, monitoring, incident controls, and independent security work continue after launch.
- Availability is not a claim that every privacy component has completed an external audit.

## Planned privacy-chain tracks

- Monero.
- Zcash.
- Midnight.

These tracks will require separate wallet UX, compliance review, chain-specific indexing, operational limits, and security review before any mainnet exposure.
