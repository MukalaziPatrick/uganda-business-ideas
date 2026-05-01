# Uganda Business Ideas - Roadmap Next Phases

Date: 2026-05-01

This roadmap starts after Phase 1 Foundation, which delivered the 50 idea inventory, idea discovery, guides, advertising page, lead capture, supplier placeholders, and safe analytics.

Current status: Phase 4 supplier verification and monetization ops is complete. Phase 5 guide sales workflow is complete. Next recommended phase is Phase 6 database/admin dashboard planning only.

## Phase 2 - Homepage Funnel Upgrade

### Goal

Turn the homepage into a clearer funnel for users who want to browse ideas, get help starting, buy guides, or advertise as suppliers.

### Files Likely Affected

- `app/HomeClient.tsx`
- `app/page.tsx`
- `components/WhatsAppCTA.tsx`
- `components/AnalyticsLink.tsx`
- possibly shared small components if the homepage is split up later

### Risks

- The homepage is currently large and client-heavy.
- Redesigning too much could destabilize working filters and content.
- Adding too many CTAs could confuse users.
- Existing user changes in `app/HomeClient.tsx` must be preserved carefully.

### Definition of Done

- Homepage clearly routes users to:
  - `/ideas`
  - `/start`
  - `/guides`
  - `/advertise`
- Existing homepage search/filter behavior still works.
- No layout break on mobile.
- Analytics events fire on major funnel CTAs.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

## Phase 3 - Blog and SEO Content Clusters

### Goal

Add long-tail SEO content that links into ideas, guides, and lead capture.

### Files Likely Affected

- `app/data/blogPosts.ts`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/sitemap.ts`
- possible `components/SeoJsonLd.tsx`
- possible `lib/seo.ts`

### Risks

- Thin or generic posts could hurt trust.
- Over-optimized posts could feel spammy.
- Blog content should not make guaranteed income claims.
- Each post needs internal links to relevant idea pages and guide CTAs.

### Definition of Done

- Blog index route exists.
- Blog detail route exists.
- First SEO cluster posts are live.
- Posts include realistic Uganda-specific costs, risks, and steps.
- Sitemap includes blog URLs.
- No fake claims, fake reviews, or fake rich-result schema.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

## Phase 4 - Supplier Verification and Monetization Ops

Status: Complete.

### Goal

Turn placeholder supplier cards into a real listing operation with verification status, packages, and manual onboarding.

### Files Likely Affected

- `app/data/suppliers.ts`
- `components/SupplierCard.tsx`
- `app/advertise/page.tsx`
- `app/ideas/[slug]/page.tsx`
- possible `docs/SUPPLIER_VERIFICATION_PROCESS.md`

### Risks

- Publishing fake or unverified contacts would damage trust.
- Supplier claims need verification.
- Payments should remain manual until demand is proven.
- Supplier categories must match relevant idea pages.

### Definition of Done

- Complete: Supplier verification checklist exists.
- Complete: Supplier records support verification notes, status, service area, lead routing tag, listing package, and onboarding notes without exposing private details.
- Complete: Placeholder suppliers remain unverified and no unverified supplier is labeled verified.
- Complete: Advertise page uses centralized supplier listing packages.
- Complete: Supplier WhatsApp routing includes supplier slug, category, source, idea title, and routing tag.
- Complete: Supplier click analytics still work.
- Complete: `npm.cmd run lint` passed.
- Complete: `npm.cmd run build` passed after rerunning outside the sandbox for the known Next.js worker `spawn EPERM` issue.

## Phase 5 - Guide Sales Workflow

Status: Complete.

### Goal

Make manual guide sales easier to operate before adding payment APIs.

### Files Likely Affected

- `app/data/guides.ts`
- `app/guides/page.tsx`
- `app/guides/[slug]/page.tsx`
- `components/WhatsAppCTA.tsx`
- possible `docs/GUIDE_SALES_PROCESS.md`

### Risks

- Payment automation too early could add complexity before demand is proven.
- Manual delivery requires a clear owner process.
- Guide promises must match actual PDF content.

### Definition of Done

- Complete: Each guide has clear price, promise, manual payment method, delivery expectation, and delivery flow.
- Complete: WhatsApp purchase messages are generated centrally and include guide title, slug, price, source, payment method, delivery expectation, and routing tag.
- Complete: Owner-facing fulfillment checklist remains available on guide pages.
- Complete: Sales tracking hooks include `guide_purchase_intent_click` with guide slug, price, source, payment method, and routing tag for external/manual tracking.
- Complete: Guide FAQs were added for buyer expectations.
- Complete: No payment API, database, auth, dashboard, fake contacts, fake payment numbers, or instant-delivery promise was added.
- Complete: `npm.cmd run lint` passed.
- Complete: `npm.cmd run build` passed after rerunning outside the sandbox for the known Next.js worker `spawn EPERM` issue.

## Phase 6 - Database and Admin Dashboard Planning Only

### Goal

Plan a possible move from static data to managed content only after static editing becomes painful or revenue operations require it. This phase is planning only unless separately approved.

### Files Likely Affected

- Documentation only by default.
- Possible planning notes under `docs/`.
- Existing data files may be reviewed read-only to shape requirements.

### Risks

- This is a major architecture change.
- Auth, permissions, backups, and data validation become required.
- Database costs and operational complexity increase.
- Migrating too early could slow content production.
- Planning must not quietly become implementation.

### Definition of Done

- Planning doc identifies whether static files are still enough.
- Database options, auth options, backup/export needs, migration risks, and admin permissions are documented.
- Approval gates are written clearly before any implementation.
- No database, auth, payment API, migration, or admin dashboard is added during this phase.
- Existing public pages remain unchanged.

## Phase 7 - AI Recommendation Engine

### Goal

Add a recommendation flow that uses real UBI content, user budget, location, audience, and behavioral data to suggest realistic businesses.

### Files Likely Affected

- `components/AIAssistant.tsx`
- `app/api/ask/route.ts`
- `app/start/page.tsx`
- `app/data/ideas.ts` or database-backed idea source
- possible `lib/recommendations.ts`
- possible analytics/event data pipeline later

### Risks

- AI can give overconfident or unsafe advice.
- Recommendations must avoid guaranteed profit claims.
- API costs can grow if usage rises.
- User privacy and data retention need clear policy if storing inputs.

### Definition of Done

- Recommendations are grounded in UBI idea data.
- AI response includes risks and disclaimers.
- No guaranteed profit claims.
- Rate limiting or cost controls are considered.
- User can continue to `/start` lead capture.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

## Cross-Phase Principles

- Preserve existing user changes.
- Keep mobile-first UX.
- Avoid fake contacts and fake verification.
- Avoid payment automation until manual sales prove demand.
- Keep SEO pages useful, local, and cautious.
- Run lint and build after code changes.
