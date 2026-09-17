// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Preloader from '../Preloader';

describe('Preloader', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the branded loader nodes with .v-boot', () => {
    render(<Preloader onComplete={() => {}} />);
    expect(document.querySelectorAll('.v-boot i')).toHaveLength(5);
    expect(document.querySelector('.v-boot')).toBeInTheDocument();
  });

  it('calls onComplete when readiness conditions are satisfied', async () => {
    const onComplete = vi.fn();
    render(<Preloader onComplete={onComplete} />);
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onComplete when unmounted early', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { unmount } = render(<Preloader onComplete={onComplete} />);
    unmount();
    vi.advanceTimersByTime(3000);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
