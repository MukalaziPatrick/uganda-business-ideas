"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BusinessIdea, IdeaCategory, IdeaBudgetBand, IdeaRegion } from "@/lib/supabase/ideas-types";

type IdeasDiscoveryClientProps = { ideas: BusinessIdea[] };

type SortOption = "demandScore" | "startupEaseScore" | "supplierPotentialScore" | "title";

const categoryOptions: Array<"All" | IdeaCategory> = ["All", "Agriculture", "Food", "Retail", "Services", "Digital"];

const budgetOptions: Array<"All" | IdeaBudgetBand> = ["All", "under_200k", "200k_500k", "500k_2m", "above_2m"];

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

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒", Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

function getSortScore(idea: BusinessIdea, sort: SortOption) {
  if (sort === "demandScore") return idea.scoring_demand ?? 0;
  if (sort === "startupEaseScore") return idea.scoring_ease ?? 0;
  if (sort === "supplierPotentialScore") return idea.scoring_supplier ?? 0;
  return 0;
}

function validCategory(v: string | null): "All" | IdeaCategory {
  if (v && (categoryOptions as string[]).includes(v)) return v as IdeaCategory;
  return "All";
}

function validBudget(v: string | null): "All" | IdeaBudgetBand {
  if (v && (budgetOptions as string[]).includes(v)) return v as IdeaBudgetBand;
  return "All";
}

function validRegion(v: string | null): "All" | IdeaRegion {
  const regions: Array<"All" | IdeaRegion> = ["All", "Central", "Eastern", "Northern", "Western"];
  if (v && (regions as string[]).includes(v)) return v as IdeaRegion;
  return "All";
}

function validSort(v: string | null): SortOption {
  const sorts: SortOption[] = ["demandScore", "startupEaseScore", "supplierPotentialScore", "title"];
  if (v && (sorts as string[]).includes(v)) return v as SortOption;
  return "demandScore";
}

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ideas
      .filter(idea => {
        const matchSearch = !q || idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q);
        const matchCat = category === "All" || idea.category === category;
        const matchBudget = budget === "All" || idea.budget_band === budget;
        const matchRegion = region === "All" || idea.regions.includes(region);
        return matchSearch && matchCat && matchBudget && matchRegion;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        return getSortScore(b, sort) - getSortScore(a, sort);
      });
  }, [ideas, search, category, budget, sort, region]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Region filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {(["All", "Central", "Eastern", "Northern", "Western"] as Array<"All" | IdeaRegion>).map((r) => (
          <button
            key={r}
            onClick={() => handleRegion(r)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              region === r
                ? "bg-[#F5C842] text-[#1C3A2A]"
                : "bg-[#2D5A40] text-white hover:bg-[#1C3A2A]"
            }`}
          >
            {r === "All" ? "All Regions" : r}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search poultry, soap, digital, food..."
          className="w-full rounded-2xl border border-[#e0d8cc] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1C3A2A] focus:ring-2 focus:ring-[#1C3A2A]/10"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        {categoryOptions.map(opt => (
          <button
            key={opt}
            onClick={() => handleCategory(opt)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              category === opt
                ? "bg-[#1C3A2A] text-[#F5C842]"
                : "bg-white border border-[#e0d8cc] text-[#1C3A2A] hover:border-[#1C3A2A]"
            }`}
          >
            {opt === "All" ? "All" : `${categoryEmoji(opt)} ${opt}`}
          </button>
        ))}
      </div>

      {/* Budget chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {budgetOptions.map(opt => (
          <button
            key={opt}
            onClick={() => handleBudget(opt)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              budget === opt
                ? "bg-[#1C3A2A] text-[#F5C842]"
                : "bg-white border border-[#e0d8cc] text-[#1C3A2A] hover:border-[#1C3A2A]"
            }`}
          >
            {opt === "All" ? "All budgets" : budgetLabels[opt as IdeaBudgetBand]}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 text-xs text-slate-500 font-semibold">
        <span>Showing {filtered.length} of {ideas.length} ideas{region !== "All" ? ` · ${region} Region` : ""}</span>
        <label className="flex items-center gap-1.5">
          Sort:
          <select
            value={sort}
            onChange={e => handleSort(e.target.value as SortOption)}
            className="rounded-lg border border-[#e0d8cc] bg-white px-2 py-1 text-xs outline-none focus:border-[#1C3A2A]"
          >
            {(Object.keys(sortLabels) as SortOption[]).map(s => (
              <option key={s} value={s}>{sortLabels[s]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e0d8cc] bg-white p-10 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-bold text-[#1C3A2A] mb-1">No ideas match your search</p>
          <p className="text-sm text-slate-500">Try clearing a filter or using a broader term.</p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-xl bg-[#1C3A2A] px-5 py-2 text-sm font-bold text-[#F5C842]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Featured card */}
      {featured && (
        <Link
          href={`/ideas/${featured.slug}`}
          className="block rounded-2xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] p-6 mb-4 hover:opacity-95 transition-opacity"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5">
              ⭐ Top Result
            </span>
            <span className="rounded-full bg-white/15 text-white text-[10px] font-bold px-2 py-0.5">
              {featured.category}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#F5C842] leading-snug mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {featured.title}
          </h2>
          <p className="text-sm text-white/75 leading-relaxed mb-5 line-clamp-3">{featured.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {featured.scoring_demand != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Demand</p>
                  <p className="text-base font-black text-white">{featured.scoring_demand}</p>
                </div>
              )}
              {featured.scoring_ease != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Ease</p>
                  <p className="text-base font-black text-white">{featured.scoring_ease}</p>
                </div>
              )}
            </div>
            <span className="rounded-xl bg-[#F5C842] px-4 py-2 text-sm font-bold text-[#1C3A2A]">
              Read More →
            </span>
          </div>
        </Link>
      )}

      {/* 2-col grid for remaining ideas */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {rest.map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="flex flex-col rounded-2xl border border-[#e0d8cc] bg-white p-4 hover:border-[#1C3A2A] transition-colors"
            >
              <div className="text-2xl mb-2">{categoryEmoji(idea.category)}</div>
              <div className="flex gap-1 flex-wrap mb-2">
                <span className="rounded-full bg-[#f5f0e8] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5">
                  {idea.category}
                </span>
                {idea.budget_band && (
                  <span className="rounded-full bg-[#f5f0e8] text-slate-500 text-[10px] font-semibold px-2 py-0.5">
                    {budgetLabels[idea.budget_band]}
                  </span>
                )}
              </div>
              <h3 className="font-black text-[#1C3A2A] text-sm leading-snug mb-1 flex-1">{idea.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{idea.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-[#1C3A2A]">{idea.capital}</span>
                <div className="flex gap-2 text-xs text-center">
                  {idea.scoring_demand != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">D</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring_demand}</p>
                    </div>
                  )}
                  {idea.scoring_ease != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">E</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring_ease}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
