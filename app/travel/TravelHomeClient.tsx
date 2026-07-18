"use client";

import { useState } from "react";
import Link from "next/link";
import type { TravelDestination } from "@/lib/supabase/travel-types";

const DESTINATION_GRADIENTS = [
  "from-brand-forest to-brand-green",
  "from-brand-green to-brand-forest",
  "from-brand-forest to-brand-green",
  "from-brand-green to-brand-forest",
  "from-brand-forest to-brand-green",
  "from-brand-green to-brand-forest",
];

export default function TravelHomeClient({ destinations }: { destinations: TravelDestination[] }) {
  const [search, setSearch] = useState("");

  const filtered = destinations.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="motion-page relative overflow-hidden bg-gradient-to-br from-brand-forest to-brand-green px-4 pt-10 pb-8 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl" />
        <h1 className="relative text-3xl font-black text-brand-gold mb-1 sm:text-4xl" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          🇺🇬 ZuulaUganda
        </h1>
        <p className="relative text-sm text-brand-cream/85 mb-5">Discover where to stay across Uganda</p>
        <div className="relative max-w-md mx-auto bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-brand-forest/10 focus-within:ring-2 focus-within:ring-brand-gold">
          <span className="text-brand-green">🔍</span>
          <input
            type="search"
            aria-label="Search destinations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination..."
            className="flex-1 text-sm text-brand-forest/90 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-brand-forest uppercase tracking-wide">
            {search ? `${filtered.length} destinations found` : "Popular Destinations"}
          </p>
          <Link href="/travel/destinations" className="text-xs font-bold text-brand-forest underline underline-offset-2">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((d, i) => (
            <Link
              key={d.id}
              href={`/travel/destinations/${d.slug}`}
              className={`motion-card relative overflow-hidden rounded-2xl bg-gradient-to-br ${DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]} p-4 text-white min-h-[100px] flex flex-col justify-end shadow-sm shadow-brand-forest/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2`}
            >
              {d.is_featured && (
                <span className="absolute top-2 right-2 bg-brand-gold text-brand-forest text-[9px] font-black px-2 py-0.5 rounded-full">
                  🔥 HOT
                </span>
              )}
              {d.activities[0] && (
                <p className="text-[10px] text-brand-cream/85 mb-1">{d.activities[0]}</p>
              )}
              <p className="font-black text-sm leading-tight">{d.name}</p>
              <p className="text-[10px] text-brand-cream/85 mt-0.5">{d.region}</p>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-12 text-center text-brand-green">
            <p className="text-3xl mb-3">🗺️</p>
            <p className="text-sm font-semibold text-brand-forest">No destinations found for &ldquo;{search}&rdquo;</p>
            <p className="mt-1 text-xs">Try another destination or region name.</p>
          </div>
        )}
      </div>
    </div>
  );
}
