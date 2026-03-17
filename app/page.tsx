"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");

  const categories = ["All", "Agriculture", "Food", "Services", "Retail"];
  const budgetOptions = ["All", "Under 500k", "500k - 2M", "Above 2M"];

  function getBudgetCategory(capital: string) {
    const cleaned = capital.replace(/,/g, "");
    const numbers = cleaned.match(/\d+/g);

    if (!numbers) return "All";

    const min = parseInt(numbers[0], 10);

    if (min < 500000) return "Under 500k";
    if (min <= 2000000) return "500k - 2M";
    return "Above 2M";
  }

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || idea.category === selectedCategory;

    const ideaBudget = getBudgetCategory(idea.capital);
    const matchesBudget =
      selectedBudget === "All" || ideaBudget === selectedBudget;

    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-6 md:px-8 md:py-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-800 text-sm font-bold text-white shadow-sm">
                UBI
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Uganda Business Ideas
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Discover practical businesses you can actually start
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Practical opportunities. Clear guidance. Real starting points.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              <a href="#ideas" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Explore Ideas
              </a>
              <a href="#filters" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Filters
              </a>
              <Link href="/about" className="rounded-full px-4 py-2 hover:bg-slate-100">
                About
              </Link>
              <Link href="/contact" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-green-950 via-green-900 to-emerald-700 shadow-xl">
          <div className="grid gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-green-100 backdrop-blur-sm">
                Growth-focused ideas for Uganda
              </p>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
                Find the right business idea for your budget, skills, and goals
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-green-50/90 md:text-lg md:leading-8">
                Explore serious, practical business opportunities in Uganda.
                Filter by category and budget, then open a detailed guide for
                each idea.
              </p>

              <div className="mt-8">
                <input
                  type="text"
                  placeholder="Search business ideas..."
                  className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-green-300 focus:ring-4 focus:ring-green-200/40"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-medium text-green-100">Available ideas</p>
                <p className="mt-2 text-4xl font-bold text-white">{ideas.length}</p>
                <p className="mt-2 text-sm leading-6 text-green-50/80">
                  Curated opportunities across agriculture, food, services, and retail.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-medium text-green-100">Filtered results</p>
                <p className="mt-2 text-4xl font-bold text-white">{filteredIdeas.length}</p>
                <p className="mt-2 text-sm leading-6 text-green-50/80">
                  Ideas matching your current search and filter choices.
                </p>
              </div>
            </div>
          </div>
        </div>

<section className="mt-10 grid gap-6 md:grid-cols-3">
  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-800">
      01
    </div>
    <h2 className="mt-5 text-xl font-bold text-slate-900">
      Practical Ideas
    </h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">
      Explore business ideas that are realistic, understandable, and easier
      to compare based on your situation.
    </p>
  </div>

  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-800">
      02
    </div>
    <h2 className="mt-5 text-xl font-bold text-slate-900">
      Budget-Based Discovery
    </h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">
      Filter opportunities by budget and category so you can focus on
      businesses that fit your starting capital.
    </p>
  </div>

  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-800">
      03
    </div>
    <h2 className="mt-5 text-xl font-bold text-slate-900">
      Detailed Guidance
    </h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">
      Open each business idea to see practical details like risks, best
      location, startup steps, and helpful tips.
    </p>
  </div>
</section>
        <section
          id="filters"
          className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Filter by Category
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Narrow results to the type of business you want.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      selectedCategory === category
                        ? "border-green-800 bg-green-800 text-white shadow-sm"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Filter by Budget
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Focus on ideas that fit your starting capital.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {budgetOptions.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(budget)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      selectedBudget === budget
                        ? "border-green-800 bg-green-800 text-white shadow-sm"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ideas" className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Business Ideas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse detailed opportunities tailored to different budgets and skills.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              {filteredIdeas.length} result{filteredIdeas.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredIdeas.map((idea) => (
              <Link key={idea.slug} href={`/ideas/${idea.slug}`}>
                <div className="group h-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                      {idea.category}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {idea.capital}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 transition group-hover:text-green-800">
                    {idea.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {idea.desc}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Open full guide</span>
                      <span className="text-sm font-semibold text-green-700">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer
          id="footer"
          className="mt-12 rounded-[28px] bg-slate-900 px-6 py-8 text-slate-300 shadow-lg md:px-8"
        >
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
                Uganda Business Ideas
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Helping people find business opportunities they can realistically start
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                This platform is designed to help users discover practical
                business ideas based on capital, skills, and location.
              </p>
            </div>

            <div className="md:text-right">
              <div className="flex flex-wrap justify-start gap-4 text-sm text-slate-300 md:justify-end">
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Built step by step with focus on practical value.
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                © 2026 Uganda Business Ideas
              </p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}