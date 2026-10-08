# Veilpay Private Wallet

> Send, receive, and hold crypto across 7+ blockchains without exposing your wallet address or financial history.

## Why Public Wallets Expose Everything

On transparent networks (Ethereum, Solana, Stellar, Base, Arbitrum), your public wallet address is a permanent ledger identity. Every transaction links your sender, receiver, balance, and transaction history to anyone with a block explorer.

## How Veilpay Solves Public Exposure

Veilpay combines three layers of cryptographic privacy:
1. **EIP-5564 Stealth Addresses**: One-time disposable destination addresses derived via Diffie-Hellman key exchange. Observers cannot link the payment to your meta-address.
2. **Zero-Knowledge Proofs**: Mathematical verification ensuring payments are legitimate without disclosing amounts or identities.
3. **Multi-Chain Native Privacy Assets**: Native integration with Monero (XMR), Zcash (ZEC), Midnight, and Stellar Private Payments.

## How to Receive Private Payments in 3 Steps

1. **Create Your Non-Custodial Vault**: Generate your BIP-39 mnemonic phrase locally on your device. No KYC required.
2. **Share Your Stealth Meta-Address**: Publish your public meta-address (spending + viewing public keys) or donation link.
3. **Automatic Scanning & Discovery**: Your vault uses your viewing key to scan on-chain announcements, discovers payments, and derives private keys locally.

## Frequently Asked Questions (FAQ)

### What is Veilpay?
Veilpay is a non-custodial crypto vault enabling private payments and donations across 7+ blockchains using EIP-5564 stealth addresses and zero-knowledge proofs.

### Does Veilpay require KYC?
No. Creating a vault and receiving payments is completely permissionless and non-custodial. Private keys never leave your device.

### Which chains are supported?
Veilpay supports Stellar, Monero, Zcash, Ethereum, Solana, Base, Arbitrum, Polygon, Optimism, and BSC.

## Resources & Links
- Home: https://veilpayapp.com/
- Documentation: https://docs.veilpayapp.com/
- LLM Reference: https://veilpayapp.com/llms.txt
- OpenAPI Spec: https://veilpayapp.com/openapi.json
