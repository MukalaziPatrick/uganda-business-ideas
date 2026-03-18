// app/HomeClient.tsx
//
// This is the interactive homepage component.
// It uses useState so it must be a client component.
// SEO metadata lives in page.tsx (the server component wrapper).

"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Radius  : rounded-2xl (cards), rounded-3xl (panels), rounded-full (badges)
// Shadows : shadow-sm (rest), hover:shadow-[0_8px_30px_-4px_rgba(22,163,74,0.18)]
// Gaps    : mt-12 / sm:mt-16 / md:mt-20
// Eyebrow : text-[10.5px] font-bold uppercase tracking-[0.14em]
// H2      : text-2xl sm:text-3xl font-black tracking-tight
// Body    : text-[14px] leading-relaxed text-slate-600
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const [search, setSearch]                     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBudget, setSelectedBudget]     = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  const categories    = ["All", "Agriculture", "Food", "Services", "Retail"];
  const budgetOptions = ["All", "Under 500k", "500k - 2M", "Above 2M"];

  const categoryConfig: Record<string, { color: string; icon: string; accent: string }> = {
    Agriculture: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🌱", accent: "emerald" },
    Food:        { color: "bg-amber-50  text-amber-700  border-amber-200",     icon: "🍽️", accent: "amber"   },
    Services:    { color: "bg-sky-50    text-sky-700    border-sky-200",       icon: "💼", accent: "sky"     },
    Retail:      { color: "bg-violet-50 text-violet-700 border-violet-200",    icon: "🛒", accent: "violet"  },
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

  // ── Shared class tokens ───────────────────────────────────────────────────
  const filterActive = "border-green-600 bg-green-600 text-white shadow-md shadow-green-200";
  const filterIdle   = "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700";
  const eyebrow      = "text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600";
  const sectionH2    = "mt-2 text-2xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl";
  const sectionLead  = "mt-2 text-[14.5px] leading-relaxed text-slate-500";

  // ── Card shared tokens ────────────────────────────────────────────────────
  const ideaCardBase = [
    "relative flex h-full flex-col overflow-hidden",
    "rounded-3xl border border-slate-200 bg-white",
    "shadow-sm transition-all duration-200 ease-out",
    "group-hover:-translate-y-1.5",
    "group-hover:border-green-200",
    "group-hover:shadow-[0_8px_30px_-4px_rgba(22,163,74,0.18)]",
    "active:translate-y-0 active:shadow-sm",
  ].join(" ");

  const accentBar = [
    "absolute inset-y-0 left-0 w-0 rounded-l-3xl bg-green-500",
    "transition-all duration-200 group-hover:w-1",
  ].join(" ");

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900 antialiased">

      {/* ── STICKY NAV ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-10">

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200 transition-shadow group-hover:shadow-lg group-hover:shadow-green-300">
              UBI
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-800">
              Uganda Business Ideas
            </span>
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#062b1a] via-[#0a3d26] to-[#0f5c3a]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-green-400/8 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-24 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center lg:gap-16">

            {/* Left col */}
            <div>
              {/* eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="text-sm">🇺🇬</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-200">Uganda · 2026 · Free Guides</span>
              </div>

              {/* headline */}
              <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                Find a business
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-green-200 to-teal-200 bg-clip-text text-transparent">
                  you can start now.
                </span>
              </h1>

              {/* value proposition */}
              <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-green-100/70">
                Practical, Uganda-focused business ideas with real startup costs in UGX,
                honest risks, and step-by-step guides — written for complete beginners.
              </p>

              {/* search bar */}
              <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-emerald-400 sm:mt-8 sm:max-w-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search business ideas…"
                  className="flex-1 bg-transparent py-1 text-sm text-white placeholder-white/40 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    aria-label="Clear search"
                  >✕</button>
                )}
              </div>

              {/* CTA row */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#ideas"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-green-800 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                >
                  Browse All Ideas
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </a>
                <a
                  href="#filters"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                >
                  Filter by Budget
                </a>
              </div>

              {/* Micro trust strip */}
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5">
                {[
                  { icon: "✅", label: "100% Free" },
                  { icon: "📋", label: "Step-by-step guides" },
                  { icon: "💰", label: "Real UGX startup costs" },
                  { icon: "🔒", label: "No sign-up needed" },
                ].map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-[12.5px] text-green-200/60">
                    <span>{t.icon}</span>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right col — stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
              {[
                {
                  label: "Business Ideas",
                  value: ideas.length,
                  note:  "Across agriculture, food, services & retail",
                  icon:  "💡",
                },
                {
                  label: "Matching Now",
                  value: filteredIdeas.length,
                  note:  "Ideas matching your current filters",
                  icon:  "🎯",
                },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-300">{s.label}</p>
                    <span className="text-lg">{s.icon}</span>
                  </div>
                  <p className="mt-2 text-4xl font-black text-white sm:text-5xl">{s.value}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-green-100/50">{s.note}</p>
                </div>
              ))}

              {/* Category quick-jump chips */}
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md lg:col-span-1">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-300">Browse by category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Agriculture 🌱", "Food 🍽️", "Services 💼", "Retail 🛒"].map((cat) => {
                    const label = cat.split(" ")[0];
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setSelectedCategory(label);
                          document.getElementById("ideas")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#f5f7fa] to-transparent" />
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 md:px-10 md:pb-24 md:pt-16">

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {[
            {
              num:   "01",
              icon:  "💡",
              title: "Browse Ideas",
              body:  "Explore practical business opportunities written for Ugandan beginners — easy to compare and understand.",
            },
            {
              num:   "02",
              icon:  "🎯",
              title: "Filter by Budget",
              body:  "Set your available capital and instantly see only the businesses you can realistically start.",
            },
            {
              num:   "03",
              icon:  "📋",
              title: "Read the Full Guide",
              body:  "Each idea has startup steps, real costs, risks, best locations, and profit potential — all in one page.",
            },
          ].map((item) => (
            <div
              key={item.num}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md sm:p-6"
            >
              <div className="absolute inset-y-0 left-0 w-0 rounded-l-2xl bg-green-500 transition-all duration-200 group-hover:w-[3px]" />
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-lg transition-colors group-hover:bg-green-100">
                  {item.icon}
                </span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-300">{item.num}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-green-700">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </section>

        {/* ── FEATURED IDEAS ────────────────────────────────────────────────── */}
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <p className={eyebrow}>Top picks</p>
              <h2 className={sectionH2}>Featured Ideas</h2>
              <p className={sectionLead}>High-demand businesses with reliable income potential across Uganda.</p>
            </div>
            <a
              href="#ideas"
              className="hidden shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:block"
            >
              View all →
            </a>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {[
              {
                href:     "/ideas/poultry-farming",
                category: "Agriculture",
                emoji:    "🐔",
                title:    "Poultry Farming",
                desc:     "Strong daily demand with repeat buyers and reliable long-term income potential.",
                budget:   "UGX 500,000 – 3,000,000",
                tag:      "High demand",
                tagColor: "bg-emerald-50 text-emerald-700 ring-emerald-100",
              },
              {
                href:     "/ideas/mobile-money-business",
                category: "Services",
                emoji:    "📱",
                title:    "Mobile Money Business",
                desc:     "Daily cash flow business in busy trading centres and high-traffic marketplaces.",
                budget:   "UGX 500,000 – 2,000,000",
                tag:      "Daily income",
                tagColor: "bg-sky-50 text-sky-700 ring-sky-100",
              },
              {
                href:     "/ideas/chapati-business",
                category: "Food",
                emoji:    "🫓",
                title:    "Chapati Business",
                desc:     "Fast-moving street food with consistent revenue in high-traffic areas.",
                budget:   "UGX 200,000 – 800,000",
                tag:      "Low capital",
                tagColor: "bg-amber-50 text-amber-700 ring-amber-100",
              },
            ].map((card) => {
              const cfg = categoryConfig[card.category];
              return (
                <Link key={card.href} href={card.href} className="group block">
                  <div className={`${ideaCardBase} p-5 sm:p-6`}>
                    <div className={accentBar} />

                    {/* Top row: category + tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg?.color ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {cfg?.icon} {card.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${card.tagColor}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Icon + title */}
                    <div className="mt-5 flex items-start gap-4">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-inner transition-colors duration-200 group-hover:bg-green-50">
                        {card.emoji}
                      </div>
                      <h3 className="mt-1 text-[17px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-green-700">
                        {card.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-slate-600">{card.desc}</p>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-400">{card.budget}</p>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 px-3.5 py-1.5 text-[12px] font-bold text-green-700 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white">
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

        {/* ── TRUST SECTION ─────────────────────────────────────────────────── */}
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-3xl">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <p className={eyebrow}>Why people trust this platform</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Built for beginners. Built for Uganda.
              </h2>
            </div>

            {/* 4-column trust grid */}
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">
              {[
                {
                  icon: "🇺🇬",
                  label: "Uganda-focused",
                  body:  "Every idea is chosen for the Ugandan market — not copied from other countries.",
                  stat:  `${ideas.length} local ideas`,
                },
                {
                  icon: "📖",
                  label: "Beginner-friendly",
                  body:  "No experience needed. Every guide explains what to do from scratch.",
                  stat:  "Zero jargon",
                },
                {
                  icon: "💰",
                  label: "Real UGX costs",
                  body:  "Honest startup figures in Ugandan shillings — what you actually need.",
                  stat:  "No hidden fees",
                },
                {
                  icon: "📋",
                  label: "Practical guides",
                  body:  "Step-by-step actions, realistic risks, best locations, and profit potential.",
                  stat:  "Free forever",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-xl">
                      {item.icon}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400 border border-slate-200">
                      {item.stat}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold leading-snug text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom reassurance bar */}
            <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8">
              {[
                "✅ 100% Free",
                "🔒 No account needed",
                "📱 Works on mobile",
                "🇺🇬 Updated for 2026",
              ].map((item) => (
                <span key={item} className="text-[12.5px] font-medium text-slate-500">{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTERS ───────────────────────────────────────────────────────── */}
        <section id="filters" className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-16 sm:rounded-3xl sm:p-8 md:mt-20 md:p-10">
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <div>
              <p className={eyebrow}>Narrow down</p>
              <h2 className="mt-2 text-xl font-black leading-snug tracking-tight text-slate-900 sm:text-2xl">Filter Ideas</h2>
              <p className={sectionLead}>Find the right business by category and startup budget.</p>
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
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Active:</span>
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
              <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 sm:min-h-0 sm:px-5 sm:py-2.5 ${selectedCategory === cat ? filterActive : filterIdle}`}
                  >
                    {cat !== "All" && <span className="mr-1">{categoryConfig[cat]?.icon}</span>}{cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Budget (UGX)</p>
              <div className="flex flex-wrap gap-2">
                {budgetOptions.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(budget)}
                    className={`min-h-[44px] rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 sm:min-h-0 sm:px-5 sm:py-2.5 ${selectedBudget === budget ? filterActive : filterIdle}`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ALL IDEAS GRID ────────────────────────────────────────────────── */}
        <section id="ideas" className="mt-12 sm:mt-16 md:mt-20">
          <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8 sm:items-end">
            <div>
              <p className={eyebrow}>Browse all</p>
              <h2 className={sectionH2}>Business Ideas</h2>
              <p className={sectionLead}>Opportunities for different budgets, skills, and locations across Uganda.</p>
            </div>
            {/* Live result count */}
            <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm sm:px-5 sm:py-3">
              <p className="text-xl font-black text-slate-900 sm:text-2xl">{filteredIdeas.length}</p>
              <p className="text-[10.5px] font-semibold text-slate-400">result{filteredIdeas.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center sm:py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl sm:h-16 sm:w-16 sm:text-3xl">🔍</div>
              <p className="mt-4 text-base font-bold text-slate-700">No ideas found</p>
              <p className="mt-1.5 max-w-xs text-[13.5px] leading-relaxed text-slate-400">
                Try adjusting your search or clearing the active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-5 min-h-[44px] rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
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

                      {/* Category + capital */}
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg?.color ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {cfg?.icon} {idea.category}
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                          {idea.capital}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-4 text-[16px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-green-700 sm:mt-5">
                        {idea.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-600">{idea.desc}</p>

                      {/* Card footer CTA */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 sm:mt-5">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75m-7.5 6h12A2.25 2.25 0 0021 18.75V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5"/>
                          </svg>
                          Full guide inside
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 px-3.5 py-1.5 text-[12px] font-bold text-green-700 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white">
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

        {/* ── WHY US ────────────────────────────────────────────────────────── */}
        <section className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#062b1a] via-[#0a3d26] to-[#0f5c3a] p-6 shadow-2xl sm:mt-16 sm:rounded-3xl sm:p-10 md:mt-20 md:p-14">
          <div className="relative">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-400">Why this platform</p>
            <h2 className="mt-3 text-xl font-black leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
              Built for Ugandan entrepreneurs
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-green-100/65 sm:max-w-xl">
              Everything you need to find, understand, and confidently start a business that fits your situation.
            </p>
            <div className="mt-7 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
              {[
                { icon: "✅", title: "Practical",  body: "Written for beginners — every idea explains exactly what it takes to get started in Uganda." },
                { icon: "📍", title: "Local",      body: "Focused on real Ugandan markets and opportunities people can start with limited capital."   },
                { icon: "📊", title: "Transparent", body: "Startup costs, risks, steps, and profit potential — everything visible in one place, for free." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15 sm:p-6">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="mt-3 text-[15px] font-bold leading-snug text-emerald-300">{item.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-green-100/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORY STRIP ────────────────────────────────────────────────── */}
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
              <span className="text-[13px] font-bold sm:text-[14px]">{cat.label}</span>
            </button>
          ))}
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
        <section className="mt-10 sm:mt-14">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-14">
            {/* Accent bar top */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />
            {/* Soft background circle */}
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-green-50 opacity-70" />

            <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">

              {/* Text side */}
              <div className="max-w-xl">
                <p className={eyebrow}>Start today — it&apos;s free</p>
                <h2 className="mt-2 text-2xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl">
                  Your next business idea
                  <br className="hidden sm:block" /> is waiting.
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-slate-500">
                  Browse {ideas.length} practical ideas built for Uganda. Filter by your budget,
                  pick a category, and open a full step-by-step guide — all free, no sign-up needed.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {[
                    { icon: "🇺🇬", label: "Uganda-focused" },
                    { icon: "📋",  label: "Step-by-step guides" },
                    { icon: "💰",  label: "Real UGX costs" },
                    { icon: "🔒",  label: "No sign-up" },
                  ].map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5 text-[13px] text-slate-500">
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Button side */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[210px]">
                <a
                  href="#ideas"
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-black text-white shadow-md shadow-green-200 transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 active:translate-y-0"
                >
                  Browse All Ideas
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#filters"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700 active:scale-95"
                >
                  Filter by Budget
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:mt-14 sm:rounded-3xl sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200">
                UBI
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Uganda Business Ideas</p>
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
          <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-slate-400">
              © 2026 Uganda Business Ideas. Built to help Ugandans start smarter. 🇺🇬
            </p>
            <p className="text-xs text-slate-300">Free · No sign-up · Beginner-friendly</p>
          </div>
        </footer>

      </div>
    </main>
  );
}