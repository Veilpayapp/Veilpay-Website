// Sentry error tracking — initialized only when VITE_SENTRY_DSN is set.
//
// The SDK is dynamically imported so the main bundle stays free of Sentry's
// weight when the project is not configured for error tracking (the default).
// All helpers here are safe no-ops in that case, so ErrorBoundary and friends
// can call them unconditionally.

type SentryModule = typeof import('@sentry/react');

let sentryInstance: SentryModule | null = null;

export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || sentryInstance) return;

  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? 'production' : 'development',
    tracesSampleRate: 0.1,
    // Sentry's default handlers already capture window errors + unhandled
    // rejections once init() runs.
  });
  sentryInstance = Sentry;
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryInstance) return;
  sentryInstance.captureException(error, { extra: context });
}

export function isSentryEnabled(): boolean {
  return sentryInstance !== null;
}
