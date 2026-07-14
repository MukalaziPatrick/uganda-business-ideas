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
    <div className="min-h-screen bg-brand-cream">
      <div className="motion-page relative overflow-hidden bg-brand-forest px-4 py-8 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />
        <h1 className="relative text-2xl font-black text-brand-gold mb-1 sm:text-3xl" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          ✂️ Find a Salon
        </h1>
        <p className="relative text-sm text-brand-cream/80">Salons &amp; stylists across Uganda</p>
      </div>

      <div className="bg-brand-surface border-b border-brand-beige px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10 shadow-sm shadow-brand-forest/5">
        <input
          type="search"
          aria-label="Search salons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, style or location..."
          className="flex-1 min-w-0 border border-brand-beige bg-white rounded-xl px-3.5 py-2 text-sm outline-none placeholder:text-brand-green/70 focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/40"
        />
        <select
          aria-label="Filter salons by gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border border-brand-beige rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/40"
        >
          <option value="">All genders</option>
          <option value="men">👨 Men</option>
          <option value="women">👩 Women</option>
          <option value="unisex">✂️ Unisex</option>
        </select>
        <select
          aria-label="Filter salons by type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-brand-beige rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/40"
        >
          <option value="">All types</option>
          <option value="salon">🏠 Salon</option>
          <option value="mobile">🚗 Mobile</option>
        </select>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-brand-green">{filtered.length} {filtered.length === 1 ? "salon" : "salons"}</p>
          <Link href="/salons/register" className="text-xs font-bold text-brand-forest underline underline-offset-2">
            + List your salon
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-14 text-center text-brand-green">
            <p className="text-3xl mb-3">✂️</p>
            <p className="text-sm font-semibold text-brand-forest">No salons found.</p>
            <p className="mt-1 text-xs">Try a different name or district.</p>
            <Link href="/salons/register" className="mt-4 inline-block rounded-xl bg-brand-forest px-4 py-2 text-xs font-bold text-brand-cream transition-colors hover:bg-brand-green">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/salons/${s.id}`}
                className={`motion-card block bg-brand-surface rounded-2xl border overflow-hidden shadow-sm shadow-brand-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
                  s.status === "featured" ? "border-brand-gold border-2" : "border-brand-beige hover:border-brand-forest"
                }`}
              >
                {s.cover_photo_url ? (
                  <div className="relative h-32 w-full">
                    <Image src={s.cover_photo_url} alt={s.name} fill className="object-cover" />
                    {s.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-brand-gold text-brand-forest text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative h-20 bg-gradient-to-br from-brand-forest to-brand-green flex items-center justify-center">
                    <span className="text-3xl">✂️</span>
                    {s.status === "featured" && (
                      <span className="absolute top-2 left-2 bg-brand-gold text-brand-forest text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <p className="font-black text-brand-forest text-sm truncate">{s.name}</p>
                  <p className="text-xs text-brand-green mt-0.5">
                    {SALON_GENDER_LABELS[s.gender]} · {SALON_TYPE_LABELS[s.type]}
                  </p>
                  <p className="text-xs text-brand-green mt-0.5">
                    📍 {s.town ? `${s.town}, ` : ""}{s.district}
                  </p>
                  {s.whatsapp && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`, "_blank");
                      }}
                      className="motion-press mt-2.5 w-full rounded-lg bg-brand-forest py-2 text-center text-xs font-bold text-white transition-colors hover:bg-brand-green"
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
            className="motion-press mt-6 w-full rounded-xl bg-brand-forest py-3 text-sm font-bold text-white transition-colors hover:bg-brand-green disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more salons →"}
          </button>
        )}
      </div>
    </div>
  );
}
