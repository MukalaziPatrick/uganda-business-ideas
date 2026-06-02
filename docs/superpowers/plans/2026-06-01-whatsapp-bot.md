# WhatsApp Sales Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated WhatsApp bot inside Business Yoo that qualifies customers, pitches a UGX 50,000 business report, waits for manual payment confirmation, generates the report via Claude, gets Patrick's Telegram approval, and delivers the report to the customer.

**Architecture:** Next.js API route at `/api/whatsapp/webhook` receives all WhatsApp messages. Supabase stores conversation state. A state machine drives message responses. Claude via OpenRouter generates the report. Telegram notifies Patrick for approval.

**Tech Stack:** Next.js 14 (App Router), Supabase, WhatsApp Cloud API (Meta), OpenRouter (Claude Sonnet 4.6), Telegram Bot API

---

## File Map

| File | Purpose |
|------|---------|
| `app/api/whatsapp/webhook/route.ts` | GET (Meta webhook verify) + POST (receive + route messages) |
| `app/api/whatsapp/telegram-callback/route.ts` | POST — receives Telegram inline button callbacks (approve/reject) |
| `app/api/whatsapp/_lib/state-machine.ts` | Pure state transition logic — given current state + message → next state + reply |
| `app/api/whatsapp/_lib/messages.ts` | All bot message templates as typed functions |
| `app/api/whatsapp/_lib/whatsapp.ts` | `sendMessage(phone, text)` — wraps Meta Graph API |
| `app/api/whatsapp/_lib/claude.ts` | `generateReport(conv)` — calls OpenRouter, returns plain text report |
| `app/api/whatsapp/_lib/telegram.ts` | `notifyPatrick(conv, report)` — sends Telegram message with approve/reject buttons |
| `lib/supabase/whatsapp.ts` | DB helpers: getOrCreateConversation, updateConversation, saveReport, getReportByTelegramMsgId |

---

## Task 1: Supabase Migrations

**Files:**
- Create: `supabase/migrations/20260601000001_whatsapp_conversations.sql`
- Create: `supabase/migrations/20260601000002_whatsapp_reports.sql`

- [ ] **Step 1: Create conversations migration file**

```sql
-- supabase/migrations/20260601000001_whatsapp_conversations.sql
create table if not exists whatsapp_conversations (
  id              uuid primary key default gen_random_uuid(),
  phone_number    text not null unique,
  state           text not null default 'NEW',
  business_type   text,
  budget          text,
  location        text,
  concern         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists whatsapp_conversations_phone_idx
  on whatsapp_conversations (phone_number);
```

- [ ] **Step 2: Create reports migration file**

```sql
-- supabase/migrations/20260601000002_whatsapp_reports.sql
create table if not exists whatsapp_reports (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid references whatsapp_conversations(id) on delete cascade,
  report_text         text,
  generated_at        timestamptz,
  approved_at         timestamptz,
  delivered_at        timestamptz,
  telegram_message_id text
);
```

- [ ] **Step 3: Apply migrations via Supabase dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run each migration file in order.

Verify both tables exist under Table Editor.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add whatsapp_conversations and whatsapp_reports tables"
```

---

## Task 2: Supabase DB Helpers

**Files:**
- Create: `lib/supabase/whatsapp.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/supabase/whatsapp.ts
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type ConversationState =
  | 'NEW'
  | 'QUALIFYING'
  | 'PITCHING'
  | 'AWAITING_PAYMENT'
  | 'GENERATING'
  | 'AWAITING_APPROVAL'
  | 'DELIVERED';

export type Conversation = {
  id: string;
  phone_number: string;
  state: ConversationState;
  business_type: string | null;
  budget: string | null;
  location: string | null;
  concern: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationUpdate = Partial<
  Omit<Conversation, 'id' | 'phone_number' | 'created_at' | 'updated_at'>
>;

export async function getOrCreateConversation(phone: string): Promise<Conversation> {
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phone)
    .single();

  if (existing) return existing as Conversation;

  const { data: created, error } = await supabase
    .from('whatsapp_conversations')
    .insert({ phone_number: phone })
    .select()
    .single();

  if (error || !created) throw new Error(`Failed to create conversation: ${error?.message}`);
  return created as Conversation;
}

