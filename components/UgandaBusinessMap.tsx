"use client";

import type { UgandaRegion } from "@/app/data/businesses";
import { UGANDA_REGIONS } from "@/app/data/businesses";

type Props = {
  activeRegion: "All" | UgandaRegion;
  onRegionClick: (region: "All" | UgandaRegion) => void;
  businessCounts?: Partial<Record<UgandaRegion, number>>;
};

const REGION_COLORS: Record<UgandaRegion, string> = {
  Central:  "#F5C842",
  Eastern:  "#3d7a58",
  Northern: "#4d9a6e",
  Western:  "#2D5A40",
};

const REGION_TEXT_COLORS: Record<UgandaRegion, string> = {
  Central:  "#1C3A2A",
  Eastern:  "#ffffff",
  Northern: "#ffffff",
  Western:  "#ffffff",
};

const ACTIVE_STROKE = "#1C3A2A";
const INACTIVE_OPACITY = "0.45";

const REGION_PATHS: Record<UgandaRegion, { d: string; labelX: number; labelY: number }> = {
  Northern: {
    d: "M95,32 C110,25 145,20 185,18 L255,17 C295,17 335,19 365,24 C385,27 405,33 418,42 C428,49 432,58 430,68 L425,95 C422,108 415,120 405,130 C395,140 382,148 368,153 L340,162 C320,168 298,172 278,173 L248,174 C228,174 208,172 190,167 L165,159 C148,153 133,144 122,133 C110,121 103,107 100,93 L94,65 C92,53 93,41 95,32 Z",
    labelX: 262, labelY: 105,
  },
  Eastern: {
    d: "M340,162 L368,153 C382,148 395,140 405,130 C415,120 422,108 425,95 L430,68 C432,58 442,52 455,58 C468,65 478,80 482,98 L485,130 C486,150 482,175 474,198 L462,228 C450,255 434,278 415,295 C398,310 378,320 357,326 L332,330 C316,332 300,330 286,322 L272,310 C260,298 253,282 252,265 L252,240 C252,222 258,205 268,192 L285,178 C305,170 322,165 340,162 Z",
    labelX: 385, labelY: 245,
  },
  Central: {
    d: "M190,167 L208,172 L228,174 L248,174 L278,173 L298,172 L320,168 L340,162 C322,165 305,170 285,178 L268,192 C258,205 252,222 252,240 L252,265 C253,282 260,298 272,310 L286,322 C300,330 316,332 332,330 L340,338 C325,355 305,368 282,374 L255,378 C232,378 210,370 194,356 L178,340 C165,325 158,306 158,287 L158,260 C158,240 164,222 175,207 L185,190 C187,182 188,175 190,167 Z",
    labelX: 245, labelY: 278,
  },
  Western: {
    d: "M90,130 L120,140 L160,148 L200,155 L190,167 C188,175 187,182 185,190 L175,207 C164,222 158,240 158,260 L158,287 C158,306 165,325 178,340 L194,356 C178,362 158,362 140,355 L115,342 C92,328 72,308 60,284 L50,258 C42,235 40,208 44,182 L52,155 C60,128 74,105 92,86 L95,32 C93,41 92,53 94,65 L100,93 C103,107 110,121 122,133 Z",
    labelX: 108, labelY: 272,
  },
};

export default function UgandaBusinessMap({ activeRegion, onRegionClick, businessCounts }: Props) {
  const handleClick = (region: UgandaRegion) => {
    onRegionClick(activeRegion === region ? "All" : region);
  };

  return (
    <div className="w-full">
      <div className="hidden min-[360px]:block">
        <svg
          viewBox="0 0 500 520"
          className="w-full max-w-xs mx-auto block"
          aria-label="Uganda region map filter"
          role="img"
        >
          <ellipse cx="310" cy="440" rx="72" ry="46"
            fill="#bee3f8" stroke="#7ec8e3" strokeWidth="1.5"
            strokeDasharray="5,3" opacity="0.7" />
          <text x="310" y="444" textAnchor="middle" fontSize="10"
            fill="#2b6cb0" fontStyle="italic" style={{ fontFamily: "system-ui" }}>
            Lake Victoria
          </text>

          {(["Northern", "Eastern", "Central", "Western"] as UgandaRegion[]).map((region) => {
            const { d, labelX, labelY } = REGION_PATHS[region];
            const isActive = activeRegion === region;
            const isDimmed = activeRegion !== "All" && !isActive;
            const count = businessCounts?.[region];

            return (
              <g
                key={region}
                onClick={() => handleClick(region)}
                className="cursor-pointer"
                role="button"
                aria-label={`${region} region${isActive ? " (selected)" : ""}${count != null ? ` — ${count} businesses` : ""}`}
                aria-pressed={isActive}
              >
                <path
                  d={d}
                  fill={REGION_COLORS[region]}
                  stroke={isActive ? ACTIVE_STROKE : "#ffffff"}
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isDimmed ? INACTIVE_OPACITY : 1}
                  className="transition-opacity duration-150 hover:opacity-80"
                />
                <text
                  x={labelX} y={labelY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="14" fontWeight="bold"
                  fill={REGION_TEXT_COLORS[region]}
                  opacity={isDimmed ? 0.5 : 1}
                  className="select-none pointer-events-none"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {region}
                </text>
                {count != null && (
                  <text
                    x={labelX} y={labelY + 16}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="10"
                    fill={REGION_TEXT_COLORS[region]}
                    opacity={isDimmed ? 0.4 : 0.85}
                    className="select-none pointer-events-none"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {count} businesses
                  </text>
                )}
              </g>
            );
          })}

          <circle cx="235" cy="248" r="5" fill="#e53e3e" stroke="white" strokeWidth="2" />
          <text x="248" y="245" fontSize="9" fill="#e53e3e" fontWeight="700"
            style={{ fontFamily: "system-ui" }}>Kampala</text>
        </svg>

        {activeRegion !== "All" && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => onRegionClick("All")}
              className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2"
            >
              Show all regions
            </button>
          </div>
        )}
      </div>

      <div className="flex min-[360px]:hidden gap-2 overflow-x-auto pb-1">
        {(["All", ...UGANDA_REGIONS] as Array<"All" | UgandaRegion>).map((r) => (
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
