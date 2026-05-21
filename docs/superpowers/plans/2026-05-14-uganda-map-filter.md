# Uganda Region Map Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clickable SVG Uganda region map above the search bar on `/ideas` that filters idea cards by region (Central, Eastern, Northern, Western).

**Architecture:** Three focused changes — (1) add `Region` type + `regions` field to the `Idea` interface and tag all 48 ideas, (2) create a standalone `UgandaRegionMap` SVG component, (3) wire region state + filter logic + map into `IdeasDiscoveryClient`. No backend changes, no new routes.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, inline SVG

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/data/ideas.ts` | Modify | Add `Region` type, `regions` field to `Idea` interface, tag all 48 ideas |
| `components/UgandaRegionMap.tsx` | Create | SVG map with 4 clickable regions, active/hover states, mobile chip fallback |
| `app/ideas/IdeasDiscoveryClient.tsx` | Modify | Add `region` state, region filter logic, render `<UgandaRegionMap>`, update result count |

---

## Task 1: Add `Region` type and `regions` field to `app/data/ideas.ts`

**Files:**
- Modify: `app/data/ideas.ts:1-56` (type definitions section)

- [ ] **Step 1: Add `Region` type and update `Idea` interface**

Open `app/data/ideas.ts`. After the `IdeaSeo` type block (line ~36) and before `export interface Idea`, add the `Region` type, then add `regions: Region[]` to the `Idea` interface.

Replace the `Idea` interface block (lines 38–56) with:

```ts
export type Region = "Central" | "Eastern" | "Northern" | "Western";

export interface Idea {
  slug: string;
  title: string;
  category: Category;
  capital: string;
  desc: string;
  skills: string[];
  bestFor: string;
  location: string;
  steps: string[];
  risks: string[];
  profit: string;
  tips: string[];
  budgetBand?: BudgetBand;
  audience?: AudienceSegment[];
  seo?: IdeaSeo;
  scoring?: IdeaScoring;
  relatedIdeaSlugs?: string[];
  regions: Region[];
}
```

- [ ] **Step 2: Tag all 48 ideas with `regions`**

Add `regions: [...]` to every idea object. Use this tagging guide (based on geographic viability):

**All 4 regions** (works everywhere):
- `liquid-soap-business` → `["Central","Eastern","Northern","Western"]`
- `poultry-farming` → `["Central","Eastern","Northern","Western"]`
- `mobile-money-business` → `["Central","Eastern","Northern","Western"]`
- `salon-business` → `["Central","Eastern","Northern","Western"]`
- `boda-boda-business` → `["Central","Eastern","Northern","Western"]`
- `chapati-business` → `["Central","Eastern","Northern","Western"]`
- `tailoring-business` → `["Central","Eastern","Northern","Western"]`
- `mitumba-clothes-business` → `["Central","Eastern","Northern","Western"]`
- `water-vending-business` → `["Central","Eastern","Northern","Western"]`
- `barber-shop-uganda` → `["Central","Eastern","Northern","Western"]`
- `cleaning-services-uganda` → `["Central","Eastern","Northern","Western"]`
- `event-planning-and-decoration-uganda` → `["Central","Eastern","Northern","Western"]`
- `photography-and-videography-uganda` → `["Central","Eastern","Northern","Western"]`
- `motorcycle-repair-garage-uganda` → `["Central","Eastern","Northern","Western"]`
- `mobile-car-wash-and-detailing-uganda` → `["Central","Eastern","Northern","Western"]`
- `welding-and-metal-fabrication-uganda` → `["Central","Eastern","Northern","Western"]`
- `daycare-creche-and-babysitting-service-uganda` → `["Central","Eastern","Northern","Western"]`
- `tuition-holiday-coaching-and-skills-training-uganda` → `["Central","Eastern","Northern","Western"]`
- `online-store-uganda` → `["Central","Eastern","Northern","Western"]`
- `social-media-marketing-and-content-services-for-smes-uganda` → `["Central","Eastern","Northern","Western"]`
- `youtube-tiktok-channel-about-ugandan-business-ideas-farming-or-side-hustles-uganda` → `["Central","Eastern","Northern","Western"]`
- `freelance-graphic-design-and-branding-uganda` → `["Central","Eastern","Northern","Western"]`
- `basic-it-training-small-cyber-caf-uganda` → `["Central","Eastern","Northern","Western"]`
- `phone-accessories-and-small-electronics-shop-uganda` → `["Central","Eastern","Northern","Western"]`
- `cosmetics-and-beauty-products-mini-shop-uganda` → `["Central","Eastern","Northern","Western"]`
- `stationery-and-printing-kiosk-uganda` → `["Central","Eastern","Northern","Western"]`
- `general-merchandise-duka-uganda` → `["Central","Eastern","Northern","Western"]`
- `local-food-takeaway-uganda` → `["Central","Eastern","Northern","Western"]`
- `home-bakery-uganda` → `["Central","Eastern","Northern","Western"]`
- `snack-and-chips-stall-uganda` → `["Central","Eastern","Northern","Western"]`
- `street-tea-and-breakfast-kiosk-uganda` → `["Central","Eastern","Northern","Western"]`
- `grilled-meat-and-barbeque-point-uganda` → `["Central","Eastern","Northern","Western"]`
- `mobile-food-delivery-uganda` → `["Central","Eastern","Northern","Western"]`
- `small-restaurant-kibanda-specializing-in-one-niche-uganda` → `["Central","Eastern","Northern","Western"]`
- `pig-farming` → `["Central","Eastern","Northern","Western"]`
- `goat-farming-uganda` → `["Central","Eastern","Northern","Western"]`
- `rabbit-farming-uganda` → `["Central","Eastern","Northern","Western"]`
- `vegetable-kitchen-gardening-uganda` → `["Central","Eastern","Northern","Western"]`
- `agro-input-shop-uganda` → `["Central","Eastern","Northern","Western"]`
- `produce-trading-uganda` → `["Central","Eastern","Northern","Western"]`
- `small-scale-food-processing-uganda` → `["Central","Eastern","Northern","Western"]`
- `motorcycle-spare-parts-shop-uganda` → `["Central","Eastern","Northern","Western"]`
- `small-hardware-construction-materials-outlet-uganda` → `["Central","Eastern","Northern","Western"]`

**Geography-specific** (1–2 regions):
- `fruit-selling` → `["Central","Western"]` (Kampala + Mbarara corridors)
- `animal-feed-supply-business` → `["Central","Eastern","Western"]` (farming zones)
- `fresh-juice-business` → `["Central","Western"]` (fruit-growing zones)
- `tomato-farming-uganda` → `["Eastern","Northern"]` (Kapchorwa, Lira, Gulu)
- `matooke-farming-uganda` → `["Central","Western"]` (Buganda + Kigezi highlands)
- `maize-millet-rice-cultivation-uganda` → `["Eastern","Northern"]` (grain belt)
- `groundnut-or-soybean-farming-uganda` → `["Northern","Eastern"]` (Lira, Soroti)

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If you see "Property 'regions' is missing", you missed some idea objects — grep for `slug:` and cross-reference with the tagging list above.

- [ ] **Step 4: Commit**

```bash
git add app/data/ideas.ts
git commit -m "feat: add Region type and regions field to all 48 ideas"
```

---

## Task 2: Create `components/UgandaRegionMap.tsx`

**Files:**
- Create: `components/UgandaRegionMap.tsx`

The SVG uses a simplified schematic map of Uganda's 4 regions. The viewBox is `0 0 200 220`. Approximate polygon shapes:

| Region | Polygon points (x,y) |
|--------|----------------------|
| Northern | `10,10 190,10 190,80 100,90 10,80` |
| Eastern | `100,90 190,80 190,180 130,220 100,180` |
| Western | `10,80 100,90 100,180 60,220 10,180` |
| Central | `100,90 100,180 130,220 60,220` |

- [ ] **Step 1: Create the component file**

Create `components/UgandaRegionMap.tsx` with this full implementation:

```tsx
"use client";

