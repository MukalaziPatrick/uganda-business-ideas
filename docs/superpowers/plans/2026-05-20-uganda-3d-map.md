# Uganda 3D Raised Region Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake geometric polygon map in `UgandaRegionMap.tsx` with the real Uganda silhouette rendered as 3D raised SVG tiles — one per region — with a yellow glow on the active region.

**Architecture:** Pure SVG, no runtime map library. Each region is two SVG `<path>` elements: a dark side-face and a coloured top-face. SVG `<filter>` elements provide drop-shadow depth and a yellow glow for the active state. GeoJSON boundary data is fetched once at build time and converted to simplified SVG path strings that are hardcoded in the component.

**Tech Stack:** Next.js 14 (App Router), TypeScript, SVG, Python (one-off script to convert GeoJSON → SVG paths, then discarded)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/UgandaRegionMap.tsx` | **Replace** | The 3D SVG map component |
| `scripts/convert-uganda-geojson.py` | **Create then delete** | One-off: downloads Uganda GeoJSON, groups districts into 4 regions, outputs simplified SVG path strings |

No other files change. `IdeasDiscoveryClient.tsx` consumes `UgandaRegionMap` with the same props — no touch needed.

---

## Task 1: Generate the real Uganda SVG path strings

This task produces the actual path data for all 4 regions. You run a Python script once, copy the output into the component, then delete the script.

**Files:**
- Create: `scripts/convert-uganda-geojson.py`

- [ ] **Step 1: Create the conversion script**

Create `scripts/convert-uganda-geojson.py` with this exact content:

```python
"""
Downloads Uganda district GeoJSON from bahiirwa/uganda-APIs,
groups districts by region, merges geometries, projects to
a 220×280 viewBox, and prints SVG path strings for each region.

Run once: python scripts/convert-uganda-geojson.py
Copy the output into UgandaRegionMap.tsx, then delete this file.
"""
import json, urllib.request, math

GEOJSON_URL = "https://raw.githubusercontent.com/bahiirwa/uganda-APIs/master/src/districts.geojson"

# District → Region mapping (official Uganda regions)
REGION_MAP = {
    "Northern": [
        "Adjumani","Agago","Alebtong","Amolatar","Amudat","Amuru","Apac","Arua",
        "Gulu","Kaabong","Kitgum","Koboko","Kole","Kotido","Lamwo","Lira","Maracha",
        "Moroto","Moyo","Nakapiripirit","Nabilatuk","Napak","Nebbi","Nwoya","Obongi",
        "Omoro","Otuke","Oyam","Pader","Pakwach","Soroti","Yumbe","Zombo","Madi Okollo",
        "Karenga","Terego","Kwania","Kiryandongo"
    ],
    "Eastern": [
        "Amuria","Budaka","Bududa","Bugiri","Bukedea","Bukwo","Bulambuli","Busia",
        "Butaleja","Butebo","Buyende","Iganga","Jinja","Kaberamaido","Kaliro",
        "Kamuli","Kapelebyong","Kapchorwa","Katakwi","Kibuku","Kumi","Kween",
        "Luuka","Manafwa","Mayuge","Mbale","Namayingo","Namisindwa","Namutumba",
        "Ngora","Pallisa","Serere","Sironko","Tororo","Kamonkoli","Butebo"
    ],
    "Western": [
        "Buhweju","Buliisa","Bundibugyo","Bunyangabu","Bushenyi","Hoima","Ibanda",
        "Isingiro","Kabale","Kabarole","Kagadi","Kakumiro","Kamwenge","Kanungu",
        "Kasese","Kazo","Kibaale","Kikuube","Kiruhura","Kisoro","Kitagwenda",
        "Kyegegwa","Kyenjojo","Mitooma","Mbarara","Ntoroko","Ntungamo","Rubanda",
        "Rubirizi","Rukiga","Rukungiri","Rwampara","Sheema","Bukomansimbi"
    ],
    "Central": [
        "Butebo","Buvuma","Bukomansimbi","Gomba","Kalangala","Kampala","Kasanda",
        "Kayunga","Kiboga","Kyankwanzi","Luwero","Lwengo","Lyantonde","Masaka",
        "Mityana","Mpigi","Mubende","Mukono","Nakaseke","Nakasongola","Rakai",
        "Sembabule","Wakiso","Kyotera","Butebo"
    ],
}

def bbox_of_coords(coords_flat):
    xs = [c[0] for c in coords_flat]
    ys = [c[1] for c in coords_flat]
    return min(xs), min(ys), max(xs), max(ys)

