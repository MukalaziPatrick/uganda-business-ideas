# Geography Apps — Consolidation & Organization Plan
*Ground-truth audit, 2026-06-07. No data was changed this session.*

## 1. What you actually have (measured, not claimed)

You have **four** things that touch Uganda geography, scattered across three databases:

| App | DB | Real data found | Verdict |
|-----|----|----|---------|
| **Business Yoo** (`uganda-business-ideas`) | Supabase `cdjaqdxvvdiiivjjiqbr` (live, healthy) | **732 businesses (660 with lat/lng), 168 land listings, 49 jobs, 12 travel, 4 salons** | This is the only app with real geo data. |
| **smart-address-uganda** | Separate Supabase `ymcywuoxmxvugkugffed` (different org) | PostGIS-enabled, but tables are a **delivery/rider product** (addresses, riders, deliveries, disputes, payments) | A *different business*, not a land app. |
| **smart-surveyor / Safe-land-deploy** | Neon (Drizzle + Clerk) | Schema file is **missing** (`lib/db/schema.ts` not present) — only a `users` table referenced. Two duplicate copies on disk. | A UI/Mapbox shell. Essentially **no data**. |
| **uganda-map** | none | One admin page + one Google-Places import route | A **utility**, not a product. Almost certainly the tool that populated the 660 located businesses. |

**The key finding (claimed vs real):**
- Your CLAUDE.md describes a clean "Hub + Satellites" with SafeLands feeding verified land into Business Yoo via `POST /api/land/sync`. In reality the proper land schema in the hub — `land_listings`, `land_agents`, `land_insights`, `land_payments` — is **completely empty (0 rows)**. The 168 real land records live in a simpler side table, `land_market`. **The sync pipe was designed but never used.**
- The "surveyor back-office" has no database schema on disk. It is not yet a working data source.
- Business Yoo's `businesses` table is mostly a **places directory** imported from Google: 348 Health & Pharmacy, 155 Hotel/Accommodation, 181 Other. That import — not the surveyor — is what actually fills the map.

## 2. My advice on the "super base" (you asked me to decide)

**Make Business Yoo's Supabase (`cdjaqdxvvdiiivjjiqbr`) the single super base — with two corrections.** Reasoning:

1. **It already holds 100% of your real geo data** (~900 located records). Migrating *into* it means migrating almost nothing — the others are empty or utilities. The risk is near zero.
2. **It's live, healthy, on Postgres 17, and is your consumer hub.** Everything geographic is meant to surface here anyway (`/land`, the map experience).
3. The surveyor (Neon) and the map importer have **no data worth migrating** — you migrate their *code/role*, not rows.

**Correction A — do NOT merge `smart-address-uganda`.** It is a last-mile delivery product (riders, deliveries, disputes), not land/listings. Merging it would pollute the super base with an unrelated domain. Keep it as its own product; if you want one map experience later, you *read* from it via API, you don't fold its tables in.

**Correction B — the super base is itself messy and needs namespacing.** Its `public` schema currently mixes geo tables with **unrelated apps** (fitness: `plans`, `exercises`, `workouts`, `workout_sets`; pitch: `pitch_usage`, `pitch_subscriptions`). "Organize better" means separating these, not just dumping more in. Use Postgres **schemas** (`geo.*`, keep app tables apart) or a strict table-prefix convention.

So: **one super base = Business Yoo Supabase, cleaned and namespaced. Surveyor and map-importer become *roles* that write into it. The delivery app stays separate.**

## 3. The organization plan (phased, ~$0, daily-reviewable)

### Phase 0 — Unblock & measure (this week, no risk)
- Adopt `scripts/geo_status.py` (created this session) as the single source of truth for "how full are the tanks." Run it, read the baseline, watch it weekly.
- **Decide the land table of record.** Right now data is split: 168 rows in `land_market`, 0 in `land_listings`. Pick one. Recommendation: keep `land_market` as the live table (it has the data and the UI uses it), and either drop the empty `land_listings` family or treat it as the future verified-by-surveyor tier.
- De-duplicate `smart-surveyor` vs `Safe-land-deploy` on disk — two copies of the same app is pure confusion. Keep one, archive the other.

### Phase 1 — Namespace the super base (low risk, big clarity win)
- Move geo tables into a clear group (Postgres `geo` schema or a `geo_` prefix): `businesses`, `land_market`, `jobs`, `travel_*`, `salons*`.
- Move the unrelated fitness/pitch tables out of the way (their own schema, or confirm they're dead and drop them).
- Write this down as one migration file; review the diff before applying. (Not done this session — plan only.)

### Phase 2 — Make the importer a first-class loader (turns a one-off into a pipe)
- Promote `uganda-map`'s Google-Places import route into a documented, repeatable loader that writes into `businesses` with dedupe + a `source` column. This is your real growth engine for the map — it's how you got 660 located records.
- **Skill candidate:** "geo-place-import" — package this so any future district/category pull is one command.

### Phase 3 — Wire the surveyor *only if* you commit to verified land
- The surveyor (Neon) should either (a) write verified parcels directly into the super base's land tables and retire its own DB, or (b) be parked until there's demand. Don't keep a third empty database alive "just in case."
- If you pursue it: the moat is **verified land data competitors can't copy** — but that moat is empty today (0 verified rows). Decide if you're filling it.

### Phase 4 — One map experience reads from the super base
- The consumer map shows businesses + land from the super base, and *optionally* reads the delivery app's addresses via API (not via merged tables).

## 4. Stack mapping (give each tool one job)

| Tool | Job in this plan | Default state |
|------|------------------|---------------|
| Business Yoo Supabase | **The super base** — all geo data of record | ON |
| smart-surveyor (Neon) | Verified-land producer → writes into super base, *or* parked | OFF until Phase 3 |
| smart-address-uganda Supabase | Separate delivery product; read via API only | ON (its own lane) |
| uganda-map importer | Repeatable place loader into `businesses` | Run on demand |
| n8n / Hermes | Schedule the weekly `geo_status.py` check + import runs | ON |
| Mapbox | Single map layer reading the super base | ON |

## 5. The one decision (please confirm)

**Is the goal a *places + listings directory* (grow the importer, monetize leads), or a *verified-land registry* (fund the surveyor to fill the empty land tables)?**
These pull in opposite directions. Today your data says you're 95% the first and 0% the second. My position: **commit to the directory now** (it has traction and a clear lead-gen path), and treat verified land as a later, separately-funded bet — don't keep an empty surveyor DB running in the meantime.

See `ROADMAP_2026-06.md` for the Business Yoo direction and `HANDOFF_2026-06-07-GEO-CONSOLIDATION.md` to resume.
