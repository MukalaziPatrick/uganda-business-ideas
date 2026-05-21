# UBI Phase 6 Supabase Leads Handoff

Date: 2026-05-03

## SMOOTH Summary

### Status

Phase 6 lead foundation is implemented and verified.

The project now has a Supabase-backed lead capture path, a server-only Supabase client, a read-only `/admin/leads` viewer, search/filter support for leads, and local Supabase temp files ignored by git.

The implementation remained narrow:

- No suppliers table implementation.
- No guides table implementation.
- No manual sales table implementation.
- No auth UI.
- No admin editing flows.
- No payment API.
- No redesign.

### Milestones Completed

1. Supabase leads foundation

- Added `@supabase/supabase-js`.
- Added server-only Supabase env/client helpers.
- Added `admin_profiles` and `leads` migration.
- Added RLS helper functions and policies.
- Added `/api/leads` POST route.
- Preserved the existing lead form fallback behavior.

Commit:

```text
9d52cee feat: add Supabase leads foundation
```

2. Phase 6 planning document

- Added the Phase 6 Supabase admin plan as a planning reference.

Commit:

```text
d4514a2 docs: add Phase 6 Supabase admin plan
```

3. Read-only admin leads viewer

- Added `/admin/leads`.
- Fetches leads server-side via the Supabase service client.
- Displays a plain read-only table with name, phone, interest, and created date.

Commit:

```text
c17b93e feat: add read-only admin leads viewer
```

4. Server-side search and filter

- Added `q` query param search across name, phone, and business interest.
- Added optional interest dropdown.
- Results remain ordered by `created_at` descending.
- No pagination, edit, delete, or auth added.

Commit:

```text
5bdf13a feat: add search and filter to admin leads viewer
```

5. Supabase temp ignore

- Added `supabase/.temp/` to `.gitignore`.

Commit:

```text
cd3540e chore: ignore Supabase temp files
```

### Operations Notes

Environment variables are expected in local/deployment configuration only. Do not commit real values.

Required for lead capture:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Required by the local Supabase helper script:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD
```

Relevant files:

```text
app/api/leads/route.ts
app/admin/leads/page.tsx
lib/supabase/env.ts
lib/supabase/server.ts
lib/supabase/types.ts
scripts/supabase-local.ps1
supabase/migrations/202605010001_phase6_leads_foundation.sql
```

Admin viewer behavior:

- Route: `/admin/leads`
- Query params:
  - `q`: searches name, phone, and business interest.
  - `interest`: filters exact business interest.
- Data is fetched server-side.
- Page is intentionally unauthenticated for this batch.
- Page is read-only.

Lead capture behavior:

- `LeadCaptureForm` submits to `/api/leads` first.
- If the API succeeds, the form shows success.
- If the API fails or throws, fallback remains available through the configured external lead form or WhatsApp path.

### Open Items

The following are intentionally not done yet:

- Auth-gated admin access.
- Admin profiles management UI.
- Lead status editing.
- Lead assignment.
- Supplier onboarding database tables.
- Guide metadata database tables.
- Manual sales ledger.
- Payment integration.
- Public page migration from static data to Supabase.

Recommended next step:

Add a narrow auth gate for `/admin/leads` before adding any editing capability. Keep the first auth batch focused on read access only.

### Tests And Verification

Verification completed during Phase 6:

```powershell
npm.cmd run lint
npm.cmd run build
```

Notes:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed when Next.js was allowed to spawn its TypeScript/static generation workers outside the sandbox.
- `/api/leads` POST returned success after the Supabase service role key was corrected.
- Supabase read-back confirmed the inserted verification lead existed.
- Fallback behavior was confirmed in code.

Safe POST verification shape:

```powershell
$body = @{
  name = 'Phase 6 Verification Rerun'
  phone = '+256700000005'
  location = 'Kampala'
  budget = 'UGX 200,000 - 500,000'
  businessInterest = 'Phase 6 API verification rerun'
  timeline = 'Still researching'
  notes = 'Safe test lead after service role key replacement.'
  source = 'phase6_verification_rerun'
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri 'http://localhost:3002/api/leads' `
  -Method Post `
  -ContentType 'application/json' `
  -Body $body
```

Observed API result:

```text
ok: True
```

### Handoff Guidance

Keep Phase 6 incremental.

Good next batches:

1. Protect `/admin/leads` with Supabase Auth or a temporary server-side admin gate.
2. Add lead detail/read view only after auth is in place.
3. Add lead status updates only after read access and admin membership are verified.
4. Add supplier, guide, or manual sales tables only as separate approved batches.

Avoid:

- Mixing auth, editing, supplier tables, sales tables, and UI redesign into one batch.
- Exposing service role keys to client components.
- Letting public pages read operational tables directly.
- Committing `.env.local` or Supabase CLI temp state.