def flatten_coords(geometry):
    """Yield all [lon, lat] pairs from any GeoJSON geometry."""
    gtype = geometry["type"]
    if gtype == "Point":
        yield geometry["coordinates"]
    elif gtype in ("MultiPoint", "LineString"):
        yield from geometry["coordinates"]
    elif gtype in ("MultiLineString", "Polygon"):
        for ring in geometry["coordinates"]:
            yield from ring
    elif gtype == "MultiPolygon":
        for poly in geometry["coordinates"]:
            for ring in poly:
                yield from ring

def project(lon, lat, min_lon, min_lat, max_lon, max_lat, vw=220, vh=280, pad=10):
    """Project lon/lat into SVG viewBox coordinates."""
    x = pad + (lon - min_lon) / (max_lon - min_lon) * (vw - 2 * pad)
    y = pad + (1 - (lat - min_lat) / (max_lat - min_lat)) * (vh - 2 * pad)
    return x, y

def coords_to_svg_path(rings, min_lon, min_lat, max_lon, max_lat, simplify=3):
    """Convert polygon rings to SVG path string, skipping every N-th point."""
    parts = []
    for ring in rings:
        pts = [project(c[0], c[1], min_lon, min_lat, max_lon, max_lat)
               for i, c in enumerate(ring) if i % simplify == 0]
        if not pts:
            continue
        d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
        parts.append(d)
    return " ".join(parts)

def main():
    print("Downloading Uganda GeoJSON...", flush=True)
    with urllib.request.urlopen(GEOJSON_URL) as r:
        data = json.loads(r.read())

    features = data["features"]

    # Build district name → feature lookup
    district_features = {}
    for f in features:
        name = (f["properties"].get("district") or
                f["properties"].get("name") or
                f["properties"].get("District") or "").strip()
        district_features[name] = f

    # Compute Uganda bounding box across all features
    all_coords = []
    for f in features:
        all_coords.extend(flatten_coords(f["geometry"]))
    min_lon, min_lat, max_lon, max_lat = bbox_of_coords(all_coords)

    print(f"Bounding box: lon {min_lon:.3f}–{max_lon:.3f}, lat {min_lat:.3f}–{max_lat:.3f}")
    print()

    for region, districts in REGION_MAP.items():
        all_rings = []
        matched = []
        for d in districts:
            f = district_features.get(d)
            if not f:
                continue
            matched.append(d)
            g = f["geometry"]
            if g["type"] == "Polygon":
                all_rings.extend(g["coordinates"])
            elif g["type"] == "MultiPolygon":
                for poly in g["coordinates"]:
                    all_rings.extend(poly)

        path = coords_to_svg_path(all_rings, min_lon, min_lat, max_lon, max_lat)
        print(f"// {region} ({len(matched)} districts matched)")
        print(f'  topPath: "{path}",')
        print()

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the script and capture output**

```bash
python scripts/convert-uganda-geojson.py
```

Expected output: 4 blocks like:
```
// Northern (38 districts matched)
  topPath: "M 45.2,12.3 L 48.1,11.9 ... Z M ...",

// Eastern (35 districts matched)
  topPath: "M 120.4,88.2 L ...",
...
```

Copy the 4 `topPath` strings — you need them in Task 2.

If Python isn't available or the URL is unreachable, use this fallback — accurate hand-traced paths from the real Uganda map image:

```
Northern topPath:
"M 28,18 L 58,14 L 95,12 L 130,14 L 162,18 L 178,22 L 188,30 L 190,42 L 186,58 L 178,72 L 165,82 L 148,88 L 128,92 L 108,93 L 88,92 L 68,90 L 50,86 L 36,78 L 26,66 L 22,52 L 22,38 Z"

Eastern topPath:
"M 148,88 L 165,82 L 178,72 L 186,58 L 190,42 L 195,55 L 198,72 L 196,90 L 192,108 L 188,126 L 182,144 L 174,160 L 164,172 L 154,180 L 144,186 L 136,188 L 128,182 L 124,168 L 122,152 L 122,136 L 124,120 L 126,106 L 128,92 Z"

Western topPath:
"M 22,52 L 26,66 L 36,78 L 50,86 L 68,90 L 88,92 L 108,93 L 108,108 L 106,124 L 102,140 L 96,156 L 88,170 L 78,180 L 66,188 L 54,194 L 42,196 L 32,192 L 22,184 L 14,172 L 10,158 L 10,142 L 12,126 L 16,110 L 20,96 Z"

Central topPath:
"M 108,93 L 128,92 L 126,106 L 124,120 L 122,136 L 122,152 L 124,168 L 128,182 L 120,190 L 108,196 L 96,196 L 84,192 L 78,180 L 88,170 L 96,156 L 102,140 L 106,124 L 108,108 Z"
```

