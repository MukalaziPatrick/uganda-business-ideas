# Uganda Region Map Filter — Design Spec

**Date:** 2026-05-14  
**Status:** Approved  
**Feature:** Interactive SVG Uganda map above filters on `/ideas` page

---

## Overview

Add a clickable SVG map of Uganda's 4 regions (Central, Eastern, Northern, Western) above the existing filters on the `/ideas` page. Clicking a region filters the idea cards below to ideas tagged for that region. This is a pure client-side filter — no backend changes required.

---

## Architecture

### Files changed

| File | Change |
|------|--------|
| `app/data/ideas.ts` | Add `regions` field to each idea |
| `app/ideas/IdeasDiscoveryClient.tsx` | Add region state + filter logic + map component |
| `components/UgandaRegionMap.tsx` | New — SVG map component |

No new routes, no new pages, no API changes.

---

## Data Changes

### `app/data/ideas.ts`

Add `regions` to the `Idea` type:

```ts
type Region = "Central" | "Eastern" | "Northern" | "Western";

type Idea = {
  // ... existing fields ...
  regions: Region[];
};
```

Tag each idea with 1–4 regions based on viability:
- **All 4 regions** — ideas that work anywhere (Mobile Money, Bodaboda, Salon, Poultry Farming)
- **1–2 regions** — geography-specific ideas (Tea Farming → Western; Fishing → Central/Eastern; Cotton → Eastern/Northern)

---

## Component: `UgandaRegionMap`

**File:** `components/UgandaRegionMap.tsx`

### Props
```ts
type Props = {
  activeRegion: "All" | Region;
  onRegionClick: (region: "All" | Region) => void;
};
```

### Behaviour
- SVG viewBox renders Uganda's 4 regions as `<path>` or `<polygon>` elements
- Each region is a different shade of green when inactive
- Active region fills with `#F5C842` (gold), label turns `#1C3A2A` (dark green)
- Hover: slight opacity change + cursor pointer
- "All regions" reset — either a button below the map or clicking the active region again deselects it
- Region name labels centered inside each shape

### Region colors (inactive)
| Region | Fill |
|--------|------|
| Central | `#2D5A40` |
| Eastern | `#3d7a58` |
| Northern | `#4d9a6e` |
| Western | `#5db884` |

Active region: `#F5C842` with `#1C3A2A` label.

---

## Filter Logic — `IdeasDiscoveryClient`

### New state
```ts
const [region, setRegion] = useState<"All" | Region>("All");
```

### Updated filter
```ts
.filter(idea => {
  const matchRegion = region === "All" || idea.regions.includes(region);
  // ... existing matchSearch, matchCat, matchBudget ...
  return matchSearch && matchCat && matchBudget && matchRegion;
})
```

### Result count line
Update from:
```
Showing {filtered.length} of {ideas.length} ideas
```
To:
```
Showing {filtered.length} of {ideas.length} ideas{region !== "All" ? ` · ${region} Region` : ""}
```

### Map placement
Insert `<UgandaRegionMap>` directly above the search bar, below the page heading.

---

## Mobile Behaviour

- Map renders full-width on all screen sizes
- 4 region shapes are large enough to tap on mobile (each ~25% of map area)
- On screens narrower than 360px: map replaced by a horizontal row of 4 region chip buttons as fallback
- No map on homepage, jobs page, or any other page — `/ideas` only

---

## Out of Scope

- District-level detail (135 districts or 15 key districts)
- Map on homepage or jobs page
- Animations beyond CSS color transitions
- Backend/database changes
- Any changes to idea slug pages

---

## Success Criteria

1. Map renders on `/ideas` page above search bar
2. Clicking a region filters ideas to those tagged for that region
3. Clicking the active region (or an "All" button) resets to show all ideas
4. Result count reflects the active region
5. Works on mobile (touch targets large enough)
6. TypeScript compiles clean, no build errors
