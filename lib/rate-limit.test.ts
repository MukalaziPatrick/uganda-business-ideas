import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIp, _resetRateLimitsForTests } from './rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetRateLimitsForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit within the window', () => {
    const key = 'ip-1';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }
  });

  it('blocks the request once the limit is exceeded within the window', () => {
    const key = 'ip-2';
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 60_000);
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets the count after the window elapses', () => {
    const key = 'ip-3';
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 60_000);
    expect(checkRateLimit(key, 5, 60_000).allowed).toBe(false);

    vi.setSystemTime(new Date('2026-07-04T00:01:01Z')); // > 60s later
    expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
  });

  it('tracks separate keys independently', () => {
    const a = 'ip-a';
    const b = 'ip-b';
    for (let i = 0; i < 5; i++) checkRateLimit(a, 5, 60_000);
    expect(checkRateLimit(a, 5, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 5, 60_000).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('uses the first entry in x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Headers({ 'x-real-ip': '9.9.9.9' });
    expect(getClientIp(headers)).toBe('9.9.9.9');
  });

  it('falls back to "unknown" when neither header is present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('unknown');
  });
});
