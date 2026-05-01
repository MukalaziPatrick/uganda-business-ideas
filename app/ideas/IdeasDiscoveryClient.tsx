"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AudienceSegment, BudgetBand, Category, Idea } from "../data/ideas";
import { formatCapital } from "../data/ideas";

type IdeasDiscoveryClientProps = {
  ideas: Idea[];
};

type SortOption =
  | "demandScore"
  | "startupEaseScore"
  | "supplierPotentialScore"
  | "title";

const categoryOptions: Array<"All" | Category> = [
  "All",
  "Agriculture",
  "Food",
  "Retail",
  "Services",
  "Digital",
];

const budgetOptions: Array<"All" | BudgetBand> = [
  "All",
  "under_200k",
  "under_500k",
  "500k_2m",
  "above_2m",
  "review",
];

const audienceOptions: Array<"All" | AudienceSegment> = [
  "All",
  "beginners",
  "diaspora",
  "farmers",
  "students",
  "women",
  "youth",
];

const budgetLabels: Record<BudgetBand, string> = {
  under_200k: "Under 200k",
  under_500k: "Under 500k",
  "500k_2m": "500k - 2M",
  above_2m: "Above 2M",
  review: "Review needed",
};

const audienceLabels: Record<AudienceSegment, string> = {
  beginners: "Beginners",
  diaspora: "Diaspora",
  farmers: "Farmers",
  students: "Students",
  women: "Women",
  youth: "Youth",
};

const sortLabels: Record<SortOption, string> = {
  demandScore: "Demand score",
  startupEaseScore: "Startup ease",
  supplierPotentialScore: "Supplier potential",
  title: "Title",
};

function getSortScore(idea: Idea, sort: SortOption) {
  if (sort === "demandScore") return idea.scoring?.incomeSpeed ?? 0;
  if (sort === "startupEaseScore") return idea.scoring?.startupEase ?? 0;
  if (sort === "supplierPotentialScore") return idea.scoring?.supplierDemand ?? 0;
  return 0;
}

function getBudgetLabel(idea: Idea) {
  return idea.budgetBand ? budgetLabels[idea.budgetBand] : "Budget review";
}

export default function IdeasDiscoveryClient({ ideas }: IdeasDiscoveryClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [budget, setBudget] = useState<"All" | BudgetBand>("All");
  const [audience, setAudience] = useState<"All" | AudienceSegment>("All");
  const [sort, setSort] = useState<SortOption>("demandScore");

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ideas
      .filter((idea) => {
        const matchesSearch =
          !query ||
          idea.title.toLowerCase().includes(query) ||
          idea.desc.toLowerCase().includes(query) ||
          idea.category.toLowerCase().includes(query);
        const matchesCategory = category === "All" || idea.category === category;
        const matchesBudget = budget === "All" || idea.budgetBand === budget;
        const matchesAudience =
          audience === "All" || idea.audience?.includes(audience);

        return matchesSearch && matchesCategory && matchesBudget && matchesAudience;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        return getSortScore(b, sort) - getSortScore(a, sort);
      });
  }, [audience, budget, category, ideas, search, sort]);

  return (
    <div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <label className="space-y-2 md:col-span-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Search
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search poultry, food, retail..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as "All" | Category)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            >
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Budget
            </span>
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value as "All" | BudgetBand)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            >
              {budgetOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All" : budgetLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Audience
            </span>
            <select
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as "All" | AudienceSegment)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            >
              {audienceOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All" : audienceLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-semibold text-slate-500">
            Showing {filteredIdeas.length} of {ideas.length} ideas
          </p>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            >
              {(Object.keys(sortLabels) as SortOption[]).map((item) => (
                <option key={item} value={item}>
                  {sortLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredIdeas.map((idea) => (
          <article
            key={idea.slug}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-100">
                {idea.category}
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-100">
                {getBudgetLabel(idea)}
              </span>
            </div>

            <h2 className="mt-4 text-[17px] font-black leading-snug text-slate-900">
              {idea.title}
            </h2>
            <p className="mt-2 text-[12.5px] font-semibold text-slate-500">
              {formatCapital(idea.capital)}
            </p>
            <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-slate-600">
              {idea.desc}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
              <Score label="Demand" value={idea.scoring?.incomeSpeed} />
              <Score label="Ease" value={idea.scoring?.startupEase} />
              <Score label="Supply" value={idea.scoring?.supplierDemand} />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={`/ideas/${idea.slug}`}
                className="inline-flex justify-center rounded-xl bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-green-700"
              >
                View idea
              </Link>
              <Link
                href={`/start?interest=${encodeURIComponent(idea.title)}`}
                className="inline-flex justify-center rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-[13px] font-bold text-green-700 transition hover:bg-green-100"
              >
                Get help starting
              </Link>
            </div>
          </article>
        ))}
      </section>

      {filteredIdeas.length === 0 && (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-[15px] font-bold text-slate-800">No ideas found</p>
          <p className="mt-2 text-[13.5px] text-slate-500">
            Try clearing one filter or using a broader search term.
          </p>
        </section>
      )}
    </div>
  );
}

function Score({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-slate-100">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-black text-slate-800">
        {value ?? "-"}
      </p>
    </div>
  );
}
