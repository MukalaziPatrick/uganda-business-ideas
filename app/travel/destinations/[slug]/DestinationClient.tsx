"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { TravelDestination, TravelStay } from "@/lib/supabase/travel-types";
import { STAY_TYPE_LABELS, BUDGET_RANGES } from "@/app/data/travel";

type StayCard = Pick<TravelStay, "id" | "name" | "type" | "town" | "district" | "price_from" | "whatsapp" | "booking_com_url" | "cover_photo_url" | "status">;

const PAGE_SIZE = 20;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default function DestinationClient({
  destination,
  initialStays,
}: {
  destination: TravelDestination;
  initialStays: StayCard[];
}) {
  const [stays, setStays] = useState(initialStays);
  const [type, setType] = useState("");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialStays.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const budget = BUDGET_RANGES[budgetIdx];

  const filtered = useMemo(() => {
    return stays.filter((s) => {
      const matchesType = !type || s.type === type;
      const matchesBudget =
        (!budget.min || s.price_from >= budget.min) &&
        (!budget.max || s.price_from <= budget.max);
      return matchesType && matchesBudget;
    });
  }, [stays, type, budget]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const { data } = await getSupabase()
      .from("travel_stays")
      .select("id,name,type,town,district,price_from,whatsapp,booking_com_url,cover_photo_url,status")
      .eq("destination_id", destination.id)
      .in("status", ["active", "featured"])
      .order("status", { ascending: false })
      .order("price_from", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    const rows = (data ?? []) as StayCard[];
    setStays((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset, destination.id]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1">
        <Link href="/travel" className="hover:text-[#1C3A2A]">ZuulaUganda</Link>
        <span>›</span>
        <Link href="/travel/destinations" className="hover:text-[#1C3A2A]">Destinations</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{destination.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d5a27] px-4 py-6 text-white">
        <p className="text-xs text-white/50 mb-1">🇺🇬 {destination.region}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-2" style={{ fontFamily: "Georgia, serif" }}>{destination.name}</h1>
        <p className="text-sm text-white/80 leading-relaxed mb-3">{destination.description}</p>
        <div className="flex gap-2 flex-wrap">
          {destination.activities.map((a) => (
            <span key={a} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{a}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]">
          <option value="">All types</option>
          {Object.entries(STAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={budgetIdx.toString()} onChange={(e) => setBudgetIdx(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]">
          {BUDGET_RANGES.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
        </select>
      </div>

      {/* Stays */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">{filtered.length} places to stay near {destination.name}</p>
          <Link href="/travel/register" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">+ List your place</Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl mb-2">🏨</p>
            <p className="text-sm">No stays found with these filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((stay) => (
              <Link key={stay.id} href={`/travel/stays/${stay.id}`}
                className={`block bg-white rounded-xl border overflow-hidden transition-colors ${stay.status === "featured" ? "border-[#F5C842] border-2" : "border-gray-200 hover:border-[#1C3A2A]"}`}>
                {stay.cover_photo_url ? (
                  <div className="relative h-36 w-full">
                    <Image src={stay.cover_photo_url} alt={stay.name} fill className="object-cover" />
                    {stay.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">⭐ FEATURED</span>
                    )}
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] flex items-center justify-center text-3xl">🏨</div>
                )}
                <div className="p-3">
                  <p className="font-black text-[#1C3A2A] text-sm">{stay.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{STAY_TYPE_LABELS[stay.type]} · {stay.town}</p>
                  <p className="text-xs font-bold text-[#2d6a4f] mt-1">From UGX {stay.price_from.toLocaleString()} / night</p>
                  <div className="flex gap-2 mt-2">
                    {stay.whatsapp && (
                      <div onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${stay.whatsapp.replace(/\D/g, "")}`, "_blank"); }}
                        className="flex-1 bg-[#25d366] text-white text-center text-xs font-bold py-1.5 rounded-lg">💬 WhatsApp</div>
                    )}
                    {stay.booking_com_url ? (
                      <div onClick={(e) => { e.preventDefault(); window.open(stay.booking_com_url!, "_blank"); }}
                        className="flex-1 bg-[#003580] text-white text-center text-xs font-bold py-1.5 rounded-lg">🌐 Booking.com</div>
                    ) : (
                      <div className="flex-1 bg-[#1C3A2A] text-white text-center text-xs font-bold py-1.5 rounded-lg">📋 Request</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <button onClick={loadMore} disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-bold text-white disabled:opacity-50">
            {loading ? "Loading..." : "Load more stays →"}
          </button>
        )}
      </div>
    </div>
  );
}
