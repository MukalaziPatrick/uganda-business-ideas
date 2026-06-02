# WhatsApp Sales Bot — Design Spec
**Date:** 2026-06-01  
**Project:** Business Yoo  
**Status:** Approved — ready for implementation planning

---

## 1. Goal

Automate the customer qualification and report sales funnel Patrick was doing manually on WhatsApp. The bot replicates the real conversation flow 24/7 while keeping Patrick in the loop for payment confirmation and report approval.

---

## 2. Architecture

```
WhatsApp (0704434457 / 0781799221)
        ↓
WhatsApp Cloud API (Meta) — webhook
        ↓
POST /api/whatsapp/webhook  (Business Yoo — Next.js)
        ↓
Conversation Engine (state machine — stored in Supabase)
        ↓ (on PAID received)
Claude via OpenRouter → generates report
        ↓
Patrick's Telegram → approve / reject
        ↓
Bot sends report to customer on WhatsApp
```

Lives entirely inside Business Yoo as one new API route (`/api/whatsapp/webhook`), following the same pattern as `/api/land/chat`. No new infrastructure needed.

---

## 3. Conversation State Machine

States stored in Supabase per conversation:

```
NEW → QUALIFYING → PITCHING → AWAITING_PAYMENT → GENERATING → AWAITING_APPROVAL → DELIVERED
```

| State | Bot action | Transition trigger |
|-------|------------|--------------------|
| `NEW` | Greeting + ask business type | Customer replies |
| `QUALIFYING` | Ask budget, location, challenge (one at a time) | All 3 answered |
| `PITCHING` | Summary + report pitch with price | Customer replies "Yes" / affirmative |
| `AWAITING_PAYMENT` | Send payment numbers, ask for PAID + screenshot | Customer replies PAID |
| `GENERATING` | Acknowledge payment → call Claude → notify Patrick on Telegram | Report generated |
| `AWAITING_APPROVAL` | Waiting silently | Patrick approves in Telegram |
| `DELIVERED` | Send report to customer | — |

---

## 4. Exact Message Scripts (approved)

**State: NEW**
```
Hey 👋 Welcome to Business Yoo.

I help you turn your business idea into a practical plan you can actually start.

What business are you thinking about?
```

**State: QUALIFYING — Budget**
```
Great choice 🐔 [business type] can work well when it is started the right way.

What is your starting budget?

1. Under 500k UGX
2. 500k – 2M UGX
3. Above 2M UGX
```

**State: QUALIFYING — Location**
```
Nice. Which district are you in?
```

**State: QUALIFYING — Challenge**
```
Last thing — what is your biggest challenge right now?

1. Finding customers
2. Getting startup money
3. Not knowing where to begin
```

**State: PITCHING**
```
Thank you. Here is what I have so far:

*Business idea:* [business_type]
*Location:* [location]
*Budget:* [budget]
*Main challenge:* [concern]

I can create a *personal business report* for you with:

• a simple step-by-step start plan
• budget breakdown
• what to buy first
• expected costs
• common mistakes to avoid
• practical next steps for [location]

*Price:* UGX 50,000 once

Would you like me to prepare it for you?
```

**State: AWAITING_PAYMENT**
```
Perfect 🙌

Please send *UGX 50,000* to:
*MTN: 0781799221*
Airtel: 0704434457
*Name: Patrick Mukalazi.*

After payment, reply *PAID* and share a screenshot and I'll start preparing your report.
```

**State: GENERATING (acknowledgement)**
```
Thank you ✅
I've received your payment.

I'm now preparing your report and will send it to you shortly.
Your business plan is being built for your exact situation in [location].
```

**State: DELIVERED**
```
Here is your personal business report 📋

[report_text]

Good luck with your [business_type] journey! Feel free to message us anytime.
```

---

## 5. Data Model (Supabase)

**`whatsapp_conversations`**
```sql
id              uuid primary key default gen_random_uuid()
phone_number    text not null
state           text not null default 'NEW'
business_type   text
budget          text
location        text
concern         text
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

**`whatsapp_reports`**
```sql
id                  uuid primary key default gen_random_uuid()
conversation_id     uuid references whatsapp_conversations(id)
report_text         text
generated_at        timestamptz
approved_at         timestamptz
delivered_at        timestamptz
telegram_message_id text
```

---

## 6. Integrations

### WhatsApp Cloud API (Meta)
- Webhook: `POST /api/whatsapp/webhook`
- Verify token endpoint: `GET /api/whatsapp/webhook` (Meta requires this for verification)
- Send messages via `https://graph.facebook.com/v19.0/{phone_number_id}/messages`
- Phone number: 0704434457 (needs Meta Business verification — separate setup step outside this build)
- Free tier sufficient for current volume

### Claude via OpenRouter
- Called after PAID confirmation
- Model: `anthropic/claude-sonnet-4-6` via OpenRouter
- Prompt includes: business_type, budget, location, concern
- Output: ~2-page plain text report (no markdown — WhatsApp renders it poorly)
- Same `OPENROUTER_API_KEY` env var already used in Business Yoo

### Telegram Approval
- When report is generated, Patrick receives:
  - Customer phone + qualification summary
  - Full report text
  - Inline buttons: ✅ Approve / ❌ Reject
- Approve → bot sends report to customer
- Reject → Patrick edits manually and sends from his phone
- Uses existing Telegram bot token already in use for other Business Yoo notifications

---

## 7. Environment Variables Required

```
WHATSAPP_PHONE_NUMBER_ID=      # from Meta Business dashboard
WHATSAPP_ACCESS_TOKEN=         # Meta permanent token
WHATSAPP_VERIFY_TOKEN=         # any secret string, used for webhook verification
TELEGRAM_BOT_TOKEN=            # existing token
TELEGRAM_CHAT_ID=              # Patrick's Telegram user ID
OPENROUTER_API_KEY=            # existing key
```

---

## 8. Files to Create

```
app/api/whatsapp/
  webhook/
    route.ts          # GET (verify) + POST (receive messages)
  _lib/
    state-machine.ts  # conversation state transitions
    messages.ts       # all message templates
    whatsapp.ts       # send message helper (wraps Meta API)
    claude.ts         # report generation via OpenRouter
    telegram.ts       # approval notification
lib/supabase/
  whatsapp.ts         # DB read/write helpers for conversations + reports
```

---

## 9. Out of Scope (v1)

- Payment verification via Flutterwave API (manual PAID reply is sufficient for now)
- Instagram / SMS fallback channel
- Admin dashboard to view conversations
- Automated follow-up messages
- Multi-language support (Luganda)

These can be added in later phases.

---

## 10. Success Criteria

- Bot correctly qualifies a customer through all 4 steps without human intervention
- Patrick receives Telegram notification with report within 2 minutes of PAID reply
- Patrick can approve with one tap and customer receives report automatically
- Conversations survive server restarts (state persisted in Supabase)
