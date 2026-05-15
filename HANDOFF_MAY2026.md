# Uganda Business Hub — Handoff (May 2026)

> Last updated: 2026-05-15

---

## What This Project Is

`uganda-business-ideas` is being transformed into a **three-pillar Uganda economic platform**:

| Pillar | Description | Status |
|---|---|---|
| 💡 Business Ideas | Browse 50+ ideas by budget & category | ✅ Built |
| 📍 Find Businesses | Real businesses searchable by region/category | 🟡 Plan ready — execute next |
| 💼 Find Jobs | Job board + worker profiles | 🟡 Plan ready — execute after |

---

## Two Projects Involved

| Project | Path | Notes |
|---|---|---|
| `uganda-business-ideas` | `d:/projects/uganda-business-ideas` | Hub app — main focus |
| `uganda-map` (LocateUG) | `d:/projects/uganda-map` | Fully built — will deep-link from hub in Phase 2 |

---

## IMMEDIATE NEXT TASK — Execute Business Directory

**This session produced a complete spec + plan. Execute it next.**

- **Spec:** `docs/superpowers/specs/2026-05-15-business-directory-design.md`
- **Plan:** `docs/superpowers/plans/2026-05-15-business-directory.md`

### To start execution:
```
Say: "Execute the business directory plan using subagent-driven development"
```

### What it builds (9 tasks, all code written):

| Task | What it builds |
|------|---------------|
| 1 | `businesses` Supabase table + RLS + signal RPC |
| 2 | TypeScript types + category/district constants |
| 3 | `UgandaBusinessMap` SVG component (4 clickable regions) |
| 4 | `/businesses` — search + region map + category filter + results |
| 5 | `/businesses/[id]` — business profile page |
| 6 | `/businesses/register` — public submission form |
| 7 | `/admin/businesses` — admin approve/reject |
| 8 | Homepage "Find a Business" pillar + nav link |
| 9 | End-to-end smoke test |

### Key decisions baked into the plan:
- New `businesses` table in this app's Supabase (not LocateUG cross-query)
- Business profile: name, category, district/town, description, hours, WhatsApp, phone, website, Facebook, Instagram, TikTok
- Anyone can submit → admin approves → goes live
- Signal columns (`view_count`, `whatsapp_clicks`, `contact_clicks`) included for future AI layer
- Uganda map: 4-region SVG filter. Real GeoJSON paths should be used at implementation time (see note below)

---

## Parked Work — Do Not Forget

### 1. Region Map Filter on /ideas
- Fully built on branch `region-map-filter`
- Restore with: `git merge region-map-filter`
- Shares the same Uganda SVG map challenge as the business directory

### 2. Jobs Board
- Plan at: `docs/superpowers/plans/2026-05-12-uganda-business-hub.md`
- Execute after business directory is live

### 3. Business Directory Phase 2 — LocateUG deep-links
- After Phase 1 launches, add "View on LocateUG map" links on business profiles
- Opens `uganda-map` app zoomed to that business location
- No code needed now

### 4. Geospatial AI Brain (long-term vision)
- Both apps become a self-improving system that learns which businesses thrive where
- Signal columns already in the `businesses` schema
- When ready: brainstorm + write-plans a dedicated spec
- Full vision saved in memory: `project_geospatial_ai_vision.md`

---

## Important Technical Notes

### Uganda map SVG shape
The current plan uses simplified SVG polygon paths. For a professional look, use real GeoJSON:
- Source: Natural Earth or GADM at ADM1 level
- Simplify with mapshaper
- Group Uganda's districts into 4 regions (Central, Eastern, Northern, Western)
- The `uganda-map` app also has real PostGIS boundaries in Supabase via `get_boundaries_geojson` RPC (level 1)

### Windows bash fix — IMPORTANT
Running `.sh` scripts on this machine requires Git bash, NOT WSL bash.
```powershell
# Correct — use Git bash
& "C:\Program Files\Git\bin\bash.exe" "path/to/script.sh" [args]

# Wrong — WSL bash.exe is broken on this machine
bash script.sh   # fails with: execvpe(/bin/bash) failed
```
Saved in memory: `feedback_windows_bash.md`

### Visual companion server (for future brainstorming sessions)
```powershell
# Run with run_in_background: true on PowerShell tool
& "C:\Program Files\Git\bin\bash.exe" "C:/Users/patri/.claude/plugins/cache/claude-plugins-official/superpowers/5.1.0/skills/brainstorming/scripts/start-server.sh" --project-dir "d:/projects/uganda-business-ideas"

# Read connection info from:
# d:\projects\uganda-business-ideas\.superpowers\brainstorm\<session-id>\state\server-info
```

### Supabase client patterns
```ts
// Public pages (client or server component)
createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Admin pages only
createSupabaseAdminClient()  // from lib/supabase/server.ts — uses SERVICE_ROLE_KEY

// Admin RLS check
public.is_admin()  // already exists, used by jobs + leads
```

### Environment variables needed
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   ← required for admin pages
```

---

## Dev Setup

```powershell
cd d:/projects/uganda-business-ideas
npm install
npm run dev   # → http://localhost:3000
```
