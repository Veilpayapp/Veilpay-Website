// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';

beforeEach(() => {
  document.documentElement.classList.remove('light-mode', 'dark-mode');
  // jsdom lacks requestAnimationFrame unless pretendToBeVisual — guarantee it.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ThemeToggle', () => {
  it('renders a toggle button with an accessible name', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle light and dark mode/i })).toBeInTheDocument();
  });

  it('adds the light-mode class on first click', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
  });

  it('removes the light-mode class on second click', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    // The component syncs its state from a MutationObserver + rAF — flush it
    // before the second click so toggleTheme reads the updated state.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
  });
});
