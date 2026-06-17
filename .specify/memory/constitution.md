# Business Yoo Constitution

The non-negotiable rules every spec, plan, and implementation in this repo must obey.
If a spec or plan conflicts with this document, this document wins.

## Core Principles

### I. Stack Lock (NON-NEGOTIABLE)
- Frontend/app: **Next.js (App Router)**. No other framework without explicit owner approval.
- Database/auth/storage: **Supabase** (uganda-business-ideas DB).
- Deploy: **Vercel** (live = ugandabiz.lugandastudio.com, mukalazipatrick account).
- Automation: **n8n on Railway only** (https://n8n-production-c3c3.up.railway.app). Never local n8n, ngrok, or localhost.
- Do not introduce new infrastructure to solve a problem an existing tool already covers.

### II. AI Calls Go Through OpenRouter (NON-NEGOTIABLE)
- Every LLM call uses **OpenRouter** (base `https://openrouter.ai/api/v1`).
- Never call the Anthropic API directly.
- Default to the best available Claude model for sellable, customer-facing content; use cheaper models (e.g. haiku) only for cached/background tasks.

### III. Payments = Pesapal Only
- Use **Pesapal** (MTN + Airtel Mobile Money + Visa/Mastercard). Settle to bank.
- **Flutterwave does NOT support Uganda merchants** — never propose it for checkout.
- Payoneer is a receiving account, not a checkout method.

### IV. Hub + Satellites Architecture
- Business Yoo is the **consumer hub**; SafeLands Admin is the surveyor back-office (separate Neon + Clerk).
- Six verticals: Land, Ideas, Businesses, Salons, Travel, Jobs — one unified Supabase schema.
- Cross-system sync happens via the documented webhook (`POST /api/land/sync`, `SYNC_SECRET`). Do not invent new sync paths.

### V. Homepage Freeze
- **Do NOT touch the homepage** when adding or changing sub-apps.
- New sub-apps live under the `/apps` holding hub until the multi-app nav strategy is decided.

## Technology & Security Constraints
- Supabase **RLS must be enabled** on every new table that holds user or listing data.
- Secrets (`SYNC_SECRET`, `OPENROUTER_API_KEY`, `CRON_SECRET`, Mapbox token, Pesapal keys) live in Vercel env vars, never in code or git.
- Public listings must never expose raw phone numbers; contact happens through the platform.
- Map experience uses **Mapbox**; verify the token is baked into the live bundle (tiles return 200) before calling a map task done.

## Development Workflow & Quality Gates
- **Verify live repo first:** `git remote -v` must be `MukalaziPatrick/uganda-business-ideas` before building. Other folders are stale duplicates.
- **Deploy gotcha:** a push to `master` builds a **Preview only** — you must manually **Promote to Production** in Vercel. A deploy is not "live" until promoted and the URL is checked.
- **Vercel git-author guardrail:** deploys block if the git author isn't recognized by the Vercel team. Confirm author before relying on auto-deploy.
- **Done = verified live**, not merely committed. Quote the evidence (URL returns 200, query returns rows, feature visible) when claiming completion.
- Apply migrations and edits directly; pause only for irreversible destructive actions.

## Governance
This constitution supersedes ad-hoc preferences. Amendments are made by editing this file
with a bumped version and date below. Every `/speckit-plan` and `/speckit-implement` run
must check its work against these principles before reporting done.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
