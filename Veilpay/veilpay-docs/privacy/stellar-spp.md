# Stellar Private Payments

Stellar Private Payments (SPP) is the protocol behind Private XLM in Veilpay.

## Status

Private XLM is generally available on Stellar Mainnet in supported Veilpay releases. Stellar Testnet remains available for integration testing. Mainnet releases load a validated public deployment configuration and disable private entry points when the required configuration or native capability is unavailable.

Product availability is distinct from an external-audit claim. Veilpay does not describe SPP as externally audited unless the audit scope, version, findings, and residual risks have been published.

## User-facing model

The app presents SPP as Private XLM. Users can:

- shield public XLM into a private balance;
- send and receive Private XLM;
- unshield to a public Stellar address.

The app separates account setup, private-history synchronization, and transaction readiness. A private balance may be shown from a local cache while it refreshes, but cached data alone cannot authorize a state-changing operation.

See [Private XLM on Stellar Mainnet](../consumer-app/private-xlm-mainnet.md) for the user guide.

## Architecture

```text
Stellar Mainnet
  ├─ private pool contract
  ├─ verifier contract
  ├─ membership contracts
  └─ private receive-key registry

Veilpay consumer app
  ├─ Private XLM Home surface
  ├─ account and synchronization lifecycle
  ├─ encrypted private state
  └─ native module bridge

Native layer
  ├─ proof generation
  ├─ private pool operations
  └─ historical state recovery
```

## Mainnet safeguards

- A release must supply a valid Mainnet deployment manifest and Soroban RPC configuration before the Private XLM surface becomes active.
- Mainnet requires complete private-history synchronization; partial history is not accepted as current state.
- Account setup and synchronization are coordinated so duplicate screen events do not launch competing work.
- Shield, private send, and unshield stop when the app cannot verify current private state.
- User-facing errors omit raw RPC payloads, proof material, private notes, signatures, and recovery data.
- Submitted, confirmed, and reconciled remain separate transaction states.

## Privacy boundaries

Shield and unshield transactions are visible on Stellar Mainnet. Private transfers reduce public transaction detail within the SPP system, but they do not eliminate every network, timing, device, or counterparty correlation risk. Users must protect their device and wallet recovery phrase.

## Security and operations

SPP adds contract, circuit, proving, recovery, and operational trust surfaces. Veilpay uses release controls, value limits, monitoring, incident procedures, and independent review to manage those surfaces. See [Ceremony and external audit gates](../security/ceremony-and-audit-gates.md) for the evidence required before using the word “audited.”