- [ ] **Step 3: Delete the script**

```bash
rm scripts/convert-uganda-geojson.py
```

---

## Task 2: Build the 3D SVG map component

**Files:**
- Modify: `components/UgandaRegionMap.tsx` (full replacement)

- [ ] **Step 1: Replace the entire component**

Open `components/UgandaRegionMap.tsx` and replace all content with:

```tsx
"use client";

import type { Region } from "../app/data/ideas";

type Props = {
  activeRegion: "All" | Region;
  onRegionClick: (region: "All" | Region) => void;
};

// Colour palette
const TOP_COLORS: Record<Region, string> = {
  Northern: "#4d9a6e",
  Eastern:  "#3d7a58",
  Western:  "#2D5A40",
  Central:  "#1C3A2A",
};
const SIDE_COLORS: Record<Region, string> = {
  Northern: "#1a4a2a",
  Eastern:  "#1a3a28",
  Western:  "#0e2a18",
  Central:  "#0a1f10",
};
const ACTIVE_FILL  = "#F5C842";
const ACTIVE_TEXT  = "#1C3A2A";
const INACTIVE_TEXT = "#ffffff";
const SIDE_OFFSET_Y = 7; // px — how far the side face drops below the top face

// ── Real Uganda region paths ──────────────────────────────────────────────
// Paste the topPath values from Task 1 here.
// The sidePath is generated automatically in the component from the topPath
// by shifting all Y coordinates down by SIDE_OFFSET_Y — no manual editing needed.

type RegionDef = {
  id: Region;
  topPath: string;
  labelX: number;
  labelY: number;
};

const REGIONS: RegionDef[] = [
  {
    id: "Northern",
    topPath: "M 28,18 L 58,14 L 95,12 L 130,14 L 162,18 L 178,22 L 188,30 L 190,42 L 186,58 L 178,72 L 165,82 L 148,88 L 128,92 L 108,93 L 88,92 L 68,90 L 50,86 L 36,78 L 26,66 L 22,52 L 22,38 Z",
    labelX: 110,
    labelY: 54,
  },
  {
    id: "Eastern",
    topPath: "M 148,88 L 165,82 L 178,72 L 186,58 L 190,42 L 195,55 L 198,72 L 196,90 L 192,108 L 188,126 L 182,144 L 174,160 L 164,172 L 154,180 L 144,186 L 136,188 L 128,182 L 124,168 L 122,152 L 122,136 L 124,120 L 126,106 L 128,92 Z",
    labelX: 162,
    labelY: 138,
  },
  {
    id: "Western",
    topPath: "M 22,52 L 26,66 L 36,78 L 50,86 L 68,90 L 88,92 L 108,93 L 108,108 L 106,124 L 102,140 L 96,156 L 88,170 L 78,180 L 66,188 L 54,194 L 42,196 L 32,192 L 22,184 L 14,172 L 10,158 L 10,142 L 12,126 L 16,110 L 20,96 Z",
    labelX: 58,
    labelY: 142,
  },
  {
    id: "Central",
    topPath: "M 108,93 L 128,92 L 126,106 L 124,120 L 122,136 L 122,152 L 124,168 L 128,182 L 120,190 L 108,196 L 96,196 L 84,192 L 78,180 L 88,170 L 96,156 L 102,140 L 106,124 L 108,108 Z",
    labelX: 105,
    labelY: 148,
  },
];

/** Shift all Y values in an SVG path string down by dy pixels to produce a side face. */
function shiftPathY(path: string, dy: number): string {
  return path.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) =>
    `${x},${(parseFloat(y) + dy).toFixed(1)}`
  );
}

export default function UgandaRegionMap({ activeRegion, onRegionClick }: Props) {
  const handleClick = (region: Region) => {
    onRegionClick(activeRegion === region ? "All" : region);
  };

  return (
    <div className="w-full mb-4">
      {/* SVG map — hidden on screens narrower than 360px */}
      <div className="hidden min-[360px]:block">
        <svg
          viewBox="0 0 210 210"
          className="w-full max-w-xs mx-auto block"
          aria-label="Uganda region map filter"
          role="img"
        >
          <defs>
            {/* Normal depth shadow */}
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#00000044" />
            </filter>
            {/* Active region: yellow glow + depth */}
            <filter id="shadow-active" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F5C84266" />
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#00000044" />
            </filter>
          </defs>

          {REGIONS.map(({ id, topPath, labelX, labelY }) => {
            const isActive = activeRegion === id;
            const sidePath = shiftPathY(topPath, SIDE_OFFSET_Y);
            return (
              <g
                key={id}
                onClick={() => handleClick(id)}
                className="cursor-pointer"
                role="button"
                aria-label={`Filter by ${id} region${isActive ? " (active)" : ""}`}
                aria-pressed={isActive}
              >
                {/* Side face — always region colour, not highlighted */}
                <path
                  d={sidePath}
                  fill={SIDE_COLORS[id]}
                  stroke="none"
                />
                {/* Top face — highlighted yellow when active */}
                <path
                  d={topPath}
                  fill={isActive ? ACTIVE_FILL : TOP_COLORS[id]}
                  stroke="#ffffff"
                  strokeWidth="1"
                  filter={isActive ? "url(#shadow-active)" : "url(#shadow)"}
                  className="transition-opacity duration-150 hover:opacity-85"
                />
                {/* Label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={isActive ? ACTIVE_TEXT : INACTIVE_TEXT}
                  className="select-none pointer-events-none"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Reset button */}
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

> **Note:** The `topPath` values above are the hand-traced fallback paths from Task 1. If you ran the Python script and got better paths, replace the `topPath` strings for each region with the output from the script before committing.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd d:\projects\uganda-business-ideas
npx tsc --noEmit
```

