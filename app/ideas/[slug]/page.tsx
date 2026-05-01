// cspell:ignore Fertilisers NARO Agro Owino Balikuddembe Kikuubo Jumia Jiji KCCA didn
import { formatCapital, getIdeaBySlug, ideas } from "../../data/ideas";
import { stories } from "../../data/stories";
import { resources } from "../../data/resources";
import { suppliers as supplierListings } from "../../data/suppliers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsLink from "@/components/AnalyticsLink";
import SupplierCard from "@/components/SupplierCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { SITE_URL } from "@/lib/site";
import { buildIdeaHelpMessage } from "@/lib/whatsapp";

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);

  if (!idea) {
    return {
      title: "Business Idea Not Found | Uganda Business Ideas",
      description: "The requested business idea could not be found.",
    };
  }

  return {
    title: `${idea.title} in Uganda | Cost, Steps & Profit`,
    description: `${idea.desc} Learn startup capital, steps, risks, and profit potential in Uganda.`,
    alternates: {
      canonical: `${SITE_URL}/ideas/${idea.slug}`,
    },
  };
}

export function generateStaticParams() {
  return ideas.map((idea) => ({
    slug: idea.slug,
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toArray = (v: string | string[]): string[] =>
  Array.isArray(v) ? v : [v];

// ─── Where-to-buy map (category → supplier list) ──────────────────────────
const supplierMap: Record<string, { name: string; type: string; tip: string }[]> = {
  Agriculture: [
    { name: "Farmers' Input Markets",  type: "Seeds & Fertilisers", tip: "Buy early before the planting season rush drives up prices." },
    { name: "NARO Extension Offices",  type: "Technical Inputs",    tip: "Free certified seeds and advice available for registered farmers." },
    { name: "Agro-vet Shops",          type: "Pesticides & Tools",  tip: "Compare prices at two or three shops — markups vary widely." },
  ],
  Food: [
    { name: "Owino / St. Balikuddembe Market", type: "Wholesale Ingredients", tip: "Buy in bulk on weekday mornings for the best prices and freshest stock." },
    { name: "Kikuubo Trading Centre",           type: "Packaging & Supplies",  tip: "Negotiate volume discounts — most vendors expect it." },
    { name: "Local Wholesale Distributors",     type: "Branded Goods",         tip: "Ask for a credit account once you have a consistent order history." },
  ],
  Services: [
    { name: "Kampala City Centre Shops",  type: "Equipment & Tools", tip: "Check second-hand first — quality used equipment cuts startup costs by 40%+." },
    { name: "Online (Jumia / Jiji Uganda)", type: "Electronics & Supplies", tip: "Read seller reviews and request a warranty in writing before buying." },
    { name: "Chinese Wholesale Importers", type: "Bulk Supplies",    tip: "Pool orders with other small business owners to hit minimum quantities." },
  ],
  Digital: [
    { name: "Computer Training Centres", type: "Skills & Setup", tip: "Ask for practical examples and avoid paying for vague promises." },
    { name: "Printing and Cyber Shops", type: "Digital Services", tip: "Compare turnaround time, file handling, and support before choosing a provider." },
    { name: "Freelance Tech Providers", type: "Online Tools", tip: "Start with a small test job before paying for a larger package." },
  ],
  Retail: [
    { name: "Kikuubo Trading Centre",   type: "Wholesale Stock",    tip: "Walk the whole street before buying — identical goods can differ by 30% in price." },
    { name: "Industrial Area Factories", type: "Direct Manufacture", tip: "Buying direct removes the middleman and increases your margin." },
    { name: "Owino Market",              type: "Second-Hand Goods",  tip: "Grade carefully: A-grade items resell fast; C-grade stock ties up your capital." },
  ],
};

const defaultSuppliers = [
  { name: "Kampala City Markets",        type: "General Supplies",   tip: "Always compare prices across at least three vendors before committing." },
  { name: "Kikuubo Trading Centre",      type: "Wholesale Goods",    tip: "Arrive early on weekday mornings for the widest selection and freshest stock." },
  { name: "Online (Jumia / Jiji Uganda)", type: "Electronics & Tools", tip: "Check seller ratings and request warranties before transferring any money." },
];

// ─── Resource type colours ────────────────────────────────────────────────────
const resourceTypeStyle: Record<string, { badge: string; dot: string }> = {
  Government: { badge: "bg-blue-50 text-blue-700 border-blue-100",     dot: "bg-blue-500"   },
  Training:   { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-500" },
  Finance:    { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  Market:     { badge: "bg-amber-50 text-amber-700 border-amber-100",   dot: "bg-amber-500"  },
  Community:  { badge: "bg-sky-50 text-sky-700 border-sky-100",         dot: "bg-sky-500"    },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);
  if (!idea) notFound();

  const categoryConfig: Record<string, { color: string; bg: string; icon: string; accent: string }> = {
    Digital:     { color: "text-indigo-700",  bg: "bg-indigo-50  border-indigo-200",  icon: "💻", accent: "indigo"  },
    Agriculture: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "🌱", accent: "emerald" },
    Food:        { color: "text-amber-700",   bg: "bg-amber-50   border-amber-200",   icon: "🍽️", accent: "amber"   },
    Services:    { color: "text-sky-700",     bg: "bg-sky-50     border-sky-200",     icon: "💼", accent: "sky"     },
    Retail:      { color: "text-violet-700",  bg: "bg-violet-50  border-violet-200",  icon: "🛒", accent: "violet"  },
  };
  const cfg = categoryConfig[idea.category] ?? {
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    icon: "💡",
    accent: "slate",
  };

  const suppliers = supplierMap[idea.category] ?? defaultSuppliers;

  // ── Stories for this idea: exact slug match OR same category ─────────────
  const ideaStories = stories.filter(
    (s) =>
      s.ideaSlugs.includes(idea.slug) ||
      s.categories.some((c) => c === idea.category)
  );

  // ── Resources for this idea: exact category match OR "All" ───────────────
  const ideaResources = resources.filter(
    (r) => r.categories.includes("All") || r.categories.includes(idea.category)
  );

  const relevantSupplierListings = supplierListings.filter(
    (supplier) =>
      supplier.ideaSlugs.includes(idea.slug) ||
      supplier.category === idea.category ||
      supplier.category === "General"
  );

  // ── Shared design tokens ──────────────────────────────────────────────────
  const card        = "rounded-2xl border border-slate-200 bg-white shadow-sm";
  const eyebrow     = "text-[10.5px] font-bold uppercase tracking-[0.14em]";
  const body        = "text-[14.5px] leading-relaxed text-slate-600";
  const iconWrap    = "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[17px]";

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900 antialiased">

      {/* ── STICKY NAVBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200 group-hover:shadow-lg group-hover:shadow-green-300 transition-all">
              UBI
            </div>
            <span className="hidden text-[15px] font-semibold tracking-tight text-slate-800 sm:block">
              Uganda Business Ideas
            </span>
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-400 md:inline-flex">
              🇺🇬 Uganda · 2026
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All ideas
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8 md:px-10 md:pt-10">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062b1a] via-[#0a3d26] to-[#0f5c3a] shadow-2xl shadow-green-950/40">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-green-300/8 blur-2xl" />
          <div className="pointer-events-none absolute right-1/3 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="relative px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                {cfg.icon} {idea.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-bold text-emerald-300">
                ✓ Beginner-friendly
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-green-200/80">
                {formatCapital(idea.capital)}
              </span>
              {ideaStories.length > 0 && (
                <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-yellow-200/90">
                  🌟 {ideaStories.length} success {ideaStories.length === 1 ? "story" : "stories"}
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[56px]">
              {idea.title}
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-green-100/70 sm:text-[17px]">
              {idea.desc}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Capital needed", value: formatCapital(idea.capital),        icon: "💰" },
                { label: "Category",       value: idea.category,       icon: "🏷️" },
                { label: "Best for",       value: idea.bestFor?.split(" ").slice(0, 5).join(" ") + "…", icon: "🎯" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <span className="text-base">{stat.icon}</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300/80">{stat.label}</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#how-to-start"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-800 shadow-md shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                🚀 How to Start
              </a>
              {ideaStories.length > 0 && (
                <a href="#stories"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95">
                  🌟 Success Stories
                </a>
              )}
              <a href="#suppliers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95">
                📦 Where to Buy
              </a>
            </div>
          </div>
        </section>

        {/* ── QUICK PROGRESS BAR (page navigation) ─────────────────────────── */}
        <nav className="mt-4 hidden gap-1.5 overflow-x-auto sm:flex">
          {[
            { label: "Best For",     href: "#best-for"     },
            { label: "Costs",        href: "#costs"        },
            { label: "How to Start", href: "#how-to-start" },
            { label: "Locations",    href: "#locations"    },
            { label: "Suppliers",    href: "#suppliers"    },
            { label: "Risks",        href: "#risks"        },
            { label: "Profit",       href: "#profit"       },
            { label: "Tips",         href: "#tips"         },
            ...(ideaStories.length > 0 ? [{ label: "Stories", href: "#stories" }] : []),
            { label: "Resources",    href: "#resources"    },
            { label: "FAQ",          href: "#faq"          },
          ].map((n) => (
            <a key={n.href} href={n.href}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700">
              {n.label}
            </a>
          ))}
        </nav>

        {/* ── 1. CONTEXT ROW: Best For + Skills ───────────────────────────── */}
        <div id="best-for" className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={`${card} p-6`}>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className={`${iconWrap} bg-sky-50`}>🎯</div>
              <div>
                <p className={`${eyebrow} text-sky-500`}>Who is this for</p>
                <h2 className="text-[15px] font-bold text-slate-900">Best For</h2>
              </div>
            </div>
            <p className={body}>{idea.bestFor}</p>
          </div>

          <div className={`${card} p-6`}>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className={`${iconWrap} bg-violet-50`}>🛠️</div>
              <div>
                <p className={`${eyebrow} text-violet-500`}>What you need to know</p>
                <h2 className="text-[15px] font-bold text-slate-900">Skills Needed</h2>
              </div>
            </div>
            <ul className="space-y-2.5">
              {toArray(idea.skills).map((skill, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </span>
                  <span className={body}>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 2. COSTS BREAKDOWN ──────────────────────────────────────────── */}
        <section id="costs" className="mt-6">
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className={`${iconWrap} bg-emerald-50`}>💰</div>
              <div>
                <p className={`${eyebrow} text-emerald-600`}>What it will cost you</p>
                <h2 className="text-[15px] font-bold text-slate-900">Costs Breakdown</h2>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { tier: "Minimum Start",      icon: "🟢", emoji: "Starter",     desc: "Bare minimum to test this idea before committing more funds.",        note: "Best for first-timers with limited savings.",    bar: "w-1/3",  bg: "bg-emerald-50/70" },
                { tier: "Comfortable Budget", icon: "🟡", emoji: "Recommended", desc: "Gives you proper tools, stock, and a small financial buffer.",        note: "Recommended for most beginners starting out.",   bar: "w-2/3",  bg: "bg-amber-50/70"   },
                { tier: "Growth Setup",       icon: "🔵", emoji: "Scale",        desc: "Larger scale with better equipment and higher earning potential.",    note: "Best if you have savings or family support.",    bar: "w-full", bg: "bg-sky-50/70"     },
              ].map((item) => (
                <div key={item.tier} className={`flex flex-col gap-4 px-6 py-6 sm:px-7 ${item.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{item.icon}</span>
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200/80">{item.emoji}</span>
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-slate-800">{item.tier}</p>
                    <p className={`mt-1.5 ${body}`}>{item.desc}</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
                    <div className={`h-full ${item.bar} rounded-full bg-gradient-to-r from-green-400 to-emerald-500`} />
                  </div>
                  <p className="text-[11.5px] text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 sm:px-8">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-4 w-4 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                </svg>
              </div>
              <p className="text-[13.5px] text-slate-600">
                <span className="font-bold text-slate-900">Total capital range:</span>{" "}
                {formatCapital(idea.capital)} — exact costs depend on your location and choices.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. HOW TO START ─────────────────────────────────────────────── */}
        <section id="how-to-start" className="mt-6">
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className={`${iconWrap} bg-green-50`}>🚀</div>
              <div>
                <p className={`${eyebrow} text-green-600`}>Your action plan</p>
                <h2 className="text-[15px] font-bold text-slate-900">How to Start — Step by Step</h2>
              </div>
              <span className="ml-auto rounded-full bg-green-50 border border-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                {toArray(idea.steps).length} steps
              </span>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ol className="relative space-y-0">
                {toArray(idea.steps).map((step, i, arr) => (
                  <li key={i} className="relative flex gap-5 pb-6 last:pb-0">
                    {i < arr.length - 1 && (
                      <div className="absolute left-[17px] top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                    )}
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-[13px] font-black text-white shadow shadow-green-300 ring-4 ring-white">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className={`${eyebrow} text-slate-400 mb-1`}>Step {i + 1}</p>
                      <p className={body}>{step}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-bold text-green-900">Ready to take the first step?</p>
                  <p className="mt-0.5 text-[13px] text-green-700/70">Start small, learn fast, and grow steadily.</p>
                </div>
                <a href="#suppliers"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-green-300 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0">
                  Find Suppliers →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. BEST LOCATIONS ───────────────────────────────────────────── */}
        <section id="locations" className="mt-6">
          <div className={`${card} p-6 sm:p-8`}>
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className={`${iconWrap} bg-amber-50`}>📍</div>
              <div>
                <p className={`${eyebrow} text-amber-500`}>Where to set up</p>
                <h2 className="text-[15px] font-bold text-slate-900">Best Locations in Uganda</h2>
              </div>
            </div>
            <p className={body}>{idea.location}</p>

            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
              <span className="text-lg">💡</span>
              <p className="text-[13.5px] leading-relaxed text-amber-900">
                <span className="font-bold">Location tip:</span> Visit your chosen area before committing.
                Observe foot traffic at different times of day and talk to people already running businesses nearby.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. WHERE TO BUY MATERIALS ───────────────────────────────────── */}
        <section id="suppliers" className="mt-6">
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className={`${iconWrap} bg-indigo-50`}>📦</div>
              <div>
                <p className={`${eyebrow} text-indigo-500`}>Stock your business</p>
                <h2 className="text-[15px] font-bold text-slate-900">Where to Buy Materials & Supplies</h2>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {suppliers.map((s, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-5 sm:px-8 hover:bg-slate-50/60 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-[12px] font-black text-indigo-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-bold text-slate-900">{s.name}</p>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">{s.type}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                      <span className="font-semibold text-indigo-600">Tip: </span>{s.tip}
                    </p>
                  </div>
                  <span className="shrink-0 text-slate-300">→</span>
                </div>
              ))}
            </div>

            {relevantSupplierListings.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 sm:px-8">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={`${eyebrow} text-green-600`}>Supplier listings</p>
                    <h3 className="mt-1 text-[15px] font-bold text-slate-900">
                      Businesses to verify before buying
                    </h3>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                    Placeholder contacts
                  </span>
                </div>
                <div className="grid gap-3">
                  {relevantSupplierListings.map((supplier) => (
                    <SupplierCard
                      key={supplier.id}
                      supplier={supplier}
                      ideaTitle={idea.title}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-indigo-50/50 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
              <div className="flex-1">
                <p className="text-[13.5px] font-bold text-indigo-900">Need help finding a trusted supplier?</p>
                <p className="mt-0.5 text-[12.5px] text-indigo-600/70">Ask in local business WhatsApp groups or visit the nearest KCCA Business Hub.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <WhatsAppCTA
                  label="Ask on WhatsApp"
                  message={buildIdeaHelpMessage(idea.title, formatCapital(idea.capital))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-[12.5px] font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-50 active:scale-95"
                />
                <a href="tel:0800100006"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
                  📞 KCCA Helpline
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. RISKS ────────────────────────────────────────────────────── */}
        <section id="risks" className="mt-6">
          <div className={`${card} p-6 sm:p-8`}>
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className={`${iconWrap} bg-red-50`}>⚠️</div>
              <div>
                <p className={`${eyebrow} text-red-500`}>What could go wrong</p>
                <h2 className="text-[15px] font-bold text-slate-900">Risks to Know</h2>
              </div>
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-slate-400">
              Every business has risks. Knowing them in advance helps you prepare and avoid common mistakes.
            </p>
            <ul className="space-y-3">
              {toArray(idea.risks).map((risk, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-slate-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 7. PROFIT POTENTIAL ─────────────────────────────────────────── */}
        <section id="profit" className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-sm">
            <div className="flex items-center gap-3 border-b border-emerald-100/70 px-6 py-5 sm:px-8">
              <div className={`${iconWrap} bg-emerald-100`}>📈</div>
              <div>
                <p className={`${eyebrow} text-emerald-700`}>What you can earn</p>
                <h2 className="text-[15px] font-bold text-slate-900">Profit Potential</h2>
              </div>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <p className="text-[14.5px] leading-relaxed text-slate-700">{idea.profit}</p>

              <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200/70 bg-white/60 px-4 py-4">
                <span className="text-lg">📌</span>
                <p className="text-[13px] leading-relaxed text-emerald-800">
                  <span className="font-bold">Keep in mind:</span> These are estimates. Your actual earnings depend on location, effort, and cost management. Most businesses take 1–3 months to gain momentum.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Month 1–2", note: "Learning & setup",  pct: "20%" },
                  { label: "Month 3–4", note: "Growing customers", pct: "55%" },
                  { label: "Month 5+",  note: "Steady income",     pct: "85%" },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl border border-emerald-100 bg-white/70 p-3 text-center">
                    <p className="text-[19px] font-black text-emerald-700">{p.pct}</p>
                    <p className="text-[12px] font-bold text-slate-700">{p.label}</p>
                    <p className="text-[11px] text-slate-400">{p.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. HELPFUL TIPS ─────────────────────────────────────────────── */}
        <section id="tips" className="mt-6">
          <div className={`${card} p-6 sm:p-8`}>
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className={`${iconWrap} bg-amber-50`}>💡</div>
              <div>
                <p className={`${eyebrow} text-amber-500`}>Insider advice</p>
                <h2 className="text-[15px] font-bold text-slate-900">Helpful Tips</h2>
              </div>
            </div>
            <ul className="space-y-3">
              {toArray(idea.tips).map((tip, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-amber-50/50 px-4 py-3.5 border border-amber-100/60">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  <p className={body}>{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 9. SUCCESS STORIES ──────────────────────────────────────────── */}
        {ideaStories.length > 0 && (
          <section id="stories" className="mt-6">
            <div className={`${card} overflow-hidden`}>
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className={`${iconWrap} bg-yellow-50`}>🌟</div>
                <div>
                  <p className={`${eyebrow} text-yellow-600`}>Real people · Real results</p>
                  <h2 className="text-[15px] font-bold text-slate-900">Success Stories</h2>
                </div>
                <span className="ml-auto rounded-full bg-yellow-50 border border-yellow-100 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
                  {ideaStories.length} {ideaStories.length === 1 ? "story" : "stories"}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {ideaStories.map((story) => (
                  <div key={story.id} className="px-6 py-6 sm:px-8">

                    {/* YouTube embed — only shown when youtubeId is set */}
                    {story.youtubeId && (
                      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-black">
                        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                          <iframe
                            className="absolute inset-0 h-full w-full"
                            src={`https://www.youtube.com/embed/${story.youtubeId}`}
                            title={`${story.name} — ${story.business}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* No video yet — placeholder */}
                    {!story.youtubeId && (
                      <div className="mb-5 flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-600">Video coming soon</p>
                          <p className="text-[12px] text-slate-400">
                            To add a video: open <code className="rounded bg-slate-100 px-1">app/data/stories.ts</code>, find story <code className="rounded bg-slate-100 px-1">{story.id}</code>, and add <code className="rounded bg-slate-100 px-1">youtubeId: &quot;YOUR_VIDEO_ID&quot;</code>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quote */}
                    <div className="relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-5 py-5">
                      <svg className="mb-3 h-6 w-6 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                      <p className="text-[14.5px] italic leading-relaxed text-slate-700">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                    </div>

                    {/* Person info */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-2xl">
                          {story.avatarEmoji}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900">{story.name}</p>
                          <p className="text-[12.5px] text-slate-400">{story.location} · {story.timeframe}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11.5px] font-semibold text-slate-600">
                          {story.business}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                          📈 {story.result}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add your story CTA */}
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                <div className="flex-1">
                  <p className="text-[13.5px] font-bold text-amber-900">Have a story like this?</p>
                  <p className="mt-0.5 text-[12.5px] text-amber-700/70">
                    Your experience could help thousands of other Ugandans start with confidence.
                  </p>
                </div>
                <Link href="/contact"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95">
                  Share Your Story →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 10. STRONG CTA ──────────────────────────────────────────────── */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#062b1a] via-[#0a3d26] to-[#0f5c3a] shadow-2xl shadow-green-950/30">
            <div className="relative px-6 py-10 sm:px-10 sm:py-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />

              <p className={`${eyebrow} text-emerald-400`}>You&apos;re one step away</p>
              <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                Ready to launch your<br className="hidden sm:block" /> {idea.title}?
              </h2>
              <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-green-100/65">
                Thousands of Ugandans have started businesses just like this one. The only difference between those who succeeded and those who didn&apos;t? They started.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#how-to-start"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[13.5px] font-black text-green-800 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
                  🚀 Start Now — Step 1
                </a>
                <AnalyticsLink
                  href={`/start?interest=${encodeURIComponent(idea.title)}`}
                  eventName="idea_start_cta_click"
                  eventProperties={{
                    idea_slug: idea.slug,
                    idea_category: idea.category,
                    source: "idea_detail",
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-[13.5px] font-black text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-green-400 hover:shadow-xl active:translate-y-0">
                  I want to start this business
                </AnalyticsLink>
                <a href="#suppliers"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-[13.5px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95">
                  📦 Contact Supplier
                </a>
                <Link href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-6 py-3 text-[13.5px] font-bold text-green-200/80 transition-all hover:text-white active:scale-95">
                  Browse more ideas →
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
                {["Free guide", "No sign-up needed", "🇺🇬 Made for Uganda"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300/70">
                    <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. CURATED RESOURCES ───────────────────────────────────────── */}
        <section id="resources" className="mt-6">
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className={`${iconWrap} bg-blue-50`}>🔗</div>
              <div>
                <p className={`${eyebrow} text-blue-500`}>Official & trusted links</p>
                <h2 className="text-[15px] font-bold text-slate-900">Useful Resources</h2>
              </div>
              <span className="ml-auto rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                {ideaResources.length} links
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {ideaResources.map((r, i) => {
                const style = resourceTypeStyle[r.type] ?? { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
                return (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-4 px-6 py-5 sm:px-8 transition-colors hover:bg-slate-50/60 group">
                    {/* Index bubble */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-[12px] font-black text-blue-600">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-bold text-slate-900 transition-colors group-hover:text-blue-700">{r.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${style.badge}`}>{r.type}</span>
                        {r.free && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 ring-1 ring-emerald-100">Free</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{r.desc}</p>
                    </div>
                    <svg className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                    </svg>
                  </a>
                );
              })}
            </div>

            <div className="border-t border-slate-100 bg-blue-50/40 px-6 py-4 sm:px-8">
              <p className="text-[12.5px] text-slate-500">
                <span className="font-semibold text-slate-700">Always verify:</span> Check that websites are genuine before entering personal information or making payments. Look for official .go.ug domains for government services.
              </p>
            </div>
          </div>
        </section>

        {/* ── 12. FAQ ─────────────────────────────────────────────────────── */}
        {(() => {
          const faqs = [
            {
              q: `How much does it cost to start a ${idea.title} in Uganda?`,
              a: `The estimated startup capital for ${idea.title} in Uganda is ${formatCapital(idea.capital)}. The exact amount depends on your location, scale, and setup choices. Starting small and growing is a common approach for beginners.`,
            },
            {
              q: `Is ${idea.title} a good business for beginners in Uganda?`,
              a: `${idea.bestFor} With the right preparation and the step-by-step guidance in this guide, it is possible to start even with limited prior experience.`,
            },
            {
              q: `Where is the best place to start a ${idea.title} business in Uganda?`,
              a: `${idea.location} Always visit your preferred location before committing — observe foot traffic at different times and talk to people already operating nearby.`,
            },
            {
              q: `What are the main risks of starting a ${idea.title} business?`,
              a: toArray(idea.risks).join(" ") + " Being aware of these risks in advance allows you to plan and reduce their impact.",
            },
            {
              q: `How profitable is a ${idea.title} business in Uganda?`,
              a: `${idea.profit} Actual earnings vary by location, effort, and cost management. Most new businesses take one to three months to find steady income.`,
            },
            {
              q: `Where can I buy materials or supplies for a ${idea.title} business?`,
              a: `${suppliers.map((s) => `${s.name} (${s.type})`).join(", ")} are good starting points. Always compare prices across multiple vendors before committing.`,
            },
          ];

          const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": { "@type": "Answer", "text": faq.a },
            })),
          };

          return (
            <section id="faq" className="mt-6">
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

              <div className={`${card} overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div className={`${iconWrap} bg-slate-100`}>❓</div>
                  <div>
                    <p className={`${eyebrow} text-slate-400`}>Common questions</p>
                    <h2 className="text-[15px] font-bold text-slate-900">Frequently Asked Questions</h2>
                  </div>
                  <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    {faqs.length} answers
                  </span>
                </div>

                <ul className="divide-y divide-slate-100">
                  {faqs.map((faq, i) => (
                    <li key={i}>
                      <details className="group px-6 sm:px-8">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 marker:hidden">
                          <h3 className="pr-2 text-[14.5px] font-semibold leading-snug text-slate-800 group-open:text-green-700">
                            {faq.q}
                          </h3>
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors group-open:border-green-200 group-open:bg-green-50 group-open:text-green-600">
                            <svg className="block h-3 w-3 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <svg className="hidden h-3 w-3 group-open:block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                          </span>
                        </summary>
                        <div className="pb-5">
                          <p className={body}>{faq.a}</p>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })()}

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-3xl sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200">
                UBI
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800">Uganda Business Ideas</p>
                <p className="text-xs text-slate-400">Uganda&apos;s beginner-friendly business guide · Updated 2026</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500">
              <Link href="/"        className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Ideas</Link>
              <Link href="/about"   className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">About</Link>
              <Link href="/contact" className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Contact</Link>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">© 2026 Uganda Business Ideas. Built to help Ugandans start smarter. 🇺🇬</p>
            <p className="text-xs text-slate-300">Free · No sign-up · Beginner-friendly</p>
          </div>
        </footer>

      </div>
    </main>
  );
}
