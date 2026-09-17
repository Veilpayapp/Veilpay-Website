// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadSection from '../DownloadSection';

// The section wires GSAP pins in a layout effect and renders a canvas-based
// GoldenWaves background — neither is relevant to the form logic under test.
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({
      scrollTrigger: {},
      fromTo: vi.fn(),
      to: vi.fn(),
    })),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { register: vi.fn() },
}));
vi.mock('../GoldenWaves', () => ({ default: () => null }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async (url: string) => {
    if (url.includes('/api/waitlist-start')) {
      return { ok: true, status: 200, json: async () => ({ token: 'test-token' }) };
    }
    if (url.includes('/api/waitlist-verify')) {
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function submitEmail(value: string) {
  const input = screen.getByLabelText('Email address');
  fireEvent.change(input, { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: /join waitlist/i }));
}

describe('DownloadSection waitlist form', () => {
  it('renders the email step by default', () => {
    render(<DownloadSection />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument();
  });

  it('does nothing on empty submit', () => {
    render(<DownloadSection />);
    fireEvent.click(screen.getByRole('button', { name: /join waitlist/i }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    render(<DownloadSection />);
    // 'a@b' passes the native type="email" constraint (so the form submits)
    // but fails the app's stricter TLD-required regex — exercising the
    // handleSubmit format check rather than the browser's validation.
    await submitEmail('a@b');
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects disposable domains', async () => {
    render(<DownloadSection />);
    await submitEmail('test@mailinator.com');
    expect(
      await screen.findByText(/Temporary or disposable emails are not allowed/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects custom domains outside the allowlist', async () => {
    render(<DownloadSection />);
    await submitEmail('user@customdomain.io');
    expect(
      await screen.findByText(/Please use an email from a major provider/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls the API and advances to the code step on success', async () => {
    render(<DownloadSection />);
    await submitEmail('user@gmail.com');
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/waitlist-start',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@gmail.com' }),
        }),
      );
    });
    expect(
      await screen.findByText(/Enter the 6-digit code we emailed you/i),
    ).toBeInTheDocument();
  });

  it('verifies the code and shows the success card', async () => {
    render(<DownloadSection />);
    await submitEmail('user@gmail.com');
    await screen.findByText(/Enter the 6-digit code we emailed you/i);

    const codeInput = screen.getByLabelText('6-digit verification code');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText("You're on the waitlist!")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/waitlist-verify',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"code":"123456"'),
      }),
    );
  });

  it('rejects a non-6-digit code client-side', async () => {
    render(<DownloadSection />);
    await submitEmail('user@gmail.com');
    await screen.findByText(/Enter the 6-digit code we emailed you/i);

    fireEvent.change(screen.getByLabelText('6-digit verification code'), { target: { value: '12' } });
    // The input's pattern="\d{6}" would block a native submit, so dispatch the
    // form's submit event directly to exercise handleVerify's guard.
    const form = screen.getByRole('button', { name: /confirm/i }).closest('form');
    fireEvent.submit(form!);

    expect(
      await screen.findByText('Enter the 6-digit code from your email.'),
    ).toBeInTheDocument();
  });
});
