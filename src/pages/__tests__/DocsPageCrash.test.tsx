// @vitest-environment jsdom
import '@/test/setup';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, domAnimation } from 'framer-motion';
import userEvent from '@testing-library/user-event';
import DocsPage from '../DocsPage';
import ErrorBoundary from '@/components/ErrorBoundary';

function DummyHome() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/docs">Go to Docs</Link>
    </div>
  );
}

describe('DocsPage navigation and error boundary', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders DocsPage without error boundary fallback', () => {
    render(
      <ErrorBoundary>
        <MemoryRouter initialEntries={['/docs']}>
          <HelmetProvider>
            <LazyMotion features={domAnimation}>
              <Routes>
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/*" element={<DocsPage />} />
              </Routes>
            </LazyMotion>
          </HelmetProvider>
        </MemoryRouter>
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('navigates from home to docs page without triggering error boundary', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <MemoryRouter initialEntries={['/']}>
          <HelmetProvider>
            <LazyMotion features={domAnimation}>
              <Routes>
                <Route path="/" element={<DummyHome />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/*" element={<DocsPage />} />
              </Routes>
            </LazyMotion>
          </HelmetProvider>
        </MemoryRouter>
      </ErrorBoundary>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    await user.click(screen.getByText('Go to Docs'));

    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
