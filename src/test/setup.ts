// Vitest global setup: extends `expect` with jest-dom matchers
// (toBeInTheDocument, toHaveTextContent, etc.) for component tests.
import '@testing-library/jest-dom/vitest';

// jsdom does not implement window.matchMedia. Components across the app use it
// for device-tier detection and reduced-motion checks, so stub it with a
// default "no match" response. Tests may override the property per case.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement requestAnimationFrame either; ThemeToggle and other
// components schedule work on it.
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
  window.cancelAnimationFrame = (handle: number) => clearTimeout(handle);
}

// jsdom does not implement Element.prototype.scrollIntoView or window.scrollTo
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

