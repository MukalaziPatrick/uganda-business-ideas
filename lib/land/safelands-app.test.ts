import { describe, it, expect } from 'vitest';
import { getSafeLandsAppUrl } from './safelands-app';

describe('getSafeLandsAppUrl', () => {
  it('returns null when unset or blank', () => {
    expect(getSafeLandsAppUrl(undefined)).toBeNull();
    expect(getSafeLandsAppUrl('')).toBeNull();
    expect(getSafeLandsAppUrl('   ')).toBeNull();
  });

  it('returns null for non-https or malformed values', () => {
    expect(getSafeLandsAppUrl('http://safelands.example.com')).toBeNull();
    expect(getSafeLandsAppUrl('not a url')).toBeNull();
    expect(getSafeLandsAppUrl('ftp://x.com')).toBeNull();
  });

  it('returns the normalized url for a valid https value', () => {
    expect(getSafeLandsAppUrl('https://safelands.example.com')).toBe('https://safelands.example.com/');
    expect(getSafeLandsAppUrl('  https://safelands.example.com/app  ')).toBe('https://safelands.example.com/app');
  });
});
