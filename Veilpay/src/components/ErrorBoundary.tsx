import React from 'react';
import { captureError } from '@/lib/sentry';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level crash boundary. Without this, a single uncaught render error
 * unmounts the whole React tree and leaves a white screen with no signal.
 *
 * The fallback deliberately mirrors the site's black theme (the preloader
 * already paints the page black, so a black screen is continuous with the
 * existing experience) and logs the error for instrumentation — wiring a
 * third-party tracker here later requires no UI change.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
    // Sentry no-ops unless VITE_SENTRY_DSN is configured.
    captureError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-6">
          <img src="/logo.webp" alt="Veilpay" className="w-24 h-24 object-contain" />
          <p className="text-white/50 text-sm font-medium tracking-wide">
            Something went wrong. Please reload the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
