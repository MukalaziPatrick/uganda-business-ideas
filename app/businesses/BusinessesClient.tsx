"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_CATEGORIES, categoryEmoji, UGANDA_REGIONS } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { Business } from "@/lib/supabase/types";

type BusinessCard = Pick<Business, "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status" | "claimed_at" | "source">;

type Props = {
  initialBusinesses: BusinessCard[];
  initialQuery: string;
  initialRegion: string;
  initialCategory: string;
  regionCounts: Partial<Record<string, number>>;
  categoryCounts: Partial<Record<string, number>>;
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
  categoryCounts,
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
      .select("id,name,category,region,district,town,whatsapp,phone,status,claimed_at,source")
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
      <div className="motion-page relative overflow-hidden bg-brand-forest px-4 py-8 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />
        <h1 className="relative text-2xl font-black text-brand-gold mb-1 sm:text-3xl" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          📍 Find a Business
        </h1>
        <p className="relative text-sm text-brand-cream/80">Real businesses across Uganda</p>
      </div>

      <div className="bg-brand-surface border-b border-brand-beige px-4 py-3 flex gap-2 flex-wrap sticky top-0 z-10 shadow-sm shadow-brand-forest/5">
        <input
          type="search"
          aria-label="Search businesses"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
          className="flex-1 min-w-0 border border-brand-beige bg-white rounded-xl px-3.5 py-2 text-sm outline-none placeholder:text-brand-green/70 focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/40"
        />
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
                className={`motion-press shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                  region === r
                    ? "bg-brand-gold text-brand-forest shadow-sm"
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

      {category === "" ? (
        <div className="px-4 pt-5 max-w-2xl mx-auto">
          <h2 className="mb-2 text-sm font-black text-brand-forest">Browse by category</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BUSINESS_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCategoryChange(c)}
                className="motion-press flex min-h-11 items-center gap-2 rounded-xl border border-brand-beige bg-brand-surface px-3 py-2 text-left text-xs font-bold text-brand-forest transition-colors hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <span aria-hidden>{categoryEmoji(c)}</span>
                <span className="min-w-0 flex-1 truncate">{c}</span>
                {categoryCounts[c] != null && (
                  <span className="shrink-0 text-[10px] font-semibold text-brand-green">({categoryCounts[c]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pt-4 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => handleCategoryChange("")}
            aria-label={`Clear category filter ${category}`}
            className="motion-press inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-forest px-4 text-xs font-bold text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            {categoryEmoji(category)} {category} ✕
          </button>
        </div>
      )}

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <h2 className="mb-2 text-sm font-black text-brand-forest">
          {category ? `${category} listings` : "Newest listings"}
        </h2>
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
          <div className="rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-14 text-center text-brand-green">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-semibold text-brand-forest">
              {category ? `No ${category} businesses listed yet.` : "No businesses found."}
            </p>
            <p className="mt-1 text-xs">Try a different name, category or region.</p>
            <Link href="/businesses/register" className="mt-4 inline-block rounded-xl bg-brand-forest px-4 py-2 text-xs font-bold text-brand-cream transition-colors hover:bg-brand-green">
              Be the first to list one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((b) => (
              <Link
                key={b.id}
                href={`/businesses/${b.id}`}
                className="motion-card block bg-brand-surface rounded-2xl border border-brand-beige p-4 shadow-sm shadow-brand-forest/5 hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-brand-forest text-sm truncate">{b.name}</p>
                    <p className="text-xs text-brand-green mt-0.5">
                      {categoryEmoji(b.category)} {b.category} · {b.town ? `${b.town}, ` : ""}{b.district}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-brand-green">
                      {b.claimed_at ? "✓ Owner-managed" : b.source ? "Directory listing — details unverified" : "Self-listed"}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg">{categoryEmoji(b.category)}</span>
                </div>
                {b.whatsapp && (
                  <div
                    onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${b.whatsapp!.replace(/\D/g, "")}`, "_blank"); }}
                    className="motion-press mt-3 w-full rounded-lg bg-brand-green py-2 text-center text-xs font-bold text-white transition-colors hover:bg-brand-forest"
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
            className="motion-press mt-6 w-full rounded-xl bg-brand-forest py-3 text-sm font-bold text-white transition-colors hover:bg-brand-green disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more businesses →"}
          </button>
        )}
      </div>
    </div>
  );
}
