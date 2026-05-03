# Phase 6 - Supabase Admin Plan

Date: 2026-05-01

This is a planning document only. Phase 6 uses Supabase as the chosen backend for UBI operations, but no database, packages, environment variables, admin routes, or application code should be added until the approval gates at the end are cleared.

## Goals

- Move UBI operations from static-only/manual messages into a Supabase-backed workflow.
- Track leads from `/start`.
- Manage supplier onboarding, verification, and listing packages.
- Keep guide offer metadata manageable.
- Track manual guide and supplier sales without adding a payment API.
- Protect phone numbers, WhatsApp contacts, payment notes, and admin-only operational notes.

## Non-Goals

- No payment API.
- No public user accounts.
- No admin dashboard implementation in this planning phase.
- No package installation in this planning phase.
- No migration from static public pages until the data model and access rules are approved.
- No fake supplier contacts, fake verification, fake reviews, or fake sales data.

## Supabase Project Shape

Supabase should provide:

- Postgres database.
- Supabase Auth for admin users.
- Row Level Security on every operational table.
- Storage later only if guide PDFs or supplier documents need controlled access.
- SQL migrations checked into the repo only after implementation is approved.

Recommended environments:

- Development Supabase project.
- Production Supabase project.

Do not point local development at production unless explicitly approved.

## Admin Users and Roles

Use Supabase Auth for admin sign-in. Store operational roles in an `admin_profiles` table keyed by `auth.users.id`.

Suggested roles:

- `owner`: full access to all operational data, role management, and publishing decisions.
- `ops`: can manage leads, supplier onboarding, and manual sales.
- `editor`: can manage guide and supplier public copy but cannot view sensitive payment notes unless separately allowed.
- `viewer`: read-only operational access, excluding highly sensitive fields if field-level separation is implemented.

Suggested `admin_profiles` fields:

- `id uuid primary key references auth.users(id)`
- `email text not null`
- `role text not null check (role in ('owner', 'ops', 'editor', 'viewer'))`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Admin membership should be allow-listed. Self-signup should not grant admin access.

## Tables

### `leads`

Purpose: store startup-help requests from `/start` and future lead sources.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `name text`
- `phone text`
- `location text`
- `budget text`
- `business_interest text`
- `timeline text`
- `notes text`
- `source text not null default 'start_page'`
- `status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'not_fit', 'closed'))`
- `assigned_tag text`
- `assigned_admin_id uuid references auth.users(id)`
- `last_contacted_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Privacy notes:

- `phone` and `notes` are sensitive.
- Public pages must never read from this table directly.
- Do not store unnecessary personal details.

### `suppliers`

Purpose: manage supplier placeholders, onboarding, verification, and public listing data.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `slug text not null unique`
- `name text not null`
- `category text not null`
- `location text not null default 'Uganda'`
- `service_area text`
- `description text not null`
- `idea_slugs text[] not null default '{}'`
- `contact_status text not null default 'placeholder' check (contact_status in ('verified', 'needs_verification', 'placeholder'))`
- `verification_summary text not null`
- `verification_checks text[] not null default '{}'`
- `is_featured boolean not null default false`
- `listing_package text check (listing_package in ('starter', 'standard', 'featured'))`
- `lead_routing_tag text`
- `onboarding_notes text`
- `phone text`
- `whatsapp text`
- `website text`
- `public_contact_approved boolean not null default false`
- `owner_approved_at timestamptz`
- `published_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- A supplier can expose `phone` or `whatsapp` publicly only when `contact_status = 'verified'` and `public_contact_approved = true`.
- Placeholders must remain clearly marked and must not have public contact details.
- Verification checks should map to the existing checklist:
  - `business_name_confirmed`
  - `phone_confirmed`
  - `location_confirmed`
  - `offer_confirmed`
  - `owner_approved`

### `guides`

Purpose: manage paid guide offer metadata. This does not store the PDF itself in Phase 6 unless separately approved.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `slug text not null unique`
- `title text not null`
- `price_ugx integer not null check (price_ugx >= 0)`
- `summary text not null`
- `format text not null default 'PDF'`
- `delivery_time text not null`
- `buyer_promise text not null`
- `target_audience text[] not null default '{}'`
- `related_idea_slugs text[] not null default '{}'`
- `what_you_get text[] not null default '{}'`
- `fulfillment_checklist text[] not null default '{}'`
- `payment_status text not null default 'manual_mobile_money' check (payment_status in ('manual_mobile_money', 'coming_soon'))`
- `payment_method text not null default 'Manual Mobile Money'`
- `delivery_expectation text not null`
- `sales_routing_tag text`
- `faqs jsonb not null default '[]'::jsonb`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- Guide promises must match actual guide contents.
- No guaranteed income or profit claims.
- No instant-delivery promise unless operations can support it.
- Payment remains manual Mobile Money until a separate payment integration is approved.

### `manual_sales`

