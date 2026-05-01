# Uganda Business Ideas - Phase 1 Foundation Handoff

Date: 2026-04-30

This document summarizes implementation Batches 1-7 for Uganda Business Ideas (UBI). It is a handoff record, not a feature spec.

## Completed Batches

### Batch 1 - Income Foundation

- Added shared site config in `lib/site.ts`.
- Added WhatsApp URL/message helper in `lib/whatsapp.ts`.
- Added placeholder supplier data in `app/data/suppliers.ts`.
- Added reusable supplier cards in `components/SupplierCard.tsx`.
- Added reusable WhatsApp CTA in `components/WhatsAppCTA.tsx`.
- Wired relevant supplier cards into `app/ideas/[slug]/page.tsx`.
- Added `generateStaticParams()` for dynamic idea pages.
- Updated `app/sitemap.ts` and `app/robots.ts` to use one shared site URL source.

Important constraint: supplier entries are placeholders only. No fake phone numbers or unverified contact details were added.

### Batch 2 - Guides and Advertise Pages

- Added guide data in `app/data/guides.ts`.
- Added `/guides` route.
- Added `/guides/[slug]` route with `generateStaticParams()`.
- Added three starter paid guide offers:
  - Businesses You Can Start Under 500k UGX
  - Poultry Starter Guide in Uganda
  - Chapati and Rollex Starter Guide
- Added `/advertise` route with supplier listing packages.
- Added WhatsApp-based manual purchase/contact CTAs.
- Updated sitemap for guide and advertise URLs.

No payment API was added. Guide sales are manual via WhatsApp and Mobile Money coordination.

### Batch 3 - Lead Capture

- Added reusable lead capture form in `components/LeadCaptureForm.tsx`.
- Added `/start` route.
- Added lead fields:
  - name
  - phone/WhatsApp
  - location
  - budget
  - business interest
  - timeline
  - notes
- Added `NEXT_PUBLIC_LEAD_FORM_URL` support.
- If `NEXT_PUBLIC_LEAD_FORM_URL` is configured, the form links to it.
- If not configured, the form generates a WhatsApp message using existing helpers.
- Added "I want to start this business" CTA to idea detail pages.
- Added "Get help starting" CTA to guide detail pages.
- Updated sitemap for `/start`.

No database or backend lead storage was added.

### Batch 4 - Safe Analytics

- Added `lib/analytics.ts`.
- Added `trackEvent()` as a safe no-op unless one of these public env vars is configured:
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - `NEXT_PUBLIC_GTM_ID`
- Added `components/AnalyticsLink.tsx`.
- Wired tracking for:
  - `whatsapp_click`
  - `supplier_click`
  - `guide_cta_click`
  - `advertise_cta_click`
  - `idea_start_cta_click`
  - `lead_form_submit`

No analytics dashboard, server tracking, database, or custom event store was added.

### Batch 5 - Idea Data Foundation

- Added TypeScript data types in `app/data/ideas.ts`:
  - `Idea`
  - `Category`
  - `BudgetBand`
  - `AudienceSegment`
  - `IdeaSeo`
  - `IdeaScoring`
- Added optional future fields while preserving current fields:
  - `budgetBand`
  - `audience`
  - `seo`
  - `scoring`
  - `relatedIdeaSlugs`
- Added helper functions:
  - `getIdeaBySlug`
  - `getRelatedIdeas`
  - `getIdeasByCategory`
  - `getIdeasByAudience`
  - `formatCapital`
- Updated idea detail page to use `getIdeaBySlug` and `formatCapital`.

Existing idea objects remained backward-compatible.

### Batch 6 - 50 Idea Inventory

- Expanded `app/data/ideas.ts` to exactly 50 concrete idea entries.
- Preserved existing 13 ideas.
- Added documented Uganda business ideas without duplicate slugs/topics.
- New entries include:
  - `slug`
  - `title`
  - `category`
  - `capital`
  - `desc`
  - `skills`
  - `bestFor`
  - `location`
  - `steps`
  - `risks`
  - `profit`
  - `tips`
  - `budgetBand`
  - `audience`
  - `seo`
  - `scoring`
  - `relatedIdeaSlugs`
- Profit language is cautious and estimate-based.

No fake supplier contacts were added.

### Batch 7 - Ideas Discovery Page

- Added `/ideas` discovery route.
- Added `app/ideas/IdeasDiscoveryClient.tsx`.
- Discovery page supports:
  - search
  - category filter
  - budget filter
  - audience filter
  - sort by demand score
  - sort by startup ease score
  - sort by supplier potential score
- Current score mapping:
  - demand score -> `scoring.incomeSpeed`
  - startup ease score -> `scoring.startupEase`
  - supplier potential score -> `scoring.supplierDemand`
- Added CTAs to:
  - `/start`
  - `/guides`
  - `/advertise`
- Added SEO metadata and canonical URL for `/ideas`.
- Updated sitemap for `/ideas`.

## Current Route Surface

- `/`
- `/about`
- `/contact`
- `/ideas`
- `/ideas/[slug]`
- `/guides`
- `/guides/[slug]`
- `/advertise`
- `/start`
- `/api/ask`
- `/robots.txt`
- `/sitemap.xml`

## SEO and Discovery

- `app/sitemap.ts` includes:
  - homepage
  - about
  - contact
  - `/ideas`
  - all 50 idea detail pages
  - `/guides`
  - all guide detail pages
  - `/advertise`
  - `/start`
- `app/robots.ts` references the shared sitemap URL.
- Shared base URL comes from `SITE_URL` in `lib/site.ts`.
- Dynamic idea and guide pages use static generation.

## Lint and Build Status

Across Batches 1-7:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed after rerunning outside the sandbox because the sandbox repeatedly blocked the Next.js TypeScript worker with `spawn EPERM`.

Latest successful build confirmed:

- `/ideas` is static.
- `/ideas/[slug]` generates 50 idea pages.
- `/guides/[slug]` generates 3 guide pages.
- `/start` is dynamic because it reads query params for prefilled interest.

## Intentionally Not Added

The following were deliberately not implemented in Phase 1:

- Database
- Auth
- Payment API
- Blog
- Dashboard
- Admin system
- Major redesign
- Fake supplier contacts
- Fake verified suppliers
- Supplier phone numbers
- User accounts
- Mobile app

## Operational Notes

- Supplier placeholders are monetization inventory, not verified supplier records.
- Guide purchases remain manual via WhatsApp and Mobile Money.
- Lead capture is WhatsApp-first unless `NEXT_PUBLIC_LEAD_FORM_URL` is configured.
- Analytics tracking is safe no-op unless GA or GTM public env vars are configured.
- The app remains static-first and Vercel-friendly.
