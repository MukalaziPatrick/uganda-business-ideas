import { ideas } from "../../data/ideas";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idea = ideas.find((i) => i.slug === slug);

  if (!idea) {
    return {
      title: "Business Idea Not Found | Uganda Business Ideas",
      description: "The requested business idea could not be found.",
    };
  }

  return {
    title: `${idea.title} in Uganda | Cost, Steps & Profit`,
    description: `${idea.desc} Learn startup capital, steps, risks, and profit potential in Uganda.`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Normalize any field that might be a string or string[]
const toArray = (v: string | string[]): string[] =>
  Array.isArray(v) ? v : [v];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idea = ideas.find((item) => item.slug === slug);
  if (!idea) notFound();

  // Category color map — matches homepage tokens
  const categoryConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Agriculture: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "🌱" },
    Food:        { color: "text-amber-700",   bg: "bg-amber-50   border-amber-200",   icon: "🍽️" },
    Services:    { color: "text-sky-700",     bg: "bg-sky-50     border-sky-200",     icon: "💼" },
    Retail:      { color: "text-violet-700",  bg: "bg-violet-50  border-violet-200",  icon: "🛒" },
  };
  const cfg = categoryConfig[idea.category] ?? {
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    icon: "💡",
  };

  // ── Shared token classes (mirrors homepage design system) ────────────────
  const sectionCard   = "rounded-2xl border border-slate-200 bg-white shadow-sm";
  const sectionHeader = "flex items-center gap-2.5 border-b border-slate-100 pb-4";
  const eyebrow       = "text-[11px] font-semibold uppercase tracking-[0.12em]";
  const bodyText      = "text-sm leading-relaxed text-slate-600";
  const iconBox       = "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">

      {/* ── NAV ── matches homepage exactly ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-[10px] font-black text-white shadow-md shadow-green-200">
              UBI
            </div>
            <span className="hidden text-[15px] font-semibold tracking-tight text-slate-800 sm:block">
              Uganda Business Ideas
            </span>
            {/* Trust pill — matches homepage nav exactly */}
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

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 md:px-10 md:pb-24 md:pt-10">

        {/* ── HERO PANEL ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-700 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-green-400/10 blur-2xl" />

          <div className="relative px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16">
            {/* Category + capital + beginner badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-green-200">
                {cfg.icon} {idea.category}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-green-200">
                {idea.capital}
              </span>
              {/* Beginner-friendly trust badge — set in every guide */}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-semibold text-emerald-300">
                ✓ Beginner-friendly guide
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
              {idea.title}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-green-100/75 sm:text-[17px]">
              {idea.desc}
            </p>

            {/* Quick-glance stat row */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Capital needed", value: idea.capital },
                { label: "Category",       value: idea.category },
                { label: "Best for",       value: idea.bestFor?.split(" ").slice(0, 6).join(" ") + "…" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">{stat.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAGE SECTIONS ────────────────────────────────────────────────
            Reading order is intentional for a beginner:
            1. Who is this for & what skills do you need?   (context)
            2. Costs Breakdown                             (can I afford it?)
            3. Startup Steps                               (how do I begin?)
            4. Best Locations in Uganda                    (where?)
            5. Risks                                       (what could go wrong?)
            6. Profit Potential                            (what's the reward?)
            7. Helpful Tips                                (insider advice)
        ─────────────────────────────────────────────────────────────────── */}

        {/* ── 1. CONTEXT ROW: Best For + Skills ───────────────────────────── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          {/* Best For */}
          <div className={`${sectionCard} p-6`}>
            <div className={`${sectionHeader} mb-4`}>
              <div className={`${iconBox} bg-sky-50 text-sky-600`}>🎯</div>
              <div>
                <p className={`${eyebrow} text-sky-600`}>Who is this for</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Best For</h2>
              </div>
            </div>
            <p className={bodyText}>{idea.bestFor}</p>
          </div>

          {/* Skills Needed */}
          <div className={`${sectionCard} p-6`}>
            <div className={`${sectionHeader} mb-4`}>
              <div className={`${iconBox} bg-violet-50 text-violet-600`}>🛠️</div>
              <div>
                <p className={`${eyebrow} text-violet-600`}>What you need to know</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Skills Needed</h2>
              </div>
            </div>
            <ul className="space-y-2.5">
              {toArray(idea.skills).map((skill, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[5px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </span>
                  <span className={bodyText}>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 2. COSTS BREAKDOWN ──────────────────────────────────────────── */}
        {/*
          idea.capital gives the total range.
          We break it into three intuitive tiers so a beginner can plan:
          minimum, comfortable, and growth. All text is explanatory, not
          fabricated numbers — the real figure is shown in the banner below.
        */}
        <section className="mt-6">
          <div className={`${sectionCard} overflow-hidden`}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className={`${iconBox} bg-emerald-50 text-emerald-600`}>💰</div>
              <div>
                <p className={`${eyebrow} text-emerald-600`}>What it will cost you</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Costs Breakdown</h2>
              </div>
            </div>

            {/* Three cost tiers */}
            <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  tier:  "Minimum Start",
                  icon:  "🟢",
                  desc:  "The bare minimum to test this business before committing more money.",
                  note:  "Good for first-timers with limited savings.",
                  color: "text-emerald-700",
                  bg:    "bg-emerald-50/60",
                },
                {
                  tier:  "Comfortable Budget",
                  icon:  "🟡",
                  desc:  "A realistic budget that gives you proper tools, stock, and a small buffer.",
                  note:  "Recommended for most beginners.",
                  color: "text-amber-700",
                  bg:    "bg-amber-50/60",
                },
                {
                  tier:  "Growth Setup",
                  icon:  "🔵",
                  desc:  "Invest more upfront to start at a larger scale with better equipment.",
                  note:  "Best if you already have savings or support.",
                  color: "text-sky-700",
                  bg:    "bg-sky-50/60",
                },
              ].map((item) => (
                <div key={item.tier} className={`flex flex-col gap-3 px-6 py-5 sm:px-7 ${item.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <p className={`text-[13px] font-bold ${item.color}`}>{item.tier}</p>
                  </div>
                  <p className={bodyText}>{item.desc}</p>
                  <p className="text-xs leading-relaxed text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>

            {/* Capital range banner */}
            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
              <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Estimated capital range:</span>{" "}
                {idea.capital} — exact costs depend on your location and setup choices.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. STARTUP STEPS ────────────────────────────────────────────── */}
        <section className="mt-6">
          <div className={`${sectionCard} p-6 sm:p-8`}>
            <div className={`${sectionHeader} mb-6`}>
              <div className={`${iconBox} bg-green-50 text-green-600`}>🚀</div>
              <div>
                <p className={`${eyebrow} text-green-600`}>How to begin</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Startup Steps</h2>
              </div>
            </div>

            {/* Vertical step list with connecting line */}
            <ol className="relative space-y-0">
              {toArray(idea.steps).map((step, i, arr) => (
                <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Connecting line */}
                  {i < arr.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-100" />
                  )}
                  {/* Step number bubble */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow-sm shadow-green-200">
                    {i + 1}
                  </div>
                  {/* Step content */}
                  <div className="flex-1 pt-1">
                    <p className={`${eyebrow} text-slate-400`}>Step {i + 1}</p>
                    <p className={`mt-1 ${bodyText}`}>{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 4. BEST LOCATIONS IN UGANDA ─────────────────────────────────── */}
        <section className="mt-6">
          <div className={`${sectionCard} p-6`}>
            <div className={`${sectionHeader} mb-4`}>
              <div className={`${iconBox} bg-amber-50 text-amber-600`}>📍</div>
              <div>
                <p className={`${eyebrow} text-amber-600`}>Where to set up</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Best Locations in Uganda</h2>
              </div>
            </div>
            <p className={bodyText}>{idea.location}</p>

            {/* Location tip callout */}
            <div className="mt-5 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3.5">
              <span className="mt-0.5 text-base">💡</span>
              <p className="text-sm leading-relaxed text-amber-800">
                <span className="font-semibold">Location tip:</span> Always visit your chosen area before committing.
                Observe foot traffic at different times of day, and talk to people already doing business nearby.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. RISKS ────────────────────────────────────────────────────── */}
        <section className="mt-6">
          <div className={`${sectionCard} p-6`}>
            <div className={`${sectionHeader} mb-4`}>
              <div className={`${iconBox} bg-red-50 text-red-500`}>⚠️</div>
              <div>
                <p className={`${eyebrow} text-red-500`}>What could go wrong</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Risks to Know</h2>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-500">
              Every business has risks. Knowing them in advance helps you prepare and avoid common mistakes.
            </p>
            <ul className="space-y-3">
              {toArray(idea.risks).map((risk, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-red-50 bg-red-50/50 px-4 py-3">
                  <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 6. PROFIT POTENTIAL ─────────────────────────────────────────── */}
        <section className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-emerald-100 px-6 py-5 sm:px-8">
              <div className={`${iconBox} bg-emerald-100 text-emerald-700`}>📈</div>
              <div>
                <p className={`${eyebrow} text-emerald-700`}>What you can earn</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Profit Potential</h2>
              </div>
            </div>
            <div className="px-6 py-5 sm:px-8">
              <p className="text-sm leading-relaxed text-slate-700">{idea.profit}</p>
              <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3.5">
                <span className="mt-0.5 text-base">📌</span>
                <p className="text-sm leading-relaxed text-emerald-800">
                  <span className="font-semibold">Keep in mind:</span> Profit figures are estimates.
                  Your actual earnings will depend on location, effort, and how well you manage costs.
                  Most businesses take 1–3 months to find their footing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. HELPFUL TIPS ─────────────────────────────────────────────── */}
        <section className="mt-6">
          <div className={`${sectionCard} p-6`}>
            <div className={`${sectionHeader} mb-4`}>
              <div className={`${iconBox} bg-amber-50 text-amber-600`}>💡</div>
              <div>
                <p className={`${eyebrow} text-amber-600`}>Insider advice</p>
                <h2 className="text-[15px] font-semibold leading-snug text-slate-900">Helpful Tips</h2>
              </div>
            </div>
            <ul className="space-y-3">
              {toArray(idea.tips).map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[5px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  <p className={bodyText}>{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 8. FAQ ──────────────────────────────────────────────────────────
            SEO notes:
            - Questions are derived from the idea's own data so every page
              has unique, relevant FAQs (not generic copy).
            - JSON-LD FAQPage schema is injected in a <script> tag so Google
              can show FAQ rich results directly in search.
            - Native <details>/<summary> accordion: no JS needed, fully
              accessible, and Google indexes the open content for ranking.
        ─────────────────────────────────────────────────────────────────── */}
        {(() => {
          // Build 5 questions dynamically from the idea's own data.
          // Each answer draws from a real field so the content is always
          // accurate and unique per idea.
          const faqs = [
            {
              q: `How much does it cost to start a ${idea.title} in Uganda?`,
              a: `The estimated startup capital for ${idea.title} in Uganda is ${idea.capital}. The exact amount depends on your location, the scale you choose, and your setup. Starting small and growing is a common approach for beginners.`,
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
              a: toArray(idea.risks).join(" ") + " Being aware of these risks in advance allows you to plan and reduce their impact on your business.",
            },
            {
              q: `How profitable is a ${idea.title} business in Uganda?`,
              a: `${idea.profit} Actual earnings vary depending on location, effort, and how well you manage costs. Most new businesses take one to three months to find their footing.`,
            },
          ];

          // JSON-LD FAQPage schema — read by Google to show rich FAQ results
          const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a,
              },
            })),
          };

          return (
            <section className="mt-6">
              {/* JSON-LD injected into <head> equivalent — Next.js renders
                  script tags in the body safely; Google reads them either way */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
              />

              <div className={`${sectionCard} overflow-hidden`}>
                {/* Section header */}
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div className={`${iconBox} bg-slate-100 text-slate-600`}>❓</div>
                  <div>
                    <p className={`${eyebrow} text-slate-500`}>Common questions</p>
                    <h2 className="text-[15px] font-semibold leading-snug text-slate-900">
                      Frequently Asked Questions
                    </h2>
                  </div>
                </div>

                {/* FAQ accordion items */}
                <ul className="divide-y divide-slate-100">
                  {faqs.map((faq, i) => (
                    <li key={i}>
                      {/*
                        <details> is a native HTML accordion — no JS, fully
                        accessible, and screen-reader friendly. The browser
                        handles open/close state. Google indexes the answer
                        text regardless of whether the item is open or closed.
                      */}
                      <details className="group px-6 py-0 sm:px-8">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 marker:hidden">
                          {/*
                            <h3> wrapping the question text is important for
                            SEO — it creates a proper heading hierarchy on the
                            page so Google understands this is a question.
                          */}
                          <h3 className="pr-2 text-[15px] font-semibold leading-snug text-slate-900 group-open:text-green-700">
                            {faq.q}
                          </h3>
                          {/* Plus / minus toggle icon */}
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors group-open:border-green-200 group-open:bg-green-50 group-open:text-green-600">
                            {/* Plus shown when closed, minus when open */}
                            <svg
                              className="block h-3 w-3 group-open:hidden"
                              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <svg
                              className="hidden h-3 w-3 group-open:block"
                              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                          </span>
                        </summary>

                        {/* Answer — visible when open */}
                        <div className="pb-5">
                          <p className={bodyText}>{faq.a}</p>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })()}

        {/* ── BOTTOM CTA ──────────────────────────────────────────────────── */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-700 p-6 shadow-2xl sm:p-8">
          <div className="relative">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className={`${eyebrow} text-emerald-400`}>Ready to explore more?</p>
                <h2 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                  Browse all business ideas
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-green-100/65">
                  Filter by budget and category to find the right fit for you.
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-800 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                Browse all ideas →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── matches homepage ───────────────────────────────────── */}
        <footer className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-3xl sm:px-8 sm:py-8">
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
              <Link href="/"        className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Ideas</Link>
              <Link href="/about"   className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">About</Link>
              <Link href="/contact" className="flex min-h-[44px] items-center transition-colors hover:text-slate-900 sm:min-h-0">Contact</Link>
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