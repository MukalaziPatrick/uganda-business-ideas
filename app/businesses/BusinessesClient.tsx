"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_CATEGORIES, categoryEmoji, UGANDA_REGIONS } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { Business } from "@/lib/supabase/types";

type BusinessCard = Pick<Business, "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status">;

type Props = {
  initialBusinesses: BusinessCard[];
  initialQuery: string;
  initialRegion: string;
  initialCategory: string;
  regionCounts: Partial<Record<string, number>>;
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
  regionCounts,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<BusinessCard[]>(initialBusinesses);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<"All" | UgandaRegion>(
    (initialRegion as UgandaRegion) || "All"
  );
  const [category, setCategory] = useState(initialCategory);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialBusinesses.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  function navigate(newRegion: string, newCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newRegion && newRegion !== "All") params.set("region", newRegion);
    else params.delete("region");
    if (newCategory) params.set("category", newCategory);
    else params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRegionClick(r: "All" | UgandaRegion) {
    setRegion(r);
    navigate(r, category);
  }

  function handleCategoryChange(c: string) {
    setCategory(c);
    navigate(region, c);
  }

  // Client-side text search only (region + category are server-side)
  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      return (
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase()) ||
        b.district.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [businesses, query]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    let q = supabase
      .from("businesses")
      .select("id,name,category,region,district,town,whatsapp,phone,status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (region && region !== "All") q = q.eq("region", region);
    if (category) q = q.eq("category", category);
    const { data } = await q;
    const rows = (data ?? []) as BusinessCard[];
    setBusinesses((prev) => [...prev, ...rows]);
    setOffset((o) => o + PAGE_SIZE);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [offset, region, category]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-forest px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-brand-gold mb-1" style={{ fontFamily: "Georgia, serif" }}>
          📍 Find a Business
        </h1>
        <p className="text-sm text-white/70">Real businesses across Uganda</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10">
        <input
          type="search"
          aria-label="Search businesses"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-forest"
        />
        <select
          aria-label="Filter businesses by category"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-brand-forest"
        >
          <option value="">All Categories</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-brand-green/10 px-4 py-4 border-b border-brand-green/20">
        <p className="text-xs font-semibold text-brand-green text-center mb-3">
          Browse by region — tap to filter
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap">
          {(["All", ...UGANDA_REGIONS] as Array<"All" | UgandaRegion>).map((r) => {
            const count = r !== "All" ? regionCounts[r] : undefined;
            return (
              <button
                key={r}
                onClick={() => handleRegionClick(r)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  region === r
                    ? "bg-brand-gold text-brand-forest"
                    : "bg-brand-green text-white hover:bg-brand-forest"
                }`}
              >
                {r === "All" ? "All Regions" : r}
                {count != null ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-brand-green">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
            {region !== "All" ? ` in ${region}` : ""}
            {category ? ` · ${category}` : ""}
          </p>
          <Link
            href="/businesses/register"
            className="text-xs font-bold text-brand-forest underline underline-offset-2"
          >
            + List your business
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-brand-green">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">No businesses found.</p>
            <Link href="/businesses/register" className="mt-3 inline-block text-sm font-bold text-brand-forest underline">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((b) => (
              <Link
                key={b.id}
                href={`/businesses/${b.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-forest transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-brand-forest text-sm truncate">{b.name}</p>
                    <p className="text-xs text-brand-green mt-0.5">
                      {categoryEmoji(b.category)} {b.category} · {b.town ? `${b.town}, ` : ""}{b.district}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg">{categoryEmoji(b.category)}</span>
                </div>
                {b.whatsapp && (
                  <div
                    onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${b.whatsapp!.replace(/\D/g, "")}`, "_blank"); }}
                    className="mt-3 w-full rounded-lg bg-green-500 py-2 text-center text-xs font-bold text-white"
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
            className="mt-6 w-full rounded-xl bg-brand-forest py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more businesses →"}
          </button>
        )}
      </div>
    </div>
  );
}
