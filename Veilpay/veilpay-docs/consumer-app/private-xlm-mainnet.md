# Private XLM on Stellar Mainnet

**Availability: Generally available in supported Veilpay releases.**

Private XLM adds private-payment flows to Veilpay's Stellar Mainnet wallet. Users can move XLM into a private balance, send and receive Private XLM, and move funds back to a public Stellar address without leaving the Veilpay app.

## What you can do

- **Shield XLM** — move public XLM into the Private XLM balance.
- **Send privately** — send Private XLM to a recipient who is ready to receive it.
- **Receive privately** — share a Private XLM receive request for the correct Stellar network.
- **Unshield XLM** — return Private XLM to your public Stellar address or another valid public destination.

Private XLM is a private balance backed by Stellar contracts. It is not a separate public token, and it should not be sent to a token contract or exchange deposit address.

## Before the first private payment

1. Use a supported Veilpay release and select Stellar Mainnet.
2. Fund the Stellar account with enough XLM for the account reserve, the amount you want to move, and network fees.
3. Select Private XLM from the privacy section.
4. Complete the on-device private-account setup when prompted.
5. Keep Veilpay open while it synchronizes private history.

The status shown on Home separates account setup from private-history synchronization. “Ready” means both have completed for the active account and deployment. A cached balance may remain visible during a refresh, but Veilpay will not use stale state to authorize a private action.

## Shield XLM

Shielding moves XLM from the public Stellar balance into the Private XLM balance.

1. Open Private XLM and choose **Shield**.
2. Enter an amount within the limit shown by the app.
3. Review the amount, destination mode, and XLM network fee.
4. Approve the final action with the device authentication requested by Veilpay.
5. Wait for confirmation and balance reconciliation.

Leave enough public XLM for Stellar's account reserve and the network fee. The review screen shows the applicable limit and prevents amounts the active account cannot safely cover.

## Send Private XLM

1. Choose **Send privately**.
2. Scan or open the recipient's Private XLM request.
3. Confirm that the request is for Stellar Mainnet.
4. Enter the amount and review the payment.
5. Approve the final action and wait for confirmation.

The recipient must be ready for Private XLM. If Veilpay cannot verify that readiness, the private send stops before proof generation or submission. Veilpay does not silently fall back to a public Stellar payment.

## Receive Private XLM

Use **Receive privately** to create a Private XLM request. Share the generated QR code or link with the sender. A private receive request is network-specific; a Mainnet request must be used with Stellar Mainnet.

Private receipts can take longer to appear when the app needs to refresh private history. The Home screen reports whether the balance is updating, ready, or needs attention.

## Unshield XLM

Unshielding moves value from the Private XLM balance to a public Stellar address.

1. Choose **Unshield**.
2. Use your active public Stellar address or enter another valid destination.
3. Review the amount, public destination, and fee information.
4. Approve the final action and wait for confirmation.

The public destination and the resulting Stellar transaction are visible on the public network.

## Transaction and privacy boundaries

- Shield and unshield transactions interact with Stellar Mainnet and remain publicly observable.
- A private transfer is handled through Veilpay's Private XLM system, but no wallet can guarantee anonymity against every form of network, timing, device, or counterparty analysis.
- Veilpay keeps signing and private-payment material on the device. The backend does not receive the wallet recovery phrase or private keys.
- Protect the wallet recovery phrase and device access. Anyone with the recovery material may be able to control the wallet.
- Do not share diagnostic files, raw signatures, private notes, proof material, or recovery data with support staff or other users.

## If synchronization cannot finish

Private actions pause when Veilpay cannot verify current private state. The public Stellar wallet remains available.

- Check the network connection and retry the private sync.
- Keep the app open long enough to finish a first or historical synchronization.
- Confirm that the Stellar account is funded.
- Install the current supported Veilpay release if the app reports that a native update is required.
- If an operation has already been submitted, do not submit it again blindly. Check its status and balances first.

Veilpay fails closed when required Mainnet deployment data, private history, or transaction readiness cannot be verified. This protects funds and avoids presenting an incomplete private balance as current.

## Related pages

- [Stellar](../chains/stellar.md)
- [Balances and assets](balances-and-assets.md)
- [Send and receive](send-and-receive.md)
- [Stellar Private Payments](../privacy/stellar-spp.md)
- [Security model](../security/security-model.md)
