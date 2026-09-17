import { describe, it, expect } from 'vitest';
import {
  ALLOWED_DOMAINS,
  DISPOSABLE_DOMAINS,
  domainOf,
  isDisposableDomain,
  isValidFormat,
  normalizeEmail,
} from '../emailValidation';

describe('normalizeEmail', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeEmail('  User@Gmail.COM  ')).toBe('user@gmail.com');
  });

  it('handles missing/empty input without throwing', () => {
    expect(normalizeEmail(undefined)).toBe('');
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail('')).toBe('');
  });

  it('coerces non-string values', () => {
    expect(normalizeEmail(123)).toBe('123');
  });
});

describe('domainOf', () => {
  it('extracts the domain after @', () => {
    expect(domainOf('user@gmail.com')).toBe('gmail.com');
  });

  it('returns empty string when no @ present', () => {
    expect(domainOf('not-an-email')).toBe('');
  });
});

describe('isValidFormat', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidFormat('user@gmail.com')).toBe(true);
    expect(isValidFormat('first.last+tag@outlook.co.uk')).toBe(true);
    expect(isValidFormat('a_b%c@protonmail.me')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidFormat('')).toBe(false);
    expect(isValidFormat('plainaddress')).toBe(false);
    expect(isValidFormat('user@')).toBe(false);
    expect(isValidFormat('@gmail.com')).toBe(false);
    expect(isValidFormat('user@localhost')).toBe(false);
    expect(isValidFormat('user gmail com')).toBe(false);
    expect(isValidFormat('user@.com')).toBe(false);
  });
});

describe('ALLOWED_DOMAINS', () => {
  it('contains the major consumer providers', () => {
    for (const d of ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'protonmail.com', 'aol.com']) {
      expect(ALLOWED_DOMAINS.has(d)).toBe(true);
    }
  });

  it('rejects custom/unknown domains', () => {
    expect(ALLOWED_DOMAINS.has('customdomain.io')).toBe(false);
    expect(ALLOWED_DOMAINS.has('gmial.com')).toBe(false);
  });
});

describe('isDisposableDomain', () => {
  it('flags known disposable providers', () => {
    expect(isDisposableDomain('mailinator.com')).toBe(true);
    expect(isDisposableDomain('10minutemail.com')).toBe(true);
    expect(isDisposableDomain('guerrillamail.com')).toBe(true);
  });

  it('passes real providers', () => {
    expect(isDisposableDomain('gmail.com')).toBe(false);
    expect(isDisposableDomain('outlook.com')).toBe(false);
  });

  it('is a superset of nothing that the allowlist also accepts', () => {
    // If a domain is in both lists the allowlist check runs first on the
    // client, so a disposable domain that is also "allowed" would slip through
    // to the server. There must be zero overlap.
    for (const d of DISPOSABLE_DOMAINS) {
      expect(ALLOWED_DOMAINS.has(d)).toBe(false);
    }
  });
});
