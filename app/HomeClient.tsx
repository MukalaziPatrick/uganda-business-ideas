// app/HomeClient.tsx
//
// This is the interactive homepage component.
// It uses useState so it must be a client component.
// SEO metadata lives in page.tsx (the server component wrapper).

"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";

// ─── DESIGN TOKENS (keep in sync with idea-page.tsx) ──────────────────────────
// Border radius : rounded-2xl  (16px) — cards, filter pills, footer
//                 rounded-3xl  (24px) — featured cards, section panels
//                 rounded-full         — badges, avatars
// Shadows       : shadow-sm           — resting card
//                 shadow-md           — active/hover card
//                 shadow-lg + colored — lifted card  (hover:-translate-y-1)
//                 shadow-xl + colored — featured lift (hover:-translate-y-1.5)
//                 shadow-2xl          — dark hero panels
// Section gaps  : mt-12 / sm:mt-16 / md:mt-20
// Inner padding : p-5 sm:p-6         — cards
//                 p-5 sm:p-8 md:p-10  — section panels
// Eyebrow       : text-[11px] font-semibold uppercase tracking-[0.12em]
// H2            : text-2xl sm:text-3xl font-bold leading-snug tracking-tight
// H3 (card)     : text-[16px] font-semibold leading-snug tracking-tight
// Body          : text-sm leading-relaxed text-slate-600
// Lead          : text-[15px] leading-relaxed text-slate-500
// ──────────────────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const [search, setSearch]                     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBudget, setSelectedBudget]     = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  const categories    = ["All", "Agriculture", "Food", "Services", "Retail"];
  const budgetOptions = ["All", "Under 500k", "500k - 2M", "Above 2M"];

  const categoryConfig: Record<string, { color: string; icon: string }> = {
    Agriculture: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🌱" },
    Food:        { color: "bg-amber-50  text-amber-700  border-amber-200",     icon: "🍽️" },
    Services:    { color: "bg-sky-50    text-sky-700    border-sky-200",       icon: "💼" },
    Retail:      { color: "bg-violet-50 text-violet-700 border-violet-200",    icon: "🛒" },
  };

  function getBudgetCategory(capital: string) {
    const min = parseInt(capital.replace(/,/g, "").match(/\d+/)?.[0] ?? "0", 10);
    if (min < 500_000)    return "Under 500k";
    if (min <= 2_000_000) return "500k - 2M";
    return "Above 2M";
  }

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch   = idea.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    const matchesBudget   = selectedBudget   === "All" || getBudgetCategory(idea.capital) === selectedBudget;
    return matchesSearch && matchesCategory && matchesBudget;
  });

  const closeMobileMenu = () => setMobileMenuOpen(false);

  function clearAllFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedBudget("All");
  }

  const hasActiveFilters =
    search !== "" || selectedCategory !== "All" || selectedBudget !== "All";

  // ── Shared class fragments ──────────────────────────────────────────────────
  const filterActive = "border-green-600 bg-green-600 text-white shadow-md shadow-green-200";
  const filterIdle   = "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700";
  const eyebrow      = "text-[11px] font-semibold uppercase tracking-[0.12em] text-green-600";
  const sectionH2    = "mt-2 text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl";
  const sectionLead  = "mt-2 text-[15px] leading-relaxed text-slate-500";

  // ── Card class fragments ────────────────────────────────────────────────────
  const ideaCardBase = [
    "relative flex h-full flex-col overflow-hidden",
    "rounded-3xl border border-slate-200 bg-white",
    "shadow-sm",
    "transition-all duration-200 ease-out",
    "group-hover:-translate-y-1.5",
    "group-hover:border-green-200",
    "group-hover:shadow-[0_8px_30px_-4px_rgba(22,163,74,0.18)]",
    "active:translate-y-0 active:shadow-sm",
  ].join(" ");

  const accentBar = [
    "absolute inset-y-0 left-0 w-0 rounded-l-3xl bg-green-500",
    "transition-all duration-200",
    "group-hover:w-1",
  ].join(" ");

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-10">

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200">
              UBI
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-800">
              Uganda Business Ideas
            </span>
            {/* Trust pill — Uganda focus + current year. Hidden on small screens
                to keep the nav clean; visible from md breakpoint. */}
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-400 md:inline-flex">
              🇺🇬 Uganda · 2026
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 text-[13px] font-medium text-slate-500 md:flex">
            <a href="#ideas"   className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Ideas</a>
            <a href="#filters" className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Filter</a>
            <Link href="/about"   className="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">About</Link>
            <Link href="/contact" className="ml-2 rounded-xl bg-green-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-green-200 transition-all hover:bg-green-700 hover:shadow-md active:scale-95">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link href="/contact" className="rounded-xl bg-green-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95">
              Contact
            </Link>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              {mobileMenuOpen
                ? <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1 text-[15px] font-medium text-slate-700">
              <a href="#ideas"   onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">💡 Ideas</a>
              <a href="#filters" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">🎯 Filter by Budget</a>
              <Link href="/about"   onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">ℹ️ About</Link>
              <Link href="/contact" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition hover:bg-slate-50">✉️ Contact</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-700">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-green-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-24 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-14">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="text-sm">🇺🇬</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-200">Uganda · 2026</span>
              </div>

              <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight text-white sm:mt-5 sm:text-5xl lg:text-6xl">
                Find the right
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                  business idea.
                </span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-green-100/70 sm:mt-5 sm:max-w-lg sm:text-[17px]">
                Practical, Uganda-focused business opportunities — with real startup
                costs in UGX, step-by-step beginner guides, and honest advice you
                can actually use.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-emerald-400 sm:mt-8 sm:max-w-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search ideas…"
                  className="flex-1 bg-transparent py-1 text-sm text-white placeholder-white/40 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/50 hover:bg-white/20 hover:text-white">✕</button>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row">
                <a href="#ideas"   className="rounded-xl bg-white px-6 py-3.5 text-center text-sm font-bold text-green-800 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:py-3">
                  Explore Ideas →
                </a>
                <a href="#filters" className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:py-3">
                  Filter by Budget
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
              {[
                { label: "Total Ideas", value: ideas.length,        note: "Across agriculture, food, services & retail" },
                { label: "Matching",    value: filteredIdeas.length, note: "Ideas matching your current filters"         },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">{s.label}</p>
                  <p className="mt-2 text-4xl font-bold text-white sm:text-5xl">{s.value}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-green-100/55 sm:mt-2">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f8fafc] to-transparent sm:h-16" />
      </section>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 md:px-10 md:pb-24 md:pt-16">

        {/* HOW IT WORKS */}
        <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {[
            { num: "01", icon: "💡", title: "Practical Ideas",        body: "Realistic opportunities written for beginners — easy to understand, compare, and act on." },
            { num: "02", icon: "🎯", title: "Budget-Based Discovery", body: "Filter by capital so you only see businesses that match what you can invest." },
            { num: "03", icon: "📋", title: "Detailed Guides",        body: "Every idea includes startup steps, risks, best locations, and profit potential." },
          ].map((item) => (
            <div
              key={item.num}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md sm:p-6"
            >
              <div className="absolute inset-y-0 left-0 w-0 rounded-l-2xl bg-green-400 transition-all duration-200 group-hover:w-[3px]" />
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">{item.num}</span>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-green-700 sm:mt-4">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </section>

        {/* FEATURED IDEAS */}
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="mb-6 sm:mb-8">
            <p className={eyebrow}>Top picks</p>
            <h2 className={sectionH2}>Featured Ideas</h2>
            <p className={sectionLead}>Beginner-friendly businesses with strong daily demand across Uganda.</p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {[
              { href: "/ideas/poultry-farming",       category: "Agriculture", emoji: "🐔", title: "Poultry Farming",       desc: "Strong demand with repeat buyers and reliable long-term income potential.",  budget: "UGX 500,000 – 3,000,000", tag: "High demand"  },
              { href: "/ideas/mobile-money-business",  category: "Services",    emoji: "📱", title: "Mobile Money Business", desc: "Daily cash flow business in busy trading centres and marketplaces.",         budget: "UGX 500,000 – 2,000,000", tag: "Daily income" },
              { href: "/ideas/chapati-business",       category: "Food",        emoji: "🫓", title: "Chapati Business",      desc: "Fast-moving street food with consistent revenue in high-traffic areas.",    budget: "UGX 200,000 – 800,000",   tag: "Low capital"  },
            ].map((card) => {
              const cfg = categoryConfig[card.category];
              return (
                <Link key={card.href} href={card.href} className="group block">
                  <div className={`${ideaCardBase} p-5 sm:p-6`}>
                    <div className={accentBar} />
                    <div className="flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg?.color ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {cfg?.icon} {card.category}
                      </span>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 ring-1 ring-green-100">
                        {card.tag}
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl shadow-inner transition-colors duration-200 group-hover:bg-green-50">
                        {card.emoji}
                      </div>
                      <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-green-700">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{card.desc}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-400">{card.budget}</p>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-green-700 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white">
                        View guide
                        <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FILTERS */}
        <section id="filters" className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-16 sm:rounded-3xl sm:p-8 md:mt-20 md:p-10">
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <div>
              <p className={eyebrow}>Narrow down</p>
              <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">Filter Ideas</h2>
              <p className={sectionLead}>Find ideas by category and startup budget.</p>
            </div>
            <button
              onClick={clearAllFilters}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                hasActiveFilters
                  ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </span>
            </button>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Active:</span>
              {search !== "" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Search: &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600" aria-label="Remove search filter">✕</button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {categoryConfig[selectedCategory]?.icon} {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="text-slate-400 hover:text-slate-600" aria-label="Remove category filter">✕</button>
                </span>
              )}
              {selectedBudget !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {selectedBudget}
                  <button onClick={() => setSelectedBudget("All")} className="text-slate-400 hover:text-slate-600" aria-label="Remove budget filter">✕</button>
                </span>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 sm:min-h-0 sm:px-5 sm:py-2.5 ${selectedCategory === cat ? filterActive : filterIdle}`}
                  >
                    {cat !== "All" && <span className="mr-1">{categoryConfig[cat]?.icon}</span>}{cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Budget (UGX)</p>
              <div className="flex flex-wrap gap-2">
                {budgetOptions.map((budget) => (
                  <button key={budget} onClick={() => setSelectedBudget(budget)}
                    className={`min-h-[44px] rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 sm:min-h-0 sm:px-5 sm:py-2.5 ${selectedBudget === budget ? filterActive : filterIdle}`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ALL IDEAS */}
        <section id="ideas" className="mt-12 sm:mt-16 md:mt-20">
          <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8 sm:items-end">
            <div>
              <p className={eyebrow}>Browse all</p>
              <h2 className={sectionH2}>Business Ideas</h2>
              <p className={sectionLead}>Opportunities for different budgets, skills, and locations.</p>
            </div>
            <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm sm:px-5 sm:py-3">
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{filteredIdeas.length}</p>
              <p className="text-[11px] font-medium text-slate-400">result{filteredIdeas.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center sm:py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl sm:h-16 sm:w-16 sm:text-3xl">🔍</div>
              <p className="mt-4 text-base font-semibold text-slate-700">No ideas found</p>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">Try adjusting your search or clearing the filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-5 min-h-[44px] rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {filteredIdeas.map((idea) => {
                const cfg = categoryConfig[idea.category];
                return (
                  <Link key={idea.slug} href={`/ideas/${idea.slug}`} className="group block">
                    <div className={`${ideaCardBase} p-5 sm:p-6`}>
                      <div className={accentBar} />
                      <div className="flex items-start justify-between gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg?.color ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {cfg?.icon} {idea.category}
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                          {idea.capital}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[16px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-green-700 sm:mt-5">
                        {idea.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{idea.desc}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 sm:mt-5">
                        <span className="text-xs font-medium text-slate-400">{idea.category}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-green-700 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white">
                          Open guide
                          <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* TRUST SECTION */}
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="rounded-2xl border border-slate-200 bg-white sm:rounded-3xl">
            <div className="border-b border-slate-100 px-6 py-4 sm:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-600">
                Why people trust this platform
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">
              {[
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                    </svg>
                  ),
                  label: "Built for Uganda",
                  body:  "Ideas chosen for the Ugandan market, not copied from elsewhere.",
                },
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                    </svg>
                  ),
                  label: "Beginner-friendly",
                  body:  "No experience needed. Every guide explains things from scratch.",
                },
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/>
                    </svg>
                  ),
                  label: "Real startup costs",
                  body:  "Honest UGX figures — what you actually need to get started.",
                },
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>
                    </svg>
                  ),
                  label: "Practical guidance",
                  body:  "Step-by-step actions, risks, and tips you can actually use.",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 sm:p-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold leading-snug text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-700 p-6 shadow-2xl sm:mt-16 sm:rounded-3xl sm:p-10 md:mt-20 md:p-14">
          <div className="relative">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-400">Why this platform</p>
            <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
              Built for Ugandan entrepreneurs
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-green-100/65 sm:max-w-xl">
              Everything you need to find, understand, and start a business that fits your situation.
            </p>
            <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 md:mt-10 md:grid-cols-3">
              {[
                { icon: "✅", title: "Practical", body: "Written for beginners — every idea explains what it actually takes to get started." },
                { icon: "📍", title: "Local",     body: "Focused on Uganda and opportunities people can start with limited capital."     },
                { icon: "📊", title: "Clear",     body: "Startup costs, risks, steps, and profit potential — all visible in one place."  },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15 sm:p-6">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="mt-3 text-[15px] font-semibold leading-snug text-emerald-300">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-green-100/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY STRIP */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4">
          {[
            { label: "Agriculture", icon: "🌱", style: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300" },
            { label: "Food",        icon: "🍽️", style: "bg-amber-50   border-amber-200   text-amber-700   hover:bg-amber-100   hover:border-amber-300"   },
            { label: "Services",    icon: "💼", style: "bg-sky-50     border-sky-200     text-sky-700     hover:bg-sky-100     hover:border-sky-300"     },
            { label: "Retail",      icon: "🛒", style: "bg-violet-50  border-violet-200  text-violet-700  hover:bg-violet-100  hover:border-violet-300"  },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setSelectedCategory(cat.label);
                document.getElementById("ideas")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex min-h-[56px] items-center gap-2.5 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:gap-3 sm:p-5 ${cat.style}`}
            >
              <span className="text-xl sm:text-2xl">{cat.icon}</span>
              <span className="text-[13px] font-semibold sm:text-[14px]">{cat.label}</span>
            </button>
          ))}
        </section>


        {/* ── CALL TO ACTION ───────────────────────────────────────────────── */}
        {/*
          Placement: after the category strip, before the footer — the last
          thing a user sees before leaving. Goal: convert a browser into
          a starter. Two actions: primary (scroll to ideas) and secondary
          (filter by budget). No dark panel here — the Why Us section above
          already uses the dark green gradient. This one uses white + a
          single green accent line to feel lighter and conclusive.
        */}
        <section className="mt-10 sm:mt-14">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-14">

            {/* Decorative top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />

            {/* Decorative background circle — subtle, bottom-right */}
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-green-50 opacity-60" />

            <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">

              {/* Left: headline + supporting text */}
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-600">
                  Start today
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
                  Your next business idea
                  <br className="hidden sm:block" /> is waiting.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
                  Browse {ideas.length} practical ideas built for Uganda. Filter by
                  your budget, pick a category, and open a full step-by-step guide
                  — all free, no sign-up needed.
                </p>

                {/* Three micro trust signals inline */}
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {[
                    { icon: "🇺🇬", label: "Uganda-focused" },
                    { icon: "📋", label: "Step-by-step guides" },
                    { icon: "💰", label: "Real UGX costs" },
                  ].map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5 text-sm text-slate-500">
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: CTA buttons stacked */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[200px]">
                <a
                  href="#ideas"
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-green-200 transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 active:translate-y-0 active:shadow-sm"
                >
                  Explore all ideas
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#filters"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700 active:scale-95"
                >
                  Filter by budget
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:mt-14 sm:rounded-3xl sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200">
                UBI
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Uganda Business Ideas</p>
                {/* Tagline carries all three trust signals in one line:
                    Uganda focus · beginner-friendly · current year */}
                <p className="text-xs leading-relaxed text-slate-400">
                  Uganda&apos;s beginner-friendly business guide · Updated 2026
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500">
              <Link href="/about"   className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">About</Link>
              <Link href="/contact" className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Contact</Link>
              <a href="#ideas"      className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Ideas</a>
              <a href="#filters"    className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Filter</a>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-slate-400">© 2026 Uganda Business Ideas. Built to help Ugandans start smarter. 🇺🇬</p>
            <p className="text-xs text-slate-300">Free · No sign-up · Beginner-friendly</p>
          </div>
        </footer>

      </div>
    </main>
  );
}