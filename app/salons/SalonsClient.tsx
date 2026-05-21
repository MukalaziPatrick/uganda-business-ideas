"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { Salon } from "@/lib/supabase/salon-types";
import { SALON_GENDER_LABELS, SALON_TYPE_LABELS } from "@/app/data/salons";

type SalonCard = Pick<Salon, "id" | "name" | "type" | "gender" | "district" | "town" | "region" | "service_area" | "whatsapp" | "cover_photo_url" | "status">;

const PAGE_SIZE = 20;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function SalonsClient({
  initialSalons,
  initialQuery,
  initialGender,
  initialType,
}: {
  initialSalons: SalonCard[];
  initialQuery: string;
  initialGender: string;
  initialType: string;
}) {
  const [salons, setSalons] = useState(initialSalons);
  const [query, setQuery] = useState(initialQuery);
  const [gender, setGender] = useState(initialGender);
  const [type, setType] = useState(initialType);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialSalons.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return salons.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        (s.town ?? "").toLowerCase().includes(q) ||
        (s.service_area ?? "").toLowerCase().includes(q);
      const matchesGender = !gender || s.gender === gender || s.gender === "unisex";
      const matchesType = !type || s.type === type;
      return matchesQuery && matchesGender && matchesType;
    });
  }, [salons, query, gender, type]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const { data } = await getSupabase()
      .from("salons")
      .select("id,name,type,gender,district,town,region,service_area,whatsapp,cover_photo_url,status")
      .in("status", ["active", "featured"])
      .order("status", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    const rows = (data ?? []) as SalonCard[];
    setSalons((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          ✂️ Find a Salon
        </h1>
        <p className="text-sm text-white/70">Salons & stylists across Uganda</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, style or location..."
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C3A2A]"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]"
        >
          <option value="">All genders</option>
          <option value="men">👨 Men</option>
          <option value="women">👩 Women</option>
          <option value="unisex">✂️ Unisex</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]"
        >
          <option value="">All types</option>
          <option value="salon">🏠 Salon</option>
          <option value="mobile">🚗 Mobile</option>
        </select>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">{filtered.length} {filtered.length === 1 ? "salon" : "salons"}</p>
          <Link href="/salons/register" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
            + List your salon
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">✂️</p>
            <p className="text-sm">No salons found.</p>
            <Link href="/salons/register" className="mt-3 inline-block text-sm font-bold text-[#1C3A2A] underline">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/salons/${s.id}`}
                className={`block bg-white rounded-xl border transition-colors overflow-hidden ${
                  s.status === "featured" ? "border-[#F5C842] border-2" : "border-gray-200 hover:border-[#1C3A2A]"
                }`}
              >
                {s.cover_photo_url ? (
                  <div className="relative h-32 w-full">
                    <Image src={s.cover_photo_url} alt={s.name} fill className="object-cover" />
                    {s.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] flex items-center justify-center">
                    <span className="text-3xl">✂️</span>
                    {s.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <p className="font-black text-[#1C3A2A] text-sm truncate">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {SALON_GENDER_LABELS[s.gender]} · {SALON_TYPE_LABELS[s.type]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {s.town ? `${s.town}, ` : ""}{s.district}
                  </p>
                  {s.whatsapp && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`, "_blank");
                      }}
                      className="mt-2 w-full rounded-lg bg-[#25d366] py-1.5 text-center text-xs font-bold text-white"
                    >
                      💬 WhatsApp
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more salons →"}
          </button>
        )}
      </div>
    </div>
  );
}
