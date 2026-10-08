# Privacy levels

Veilpay treats privacy as an explicit protocol dimension.

## Standard

Standard payments use normal chain transfers. They are faster to reason about and easier to index, but inherit the public visibility of the underlying network.

## Enhanced primitives

Veilpay includes privacy-oriented primitives such as stealth addresses and encrypted notes. These help reduce direct linkability and protect memo content, but they are not equivalent to full private settlement by themselves.

## Private XLM

Private XLM is available on Stellar Mainnet in supported Veilpay releases. Users can move public XLM into the private balance, send and receive privately, and return funds to a public Stellar address. Veilpay requires current private state before enabling a private action and pauses the action when synchronization or account readiness cannot be verified.

## Roadmap privacy chains

Monero, Zcash, and Midnight are planned privacy-chain tracks. Each will require its own integration, security model, indexing strategy, UX, compliance review, and production-readiness gates.
