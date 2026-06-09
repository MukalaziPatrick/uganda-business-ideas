import { describe, it, expect } from 'vitest'
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
