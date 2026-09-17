# Stellar

Veilpay supports public XLM wallet flows and Private XLM on Stellar Mainnet. Stellar Testnet remains available for testing.

## Public network support

- Stellar Mainnet for public XLM and Private XLM.
- Stellar Testnet for development and integration testing.

## Balance and send flows

Stellar flows use Horizon and Stellar SDK tooling. XLM uses seven decimal places and Stellar-specific account reserve rules.

## Fiat ramps

Stellar assets can be funded and withdrawn through Stellar anchors using the standard interactive deposit and withdrawal flow. See [Fiat ramps](../consumer-app/fiat-ramps.md).

## Private XLM

Private XLM lets a user shield public XLM, send or receive privately, and unshield to a public Stellar address. Veilpay keeps proof generation and private-state recovery on the device and verifies synchronization before enabling private actions.

Start with [Private XLM on Stellar Mainnet](../consumer-app/private-xlm-mainnet.md). Technical readers can also review [Stellar Private Payments](../privacy/stellar-spp.md).
