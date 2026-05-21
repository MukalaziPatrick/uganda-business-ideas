"use client";

import { useState } from "react";
import Link from "next/link";
import type { TravelDestination } from "@/lib/supabase/travel-types";

const DESTINATION_GRADIENTS = [
  "from-[#1a3a1a] to-[#2d5a27]",
  "from-[#1a4a6e] to-[#0d3a5c]",
  "from-[#5a3a1a] to-[#3a2010]",
  "from-[#1a5a3a] to-[#0d3a27]",
  "from-[#3a1a5a] to-[#2a0d3a]",
  "from-[#5a1a1a] to-[#3a0d0d]",
];

export default function TravelHomeClient({ destinations }: { destinations: TravelDestination[] }) {
  const [search, setSearch] = useState("");

  const filtered = destinations.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 pt-8 pb-6 text-center text-white">
        <h1 className="text-3xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 ZuulaUganda
        </h1>
        <p className="text-sm text-white/80 mb-4">Discover where to stay across Uganda</p>
        <div className="max-w-md mx-auto bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination..."
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#1C3A2A] uppercase tracking-wide">
            {search ? `${filtered.length} destinations found` : "Popular Destinations"}
          </p>
          <Link href="/travel/destinations" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((d, i) => (
            <Link
              key={d.id}
              href={`/travel/destinations/${d.slug}`}
              className={`relative rounded-xl bg-gradient-to-br ${DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]} p-4 text-white min-h-[90px] flex flex-col justify-end`}
            >
              {d.is_featured && (
                <span className="absolute top-2 right-2 bg-[#F5C842] text-[#1C3A2A] text-[9px] font-black px-2 py-0.5 rounded-full">
                  🔥 HOT
                </span>
              )}
              {d.activities[0] && (
                <p className="text-[10px] text-white/60 mb-1">{d.activities[0]}</p>
              )}
              <p className="font-black text-sm leading-tight">{d.name}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{d.region}</p>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-sm">No destinations found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
