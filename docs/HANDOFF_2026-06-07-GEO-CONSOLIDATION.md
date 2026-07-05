# HANDOFF — Geo Apps Consolidation + Business Yoo Audit (2026-06-07)

## TL;DR
Audited all four geography apps. Real geo data lives **only** in the Business Yoo Supabase
(`cdjaqdxvvdiiivjjiqbr`). The surveyor (Neon) is an empty shell, the map app is an importer
utility, and smart-address is a *separate delivery product* (don't merge it). Recommendation:
**Business Yoo Supabase = the single super base**, cleaned/namespaced; pursue the directory as a
lead-gen asset, park verified-land. No data changed this session (plan + audit only).

## Baseline numbers (measured live)
- businesses: **732** (660 with lat/lng) — mostly Google-Places import (348 pharmacy, 155 hotel)
- land_market: **168** (the live land table)
- jobs: 49 · travel_destinations: 12 · salons: 4
- land_listings / land_agents / land_insights / land_payments / travel_stays: **0 (empty)**

## Claimed vs real (the key finding)
- CLAUDE.md describes SafeLands → `/api/land/sync` → verified land. Reality: that schema is
  empty; the sync was never used. Surveyor has no DB schema on disk.
- Two duplicate surveyor copies exist: `smart-surveyor/` and `Safe-land-deploy/`.
- The super base's `public` schema is polluted with unrelated apps (fitness, pitch).

## Open items
**User-on-their-machine:**
- Confirm THE ONE DECISION: directory-as-lead-gen now vs verified-land registry now (rec: directory).
- Set `SUPABASE_URL` + `SUPABASE_KEY` env vars to run `scripts/geo_status.py`.
- Decide which surveyor copy to keep; archive the other.

**Claude-next (pick one):**
- (a) Build Phase 2 — the pharmacy lead loop (`/pharmacy` map view → contact → `leads` row).
- (b) Write the Phase 1 namespacing migration (geo vs fitness/pitch) for review.
- (c) Package `geo-place-import` as a skill.
- (d) Schedule weekly `geo_status.py` into the morning briefing.

## Key paths
- Plan: `docs/GEO_CONSOLIDATION_PLAN_2026-06.md`
- Roadmap: `docs/ROADMAP_2026-06.md`
- Status tool: `scripts/geo_status.py` (stdlib; reads SUPABASE_URL/SUPABASE_KEY)
- Super base: Supabase project `cdjaqdxvvdiiivjjiqbr` (uganda-business-ideas)

## Standing rules
Ground truth over README claims · keep costs ~$0, phased · always name skill + schedule candidates.
