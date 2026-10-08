// @vitest-environment jsdom
import '@/test/setup';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function submitEmail(value: string) {
  const input = screen.getByLabelText('Email address');
  fireEvent.change(input, { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: /join waitlist/i }));
}

async function submitCode(value: string) {
  const input = screen.getByLabelText('Verification code');
  fireEvent.change(input, { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: /verify email/i }));
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

  it('sends a verification code for a supported email provider', async () => {
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
    expect(await screen.findByLabelText('Verification code')).toBeInTheDocument();
  });

  it('verifies the emailed code and shows the success card', async () => {
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
    await submitCode('123456');
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/waitlist-verify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'user@gmail.com',
            code: '123456',
            token: 'test-token',
          }),
        }),
      );
    });
    expect(await screen.findByText("You're on the waitlist!")).toBeInTheDocument();
  });

  it('handles API error response gracefully', async () => {
    fetchMock.mockImplementationOnce(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "That email domain can't receive mail. Please check the spelling." } }),
    }));

    render(<DownloadSection />);
    await submitEmail('typo@gmialll.com');
    const matches = await screen.findAllByText("That email domain can't receive mail. Please check the spelling.");
    expect(matches.length).toBeGreaterThan(0);
  });
});