Purpose: track manual sales for guides and supplier listing packages.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `sale_type text not null check (sale_type in ('guide', 'supplier_listing'))`
- `guide_id uuid references guides(id)`
- `supplier_id uuid references suppliers(id)`
- `buyer_name text`
- `buyer_phone text`
- `amount_ugx integer not null check (amount_ugx >= 0)`
- `payment_method text not null default 'Manual Mobile Money'`
- `payment_status text not null default 'pending' check (payment_status in ('pending', 'confirmed', 'failed', 'refunded'))`
- `delivery_status text not null default 'not_delivered' check (delivery_status in ('not_delivered', 'delivered', 'not_required'))`
- `source text`
- `routing_tag text`
- `payment_reference text`
- `payment_notes text`
- `delivered_at timestamptz`
- `confirmed_at timestamptz`
- `created_by uuid references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- `guide_id` is required when `sale_type = 'guide'`.
- `supplier_id` is required when `sale_type = 'supplier_listing'`.
- Do not deliver guide PDFs before payment is confirmed.
- `buyer_phone`, `payment_reference`, and `payment_notes` are sensitive.

## RLS and Security Rules

Enable RLS on every table.

General approach:

- Public anonymous users cannot select, insert, update, or delete operational tables directly.
- Admin access is granted only to authenticated users with active rows in `admin_profiles`.
- Role checks should use stable SQL helper functions, for example:
  - `is_admin()`
  - `has_admin_role(required_roles text[])`

Suggested table policy direction:

- `admin_profiles`
  - Owners can read and manage all profiles.
  - Active admins can read their own profile.
- `leads`
  - Owners and ops can read/write.
  - Editors/viewers should not access sensitive lead fields unless explicitly approved.
- `suppliers`
  - Owners and ops can read/write all fields.
  - Editors can edit public copy fields but not sensitive notes or contact approval fields unless approved.
  - Public read, if later needed, should use a safe view that only exposes verified, approved fields.
- `guides`
  - Owners, ops, and editors can manage guide metadata.
  - Public read, if later needed, should use a safe view for active guide offers.
- `manual_sales`
  - Owners and ops can read/write.
  - Editors/viewers should not read sensitive payment fields by default.

Recommended safe views for public app usage later:

- `public_suppliers_view`: only verified suppliers with approved public contact visibility.
- `public_guides_view`: only active guides and non-sensitive metadata.

Do not connect public pages directly to base operational tables.

## Privacy Rules for Phone and Payment Data

- Treat phone numbers, WhatsApp numbers, buyer names, payment references, payment screenshots, and payment notes as sensitive operational data.
- Store only what UBI needs to fulfill the request or sale.
- Do not expose lead phone numbers or sales records to client-side code.
- Do not log full phone numbers or payment references in analytics.
- Do not send sensitive fields to GA/GTM.
- Restrict sensitive fields to owner/ops roles.
- If guide PDFs or payment screenshots are ever stored, use private Supabase Storage buckets with signed URLs and short expiries.
- Define a data retention policy before implementation, especially for abandoned leads and old payment notes.

## Migration Sequence

### Step 1 - Finalize Schema

- Approve table names, fields, enums/check constraints, indexes, and RLS policy shape.
- Decide whether public pages will continue reading static data during the first Supabase release.

### Step 2 - Create Supabase Projects

- Create development and production Supabase projects.
- Store project URLs and anon keys in environment variables.
- Keep service role keys server-only and never expose them to the browser.

### Step 3 - Add Migrations

- Add SQL migrations for:
  - `admin_profiles`
  - `leads`
  - `suppliers`
  - `guides`
  - `manual_sales`
  - helper functions
  - RLS policies
  - safe public views if needed

### Step 4 - Seed Static Data

- Seed existing guide metadata from `app/data/guides.ts`.
- Seed existing supplier placeholders from `app/data/suppliers.ts`.
- Do not seed fake contacts or fake sales.
- Keep public pages on static data until seeded records are reviewed.

### Step 5 - Admin Auth Skeleton

- Implement admin sign-in using Supabase Auth only after approval.
- Require active `admin_profiles` membership.
- Start with read-only admin views before write forms.

### Step 6 - Operational Write Flows

Suggested order:

1. Lead capture into Supabase.
2. Manual guide sales ledger.
3. Supplier onboarding and verification.
4. Guide metadata editing.
5. Optional public read from Supabase safe views.

### Step 7 - Public Page Migration

- Migrate public pages from static data only after admin workflows are stable.
- Keep static data as a fallback export until rollback confidence is high.

## Rollback Plan

- Keep static data files as the public-site source of truth until Supabase data is verified.
- Export Supabase data before every schema-changing migration.
- Use additive migrations first; avoid destructive column drops early.
- Keep SQL rollback notes beside each migration.
- If admin implementation fails, disable admin routes and continue serving static public pages.
- If lead capture fails, fall back to existing WhatsApp/external form behavior.
- If supplier/guide DB reads fail, fall back to static `app/data/*` files.
- Never delete static guide or supplier data until a separate deprecation approval is given.

## Environment Variables Needed

Public/browser-safe:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only:

```env
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
```

Optional later:

```env
ADMIN_ALLOWED_EMAILS=
SUPABASE_STORAGE_GUIDE_BUCKET=
```

Rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
- Do not commit real env values.
- Add deployment env vars only after implementation is approved.

## Approval Gates Before Implementation

Implementation should not begin until these are approved:

1. Supabase project strategy: development and production projects.
2. Final schema for `leads`, `suppliers`, `guides`, `manual_sales`, and `admin_profiles`.
3. Admin role definitions and first admin email allow-list.
4. RLS policies and helper function strategy.
5. Privacy and retention policy for phone numbers, WhatsApp numbers, payment references, and payment notes.
6. Decision on whether public pages keep static data during the first admin release.
7. Migration and seed strategy for existing guides and supplier placeholders.
8. Rollback process and backup/export process.
9. Package choices for Supabase client integration.
10. Explicit approval to create admin routes and database migrations.

## Recommended First Implementation Batch After Approval

After the approval gates are cleared, the smallest safe implementation batch should be:

1. Add Supabase client dependency and env wiring.
2. Add SQL migrations for `admin_profiles`, `leads`, and RLS helpers only.
3. Add server-side lead submission route.
4. Keep WhatsApp fallback.
5. Do not build the full admin dashboard until lead write flow and RLS are verified.

This keeps the first Supabase implementation small while proving authentication, RLS, environment configuration, and rollback behavior.
