import { createHmac } from 'crypto';

export type InitiatePaymentParams = {
  tx_ref: string;
  amount: number;
  phone: string;
  network: 'MTN' | 'AIRTEL';
  listing_id: string;
  listing_title: string;
};

export type InitiatePaymentResult =
  | { success: true; tx_ref: string; message: string }
  | { success: false; error: string };

export async function initiateMobileMoney(
  params: InitiatePaymentParams
): Promise<InitiatePaymentResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Flutterwave not configured' };

  const payload = {
    tx_ref: params.tx_ref,
    amount: params.amount,
    currency: 'UGX',
    network: params.network,
    phone_number: params.phone,
    email: 'buyer@safelandsug.com',
    fullname: 'Land Buyer',
    meta: { listing_id: params.listing_id },
  };

  const res = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_uganda', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.status === 'success' || data.status === 'pending') {
    return { success: true, tx_ref: params.tx_ref, message: data.message ?? 'Payment initiated. Check your phone.' };
  }

  return { success: false, error: data.message ?? 'Payment failed' };
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? '';
  const hash = createHmac('sha256', secret).update(body).digest('hex');
  return hash === signature;
}
