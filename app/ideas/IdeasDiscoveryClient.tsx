"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BusinessIdea, IdeaCategory, IdeaBudgetBand, IdeaRegion } from "@/lib/supabase/ideas-types";
import {
  filterAndSortIdeas,
  countActiveFilters,
  validCategory,
  validBudget,
  validRegion,
  validSort,
  type SortOption,
} from "@/lib/ideas/filtering";
import IdeaCard from "./IdeaCard";

type IdeasDiscoveryClientProps = { ideas: BusinessIdea[] };

const categoryOptions: Array<"All" | IdeaCategory> = ["All", "Agriculture", "Food", "Retail", "Services", "Digital"];

const budgetOptions: Array<"All" | IdeaBudgetBand> = ["All", "under_200k", "200k_500k", "500k_2m", "above_2m"];

const regionOptions: Array<"All" | IdeaRegion> = ["All", "Central", "Eastern", "Northern", "Western"];

const budgetLabels: Record<IdeaBudgetBand, string> = {
  under_200k: "Under 200k",
  "200k_500k": "200k–500k",
  "500k_2m": "500k–2M",
  above_2m: "Above 2M",
};

const sortLabels: Record<SortOption, string> = {
  demandScore: "Demand",
  startupEaseScore: "Ease",
  supplierPotentialScore: "Supplier",
  title: "A–Z",
};

const selectClass =
  "min-h-11 rounded-xl border border-brand-beige bg-white px-3 text-sm text-brand-forest outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40";

