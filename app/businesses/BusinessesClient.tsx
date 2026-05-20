"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import UgandaBusinessMap from "@/components/UgandaBusinessMap";
import { BUSINESS_CATEGORIES, UGANDA_REGIONS, categoryEmoji } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { Business } from "@/lib/supabase/types";

type BusinessCard = Pick<Business, "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status">;

type Props = {
  initialBusinesses: BusinessCard[];
  initialQuery: string;
  initialRegion: string;
  initialCategory: string;
};

const PAGE_SIZE = 20;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function BusinessesClient({
  initialBusinesses,
  initialQuery,
  initialRegion,
  initialCategory,
}: Props) {
  const [businesses, setBusinesses] = useState<BusinessCard[]>(initialBusinesses);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<"All" | UgandaRegion>(
    (initialRegion as UgandaRegion) || "All"
  );
  const [category, setCategory] = useState(initialCategory);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialBusinesses.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesQuery =
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase()) ||
        b.district.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = region === "All" || b.region === region;
      const matchesCategory = !category || b.category === category;
      return matchesQuery && matchesRegion && matchesCategory;
    });
  }, [businesses, query, region, category]);

  const businessCounts = useMemo(() => {
    const counts: Partial<Record<UgandaRegion, number>> = {};
    for (const r of UGANDA_REGIONS) {
      counts[r] = businesses.filter((b) => b.region === r).length;
    }
    return counts;
  }, [businesses]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("businesses")
      .select("id,name,category,region,district,town,whatsapp,phone,status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    const rows = (data ?? []) as BusinessCard[];
    setBusinesses((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          📍 Find a Business
        </h1>
        <p className="text-sm text-white/70">Real businesses across Uganda</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C3A2A]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#1C3A2A]"
        >
          <option value="">All Categories</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#e8f5ee] px-4 py-5 border-b border-[#c0dcc8]">
        <p className="text-xs font-semibold text-[#2d6a4f] text-center mb-3">
          Browse by region — click to filter
        </p>
        <UgandaBusinessMap
          activeRegion={region}
          onRegionClick={setRegion}
          businessCounts={businessCounts}
        />
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
            {region !== "All" ? ` in ${region}` : ""}
            {category ? ` · ${category}` : ""}
          </p>
          <Link
            href="/businesses/register"
            className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2"
          >
            + List your business
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">No businesses found.</p>
            <Link href="/businesses/register" className="mt-3 inline-block text-sm font-bold text-[#1C3A2A] underline">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((b) => (
              <Link
                key={b.id}
                href={`/businesses/${b.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1C3A2A] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-[#1C3A2A] text-sm truncate">{b.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {categoryEmoji(b.category)} {b.category} · {b.town ? `${b.town}, ` : ""}{b.district}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg">{categoryEmoji(b.category)}</span>
                </div>
                {b.whatsapp && (
                  <div
                    onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${b.whatsapp!.replace(/\D/g, "")}`, "_blank"); }}
                    className="mt-3 w-full rounded-lg bg-[#25d366] py-2 text-center text-xs font-bold text-white"
                  >
                    💬 WhatsApp
                  </div>
                )}
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
            {loading ? "Loading..." : "Load more businesses →"}
          </button>
        )}
      </div>
    </div>
  );
}