import type { Region } from "../app/data/ideas";

type Props = {
  activeRegion: "All" | Region;
  onRegionClick: (region: "All" | Region) => void;
};

const REGION_COLORS: Record<Region, string> = {
  Central: "#2D5A40",
  Eastern: "#3d7a58",
  Northern: "#4d9a6e",
  Western: "#5db884",
};

const ACTIVE_FILL = "#F5C842";
const ACTIVE_LABEL = "#1C3A2A";
const INACTIVE_LABEL = "#ffffff";

type RegionShape = {
  id: Region;
  points: string;
  labelX: number;
  labelY: number;
};

const REGIONS: RegionShape[] = [
  { id: "Northern", points: "10,10 190,10 190,80 100,90 10,80", labelX: 100, labelY: 50 },
  { id: "Eastern",  points: "100,90 190,80 190,180 130,220 100,180", labelX: 148, labelY: 148 },
  { id: "Western",  points: "10,80 100,90 100,180 60,220 10,180",    labelX: 52,  labelY: 148 },
  { id: "Central",  points: "100,90 100,180 130,220 60,220",          labelX: 95,  labelY: 168 },
];

export default function UgandaRegionMap({ activeRegion, onRegionClick }: Props) {
  const handleClick = (region: Region) => {
    onRegionClick(activeRegion === region ? "All" : region);
  };

  return (
    <div className="w-full mb-4">
      {/* SVG map — hidden on screens narrower than 360px via CSS */}
      <div className="hidden min-[360px]:block">
        <svg
          viewBox="0 0 200 230"
          className="w-full max-w-xs mx-auto block"
          aria-label="Uganda region map filter"
          role="img"
        >
          {REGIONS.map(({ id, points, labelX, labelY }) => {
            const isActive = activeRegion === id;
            return (
              <g
                key={id}
                onClick={() => handleClick(id)}
                className="cursor-pointer"
                role="button"
                aria-label={`Filter by ${id} region${isActive ? " (active)" : ""}`}
                aria-pressed={isActive}
              >
                <polygon
                  points={points}
                  fill={isActive ? ACTIVE_FILL : REGION_COLORS[id]}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-opacity duration-150 hover:opacity-80"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                  className="select-none pointer-events-none"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Reset button — shown only when a region is active */}
        {activeRegion !== "All" && (
          <div className="flex justify-center mt-1">
            <button
              onClick={() => onRegionClick("All")}
              className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2"
            >
              Show all regions
            </button>
          </div>
        )}
      </div>

      {/* Mobile chip fallback — shown only on screens narrower than 360px */}
      <div className="flex min-[360px]:hidden gap-2 overflow-x-auto pb-1">
        {(["All", "Central", "Eastern", "Northern", "Western"] as Array<"All" | Region>).map(r => (
          <button
            key={r}
            onClick={() => onRegionClick(r)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              activeRegion === r
                ? "bg-[#F5C842] text-[#1C3A2A]"
                : "bg-[#2D5A40] text-white"
            }`}
          >
            {r === "All" ? "All Regions" : r}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/UgandaRegionMap.tsx
git commit -m "feat: add UgandaRegionMap SVG component with mobile chip fallback"
```

---

## Task 3: Wire region filter into `IdeasDiscoveryClient.tsx`

**Files:**
- Modify: `app/ideas/IdeasDiscoveryClient.tsx`

- [ ] **Step 1: Add `Region` import and `UgandaRegionMap` import**

At the top of `app/ideas/IdeasDiscoveryClient.tsx`, update the existing import line:

```ts
import type { AudienceSegment, BudgetBand, Category, Idea, Region } from "../data/ideas";
```

Add below it (after the existing imports):

```ts
import UgandaRegionMap from "../../components/UgandaRegionMap";
```

- [ ] **Step 2: Add `region` state**

Inside `IdeasDiscoveryClient`, add region state alongside the existing state hooks (around line 48):

```ts
const [region, setRegion] = useState<"All" | Region>("All");
```

- [ ] **Step 3: Add region filter to `useMemo`**

In the `.filter()` call inside `useMemo`, add region matching. Change:

```ts
return matchSearch && matchCat && matchBudget;
```

To:

```ts
const matchRegion = region === "All" || idea.regions.includes(region);
return matchSearch && matchCat && matchBudget && matchRegion;
```

Also add `region` to the `useMemo` dependency array:

```ts
}, [ideas, search, category, budget, sort, region]);
```

- [ ] **Step 4: Update result count line**

Find (around line 116):

```tsx
<span>Showing {filtered.length} of {ideas.length} ideas</span>
```

Replace with:

```tsx
<span>Showing {filtered.length} of {ideas.length} ideas{region !== "All" ? ` · ${region} Region` : ""}</span>
```

- [ ] **Step 5: Insert `<UgandaRegionMap>` above the search bar**

Find the opening `<div>` of the component return (line 68) followed by the search bar comment. Insert the map component before the search bar:

```tsx
return (
  <div>
    {/* Region map */}
    <UgandaRegionMap activeRegion={region} onRegionClick={setRegion} />

    {/* Search bar */}
    <div className="relative mb-4">
```

- [ ] **Step 6: Update "Clear filters" button to also reset region**

Find (around line 139):

```tsx
onClick={() => { setSearch(""); setCategory("All"); setBudget("All"); }}
```

Replace with:

```tsx
onClick={() => { setSearch(""); setCategory("All"); setBudget("All"); setRegion("All"); }}
```

- [ ] **Step 7: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 8: Run the dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/ideas` and verify:

1. Map renders above search bar
2. Clicking "Northern" filters ideas — count drops and shows "· Northern Region"
3. Clicking "Northern" again resets to all ideas
4. "Show all regions" button appears when a region is active and resets on click
5. "Clear filters" button resets region too
6. On a browser window narrowed to <360px, chip buttons appear instead of the SVG

- [ ] **Step 9: Commit**

```bash
git add app/ideas/IdeasDiscoveryClient.tsx
git commit -m "feat: wire Uganda region map filter into ideas discovery page"
```

---

## Self-Review Checklist

Spec requirements vs plan coverage:

| Requirement | Covered in |
|-------------|-----------|
| Map renders on `/ideas` above search bar | Task 3 Step 5 |
| Clicking region filters idea cards | Task 3 Steps 2–3 |
| Clicking active region resets to "All" | Task 2 Step 1 (`handleClick` toggle logic) |
| "All" reset button | Task 2 Step 1 (`Show all regions` button) |
| Result count reflects region | Task 3 Step 4 |
| Works on mobile — large tap targets | Task 2 Step 1 (polygon ~25% of map area each) |
| <360px fallback to chip buttons | Task 2 Step 1 (chip fallback section) |
| Region colors per spec | Task 2 Step 1 (`REGION_COLORS` map) |
| Active region gold `#F5C842` | Task 2 Step 1 (`ACTIVE_FILL`) |
| TypeScript compiles clean | Tasks 1–3 each have a `tsc --noEmit` step |
| No map on other pages | No changes to homepage, jobs, or slug pages |
| `regions` field on all 48 ideas | Task 1 Step 2 |
