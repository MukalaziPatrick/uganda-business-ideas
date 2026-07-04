// lib/rate-limit.ts
//
// Simple in-memory per-key (e.g. per-IP) sliding-window rate limiter.
// Good enough for a single-instance/serverless-with-warm-lambda deployment
// (B2): it stops a script from hammering an endpoint from one IP without
// needing an external store like Upstash. It does NOT share state across
// lambda instances — if that durability is ever needed, swap the Map for
// Upstash Redis behind the same `check()` signature.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Returns whether `key` is allowed to proceed under a `limit` requests per
 * `windowMs` sliding window. Mutates internal state as a side effect.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Test-only: clears all buckets so tests don't leak state between runs. */
export function _resetRateLimitsForTests(): void {
  buckets.clear();
}

/**
 * Best-effort client IP extraction from a Next.js request's headers.
 * Vercel/most proxies set x-forwarded-for as "client, proxy1, proxy2".
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
