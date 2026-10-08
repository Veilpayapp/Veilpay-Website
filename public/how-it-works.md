# How Veilpay Works: The Privacy Payment Lifecycle

> End-to-end technical overview of stealth address derivation, ephemeral announcements, and zero-knowledge verification in Veilpay.

## 5-Step Payment Lifecycle

```
[Recipient] publishes Stealth Meta-Address (K_spend_pub, K_view_pub)
       │
       ▼
[Sender] generates Ephemeral Key Pair (r, R = r*G)
       │
       ├─► Computes Shared Secret: S = r * K_view_pub
       ├─► Derives Stealth Address: P = K_spend_pub + hash(S)*G
       └─► Broadcasts Payment to P + Ephemeral Tag announcement (R)
       │
       ▼
[Recipient Vault] scans on-chain announcements with private Viewing Key (k_view)
       │
       ├─► Computes Shared Secret: S = k_view * R
       ├─► Checks if P matches K_spend_pub + hash(S)*G
       └─► Recovers One-Time Private Key: p = k_spend + hash(S)
       │
       ▼
[Zero-Knowledge Proofs] verify balance validity without disclosing metadata
```

## Comparison: Veilpay vs Mixers vs Single-Chain Privacy

| Feature | Veilpay | Mixers / Tumblers | Single-Chain Privacy |
| :--- | :--- | :--- | :--- |
| **Custody** | 100% Non-Custodial | Custodial / Shared Pools | Non-Custodial |
| **Chains Supported** | 7+ Blockchains | Single Chain | Single Chain |
| **Regulatory Risk** | Compliant Dual-Key Stealth | High Taint / Sanctions | Network-Gated |
| **KYC Required** | No | No | No |
| **Everyday Usability**| Direct P2P & Donations | Delayed Mixing Rounds | Chain-Specific |

## Resources & Links
- Home: https://veilpayapp.com/
- Documentation: https://docs.veilpayapp.com/
- LLM Reference: https://veilpayapp.com/llms.txt
- OpenAPI Spec: https://veilpayapp.com/openapi.json
