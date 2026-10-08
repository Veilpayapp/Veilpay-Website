# Indexer and jobs

Veilpay uses background workers for tasks that should not block API request/response paths.

## Job categories

- Chain polling and transaction detection.
- Retry and dead-letter handling for failed background jobs.
- Chain-specific indexing and recovery support for private-payment state.

## BullMQ

BullMQ is used for queue-based job execution. Redis provides the backing store for queues, retry state, and coordination.

## Chain indexer

The indexer package and backend chain-indexing jobs monitor networks for transaction status. Supported chain behavior differs by network, so integration code is split by chain family.

## Private XLM state recovery

Private XLM uses the native client and configured Stellar infrastructure to recover private state. The app requires a verifiable, complete synchronization result before enabling state-changing private actions. Backend or archive indexing can improve recovery performance and provider resilience, but the UI must not treat an incomplete index as a current balance.
