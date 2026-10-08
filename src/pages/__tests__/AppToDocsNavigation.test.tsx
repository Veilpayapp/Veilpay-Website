// @vitest-environment jsdom
import '@/test/setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, domAnimation } from 'framer-motion';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import DocsPage from '../DocsPage';
import ErrorBoundary from '@/components/ErrorBoundary';

describe('Real App to Docs transition', () => {
  it('navigates from real App to DocsPage without ErrorBoundary crash', async () => {
    // Mock requestAnimationFrame, scrollTo, matchMedia
    window.scrollTo = vi.fn();
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <MemoryRouter initialEntries={['/']}>
          <HelmetProvider>
            <LazyMotion features={domAnimation}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/*" element={<DocsPage />} />
              </Routes>
            </LazyMotion>
          </HelmetProvider>
        </MemoryRouter>
      </ErrorBoundary>
    );

    // Fast-forward past preloader
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2000));
    });

    const docsLinks = screen.getAllByText(/DOCS/i);
    expect(docsLinks.length).toBeGreaterThan(0);

    // Click Docs link
    await user.click(docsLinks[0]);

    // Check if ErrorBoundary triggered
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
});
