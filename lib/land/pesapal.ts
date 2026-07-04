// lib/land/pesapal.ts — Pesapal API v3 (Uganda mobile money + cards)
const BASE = process.env.PESAPAL_ENV === 'live'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3'

export interface OrderInput {
  amount: number; reference: string; phone: string; description: string; callbackUrl: string
}

export function buildOrderPayload(i: OrderInput) {
  return {
    id: i.reference,
    currency: 'UGX',
    amount: i.amount,
    description: i.description,
    callback_url: i.callbackUrl,
    notification_id: process.env.PESAPAL_IPN_ID ?? '',
    billing_address: { phone_number: i.phone },
  }
}

// B9: Pesapal tokens live ~5 minutes (`expiryDate` in the auth response).
// Cache the token at module level and reuse it until 30s before expiry,
// instead of paying a round-trip to Pesapal's auth endpoint on every call —
// submitOrder and getTransactionStatus both call getToken(), and the IPN
// handler pays this cost in webhook latency.
const TOKEN_SAFETY_MARGIN_MS = 30_000;
const DEFAULT_TOKEN_TTL_MS = 4 * 60_000; // fallback if Pesapal omits expiryDate

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_SAFETY_MARGIN_MS > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${BASE}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  })
  const data = await res.json()
  if (!data.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`)

  const expiresAt = data.expiryDate ? new Date(data.expiryDate).getTime() : Date.now() + DEFAULT_TOKEN_TTL_MS;
  cachedToken = { token: data.token, expiresAt };
  return data.token
}

export async function submitOrder(i: OrderInput): Promise<{ redirect_url: string; order_tracking_id: string }> {
  const token = await getToken()
  const res = await fetch(`${BASE}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(buildOrderPayload(i)),
  })
  const data = await res.json()
  if (!data.redirect_url) throw new Error(`Pesapal order failed: ${JSON.stringify(data)}`)
  return { redirect_url: data.redirect_url, order_tracking_id: data.order_tracking_id }
}

export async function getTransactionStatus(orderTrackingId: string) {
  const token = await getToken()
  const res = await fetch(`${BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  return res.json()
}
