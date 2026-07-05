# HANDOFF - Tenders country filter showing Uganda only (2026-07-04)

## TL;DR
The `/tenders` page is live and no longer crashes, but `All countries` currently shows only Uganda rows.
That is not a UI-select bug by itself. The current server-side fallback intentionally filters out the
known-bad Kenya batch because its imported data is unreliable: many Kenya rows have `category = null`
and incorrect `deadline` values like `2026-07-03`, even when the source site shows December 2026 or
other dates. The next session should focus on restoring clean Kenya data, not just tweaking the dropdown.

## What was completed this session
- Added a working `/tenders` page.
- Added `lib/tenders.ts` as the shared server-side query layer.
- Added fallback logic from missing `tenders_live` to `public.tenders`.
- Added `lib/tenders.test.ts` regression coverage for:
  - fallback when `tenders_live` is missing
  - country metadata mapping from `tender_countries`
  - suppression of noisy console errors for expected `PGRST205`
  - dropping known-bad Kenya legacy rows with null categories
- Verified build and tests after the tender-page changes.

## Current user-visible problem
At:

`/tenders?q=&country=all&sector=all`

the page shows only Uganda tenders even though the UI says `All countries`.

## Why this is happening
The current fallback path in `lib/tenders.ts` includes this guard:

- keep only `country_id` 1 or 2
- exclude Kenya rows from source `combine_all_2026-07-02` when `category` is null

That filter was added on purpose because the imported Kenya records were visibly wrong:

- many Kenya rows had `category = null`
- many Kenya rows had the same incorrect deadline:
  - `2026-07-03T10:00:00+00:00`
- source screenshots showed real close dates such as:
  - `December 8, 2026`
  - `December 15, 2026`
  - `July 21, 2026`

Result: once the broken Kenya rows are filtered out, the remaining public shortlist is effectively Uganda-only.

## Verified database findings
Using the Business Yoo Supabase project `cdjaqdxvvdiiivjjiqbr`:

- `tenders_live` does not exist
  - query returns `PGRST205`
  - hint points to `public.tenders`
- `public.tenders` exists and contains live rows
- `tender_countries` mapping is:
  - `1 -> UG / Uganda`
  - `2 -> KE / Kenya`
  - `3 -> RW / Rwanda`
  - `4 -> TZ / Tanzania`
- source counts observed during debugging:
  - `combine_all_2026-07-02`: 610 rows
  - `uganda_gpp_seed_2026-07-03`: 19 rows
- Kenya rows (`country_id = 2`) exist in the database, but the legacy batch is low quality

## Relevant files
- `D:\projects\mukalazipatrick\uganda-business-ideas\app\tenders\page.tsx`
- `D:\projects\mukalazipatrick\uganda-business-ideas\lib\tenders.ts`
- `D:\projects\mukalazipatrick\uganda-business-ideas\lib\tenders.test.ts`
- `D:\projects\mukalazipatrick\uganda-business-ideas\.env.local`

## Current logic to be aware of
`lib/tenders.ts` currently:

1. tries `tenders_live`
2. falls back to `public.tenders` if the read model is missing
3. maps `country_id` through `tender_countries`
4. filters out broken Kenya legacy rows before returning public results

That means the current behavior is conservative by design:
better Uganda-only than a mixed feed with fake deadlines.

## Recommended next-session plan
1. Confirm whether Kenya data should come from:
   - a repaired `public.tenders` import, or
   - a proper `tenders_live` read model / cleaned view
2. Inspect the Kenya ingestion pipeline that produced `combine_all_2026-07-02`.
3. Re-import or rebuild Kenya rows so each record has:
   - correct `deadline`
   - usable `category`
   - stable `country_id`
   - reliable `source_url`
4. Remove or relax the temporary Kenya exclusion only after the repaired rows are verified.
5. Re-test the filters:
   - `All countries`
   - `Kenya`
   - `Uganda`
   - sector filter on mixed-country results

## Strong suspicion for the real fix
The real fix is probably data-side, not frontend-side.

The dropdown logic in `app/tenders/page.tsx` is simple and looks fine:
- `country=all` does not filter by ISO code
- `country=ug` and `country=ke` compare against `country_iso2`

So if `All countries` still shows Uganda only, it is because no Kenya rows survive the server-side cleanup.

## Good next commands
From the repo root:

```powershell
npm.cmd exec vitest run lib/tenders.test.ts
npm.cmd run build
```

For database debugging, inspect:

```powershell
Get-Content lib\tenders.ts
Get-Content app\tenders\page.tsx
```

Then compare live Kenya source pages against stored rows in Supabase before changing the filter guard.

## Notes for the next person
- Do not remove the Kenya exclusion blindly just to make `All countries` look populated.
- The earlier screenshots already proved the deadline issue is real.
- If Kenya rows are restored, re-check the sector filter too, because earlier user feedback suggested
  sectors did not feel right when the dataset was inconsistent.
- Git status could not be checked from the sandbox because the repo is marked as dubious ownership for
  the sandbox user.
