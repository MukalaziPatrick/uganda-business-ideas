# Business Yoo Living Platform — Phase 4: Commerce

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the paid assisted land check flow (UGX 10,000 / 24hr via MTN/Airtel Mobile Money + WhatsApp fallback), the /land/agents directory, and the n8n Payment workflow.

**Architecture:** `/land/check` is a client page that collects phone number and listing reference, initiates a Flutterwave Mobile Money payment, and on success creates a `land_payments` record via a Next.js API route. A Flutterwave webhook confirms payment and triggers the n8n workflow which sends WhatsApp messages to both buyer and agent.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Flutterwave (flw-node for server, Flutterwave inline JS for client), n8n on Railway

**Prerequisite:** Phase 3 complete. Supabase `land_payments` and `land_agents` tables exist.

---

## File Structure

**New files:**
- `lib/land/flutterwave.ts` — server-side Flutterwave payment initiation + webhook verification
- `app/api/land/payment/initiate/route.ts` — POST: create payment link
- `app/api/land/payment/webhook/route.ts` — POST: Flutterwave webhook, confirm payment + trigger n8n
- `app/land/check/page.tsx` — /land/check payment page (client)
- `app/land/check/CheckSuccess.tsx` — success state after payment
- `app/land/agents/page.tsx` — /land/agents directory

---

### Task 1: Flutterwave server library

**Files:**
- Create: `lib/land/flutterwave.ts`

- [ ] **Step 1: Install Flutterwave SDK**

```bash
npm install flutterwave-node-v3
```

- [ ] **Step 2: Add env vars to .env.local**

```bash
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-hash
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxx
```

(Get test keys from dashboard.flutterwave.com → Settings → API)

- [ ] **Step 3: Create lib/land/flutterwave.ts**

```typescript
// lib/land/flutterwave.ts

export type InitiatePaymentParams = {
  tx_ref: string;          // unique, use `land_${listingId}_${Date.now()}`
  amount: number;          // 10000 (UGX)
  phone: string;           // buyer phone e.g. 0772000000
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
    payment_type: params.network === 'MTN' ? 'mobilemoneyrwanda' : 'mobilemoneyuganda',
    // Flutterwave Uganda MM:
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
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return hash === signature;
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add lib/land/flutterwave.ts package.json package-lock.json
git commit -m "feat: add Flutterwave mobile money library for land payments"
```

---

### Task 2: Payment initiation API route

**Files:**
- Create: `app/api/land/payment/initiate/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/land/payment/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { initiateMobileMoney } from '@/lib/land/flutterwave';
import { getLandListingById } from '@/lib/land/queries';

export async function POST(req: NextRequest) {
  const { listing_id, phone, network } = await req.json();

  if (!listing_id || !phone || !network) {
    return NextResponse.json({ error: 'listing_id, phone, and network are required' }, { status: 400 });
  }

  if (!['MTN', 'AIRTEL'].includes(network)) {
    return NextResponse.json({ error: 'network must be MTN or AIRTEL' }, { status: 400 });
  }

  const listing = await getLandListingById(listing_id);
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const tx_ref = `land_${listing_id}_${Date.now()}`;

  // Create pending payment record
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  await supabase.from('land_payments').insert({
    listing_id,
    buyer_phone: phone,
    amount_ugx: 10000,
    payment_method: network.toLowerCase(),
    status: 'pending',
    agent_id: listing.agent_id,
    flutterwave_ref: tx_ref,
  });

  const result = await initiateMobileMoney({
    tx_ref,
    amount: 10000,
    phone,
    network,
    listing_id,
    listing_title: listing.title,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, tx_ref, message: result.message });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/land/payment/initiate/route.ts
git commit -m "feat: add payment initiation API route"
```

---

### Task 3: Flutterwave webhook handler

**Files:**
- Create: `app/api/land/payment/webhook/route.ts`

- [ ] **Step 1: Create the webhook route**

