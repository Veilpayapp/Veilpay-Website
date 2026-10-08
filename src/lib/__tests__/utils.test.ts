// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { cn, getLenisInstance, isSmoothScrollReady, setLenisInstance, setSmoothScrollReady } from '../utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', null, undefined, false, 0, 'b')).toBe('a b');
  });

  it('lets tailwind-merge resolve conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-white', 'text-black')).toBe('text-black');
  });

  it('keeps non-conflicting utilities', () => {
    // tailwind-merge preserves the class set, though not necessarily the input
    // order — compare as sets.
    const result = cn('p-2', 'm-2', 'bg-black').split(' ').sort();
    expect(result).toEqual(['bg-black', 'm-2', 'p-2']);
  });
});

describe('Lenis instance store', () => {
  beforeEach(() => {
    setLenisInstance(null);
  });

  it('stores and returns the instance on window', () => {
    const fake = { destroy: () => {} } as never;
    setLenisInstance(fake);
    expect(getLenisInstance()).toBe(fake);
  });

  it('returns null after being cleared', () => {
    expect(getLenisInstance()).toBeNull();
  });
});

describe('smooth-scroll ready flag', () => {
  beforeEach(() => {
    setSmoothScrollReady(false);
  });

  it('defaults to false', () => {
    expect(isSmoothScrollReady()).toBe(false);
  });

  it('reflects the set value', () => {
    setSmoothScrollReady(true);
    expect(isSmoothScrollReady()).toBe(true);
  });
});
