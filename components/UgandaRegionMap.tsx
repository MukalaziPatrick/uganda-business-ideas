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
