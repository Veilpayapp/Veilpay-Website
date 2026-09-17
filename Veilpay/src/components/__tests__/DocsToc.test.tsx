// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocsToc } from '../docs/DocsToc';
import type { TocEntry } from '../../lib/docs/markdownParser';

const TOC: TocEntry[] = [
  { id: 'intro', text: 'Introduction', level: 2 },
  { id: 'details', text: 'Details', level: 3 },
];

describe('DocsToc', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('returns null when there are no entries', () => {
    const { container } = render(<DocsToc toc={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a table of contents with links', () => {
    render(<DocsToc toc={TOC} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Introduction' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Details' })).toBeInTheDocument();
  });

  it('indents level 3 headings appropriately', () => {
    render(<DocsToc toc={TOC} />);
    const detailsLink = screen.getByRole('link', { name: 'Details' });
    const li = detailsLink.closest('li');
    expect(li?.style.paddingLeft).toBe('0.75rem');
  });

  it('renders links without highlight styling', () => {
    window.location.hash = '#details';
    render(<DocsToc toc={TOC} />);
    const introLink = screen.getByRole('link', { name: 'Introduction' });
    const detailsLink = screen.getByRole('link', { name: 'Details' });
    expect(introLink.className).not.toContain('border-amber-400');
    expect(detailsLink.className).not.toContain('border-amber-400');
    expect(introLink.className).not.toContain('bg-white/');
    expect(detailsLink.className).not.toContain('bg-white/');
  });

  it('clicking a link smooth-scrolls to target and updates history hash', () => {
    const introEl = document.createElement('div');
    introEl.id = 'intro';
    document.body.append(introEl);
    const scrollIntoView = vi.fn();
    introEl.scrollIntoView = scrollIntoView;

    render(<DocsToc toc={TOC} />);
    const introLink = screen.getByRole('link', { name: 'Introduction' });

    fireEvent.click(introLink);
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    expect(window.location.hash).toBe('#intro');
    expect(introLink.className).not.toContain('border-amber-400');
  });

  it('does not attach live scroll listeners to window', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(<DocsToc toc={TOC} />);
    const scrollCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === 'scroll');
    expect(scrollCalls.length).toBe(0);
  });
});
