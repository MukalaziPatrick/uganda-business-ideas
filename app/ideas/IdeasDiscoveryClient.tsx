"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AudienceSegment, BudgetBand, Category, Idea } from "../data/ideas";

type IdeasDiscoveryClientProps = { ideas: Idea[] };

type SortOption = "demandScore" | "startupEaseScore" | "supplierPotentialScore" | "title";

const categoryOptions: Array<"All" | Category> = ["All", "Agriculture", "Food", "Retail", "Services", "Digital"];

const budgetOptions: Array<"All" | BudgetBand> = ["All", "under_200k", "under_500k", "500k_2m", "above_2m"];

const budgetLabels: Record<BudgetBand, string> = {
  under_200k: "Under 200k",
  under_500k: "Under 500k",
  "500k_2m": "500k–2M",
  above_2m: "Above 2M",
  review: "Review",
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

function getSortScore(idea: Idea, sort: SortOption) {
  if (sort === "demandScore") return idea.scoring?.incomeSpeed ?? 0;
  if (sort === "startupEaseScore") return idea.scoring?.startupEase ?? 0;
  if (sort === "supplierPotentialScore") return idea.scoring?.supplierDemand ?? 0;
  return 0;
}

export default function IdeasDiscoveryClient({ ideas }: IdeasDiscoveryClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [budget, setBudget] = useState<"All" | BudgetBand>("All");
  const [sort, setSort] = useState<SortOption>("demandScore");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ideas
      .filter(idea => {
        const matchSearch = !q || idea.title.toLowerCase().includes(q) || idea.desc.toLowerCase().includes(q);
        const matchCat = category === "All" || idea.category === category;
        const matchBudget = budget === "All" || idea.budgetBand === budget;
        return matchSearch && matchCat && matchBudget;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        return getSortScore(b, sort) - getSortScore(a, sort);
      });
  }, [ideas, search, category, budget, sort]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search poultry, soap, digital, food..."
          className="w-full rounded-2xl border border-[#e0d8cc] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1C3A2A] focus:ring-2 focus:ring-[#1C3A2A]/10"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        {categoryOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setCategory(opt as "All" | Category)}
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
            onClick={() => setBudget(opt as "All" | BudgetBand)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              budget === opt
                ? "bg-[#1C3A2A] text-[#F5C842]"
                : "bg-white border border-[#e0d8cc] text-[#1C3A2A] hover:border-[#1C3A2A]"
            }`}
          >
            {opt === "All" ? "All budgets" : budgetLabels[opt as BudgetBand]}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 text-xs text-slate-500 font-semibold">
        <span>Showing {filtered.length} of {ideas.length} ideas</span>
        <label className="flex items-center gap-1.5">
          Sort:
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
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
            onClick={() => { setSearch(""); setCategory("All"); setBudget("All"); }}
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
          <p className="text-sm text-white/75 leading-relaxed mb-5 line-clamp-3">{featured.desc}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {featured.scoring?.incomeSpeed != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Demand</p>
                  <p className="text-base font-black text-white">{featured.scoring.incomeSpeed}</p>
                </div>
              )}
              {featured.scoring?.startupEase != null && (
                <div className="text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">Ease</p>
                  <p className="text-base font-black text-white">{featured.scoring.startupEase}</p>
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
                {idea.budgetBand && idea.budgetBand !== "review" && (
                  <span className="rounded-full bg-[#f5f0e8] text-slate-500 text-[10px] font-semibold px-2 py-0.5">
                    {budgetLabels[idea.budgetBand]}
                  </span>
                )}
              </div>
              <h3 className="font-black text-[#1C3A2A] text-sm leading-snug mb-1 flex-1">{idea.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{idea.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-[#1C3A2A]">{idea.capital}</span>
                <div className="flex gap-2 text-xs text-center">
                  {idea.scoring?.incomeSpeed != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">D</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring.incomeSpeed}</p>
                    </div>
                  )}
                  {idea.scoring?.startupEase != null && (
                    <div className="rounded-lg bg-[#f5f0e8] px-2 py-1">
                      <p className="text-[9px] text-slate-400 uppercase">E</p>
                      <p className="font-black text-[#1C3A2A]">{idea.scoring.startupEase}</p>
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
