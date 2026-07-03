# Uganda Business Ideas - Current Session State

Date: 2026-06-27

## Completed Batches

Completed implementation batches:

1. Batch 1 - Shared config, WhatsApp helper, supplier placeholders/cards, dynamic idea pages, sitemap/robots alignment.
2. Batch 2 - Guides data, `/guides`, `/guides/[slug]`, `/advertise`.
3. Batch 3 - `/start` lead capture and reusable `LeadCaptureForm`.
4. Batch 4 - Safe no-op analytics tracking.
5. Batch 5 - Typed idea data foundation and helper functions.
6. Batch 6 - Expanded idea inventory to exactly 50 ideas.
7. Batch 7 - `/ideas` discovery page with search, filters, and sorting.
8. Phase 4 - Supplier verification and monetization ops.
9. Phase 5 - Guide sales workflow.
10. Pharmacy locator foundation and launch-ops groundwork.

## Current Monetization Model

UBI is currently set up for manual, early-stage monetization:

- Supplier listings via `/advertise`.
- Placeholder supplier cards on idea pages.
- Manual guide sales via `/guides` and `/guides/[slug]`.
- WhatsApp-first lead capture via `/start`.
- Manual Mobile Money coordination for guide purchases.
- Safe analytics events for key monetization clicks.
- Supplier listing packages and placeholder ops fields are centralized in supplier data.
- Guide purchase messages are generated centrally and include manual sales routing context.
- Pharmacy locator now has a separate moderation workflow, but no pharmacy monetization flow is live yet.

No payment API, database, admin dashboard, or auth has been added.

## Recently Completed

### Pharmacy Locator - Launch Ops Groundwork

- Added `/pharmacy` public route and pharmacy query layer.
- Added `pharmacy_businesses` live Supabase table plus RLS.
- Added phone-first support so rows can publish with `Call` even when `WhatsApp` is null.
- Imported 93 likely pharmacy rows from `businesses` into `pharmacy_businesses` as `pending`.
- Added `/admin/pharmacy` review UI with approve, reject, feature, and unfeature actions.
- Added pharmacy admin search and district filters to speed up review.
- Added admin-only pharmacy ranking workflow with private Google rating/review inputs, phone/map/licence verification flags, ranking notes, and computed `rank_score`.
- Added public pharmacy contact fallback UI so phone-only pharmacies show a visible number plus `Copy number` alongside `Call`.
- Kept imported rows non-public until manually reviewed.
- Kept `nda_licence_no` and `licence_expiry` null for all imported rows.
- Approved the first curated launch batch: 6 Kampala rows are now public (`2 featured`, `4 active`).
- Approved the remaining 80 imported rows that had phone, address, district, and map-usable location details.
- Pharmacy live totals are now `93` public rows (`2 featured`, `91 active`) with `0 pending`.
- Verified the anon/public query returns public rows live with phone-only contact where applicable and no licence badges yet.
- Applied live Supabase ranking columns to `pharmacy_businesses`; public `/pharmacy` does not show Google ratings.
- Verified the public `/pharmacy` page now works better on desktop for phone-only rows because users can copy the number even when `tel:` cannot place a call locally.

### Phase 4 - Supplier Verification and Monetization Ops

- Fixed swapped placeholder supplier categories.
- Added lightweight supplier ops fields:
  - `serviceArea`
  - `leadRoutingTag`
  - `listingPackage`
  - `onboardingNotes`
- Centralized supplier listing packages in `app/data/suppliers.ts`.
- Reused shared supplier package data on `/advertise`.
- Improved supplier WhatsApp lead routing with supplier slug, category, source, idea title, and routing tag.
- Clarified supplier onboarding requirements.
- Kept placeholder suppliers unverified and did not add supplier contacts.

### Phase 5 - Guide Sales Workflow

