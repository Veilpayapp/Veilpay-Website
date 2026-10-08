# Zero-knowledge direction

Veilpay uses zero-knowledge infrastructure for Private XLM and continues to develop privacy-pool components for other networks.

## Current direction

- Groth16-style proof concepts.
- Nullifier-based double-spend prevention.
- Privacy pool patterns.
- A dedicated Stellar Private Payments circuit and native proving path for Private XLM.

## Important boundary

Private XLM availability is documented separately from its audit status. Experimental EVM, Solana, or future-chain scaffolding must not be presented as production-live private payments until the relevant proving, verification, recovery, security, and operational controls are complete.

## Production requirements

- External audit of circuits and contracts.
- Trusted setup or transparent proof system strategy appropriate to the deployed circuit.
- Nullifier correctness.
- Relayer abuse controls.
- Value caps.
- Kill-switch and incident response plan.
- Clear user recovery and note-secret handling.
