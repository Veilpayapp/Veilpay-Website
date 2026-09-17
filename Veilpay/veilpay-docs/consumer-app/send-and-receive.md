# Send and receive

## Receive

Receive flows expose the correct address for the selected chain family. The user can share a QR code or copied address.

Private XLM receive requests use the recipient's private-payment details and the correct Stellar network. Veilpay verifies recipient readiness before a private send and does not silently replace a private payment with a public transfer.

## Send

Send flows validate:

- selected network
- address format
- amount
- balance
- gas or fee expectations
- privacy option compatibility

## Confirmation

Payment confirmation screens present transaction details before signing. The app should make fee risk and network selection explicit.

## Status tracking

After broadcast, the app records local transaction state and polls or fetches status through chain-specific utilities.

For Private XLM, submitted, confirmed, and locally reconciled are distinct states. If confirmation is delayed, users should check the existing operation and balances before retrying. Veilpay does not present a submitted private operation as complete until confirmation and required reconciliation have finished.