- Centralized guide purchase messaging in `lib/whatsapp.ts`.
- Added lightweight guide sales ops fields in `app/data/guides.ts`.
- Improved `/guides` and `/guides/[slug]` manual purchase copy.
- Added guide FAQs and clearer delivery expectations.
- Added `guide_purchase_intent_click` tracking with guide slug, price, source, payment method, and routing tag.
- Kept guide sales manual through WhatsApp and Mobile Money only.

## Current Technical State

Stack:

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Static data files
- Static generation for idea and guide detail pages

Important files:

- `app/data/ideas.ts` - typed 50 idea inventory and helpers.
- `app/data/guides.ts` - 3 starter paid guide offers.
- `app/data/suppliers.ts` - placeholder supplier listings, listing packages, and supplier ops fields.
- `lib/site.ts` - shared site URL, WhatsApp number, lead form URL.
- `lib/whatsapp.ts` - WhatsApp message and URL helpers.
- `lib/analytics.ts` - safe no-op analytics helper.
- `app/ideas/page.tsx` - idea discovery page.
- `app/ideas/[slug]/page.tsx` - idea detail page.
- `app/guides/page.tsx` - guides index.
- `app/guides/[slug]/page.tsx` - guide detail page.
- `app/advertise/page.tsx` - supplier listing offer page.
- `app/start/page.tsx` - lead capture page.
- `app/sitemap.ts` - sitemap for static and dynamic pages.
- `app/robots.ts` - robots rules and sitemap reference.

Current generated route behavior:

- `/ideas` is static.
- `/ideas/[slug]` generates 50 static idea pages.
- `/guides/[slug]` generates 3 static guide pages.
- `/start` is dynamic because it reads query params.

## Current Environment Variables

Supported but optional:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=256XXXXXXXXX
NEXT_PUBLIC_LEAD_FORM_URL=https://forms.gle/...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
ANTHROPIC_API_KEY=...
```

If public GA/GTM values are missing, analytics safely no-ops.

If `NEXT_PUBLIC_LEAD_FORM_URL` is missing, `/start` generates a WhatsApp message instead.

If `ANTHROPIC_API_KEY` is missing, `/api/ask` returns an API-key-not-configured error.

## Next Recommended Batch

Recommended next batch: Phase 8 pharmacy ranking and verification workflow.
Recommended next phase: begin filling ranking signals for the strongest active pharmacies, then feature the highest-confidence rows.

Suggested scope:

- Fill internal pharmacy ranking inputs for admin use only.
- Manually feature the best-ranked and best-verified pharmacies after scoring a first batch.
- Keep Google ratings/reviews as moderation signals, not public claims.
- Add licence verification workflow for `nda_licence_no` and `licence_expiry`.
- Keep licence fields null until verified against real sources.
- Optionally add bulk feature/unfeature tools if curation gets repetitive.

## Commands Before Future Changes

Run these before starting a future code batch:

```powershell
git status --short
Get-ChildItem -Force
Get-ChildItem app -Recurse -File | Select-Object -ExpandProperty FullName
Get-ChildItem components -Recurse -File | Select-Object -ExpandProperty FullName
```

For data work, also check:

```powershell
(Select-String -Path app\data\ideas.ts -Pattern 'slug: "').Count
Select-String -Path app\data\ideas.ts -Pattern 'slug:|category:|budgetBand:|audience:'
```

## Commands After Future Code Changes

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Known issue:

- The sandbox often blocks the Next.js TypeScript worker with `spawn EPERM`.
- If the normal build compiles and then fails with `spawn EPERM`, rerun the same build outside the sandbox with approval.

## Do Not Add Without Separate Approval

- Database
- Auth
- Payment API
- Admin dashboard
- Blog
- Major redesign
- Fake supplier contacts
- Fake verified suppliers
- Fake reviews or ratings
- Invented pharmacy licence numbers
- Pretend WhatsApp numbers copied from phone fields

## Current Handoff Docs

- `docs/UBI_CODEX_EXECUTION_BRIEF.md`
- `docs/HANDOFF_PHASE_1_FOUNDATION.md`
- `docs/ROADMAP_NEXT_PHASES.md`
- `docs/SESSION_STATE.md`