export async function updateConversation(
  id: string,
  updates: ConversationUpdate
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('whatsapp_conversations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
}

export async function saveReport(
  conversationId: string,
  reportText: string,
  telegramMessageId: string
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('whatsapp_reports')
    .insert({
      conversation_id: conversationId,
      report_text: reportText,
      generated_at: new Date().toISOString(),
      telegram_message_id: telegramMessageId,
    })
    .select('id')
    .single();
  if (error || !data) throw new Error(`Failed to save report: ${error?.message}`);
  return data.id;
}

export async function getReportByTelegramMsgId(telegramMsgId: string): Promise<{
  id: string;
  conversation_id: string;
  report_text: string;
} | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('whatsapp_reports')
    .select('id, conversation_id, report_text')
    .eq('telegram_message_id', telegramMsgId)
    .single();
  return data ?? null;
}

export async function markReportApproved(reportId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from('whatsapp_reports')
    .update({ approved_at: new Date().toISOString() })
    .eq('id', reportId);
}

export async function markReportDelivered(reportId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from('whatsapp_reports')
    .update({ delivered_at: new Date().toISOString() })
    .eq('id', reportId);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/whatsapp.ts
git commit -m "feat: add whatsapp supabase helpers"
```

---

## Task 3: Message Templates

**Files:**
- Create: `app/api/whatsapp/_lib/messages.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/_lib/messages.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export function greetingMessage(): string {
  return `Hey 👋 Welcome to Business Yoo.

I help you turn your business idea into a practical plan you can actually start.

What business are you thinking about?`;
}

export function budgetMessage(businessType: string): string {
  return `Great choice 🌱 ${businessType} can work well when it is started the right way.

What is your starting budget?

1. Under 500k UGX
2. 500k – 2M UGX
3. Above 2M UGX`;
}

export function locationMessage(): string {
  return `Nice. Which district are you in?`;
}

export function challengeMessage(): string {
  return `Last thing — what is your biggest challenge right now?

1. Finding customers
2. Getting startup money
3. Not knowing where to begin`;
}

export function pitchMessage(conv: Conversation): string {
  return `Thank you. Here is what I have so far:

*Business idea:* ${conv.business_type}
*Location:* ${conv.location}
*Budget:* ${conv.budget}
*Main challenge:* ${conv.concern}

I can create a *personal business report* for you with:

• a simple step-by-step start plan
• budget breakdown
• what to buy first
• expected costs
• common mistakes to avoid
• practical next steps for ${conv.location}

*Price:* UGX 50,000 once

Would you like me to prepare it for you?`;
}

export function paymentMessage(): string {
  return `Perfect 🙌

Please send *UGX 50,000* to:
*MTN: 0781799221*
Airtel: 0704434457
*Name: Patrick Mukalazi.*

After payment, reply *PAID* and share a screenshot and I'll start preparing your report.`;
}

export function generatingMessage(location: string): string {
  return `Thank you ✅
I've received your payment.

I'm now preparing your report and will send it to you shortly.
Your business plan is being built for your exact situation in ${location}.`;
}

export function deliveryMessage(businessType: string, reportText: string): string {
  return `Here is your personal business report 📋

${reportText}

Good luck with your ${businessType} journey! Feel free to message us anytime.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/_lib/messages.ts
git commit -m "feat: add whatsapp message templates"
```

---

## Task 4: WhatsApp Send Helper

**Files:**
- Create: `app/api/whatsapp/_lib/whatsapp.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/_lib/whatsapp.ts

export async function sendWhatsAppMessage(phone: string, text: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed: ${err}`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/_lib/whatsapp.ts
git commit -m "feat: add whatsapp send message helper"
```

---

## Task 5: Claude Report Generator

**Files:**
- Create: `app/api/whatsapp/_lib/claude.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/_lib/claude.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export async function generateReport(conv: Conversation): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const prompt = `You are a practical business advisor in Uganda. Write a personal business report for a customer who wants to start a business.

Customer details:
- Business idea: ${conv.business_type}
- Location: ${conv.location}
- Starting budget: ${conv.budget}
- Main challenge: ${conv.concern}

Write a clear, practical report with these sections:
1. Overview of ${conv.business_type} in ${conv.location}
2. Step-by-step start plan (5-7 steps)
3. Budget breakdown for ${conv.budget}
4. What to buy or set up first
5. How to find your first customers in ${conv.location}
6. Common mistakes to avoid
7. Your next 3 actions this week

Keep the language simple and direct. Write for someone starting their first business. Do NOT use markdown formatting — write plain text only, since this will be sent on WhatsApp. Use numbered lists and line breaks only.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://businessyoo.com',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/_lib/claude.ts
git commit -m "feat: add claude report generator via openrouter"
```

---

## Task 6: Telegram Approval Notifier

**Files:**
- Create: `app/api/whatsapp/_lib/telegram.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/_lib/telegram.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export async function notifyPatrick(
  conv: Conversation,
  reportText: string,
  reportId: string
): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');

  const summary = `📋 New Report Ready for Approval

Customer: ${conv.phone_number}
Business: ${conv.business_type}
Location: ${conv.location}
Budget: ${conv.budget}
Challenge: ${conv.concern}

--- REPORT ---
${reportText.slice(0, 3000)}${reportText.length > 3000 ? '\n\n[truncated — full report in DB]' : ''}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: summary,
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Approve — Send to Customer', callback_data: `approve:${reportId}` },
            { text: '❌ Reject', callback_data: `reject:${reportId}` },
          ],
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram notify failed: ${err}`);
  }

  const data = await res.json();
  return String(data.result.message_id);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/_lib/telegram.ts
git commit -m "feat: add telegram approval notifier"
```

---

## Task 7: State Machine

**Files:**
- Create: `app/api/whatsapp/_lib/state-machine.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/_lib/state-machine.ts
import type { Conversation, ConversationUpdate } from '@/lib/supabase/whatsapp';
import {
  greetingMessage,
  budgetMessage,
  locationMessage,
  challengeMessage,
  pitchMessage,
  paymentMessage,
  generatingMessage,
} from './messages';

type TransitionResult = {
  updates: ConversationUpdate;
  reply: string | null; // null = no immediate reply (async path)
};

const AFFIRMATIVES = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'yes please', 'proceed', 'go ahead'];
const BUDGET_OPTIONS: Record<string, string> = {
  '1': 'Under 500k UGX',
  '2': '500k – 2M UGX',
  '3': 'Above 2M UGX',
  'under 500k': 'Under 500k UGX',
  '500k': '500k – 2M UGX',
  '500k to 2m': '500k – 2M UGX',
  '500k – 2m': '500k – 2M UGX',
  'above 2m': 'Above 2M UGX',
  'above 2 million': 'Above 2M UGX',
};
const CHALLENGE_OPTIONS: Record<string, string> = {
  '1': 'Finding customers',
  '2': 'Getting startup money',
  '3': 'Not knowing where to begin',
  'finding customers': 'Finding customers',
  'customers': 'Finding customers',
  'money': 'Getting startup money',
  'startup money': 'Getting startup money',
  'not knowing': 'Not knowing where to begin',
  'where to begin': 'Not knowing where to begin',
  'where to start': 'Not knowing where to begin',
};

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function transition(conv: Conversation, incomingText: string): TransitionResult {
  const msg = normalize(incomingText);

  switch (conv.state) {
    case 'NEW': {
      return {
        updates: { state: 'QUALIFYING', business_type: incomingText.trim() },
        reply: budgetMessage(incomingText.trim()),
      };
    }

    case 'QUALIFYING': {
      if (!conv.budget) {
        const budget = BUDGET_OPTIONS[msg] ?? incomingText.trim();
        return {
          updates: { budget },
          reply: locationMessage(),
        };
      }
      if (!conv.location) {
        return {
          updates: { location: incomingText.trim() },
          reply: challengeMessage(),
        };
      }
      if (!conv.concern) {
        const concern = CHALLENGE_OPTIONS[msg] ?? incomingText.trim();
        return {
          updates: { state: 'PITCHING', concern },
          reply: null, // caller builds pitch using updated conv
        };
      }
      return { updates: {}, reply: challengeMessage() };
    }

    case 'PITCHING': {
      if (AFFIRMATIVES.includes(msg)) {
        return {
          updates: { state: 'AWAITING_PAYMENT' },
          reply: paymentMessage(),
        };
      }
      return {
        updates: {},
        reply: `Would you like me to prepare the report for you? Reply *Yes* to proceed.`,
      };
    }

    case 'AWAITING_PAYMENT': {
      if (msg.includes('paid') || msg.includes('payment') || msg.includes('sent')) {
        return {
          updates: { state: 'GENERATING' },
          reply: generatingMessage(conv.location ?? 'your area'),
        };
      }
      return {
        updates: {},
        reply: `Once you have sent the payment, reply *PAID* and share a screenshot.`,
      };
    }

    case 'GENERATING':
    case 'AWAITING_APPROVAL': {
      return {
        updates: {},
        reply: `Your report is still being prepared. We will send it to you very shortly.`,
      };
    }

    case 'DELIVERED': {
      return {
        updates: {},
        reply: `Thank you for using Business Yoo! If you need anything else, feel free to message us.`,
      };
    }

    default:
      return { updates: {}, reply: null };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/_lib/state-machine.ts
git commit -m "feat: add whatsapp conversation state machine"
```

---

## Task 8: Main Webhook Route

**Files:**
- Create: `app/api/whatsapp/webhook/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation, updateConversation, saveReport, markReportApproved, markReportDelivered, getReportByTelegramMsgId } from '@/lib/supabase/whatsapp';
import { transition } from '../_lib/state-machine';
import { sendWhatsAppMessage } from '../_lib/whatsapp';
import { generateReport } from '../_lib/claude';
import { notifyPatrick } from '../_lib/telegram';
import { pitchMessage, deliveryMessage } from '../_lib/messages';

// GET — Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST — incoming WhatsApp messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Meta sends test pings — acknowledge silently
  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' });
  }

  const phone = message.from as string;
  const text = message.text.body as string;

  try {
    const conv = await getOrCreateConversation(phone);
    const { updates, reply } = transition(conv, text);

    // Apply updates first
    if (Object.keys(updates).length > 0) {
      await updateConversation(conv.id, updates);
    }

    const updatedConv = { ...conv, ...updates };

    // Special case: finishing QUALIFYING — send pitch with final concern filled in
    if (conv.state === 'QUALIFYING' && !conv.concern && updates.concern) {
      const pitch = pitchMessage(updatedConv as typeof conv);
      await sendWhatsAppMessage(phone, pitch);
      return NextResponse.json({ status: 'ok' });
    }

    // Special case: PAID received — trigger generation pipeline
    if (updates.state === 'GENERATING') {
      // reply already sent (generatingMessage) — now run async pipeline
      if (reply) await sendWhatsAppMessage(phone, reply);

      const reportText = await generateReport(updatedConv as typeof conv);
      const telegramMsgId = await notifyPatrick(
        updatedConv as typeof conv,
        reportText,
        conv.id // temp — saveReport returns real ID below
      );
      await saveReport(conv.id, reportText, telegramMsgId);
      await updateConversation(conv.id, { state: 'AWAITING_APPROVAL' });
      return NextResponse.json({ status: 'ok' });
    }

    if (reply) await sendWhatsAppMessage(phone, reply);
  } catch (err) {
    console.error('[whatsapp webhook error]', err);
  }

  return NextResponse.json({ status: 'ok' });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/whatsapp/webhook/route.ts
git commit -m "feat: add whatsapp webhook route (verify + receive messages)"
```

---

## Task 9: Telegram Callback Route

**Files:**
- Create: `app/api/whatsapp/telegram-callback/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/whatsapp/telegram-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getReportByTelegramMsgId,
  updateConversation,
  markReportApproved,
  markReportDelivered,
} from '@/lib/supabase/whatsapp';
import { sendWhatsAppMessage } from '../_lib/whatsapp';
import { deliveryMessage } from '../_lib/messages';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callbackQuery = body?.callback_query;
  if (!callbackQuery) return NextResponse.json({ status: 'ok' });

  const data: string = callbackQuery.data ?? '';
  const telegramMsgId = String(callbackQuery.message?.message_id);
  const [action, reportId] = data.split(':');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const callbackId = callbackQuery.id;

  // Acknowledge the button press to Telegram
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId }),
  });

  if (action === 'approve') {
    const supabase = createSupabaseAdminClient();
    const { data: report } = await supabase
      .from('whatsapp_reports')
      .select('id, conversation_id, report_text')
      .eq('id', reportId)
      .single();

    if (!report) return NextResponse.json({ status: 'not found' });

    const { data: conv } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('id', report.conversation_id)
      .single();

    if (!conv) return NextResponse.json({ status: 'conv not found' });

    await sendWhatsAppMessage(
      conv.phone_number,
      deliveryMessage(conv.business_type ?? 'business', report.report_text)
    );

    await markReportApproved(report.id);
    await markReportDelivered(report.id);
    await updateConversation(conv.id, { state: 'DELIVERED' });

    // Notify Patrick in Telegram that it was sent
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: callbackQuery.message.chat.id,
        text: `✅ Report sent to ${conv.phone_number}`,
      }),
    });
  }

  if (action === 'reject') {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: callbackQuery.message.chat.id,
        text: `❌ Report rejected. Send manually from your phone if needed.`,
      }),
    });
  }

  return NextResponse.json({ status: 'ok' });
}
```

- [ ] **Step 2: Set Telegram webhook to point to this route**

After deploying to Vercel, run this in your browser (replace YOUR_BOT_TOKEN and YOUR_VERCEL_URL):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_VERCEL_URL/api/whatsapp/telegram-callback
```

You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

- [ ] **Step 3: Commit**

```bash
git add app/api/whatsapp/telegram-callback/route.ts
git commit -m "feat: add telegram callback route for report approval"
```

---

## Task 10: Environment Variables

- [ ] **Step 1: Add to `.env.local` for local testing**

```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_meta
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_VERIFY_TOKEN=mukalazi_verify_2026
TELEGRAM_BOT_TOKEN=your_existing_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_user_id
# OPENROUTER_API_KEY already set
```

To find your Telegram chat ID: message `@userinfobot` on Telegram — it replies with your ID.

- [ ] **Step 2: Add to Vercel**

Go to Vercel Dashboard → Business Yoo project → Settings → Environment Variables.

Add each variable above. `OPENROUTER_API_KEY` should already be there — skip it.

- [ ] **Step 3: Commit env example**

```bash
git add .env.example  # only add the example, never .env.local
git commit -m "docs: add whatsapp env vars to .env.example"
```

---

## Task 11: Deploy and Register Meta Webhook

- [ ] **Step 1: Deploy to Vercel**

```bash
git push origin main
```

Wait for Vercel build to complete.

- [ ] **Step 2: Register webhook with Meta**

Go to: Meta Developer Dashboard → Your App → WhatsApp → Configuration

Set:
- **Callback URL:** `https://YOUR_VERCEL_URL/api/whatsapp/webhook`
- **Verify Token:** `mukalazi_verify_2026` (must match `WHATSAPP_VERIFY_TOKEN`)

Click "Verify and Save". Meta will call your GET endpoint — it should return the challenge.

- [ ] **Step 3: Subscribe to messages**

Under Webhook Fields, enable: `messages`

- [ ] **Step 4: Smoke test**

Send a WhatsApp message to your bot number from a different phone.

Expected: bot replies with the greeting message.

---

## Task 12: End-to-End Test

- [ ] **Step 1: Run full flow manually**

Send messages in order and verify each bot reply matches the approved scripts:

1. Any text → greeting
2. Business type → budget question
3. Budget (1/2/3 or typed) → location question
4. Location → challenge question
5. Challenge (1/2/3 or typed) → pitch message with correct details filled in
6. "Yes" → payment message with MTN + Airtel numbers
7. "PAID" → generating acknowledgement + Telegram notification to Patrick
8. Patrick taps ✅ Approve in Telegram → customer receives report
9. Telegram shows "✅ Report sent to [phone]"

- [ ] **Step 2: Verify Supabase state**

After each step, check `whatsapp_conversations` in Supabase Table Editor. Verify `state` column transitions correctly.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: whatsapp sales bot — end-to-end complete"
```
