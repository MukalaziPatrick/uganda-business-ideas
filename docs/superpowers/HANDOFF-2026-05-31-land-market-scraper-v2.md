# Handoff — Land Market Scraper v2
**Date:** 2026-05-31  
**Status:** Pipeline live on Railway — detail scraping fix needed

---

## What Was Accomplished This Session

| Task | Status |
|---|---|
| Push code to GitHub (commit 2c0178a) | ✅ Done |
| Create Railway service from GitHub repo | ✅ Done |
| Set Root Directory to `/scraper` | ✅ Done |
| Add 6 environment variables in Railway | ✅ Done |
| Fix Lamudi URL (rewritten for real .co.ug site) | ✅ Done |
| Fix Telegram async threading error | ✅ Done |
| Fix OpenRouter model name (claude-haiku-4-5) | ✅ Done |
| Fix Supabase service_role key (JWT format) | ✅ Done |
| 6 listings saved to Supabase land_market table | ✅ Done |
| Telegram bot sending Approve/Reject messages | ✅ Done |
| Scheduler running (next run 6 AM EAT daily) | ✅ Done |

---

## The One Remaining Problem — Thin Listing Data

Telegram messages show:
- ? acres, —, — (no size, no road, no district)
- Unknown price
- No contact found
- Flags: nocontact, vaguelocation, nosizegiven

**Root cause:** The Lamudi scraper only reads the homepage card (title + thumbnail). It does NOT visit each listing's detail page where the real data lives.

**Fix needed:** Update `scraper/scrapers/lamudi.py` to visit each listing's detail page at:
```
https://www.lamudi.co.ug/HouseDetails.aspx?HouseCode=XXXXX
```
And extract: price, size, location, contact phone, land type from the full page HTML.

---

## Railway Service Details

| Item | Value |
|---|---|
| Project name | accurate-adventure |
| Service name | uganda-business-ideas |
| Root Directory | /scraper |
| Branch | master |
| Region | US West |
| Auto-deploy | On push to master |

## Environment Variables (all set in Railway)

| Key | Notes |
|---|---|
| `SUPABASE_URL` | https://cdjaqdxvvdiiivjjiqbr.supabase.co |
| `SUPABASE_SERVICE_KEY` | JWT format eyJhbGci... (set in Railway) |
| `OPENROUTER_API_KEY` | sk-or-v1-... (set in Railway) |
| `TELEGRAM_BOT_TOKEN` | 8930203583:AAENER_... (set in Railway) |
| `TELEGRAM_GROUP_ID` | -5236637653 |
| `GOOGLE_PLACES_API_KEY` | AIzaSyCG... (set in Railway) |

---

## Current Scraper State

### What works
- `scraper/scrapers/lamudi.py` — scrapes homepage, finds 6 listing cards
- `scraper/enricher.py` — calls OpenRouter claude-haiku-4-5, extracts fields
- `scraper/verifier.py` — scores trust 1–5
- `scraper/db.py` — saves to Supabase land_market table
- `scraper/telegram_bot.py` — sends Approve/Reject to group -5236637653
- `scraper/main.py` — orchestrates everything, scheduler at 6 AM EAT

### What needs fixing
- `scraper/scrapers/lamudi.py` — needs to visit `HouseDetails.aspx?HouseCode=XXXXX` for each card to get full data (price, size, location, contact)
- OLX is permanently blocked (403) — needs a different approach (RSS feed or alternative source like PropertyUganda.com or Realtor.ug)

---

## Supabase Table

- **Table:** `land_market`  
- **Project:** cdjaqdxvvdiiivjjiqbr (uganda-business-ideas)
- **6 rows** currently in table, all status=`pending`, trust_score=1
- Key columns: id, title, price_ugx, size_acres, land_type, district, road_area, has_title, contact_phone, source_url, source_site, status, trust_score, trust_flags, reviewed_by, reviewed_at, scraped_at

---

## Key Files

| File | Purpose |
|---|---|
| `scraper/main.py` | Entry point + scheduler |
| `scraper/scrapers/lamudi.py` | Lamudi scraper — NEEDS DETAIL PAGE FIX |
| `scraper/scrapers/olx.py` | OLX scraper — blocked, needs replacement source |
| `scraper/enricher.py` | OpenRouter AI enrichment |
| `scraper/verifier.py` | Trust scoring |
| `scraper/telegram_bot.py` | Telegram Approve/Reject bot |
| `scraper/db.py` | Supabase upsert |
| `app/land/market/page.tsx` | /land/market Next.js page |

---

## Next Session — What To Do First

1. **Fix Lamudi detail scraper** — update `lamudi.py` to fetch `HouseDetails.aspx?HouseCode=XXXXX` for each card and extract real data
2. **Test** — push to GitHub, Railway auto-deploys, check Telegram for rich listing data
3. **Approve listings** in Telegram → they appear on `/land/market` page
4. **Replace OLX** with PropertyUganda.com or Realtor.ug scraper

### Prompt to use in new session:
```
Read HANDOFF-2026-05-31-land-market-scraper-v2.md in 
d:/projects/uganda-business-ideas/docs/superpowers/
and fix the Lamudi scraper to visit each listing detail page 
(HouseDetails.aspx?HouseCode=XXXXX) to extract full data 
(price, size, location, contact) before enrichment.
```

---

*Session ended: 2026-05-31*
