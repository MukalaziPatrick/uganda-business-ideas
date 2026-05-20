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
