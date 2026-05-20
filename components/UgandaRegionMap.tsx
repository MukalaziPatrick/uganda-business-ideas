"use client";

import type { Region } from "../app/data/ideas";

type Props = {
  activeRegion: "All" | Region;
  onRegionClick: (region: "All" | Region) => void;
};

const FILL: Record<Region, string> = {
  Northern: "#4d9a6e",
  Eastern:  "#3d7a58",
  Western:  "#2D5A40",
  Central:  "#1C3A2A",
};
const ACTIVE_FILL   = "#F5C842";
const ACTIVE_TEXT   = "#1C3A2A";
const INACTIVE_TEXT = "#e8f5ee";

type RegionDef = {
  id: Region;
  topPath: string;
  labelX: number;
  labelY: number;
};

// Real Uganda region boundaries — geoBoundaries ADM1, projected 200×200 viewBox
const REGIONS: RegionDef[] = [
  {
    id: "Northern",
    topPath: "M 184.8,100.3 L 191.7,90.6 L 189.1,67.1 L 190.5,64.6 L 173.6,41.8 L 171.4,32.1 L 173.8,26.1 L 164.1,22.9 L 165.0,19.2 L 161.1,19.8 L 162.6,16.8 L 160.1,14.5 L 160.3,10.8 L 155.7,9.8 L 141.0,23.4 L 130.3,22.5 L 126.4,19.7 L 104.5,23.6 L 96.9,28.4 L 97.2,31.3 L 88.9,29.2 L 84.1,21.1 L 74.0,27.1 L 66.3,22.0 L 58.8,23.6 L 51.3,31.6 L 54.6,32.6 L 48.6,46.0 L 52.7,52.5 L 48.0,60.9 L 48.0,66.3 L 50.8,66.1 L 53.3,69.2 L 56.7,67.0 L 66.0,74.0 L 72.1,68.4 L 74.3,64.4 L 72.5,63.3 L 74.5,64.7 L 68.6,71.9 L 78.5,71.5 L 84.6,67.9 L 95.3,72.6 L 99.2,71.6 L 102.3,77.4 L 102.0,84.2 L 93.9,88.2 L 93.5,91.1 L 100.4,90.9 L 111.5,97.9 L 123.3,96.6 L 122.4,91.4 L 127.0,88.5 L 128.1,84.4 L 139.6,75.6 L 139.1,72.1 L 142.8,70.6 L 142.4,68.3 L 149.1,66.4 L 165.2,75.9 L 165.9,93.3 L 179.0,93.4 L 184.7,100.2 Z",
    labelX: 120,
    labelY: 50,
  },
  {
    id: "Eastern",
    topPath: "M 118.1,96.7 L 127.0,126.6 L 131.2,131.0 L 137.8,128.8 L 134.7,132.7 L 140.7,132.7 L 141.6,135.5 L 137.8,135.2 L 140.6,138.6 L 145.5,137.2 L 144.3,134.0 L 149.1,133.9 L 148.2,138.1 L 151.0,136.4 L 152.1,139.7 L 152.2,137.7 L 154.7,138.8 L 161.5,133.0 L 162.8,125.5 L 172.2,118.3 L 175.7,108.9 L 186.3,103.4 L 181.8,95.1 L 176.6,92.7 L 165.9,93.9 L 165.4,77.7 L 149.0,66.4 L 142.3,68.3 L 142.8,70.5 L 139.1,72.1 L 139.6,75.7 L 134.2,78.4 L 122.3,91.3 L 123.0,96.6 L 118.7,96.6 Z",
    labelX: 158,
    labelY: 108,
  },
  {
    id: "Western",
    topPath: "M 68.6,71.9 L 70.6,82.3 L 65.9,89.8 L 54.9,94.6 L 43.1,111.2 L 39.4,110.9 L 37.8,105.9 L 39.4,105.4 L 35.0,105.6 L 30.6,107.8 L 27.8,115.8 L 22.2,117.0 L 21.9,127.7 L 13.0,141.9 L 13.4,146.7 L 16.9,149.9 L 19.6,149.3 L 17.9,155.1 L 11.9,158.8 L 8.1,182.5 L 8.7,189.0 L 15.7,188.6 L 16.7,186.5 L 19.9,192.1 L 28.0,187.8 L 34.6,178.5 L 44.6,178.7 L 48.4,176.1 L 65.6,176.5 L 63.1,168.4 L 59.5,165.5 L 61.7,159.2 L 56.9,137.8 L 61.3,133.1 L 61.2,128.0 L 64.9,127.2 L 63.7,123.9 L 66.3,120.4 L 69.4,121.4 L 71.1,113.6 L 74.3,111.6 L 66.3,105.2 L 74.5,100.3 L 84.7,100.4 L 93.4,92.9 L 94.0,88.1 L 101.9,84.5 L 102.6,81.5 L 99.9,72.1 L 95.3,72.6 L 87.6,68.0 L 78.5,71.5 L 68.6,71.8 Z",
    labelX: 40,
    labelY: 145,
  },
  {
    id: "Central",
    topPath: "M 93.6,91.1 L 84.7,100.4 L 74.5,100.3 L 66.3,105.2 L 74.3,111.6 L 71.1,113.6 L 69.4,121.4 L 66.3,120.4 L 63.7,123.9 L 64.9,127.2 L 61.2,128.0 L 61.3,133.1 L 56.9,137.8 L 61.7,159.2 L 59.5,165.5 L 63.1,168.4 L 65.6,176.5 L 83.2,176.5 L 82.7,172.6 L 80.0,171.0 L 84.9,160.6 L 91.8,154.6 L 89.2,150.0 L 87.1,152.7 L 87.7,148.7 L 93.2,147.2 L 91.1,145.6 L 96.9,146.8 L 97.8,142.9 L 99.4,145.5 L 100.7,144.1 L 98.3,142.5 L 103.1,144.5 L 102.3,142.2 L 105.5,140.4 L 105.2,143.7 L 106.8,141.5 L 109.9,142.9 L 109.6,137.9 L 112.8,134.6 L 112.5,138.9 L 115.6,138.8 L 112.7,141.7 L 119.3,140.0 L 120.0,137.9 L 120.7,142.1 L 123.2,141.7 L 127.3,138.4 L 126.3,136.1 L 128.7,137.3 L 129.2,134.5 L 133.4,132.4 L 125.9,125.0 L 125.2,117.5 L 121.9,111.8 L 122.3,105.6 L 118.0,96.7 L 112.0,97.9 L 99.7,90.6 L 93.6,91.1 Z",
    labelX: 100,
    labelY: 130,
  },
];

export default function UgandaRegionMap({ activeRegion, onRegionClick }: Props) {
  const handleClick = (region: Region) => {
    onRegionClick(activeRegion === region ? "All" : region);
  };

  return (
    <div className="w-full mb-4">
      <div className="hidden min-[360px]:block">
        <svg
          viewBox="0 0 210 210"
          className="w-full max-w-xs mx-auto block"
          aria-label="Uganda region map filter"
          role="img"
        >
          {REGIONS.map(({ id, topPath, labelX, labelY }) => {
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
                <path
                  d={topPath}
                  fill={isActive ? ACTIVE_FILL : FILL[id]}
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity={isActive ? 1 : 0.9}
                  className="transition-all duration-150 hover:opacity-100"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
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

      {/* Mobile chip fallback for very narrow screens */}
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