```typescript
// app/api/land/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/land/flutterwave';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('verif-hash') ?? '';
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // Only process successful mobile money charges
  if (event.event !== 'charge.completed' || event.data?.status !== 'successful') {
    return NextResponse.json({ received: true });
  }

  const tx_ref: string = event.data.tx_ref;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  // Update payment record
  const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: payment } = await supabase
    .from('land_payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      access_expires_at: accessExpiresAt,
    })
    .eq('flutterwave_ref', tx_ref)
    .select('*, listing:land_listings(title, id), agent:land_agents(whatsapp, name)')
    .single();

  if (!payment) return NextResponse.json({ received: true });

  // Trigger n8n payment workflow
  if (process.env.N8N_PAYMENT_WEBHOOK) {
    await fetch(process.env.N8N_PAYMENT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': process.env.N8N_LAND_SYNC_SECRET ?? '',
      },
      body: JSON.stringify({
        buyer_phone: payment.buyer_phone,
        agent_whatsapp: payment.agent?.whatsapp,
        agent_name: payment.agent?.name,
        listing_title: payment.listing?.title,
        listing_url: `${process.env.NEXT_PUBLIC_SITE_URL}/land/browse/${payment.listing?.id}`,
        access_expires_at: accessExpiresAt,
      }),
    }).catch(console.error);
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Register webhook URL in Flutterwave dashboard**

Flutterwave dashboard → Settings → Webhooks:
- URL: `https://uganda-business-ideas.vercel.app/api/land/payment/webhook`
- Secret hash: same value as `FLUTTERWAVE_WEBHOOK_SECRET`

- [ ] **Step 3: Commit**

```bash
git add app/api/land/payment/webhook/route.ts
git commit -m "feat: add Flutterwave webhook handler — confirms payment, triggers n8n"
```

---

### Task 4: /land/check payment page

**Files:**
- Create: `app/land/check/CheckSuccess.tsx`
- Create: `app/land/check/page.tsx`

- [ ] **Step 1: Create CheckSuccess.tsx**

```typescript
// app/land/check/CheckSuccess.tsx
'use client';
export function CheckSuccess({ phone, listingTitle }: { phone: string; listingTitle?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Payment received!</h2>
      <p className="text-gray-600 mb-4">
        Your 24-hour assisted check for{listingTitle ? ` "${listingTitle}"` : ' this land'} is now active.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        An agent will contact you on <strong>{phone}</strong> via WhatsApp shortly.
      </p>
      <a
        href={`https://wa.me/256700000000?text=${encodeURIComponent('Hi, I just paid for an assisted land check.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#2d6a4f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#235840] transition-colors"
      >
        📲 Open WhatsApp
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Create app/land/check/page.tsx**

```typescript
// app/land/check/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckSuccess } from './CheckSuccess';
import { Suspense } from 'react';

function CheckForm() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');

  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/land/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, phone, network }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Payment failed. Try again or use WhatsApp.');
      return;
    }

    setMessage(data.message);
    // Show success after a short delay (payment is async — user approves on phone)
    setTimeout(() => setSuccess(true), 3000);
  }

  if (success) return <CheckSuccess phone={phone} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your mobile money number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. 0772000000"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2d6a4f]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
        <div className="grid grid-cols-2 gap-3">
          {(['MTN', 'AIRTEL'] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNetwork(n)}
              className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                network === n
                  ? 'border-[#2d6a4f] bg-[#f0faf4] text-[#2d6a4f]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {n === 'MTN' ? '🟡 MTN Mobile Money' : '🔴 Airtel Money'}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          {message} — check your phone and approve the payment.
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          <a
            href={`https://wa.me/256700000000?text=${encodeURIComponent('Hi, I want to do an assisted land check. My phone is ' + phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] text-sm font-medium hover:bg-[#f0faf4]"
          >
            📲 Pay via WhatsApp instead
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !phone.trim()}
        className="w-full bg-[#2d6a4f] text-white font-semibold py-4 rounded-xl hover:bg-[#235840] transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay UGX 10,000 — Get 24hr Access'}
      </button>
    </form>
  );
}