export default function IdeasDiscoveryClient({ ideas }: IdeasDiscoveryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState<"All" | IdeaCategory>(() => validCategory(searchParams.get("category")));
  const [budget, setBudget] = useState<"All" | IdeaBudgetBand>(() => validBudget(searchParams.get("budget")));
  const [sort, setSort] = useState<SortOption>(() => validSort(searchParams.get("sort")));
  const [region, setRegion] = useState<"All" | IdeaRegion>(() => validRegion(searchParams.get("region")));

  function buildUrl(updates: Partial<Record<"q" | "category" | "budget" | "region" | "sort", string>>) {
    const params = new URLSearchParams(searchParams.toString());
    const vals = { q: search, category, budget, region, sort, ...updates };
    for (const [k, v] of Object.entries(vals) as [string, string][]) {
      if (v && v !== "All" && v !== "" && v !== "demandScore") params.set(k, v);
      else params.delete(k);
    }
    return params.size > 0 ? `?${params.toString()}` : "?";
  }

  function handleSearch(v: string) {
    setSearch(v);
    router.replace(buildUrl({ q: v }), { scroll: false });
  }
  function handleCategory(v: "All" | IdeaCategory) {
    setCategory(v);
    router.replace(buildUrl({ category: v }), { scroll: false });
  }
  function handleBudget(v: "All" | IdeaBudgetBand) {
    setBudget(v);
    router.replace(buildUrl({ budget: v }), { scroll: false });
  }
  function handleRegion(v: "All" | IdeaRegion) {
    setRegion(v);
    router.replace(buildUrl({ region: v }), { scroll: false });
  }
  function handleSort(v: SortOption) {
    setSort(v);
    router.replace(buildUrl({ sort: v }), { scroll: false });
  }
  function clearFilters() {
    setSearch(""); setCategory("All"); setBudget("All"); setRegion("All"); setSort("demandScore");
    router.replace("?", { scroll: false });
  }

  const filtered = useMemo(
    () => filterAndSortIdeas(ideas, { q: search, category, budget, region, sort }),
    [ideas, search, category, budget, sort, region]
  );

  const activeFilters = countActiveFilters({ q: search, category, budget, region });

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-3">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green">🔍</span>
        <input
          aria-label="Search business ideas"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search poultry, soap, digital, food..."
          className="w-full rounded-2xl border border-brand-beige bg-brand-surface py-3 pl-10 pr-4 text-sm shadow-sm outline-none placeholder:text-brand-green/70 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40"
        />
      </div>

      {/* Filter selects: 2×2 on phones, one row on desktop */}
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="flex basis-[calc(50%-0.25rem)] flex-col gap-1 text-[11px] font-bold text-brand-green sm:basis-auto">
          Category
          <select
            value={category}
            onChange={e => handleCategory(e.target.value as "All" | IdeaCategory)}
            className={selectClass}
          >
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt === "All" ? "All categories" : opt}</option>
            ))}
          </select>
        </label>
        <label className="flex basis-[calc(50%-0.25rem)] flex-col gap-1 text-[11px] font-bold text-brand-green sm:basis-auto">
          Budget
          <select
            value={budget}
            onChange={e => handleBudget(e.target.value as "All" | IdeaBudgetBand)}
            className={selectClass}
          >
            {budgetOptions.map(opt => (
              <option key={opt} value={opt}>{opt === "All" ? "All budgets" : budgetLabels[opt as IdeaBudgetBand]}</option>
            ))}
          </select>
        </label>
        <label className="flex basis-[calc(50%-0.25rem)] flex-col gap-1 text-[11px] font-bold text-brand-green sm:basis-auto">
          Region
          <select
            value={region}
            onChange={e => handleRegion(e.target.value as "All" | IdeaRegion)}
            className={selectClass}
          >
            {regionOptions.map(opt => (
              <option key={opt} value={opt}>{opt === "All" ? "All regions" : opt}</option>
            ))}
          </select>
        </label>
        <label className="flex basis-[calc(50%-0.25rem)] flex-col gap-1 text-[11px] font-bold text-brand-green sm:basis-auto">
          Sort by
          <select
            value={sort}
            onChange={e => handleSort(e.target.value as SortOption)}
            className={selectClass}
          >
            {(Object.keys(sortLabels) as SortOption[]).map(s => (
              <option key={s} value={s}>{sortLabels[s]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Result count + clear */}
      <div className="mb-5 flex items-center justify-between text-xs font-semibold text-brand-green">
        <span>Showing {filtered.length} of {ideas.length} ideas{region !== "All" ? ` · ${region} Region` : ""}</span>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="motion-press font-bold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-beige bg-white p-10 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-bold text-brand-forest mb-1">No ideas match your search</p>
          <p className="text-sm text-brand-green">Try clearing a filter or using a broader term.</p>
          <button
            onClick={clearFilters}
            className="motion-press mt-4 rounded-xl bg-brand-forest px-5 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-green"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Featured card */}
      {featured && (
        <Link
          href={`/ideas/${featured.slug}`}
          className="motion-card block rounded-2xl bg-gradient-to-br from-brand-forest to-brand-green p-6 mb-4 shadow-lg shadow-brand-forest/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-brand-gold text-brand-forest text-[10px] font-bold px-2 py-0.5">
              ⭐ Top Result
            </span>
            <span className="rounded-full bg-white/15 text-white text-[10px] font-bold px-2 py-0.5">
              {featured.category}
            </span>
          </div>
          <h2 className="text-xl font-black text-brand-gold leading-snug mb-2" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
            {featured.title}
          </h2>
          <p className="text-sm text-white/75 leading-relaxed mb-5 line-clamp-3">{featured.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {featured.scoring_demand != null && (
                <div className="text-center">
                  <p className="text-[10px] text-brand-cream/85 uppercase tracking-wide">Demand</p>
                  <p className="text-base font-black text-white">{featured.scoring_demand}</p>
                </div>
              )}
              {featured.scoring_ease != null && (
                <div className="text-center">
                  <p className="text-[10px] text-brand-cream/85 uppercase tracking-wide">Ease</p>
                  <p className="text-base font-black text-white">{featured.scoring_ease}</p>
                </div>
              )}
            </div>
            <span className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-brand-forest">
              Read More →
            </span>
          </div>
        </Link>
      )}

      {/* Grid for remaining ideas */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
          {rest.map(idea => (
            <IdeaCard key={idea.slug} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
