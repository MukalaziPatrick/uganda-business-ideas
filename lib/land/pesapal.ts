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

export async function getToken(): Promise<string> {
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
