# Business Yoo — Roadmap & Direction (Geo Hub)
*Project audit, 2026-06-07. Audit target chosen after consolidation analysis: Business Yoo is the only geo app with real data and is the hub the others feed.*

## 1. Where you actually are
- Live Supabase hub, healthy, Postgres 17.
- Real geo asset: **732 businesses (660 located), 168 land listings, 49 jobs, 12 travel, 4 salons.**
- The `businesses` table is effectively a **Uganda places directory** built from a Google-Places import: 348 Health & Pharmacy, 155 Hotels, 181 Other, 23 retail, 21 restaurants, 4 agriculture.
- The "proper" land + surveyor pipeline (`land_listings`, `land_agents`, sync from SafeLands) is **built but empty (0 rows)**. The surveyor app has no schema on disk.
- The hub DB is shared with unrelated apps (fitness, pitch) — needs namespacing.

## 2. What's missing (ranked by what blocks the business, not effort)
1. **A reason for anyone to come back.** 900 records is a directory, but there's no demonstrated demand loop (search → contact → lead). Distribution, not more tables, is the gap.
2. **Lead capture / monetization surface.** You have `leads` infra but ~0 flowing. The business case for a directory is selling/qualifying leads to listed businesses.
3. **A decision on land.** Two half-built land paths (live `land_market` vs empty verified `land_listings`). Pick one.
4. **Data freshness + dedupe** on the importer so the directory doesn't rot.
5. **Schema hygiene** (geo vs fitness/pitch tangle) before you build more on top.

## 3. The thesis (a position, not options)
There are **two businesses inside Business Yoo**:
- a **commodity surface** — a map/listings app anyone can build; and
- a **defensible layer** — a *structured, deduped, contact-rich directory of Ugandan businesses and land*, which is hard to assemble and is the thing worth owning.

**Direction: pursue the directory as a lead-generation asset.** Grow and clean the data, prove a contact/lead loop on the strongest category (Health & Pharmacy — 348 records is already a real vertical), and monetize qualified leads. Treat verified-land as a *separate, later* bet that you only fund when the directory has cash flow. Defensibility ranking here: **the deduped contact dataset > the map app > an empty verified-land registry.**

Riskiest assumption: that listed businesses (or buyers) will pay for leads. Test this on pharmacies before building more.

## 4. The road plan
**Phase 0 — Unblock & measure (this week)**: run `geo_status.py`; pick the land table of record; de-dupe the two surveyor copies on disk. (See consolidation plan.)

**Phase 1 — Clean the base**: namespace geo vs fitness/pitch tables; one reviewed migration.

**Phase 2 — Prove the loop on pharmacies**: a clean `/health` or `/pharmacy` map view over the 348 records → a "contact / get a quote" action → a row in `leads`. Target: 20 real leads in 30 days.

**Phase 3 — Make the importer a repeatable loader**: dedupe + `source` column; pull 2–3 more districts to push businesses toward 2,000 located records.

**Phase 4 — Monetize**: charge for verified placement or qualified leads in the strongest vertical. Only here, revisit funding the surveyor for verified land.

## 5. Stack mapping
Super base = Business Yoo Supabase (ON). Importer = repeatable loader (on demand). Surveyor/Neon = OFF until Phase 4. Delivery app = separate, read via API. n8n/Hermes = schedule weekly status + imports. Mapbox = one layer over the super base. (Full table in the consolidation plan.)

## 6. Monetization milestones (ordered by defensibility)
1. Qualified leads in Health & Pharmacy (uses the data moat).
2. Verified/featured placement for businesses (uses distribution).
3. Land lead-gen on `land_market` (uses listings).
4. Verified-land registry subscription (only once the dataset exists).

## 7. Skill + schedule candidates
- **Skill:** `geo-place-import` — package the Google-Places loader as one command.
- **Skill:** `geo-status-report` — wrap `geo_status.py` into a briefing line.
- **Schedule:** weekly run of `geo_status.py --json` into the morning briefing to flag stagnation.
- **Schedule:** monthly importer run to keep the directory fresh.

## 8. The one decision
**Directory-as-lead-gen now, or verified-land registry now?** Data says you're 95% the first, 0% the second. Recommendation: commit to the directory, park the surveyor. Confirm and I'll build Phase 2 (the pharmacy lead loop).
