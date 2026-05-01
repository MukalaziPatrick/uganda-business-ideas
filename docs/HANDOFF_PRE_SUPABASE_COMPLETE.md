# Uganda Business Ideas - Pre-Supabase Completion Handoff

Date: 2026-05-01

This handoff summarizes the completed static-first and manual-ops work before Supabase implementation. Phase 6 Supabase implementation is paused and should not be included in the pre-Supabase commit.

## Completed Scope

### Phase 1 Foundation

- Shared site config, WhatsApp helpers, supplier placeholders, and reusable CTA/card components.
- Dynamic idea detail pages with static params.
- Sitemap and robots alignment.
- Guides, advertise, and start/lead-capture routes.
- Safe analytics hooks that no-op unless GA/GTM public env vars are configured.
- Typed 50-idea inventory and `/ideas` discovery route.

### Homepage, Blog, and Discovery Work

- Homepage funnel content links users to ideas, guides, start help, supplier options, and advertise flow.
- Blog data and blog routes were added for long-tail SEO content.
- `/ideas` discovery supports browsing, filtering, and sorting across the 50 idea inventory.

### Phase 4 - Supplier Verification and Monetization Ops

- Supplier placeholder categories were corrected.
- Supplier records include lightweight ops fields:
  - `serviceArea`
  - `leadRoutingTag`
  - `listingPackage`
  - `onboardingNotes`
- Supplier listing packages are centralized in supplier data and reused by `/advertise`.
- Supplier WhatsApp lead routing includes supplier slug, category, source, idea title, and routing tag.
- Placeholder suppliers remain unverified and no fake contacts were added.

### Phase 5 - Guide Sales Workflow

- Guide purchase messages are generated centrally.
- Guide records include manual sales ops fields:
  - `paymentMethod`
  - `deliveryExpectation`
  - `salesRoutingTag`
  - `faqs`
- `/guides` and `/guides/[slug]` clarify manual Mobile Money purchase flow.
- Guide detail pages show FAQs, delivery expectations, and fulfillment checklist.
- `guide_purchase_intent_click` tracking was added for manual sales intent.
- No payment API, database, auth, or dashboard was added.

## Phase 6 Status

Phase 6 Supabase work is paused.

Do not include these Phase 6 implementation files in the pre-Supabase commit:

- `app/api/leads/route.ts`
- `lib/supabase/`
- `supabase/`
- `scripts/supabase-local.ps1`
- Supabase-only package changes in `package.json` and `package-lock.json`
- `.env.local.example` if it only documents Supabase env vars

The app should remain static-first and manual-ops-first in this commit. Public pages should continue reading from static data files.

## Constraints Preserved

- No fake supplier contacts.
- No fake verified suppliers.
- No payment API.
- No database-backed public content.
- No admin dashboard.
- No auth UI.
- No public user accounts.
- No guide income guarantees.

## Verification Notes

Recent pre-Supabase work was verified with:

- `npm.cmd run lint`
- `npm.cmd run build`

Known local issue:

- The sandbox may block the Next.js TypeScript worker with `spawn EPERM`.
- When that happens, the build has passed after rerunning outside the sandbox with approval.