export default function LandCheckPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        <Link href="/land" className="text-sm text-[#2d6a4f] hover:underline">← Back to Land</Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Assisted Land Check
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            A certified agent will verify this property and contact you within 24 hours.
          </p>

          {/* What's included */}
          <div className="bg-[#f0faf4] rounded-2xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-[#2d6a4f] uppercase tracking-wide mb-2">What you get</p>
            {[
              '✅ Title check via MLHUD portal',
              '📋 Surveyor verification status',
              '🗺 Site visit confirmation',
              '📲 WhatsApp updates from agent',
              '⏰ 24-hour access window',
            ].map(item => (
              <p key={item} className="text-sm text-gray-700">{item}</p>
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl font-bold text-[#2d6a4f]">UGX 10,000</span>
            <span className="text-gray-500 text-sm ml-2">/ 24 hours</span>
          </div>

          <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading...</div>}>
            <CheckForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify locally**

Open `http://localhost:3000/land/check` — shows payment form with MTN/Airtel selector, UGX 10,000 price, and WhatsApp fallback. (Payment will fail in dev without live credentials — that's expected.)

- [ ] **Step 4: Commit**

```bash
git add app/land/check/page.tsx app/land/check/CheckSuccess.tsx
git commit -m "feat: add /land/check payment page with MTN/Airtel and WhatsApp fallback"
```

---

### Task 5: /land/agents directory

**Files:**
- Create: `app/land/agents/page.tsx`
- Modify: `lib/land/queries.ts`

- [ ] **Step 1: Add getLandAgents to queries.ts**

Add to `lib/land/queries.ts`:
```typescript
import type { LandAgent } from '@/lib/supabase/land-types';

export async function getLandAgents(): Promise<LandAgent[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('land_agents')
    .select('*')
    .eq('is_verified', true)
    .order('rating', { ascending: false });
  if (error) return [];
  return (data ?? []) as LandAgent[];
}
```

- [ ] **Step 2: Create app/land/agents/page.tsx**

```typescript
// app/land/agents/page.tsx
import type { Metadata } from 'next';
import { getLandAgents } from '@/lib/land/queries';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Verified Land Agents in Uganda | SafeLands UG',
  description: 'Connect with certified land agents across Uganda for safe, verified property transactions.',
};

export default async function LandAgentsPage() {
  const agents = await getLandAgents();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#2d6a4f] text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Verified Land Agents
          </h1>
          <p className="text-green-100">Certified agents ready to help you buy land safely.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {agents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Agents coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#f0faf4] flex items-center justify-center text-2xl flex-shrink-0">
                    {agent.photo ? (
                      <img src={agent.photo} alt={agent.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : '👤'}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{agent.name}</h2>
                    <p className="text-sm text-gray-500">{agent.district ?? 'Uganda'}</p>
                    {agent.rating && (
                      <p className="text-xs text-yellow-600 mt-0.5">{'⭐'.repeat(Math.round(agent.rating))} {agent.rating}/5</p>
                    )}
                  </div>
                </div>

                {agent.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.bio}</p>
                )}

                {agent.response_time_hrs && (
                  <p className="text-xs text-gray-500 mb-3">⚡ Responds within {agent.response_time_hrs}h</p>
                )}

                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I found you on SafeLands UG and need help with land.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold hover:bg-[#235840] transition-colors"
                  >
                    📲 WhatsApp {agent.name.split(' ')[0]}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify locally**

Open `http://localhost:3000/land/agents` — shows verified agent cards with WhatsApp CTAs. (Will show "Agents coming soon" if no verified agents in DB yet — that's fine.)

- [ ] **Step 4: Commit**

```bash
git add app/land/agents/page.tsx lib/land/queries.ts
git commit -m "feat: add /land/agents verified agents directory"
```

---

### Task 6: n8n — Payment workflow

- [ ] **Step 1: Create workflow "Land — Payment Confirmed" in n8n**

**Node 1 — Webhook (trigger)**
- Path: `/land-payment-confirmed`
- Authentication: Header Auth `x-n8n-secret`

**Node 2 — HTTP Request (WhatsApp to buyer)**
- Send message to `{{ $json.buyer_phone }}`:
  > "✅ Your SafeLands UG assisted check is active for 24 hours. Our agent {{ $json.agent_name }} will contact you shortly. View your listing: {{ $json.listing_url }}"

**Node 3 — HTTP Request (WhatsApp to agent)**
- Send message to `{{ $json.agent_whatsapp }}`:
  > "🔔 New assisted check request. Buyer: {{ $json.buyer_phone }}. Listing: {{ $json.listing_title }} — {{ $json.listing_url }}. Please contact the buyer within 2 hours."

- [ ] **Step 2: Add N8N_PAYMENT_WEBHOOK to Vercel and Railway**

Vercel → Business Yoo → Environment Variables:
- `N8N_PAYMENT_WEBHOOK` = `https://n8n-production-c3c3.up.railway.app/webhook/land-payment-confirmed`

- [ ] **Step 3: Deploy**

```bash
git push
```

- [ ] **Step 4: Smoke test /land/check in production**

Open `https://uganda-business-ideas.vercel.app/land/check` — form loads, MTN/Airtel selector works. (Live payment test requires real Flutterwave production keys and a real Uganda number.)

- [ ] **Step 5: Final commit**

```bash
git commit --allow-empty -m "chore: phase 4 commerce complete — payments, agents, n8n payment workflow live"
```

---

## Phase 4 Complete ✅

After this plan:
- `/land/check` payment page — UGX 10,000, MTN/Airtel Mobile Money, WhatsApp fallback
- Flutterwave webhook confirms payment and creates 24hr access record in Supabase
- n8n sends WhatsApp to buyer and agent on confirmed payment
- `/land/agents` verified agents directory with WhatsApp CTAs

**Next:** [Phase 5 — Living System: content engine, planting alerts, save search, draw-on-map](2026-05-29-phase5-living-system.md)
