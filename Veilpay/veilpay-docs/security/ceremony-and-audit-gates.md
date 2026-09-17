# Ceremony and external audit gates (SEC-008 / SEC-011)

Veilpay enforces formal ceremony review and external audit gates before declaring zero-knowledge or cryptographic privacy features production-ready.

## Ceremony requirements (SEC-008)

- Documented multi-party computation (MPC) trusted setup ceremony where applicable.
- Verifiable transcript generation and public beacon contributions.
- Device proof-generation benchmarking across tier-1, tier-2, and tier-3 devices.

## External audit gates (SEC-011)

- Independent security audit of all privacy circuits, smart contracts, and cryptographic primitives.
- Remediation verification of all critical, high, and medium severity findings.
- Public publication of executive audit reports prior to general availability.

## Continuous verification

- Automated regression suites verifying circuit constraints and proof verification boundaries.
- Runtime circuit assertion checks and invariant monitoring in production.