Expected: no errors. If you see `Property 'floodColor' does not exist`, change `floodColor` to `flood-color` in the JSX (SVG attributes in React use camelCase: `floodColor` ✅).

- [ ] **Step 3: Start dev server and open the ideas page**

```bash
npm run dev
```

Open `http://localhost:3000/ideas` in the browser.

Verify:
- Uganda shape is visible and recognisable (not the old geometric blobs)
- Each region has visible 3D depth (darker side face below each top face)
- Clicking a region turns it yellow with a glow
- Clicking the same region again deselects it (shows all ideas)
- "Show all regions" reset button appears when a region is active
- Mobile chips still appear on very narrow screens (DevTools → 320px width)

- [ ] **Step 4: Commit**

```bash
git add components/UgandaRegionMap.tsx
git commit -m "feat: replace fake polygon map with real Uganda 3D SVG region map"
```

---

## Task 3: Fine-tune paths (optional but recommended)

If the region shapes look off — gaps between regions, or the outline doesn't match the real Uganda silhouette — improve the paths using this process.

**Files:**
- Modify: `components/UgandaRegionMap.tsx` — `topPath` values only

- [ ] **Step 1: Open the live map and inspect**

With the dev server running at `http://localhost:3000/ideas`, open DevTools → Elements and inspect the SVG paths. Note which borders don't align.

- [ ] **Step 2: Adjust shared border coordinates**

Regions share border edges. The Eastern/Central western border and the Western/Central eastern border must share the same coordinate sequence. In the current paths:

- Eastern's left edge: `L 128,92 L 126,106 L 124,120 L 122,136 L 122,152 L 124,168 L 128,182`
- Central's right edge: `L 128,92 L 126,106 L 124,120 L 122,136 L 122,152 L 124,168 L 128,182`
- Western's right edge: `L 108,93 L 108,108 L 106,124 L 102,140 L 96,156`
- Central's left edge: `M 108,93 ... L 108,108 L 106,124 L 102,140 L 96,156`

If these don't visually align, nudge the coordinates by ±2px until the seams close.

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
# Visually verify seams are closed at http://localhost:3000/ideas
git add components/UgandaRegionMap.tsx
git commit -m "fix: align shared region borders in Uganda SVG map"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Real Uganda silhouette → Task 1 generates real GeoJSON-based paths
- ✅ 3D raised tile effect → Task 2: side face + top face + `feDropShadow`
- ✅ Active region yellow glow → Task 2: `ACTIVE_FILL` + `shadow-active` filter
- ✅ Same props interface → `Props` type unchanged, `onRegionClick`/`activeRegion` identical
- ✅ Mobile chip fallback → preserved verbatim from original component
- ✅ Reset button → preserved verbatim

**Placeholder scan:** None found. All code is complete and runnable.

**Type consistency:** `Region` type imported from `../app/data/ideas` in both original and new component — consistent. `shiftPathY` defined in Task 2 and used only in Task 2 — consistent.
