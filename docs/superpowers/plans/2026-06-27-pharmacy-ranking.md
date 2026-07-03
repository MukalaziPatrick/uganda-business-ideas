# Pharmacy Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only pharmacy ranking workflow that uses private review signals to sort pharmacies without showing Google ratings publicly.

**Architecture:** Add nullable ranking columns to `pharmacy_businesses`, calculate `rank_score` in a focused TypeScript helper, expose a service-role admin update route, and render compact ranking controls only in `/admin/pharmacy`. The public `/pharmacy` query and card UI remain unchanged.

**Tech Stack:** Next.js App Router, Supabase/Postgres, TypeScript, React client component, Vitest.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/pharmacy/ranking.ts` | Calculate internal pharmacy rank score from admin-only inputs |
| `lib/pharmacy/ranking.test.ts` | Tests for score formula and input normalization |
| `supabase/migrations/20260627000001_pharmacy_ranking.sql` | Add nullable private ranking fields and index |
| `lib/supabase/pharmacy-types.ts` | Add optional ranking fields to pharmacy type |
| `app/admin/pharmacy/page.tsx` | Select ranking fields for admin-only view |
| `app/admin/pharmacy/AdminPharmacyClient.tsx` | Show private ranking controls and sort active rows |
| `app/api/admin/pharmacy/ranking/route.ts` | Update private ranking fields for one pharmacy |
| `docs/SESSION_STATE.md` | Save updated handoff state |
| `docs/ROADMAP_NEXT_PHASES.md` | Mark ranking workflow progress |

---

## Tasks

- [x] Add failing tests for `calculatePharmacyRankScore`.
- [x] Implement `calculatePharmacyRankScore` with Google rating, review count, phone verification, map verification, licence verification, delivery, and 24-hour signals.
- [x] Add Supabase migration with nullable admin-only columns.
- [x] Update pharmacy TypeScript types.
- [x] Add admin ranking API route gated by the existing Supabase admin session helper.
- [x] Select ranking fields on `/admin/pharmacy`.
- [x] Add admin-only rank controls and active-list sorting.
- [x] Apply live Supabase schema changes.
- [x] Run focused tests and production build.
- [x] Update session and roadmap docs.
