import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildOrderPayload } from './pesapal'

describe('buildOrderPayload', () => {
  it('builds a Pesapal order with UGX amount and callback', () => {
    const p = buildOrderPayload({ amount: 10000, reference: 'TC-123', phone: '0772000000', description: 'Land Title Check', callbackUrl: 'https://x/cb' })
    expect(p.amount).toBe(10000)
    expect(p.currency).toBe('UGX')
    expect(p.id).toBe('TC-123')
    expect(p.callback_url).toBe('https://x/cb')
  })
})

describe('getToken caching (B9)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T00:00:00Z'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
  })

  it('reuses the cached token across calls instead of hitting the API each time', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ token: 'tok-1', expiryDate: '2026-07-04T00:05:00Z' }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { getToken } = await import('./pesapal')

    const t1 = await getToken()
    const t2 = await getToken()

    expect(t1).toBe('tok-1')
    expect(t2).toBe('tok-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fetches a fresh token once the cached one is within 30s of expiry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ token: 'tok-1', expiryDate: '2026-07-04T00:05:00Z' }) })
      .mockResolvedValueOnce({ json: async () => ({ token: 'tok-2', expiryDate: '2026-07-04T00:10:00Z' }) })
    global.fetch = fetchMock as unknown as typeof fetch

    const { getToken } = await import('./pesapal')

    const t1 = await getToken()
    // Jump to 10s before the cached token's expiry — inside the 30s safety margin.
    vi.setSystemTime(new Date('2026-07-04T00:04:50Z'))
    const t2 = await getToken()

    expect(t1).toBe('tok-1')
    expect(t2).toBe('tok-2')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws and does not cache when Pesapal returns no token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ error: 'bad creds' }) })
    global.fetch = fetchMock as unknown as typeof fetch

    const { getToken } = await import('./pesapal')

    await expect(getToken()).rejects.toThrow(/Pesapal auth failed/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
