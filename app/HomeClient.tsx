"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";
import GetHelp from "@/components/GetHelp";

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒",
    Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

// Top 3 ideas by income speed for the homepage teaser
const featuredIdeas = [...ideas]
  .sort((a, b) => (b.scoring?.incomeSpeed ?? 0) - (a.scoring?.incomeSpeed ?? 0))
  .slice(0, 3);

const SERVICES = [
  { href: "/ideas", emoji: "💡", name: "Business Ideas", tagline: "Proven ideas with real UGX costs" },
  { href: "/businesses", emoji: "💼", name: "Find Businesses", tagline: "Directory across all districts" },
  { href: "/jobs", emoji: "👷", name: "Jobs", tagline: "Find work or hire near you" },
  { href: "/land", emoji: "🏞️", name: "Land", tagline: "SafeLands verified plots + market radar" },
  { href: "/laundry", emoji: "🧺", name: "Laundry", tagline: "Doorstep pickup & delivery" },
  { href: "/salons", emoji: "✂️", name: "Salons", tagline: "Book your next visit nearby" },
  { href: "/travel", emoji: "✈️", name: "Travel", tagline: "Stays & destinations in Uganda" },
  { href: "/pitch", emoji: "🎵", name: "Music", tagline: "Get your music heard by radios & blogs" },
  { href: "/pharmacy", emoji: "💊", name: "Pharmacy", tagline: "Find medicine & pharmacies near you" },
  { href: "/launch", emoji: "🚀", name: "Launch", tagline: "Launch your business in 30 days" },
];

// Coming-soon services: shown as muted chips under the live grid (25 categories total
// with SERVICES). Named by Patrick 2026-07-03: mechanics, schools, gym, swimming,
// land brokers — rest chosen for Uganda relevance. Some will later link to his own
// apps (Gym = Nguvu Fit, Swimming = SwimPace, Loans & SACCOs = Sacco Smart Manager).
const COMING_SOON = [
  { emoji: "🔧", name: "Mechanics" },
  { emoji: "🏫", name: "Schools" },
  { emoji: "💪", name: "Gym & Fitness" },
  { emoji: "🏊", name: "Swimming" },
  { emoji: "🤝", name: "Land Brokers" },
  { emoji: "🏠", name: "Rentals" },
  { emoji: "🚗", name: "Cars" },
  { emoji: "🌾", name: "Farming" },
  { emoji: "🎉", name: "Events" },
  { emoji: "🧱", name: "Construction" },
  { emoji: "⚖️", name: "Legal Help" },
  { emoji: "💰", name: "Loans & SACCOs" },
  { emoji: "🛵", name: "Boda & Delivery" },
  { emoji: "🩺", name: "Clinics" },
  { emoji: "👗", name: "Fashion & Tailoring" },
  { emoji: "📱", name: "Electronics & Repairs" },
];

const FOOTER_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/ideas", label: "Business Ideas" },
      { href: "/businesses", label: "Businesses" },
      { href: "/jobs", label: "Jobs" },
      { href: "/land", label: "Land" },
      { href: "/laundry", label: "Laundry" },
      { href: "/salons", label: "Salons" },
      { href: "/travel", label: "Travel" },
      { href: "/pitch", label: "Music" },
      { href: "/pharmacy", label: "Pharmacy" },
      { href: "/launch", label: "Launch (Founder OS)" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/jobs/post", label: "Post a Job" },
      { href: "/advertise", label: "Advertise" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2";

export default function HomeClient({
  ideasCount,
  jobsTeaser,
}: {
  ideasCount: number;
  jobsTeaser: React.ReactNode;
}) {
  const [bizSearch, setBizSearch] = useState("");

  const handleBizSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = bizSearch.trim()
      ? `/businesses?q=${encodeURIComponent(bizSearch.trim())}`
      : "/businesses";
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream font-sans text-brand-forest">

      {/* ── Hero ── */}
      <header className="motion-page relative overflow-hidden bg-brand-forest px-4 pb-14 pt-16 text-center sm:pb-20 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-green/60 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-green bg-brand-green/30 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">
            🇺🇬 Uganda&apos;s Everything-Business App
          </p>
          <h1 className="mb-4 text-4xl font-black leading-[1.05] tracking-tight text-brand-cream sm:text-5xl">
            Start something new.<br />
            <span className="text-brand-gold">Grow</span> what you have.
          </h1>
          <p className="mx-auto mb-9 max-w-md text-sm leading-relaxed text-brand-cream/85 sm:text-base">
            Ideas, jobs, land, laundry, salons, travel — one app for starters, business owners, and workers.
          </p>
          <div className="mb-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/start"
              className={`motion-press w-full rounded-xl bg-brand-gold px-7 py-3.5 text-sm font-black text-brand-forest shadow-lg shadow-brand-gold/20 transition-colors hover:bg-brand-gold/90 sm:w-auto ${focusRing} focus-visible:ring-offset-brand-forest`}
            >
              Start a business
            </Link>
            <a
              href="#grow"
              className={`motion-press w-full rounded-xl border border-brand-cream/30 px-7 py-3.5 text-sm font-bold text-brand-cream transition-colors hover:border-brand-gold/70 hover:text-brand-gold sm:w-auto ${focusRing} focus-visible:ring-offset-brand-forest`}
            >
              Grow my business
            </a>
            <Link
              href="/jobs"
              className={`motion-press w-full rounded-xl border border-brand-cream/30 px-7 py-3.5 text-sm font-bold text-brand-cream transition-colors hover:border-brand-gold/70 hover:text-brand-gold sm:w-auto ${focusRing} focus-visible:ring-offset-brand-forest`}
            >
              Find work
            </Link>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-brand-cream/75">
            <span className="text-brand-gold">{ideasCount}+ Ideas</span>
            <span aria-hidden className="text-brand-cream/40">•</span>
            <span>Growing Jobs</span>
            <span aria-hidden className="text-brand-cream/40">•</span>
            <span>All Uganda Districts</span>
          </p>
        </div>
      </header>

      {/* ── Service grid: every vertical, one screen ── */}
      <section className="motion-page-delay mx-auto w-full max-w-2xl px-4 pb-12 pt-10">
        <div className="mb-6">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">Everything on Business Yoo</h2>
          <p className="mt-1 text-xs text-brand-green sm:text-sm">Tap a service — it&apos;s all in one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICES.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className={`motion-card group rounded-2xl border border-brand-beige bg-brand-surface p-4 shadow-sm transition-all hover:border-brand-gold hover:shadow-md ${focusRing}`}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cream text-xl transition-colors group-hover:bg-brand-gold/25">
                {s.emoji}
              </div>
              <p className="mb-0.5 text-sm font-black">{s.name}</p>
              <p className="text-[11px] leading-snug text-brand-green">{s.tagline}</p>
            </Link>
          ))}
        </div>

        <form
          onSubmit={handleBizSearch}
          className="mt-6 flex items-center gap-2 rounded-2xl border border-brand-beige bg-brand-surface p-2.5 shadow-sm focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/40"
        >
          <span aria-hidden className="pl-2 text-base">🔍</span>
          <input
            type="search"
            aria-label="Search businesses"
            value={bizSearch}
            onChange={e => setBizSearch(e.target.value)}
            placeholder="Find a business… e.g. restaurant in Gulu"
            className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-brand-forest outline-none placeholder:text-brand-green/80"
          />
          <button
            type="submit"
            className={`motion-press rounded-xl bg-brand-forest px-5 py-2.5 text-sm font-bold text-brand-cream transition-colors hover:bg-brand-green ${focusRing}`}
          >
            Search
          </button>
        </form>

        {/* Coming-soon categories */}
        <div className="mt-10">
          <div className="mb-1 flex items-baseline gap-2">
            <h3 className="text-sm font-black tracking-tight">Coming soon</h3>
            <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-forest">
              {COMING_SOON.length} more services
            </span>
          </div>
          <p className="mb-3 text-[11px] text-brand-green">Business Yoo is growing — these are on the way.</p>
          <div className="flex flex-wrap gap-2">
            {COMING_SOON.map(c => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-beige bg-brand-surface/70 px-3 py-1.5 text-xs font-semibold text-brand-green"
              >
                <span aria-hidden>{c.emoji}</span>{c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grow: for EXISTING business owners ── */}
      <section id="grow" className="scroll-mt-6 bg-brand-forest px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">For business owners</p>
          <h2 className="mb-1 text-2xl font-black tracking-tight text-brand-cream">Already running a business?</h2>
          <p className="mb-7 text-sm text-brand-cream/85">Business Yoo works for you too — get found, reach customers, grow.</p>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/contact"
              className={`motion-card flex flex-col rounded-2xl border border-brand-green bg-brand-green/40 p-5 transition-colors hover:border-brand-gold ${focusRing} focus-visible:ring-offset-brand-forest`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/60 text-xl">📍</div>
              <p className="mb-1 text-sm font-black text-brand-cream">Get found</p>
              <p className="mb-4 text-xs leading-relaxed text-brand-cream/80">List your business in the directory so customers find you.</p>
              <p className="mt-auto text-xs font-bold text-brand-gold">List my business →</p>
            </Link>

            <div className="flex flex-col rounded-2xl border border-brand-green bg-brand-green/40 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/60 text-xl">🤝</div>
              <p className="mb-1 text-sm font-black text-brand-cream">Reach customers</p>
              <p className="mb-4 text-xs leading-relaxed text-brand-cream/80">Offer your services through our verticals.</p>
              <div className="mt-auto flex gap-4 text-xs font-bold text-brand-gold">
                <Link href="/laundry" className={`hover:underline ${focusRing} focus-visible:ring-offset-brand-forest`}>Laundry →</Link>
                <Link href="/salons" className={`hover:underline ${focusRing} focus-visible:ring-offset-brand-forest`}>Salons →</Link>
              </div>
            </div>

            <Link
              href="/advertise"
              className={`motion-card flex flex-col rounded-2xl border border-brand-green bg-brand-green/40 p-5 transition-colors hover:border-brand-gold ${focusRing} focus-visible:ring-offset-brand-forest`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/60 text-xl">📣</div>
              <p className="mb-1 text-sm font-black text-brand-cream">Advertise</p>
              <p className="mb-4 text-xs leading-relaxed text-brand-cream/80">Put your brand in front of thousands of Ugandans.</p>
              <p className="mt-auto text-xs font-bold text-brand-gold">Advertise with us →</p>
            </Link>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-gold/50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-forest/60 text-xl">📜</div>
            <div>
              <p className="mb-0.5 text-sm font-black text-brand-cream">
                Tenders &amp; contracts
                <span className="ml-2 rounded-full bg-brand-gold px-2 py-0.5 align-middle text-[10px] font-black text-brand-forest">COMING SOON</span>
              </p>
              <p className="text-xs text-brand-cream/80">Public &amp; private tenders matched to your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-8 text-xl font-black tracking-tight sm:text-2xl">How it works</h2>
          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            <div
              aria-hidden
              className="absolute left-1/2 top-5 hidden h-px w-2/3 -translate-x-1/2 bg-brand-beige sm:block"
            />
            {[
              { n: "1", t: "Pick your path", d: "A new idea to start — or grow the business you run." },
              { n: "2", t: "Get the plan", d: "Guides, real costs in UGX, and simple tools." },
              { n: "3", t: "Earn & grow", d: "Customers, jobs, and buyers — all on one app." },
            ].map(step => (
              <div key={step.n} className="relative flex flex-col items-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-lg font-black text-brand-gold ring-4 ring-brand-cream">
                  {step.n}
                </div>
                <h3 className="mb-1 text-sm font-bold">{step.t}</h3>
                <p className="max-w-[24ch] text-xs leading-relaxed text-brand-green">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jobs teaser (server slot) ── */}
      {jobsTeaser}

      {/* ── Featured ideas ── */}
      <section className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">Featured Ideas</h2>
          <Link href="/ideas" className={`text-xs font-bold text-brand-green hover:underline ${focusRing}`}>
            View all {ideasCount}+ →
          </Link>
        </div>

        {featuredIdeas[0] && (
          <Link
            href={`/ideas/${featuredIdeas[0].slug}`}
            className={`motion-card mb-4 block rounded-2xl bg-brand-forest p-6 shadow-lg transition-colors hover:bg-brand-green sm:p-7 ${focusRing}`}
          >
            <span className="mb-3 inline-block rounded-full bg-brand-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-forest">
              ⭐ Editor&apos;s Pick
            </span>
            <h3 className="mb-2 text-lg font-black leading-snug text-brand-cream sm:text-xl">
              {featuredIdeas[0].title}
            </h3>
            <p className="mb-6 line-clamp-2 max-w-prose text-sm leading-relaxed text-brand-cream/85">
              {featuredIdeas[0].desc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-cream/75">{featuredIdeas[0].capital}</span>
              <span className="rounded-lg bg-brand-gold px-4 py-2 text-xs font-bold text-brand-forest">
                Read More
              </span>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-4">
          {featuredIdeas.slice(1, 3).map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className={`motion-card flex flex-col justify-between rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm transition-colors hover:border-brand-gold ${focusRing}`}
            >
              <div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cream text-lg">
                  {categoryEmoji(idea.category)}
                </div>
                <h3 className="mb-2 text-sm font-black leading-snug">{idea.title}</h3>
                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-brand-green">{idea.desc}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="text-xs font-bold">{idea.capital}</span>
                <span className="rounded-full bg-brand-cream px-2 py-1 text-[10px] font-bold text-brand-green">
                  {idea.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Support ── */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-12 pt-2">
        <GetHelp message="Hello Business Yoo, I want help starting or growing a business." />
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-brand-forest px-4 py-14 text-xs text-brand-cream/80">
        <div className="mx-auto max-w-2xl">
          <p className="mb-8 text-center text-lg font-black text-brand-cream">
            🇺🇬 Business <span className="text-brand-gold">Yoo</span>
          </p>
          <div className="mb-10 grid grid-cols-3 gap-6">
            {FOOTER_GROUPS.map(group => (
              <div key={group.title}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold">{group.title}</p>
                <div className="flex flex-col gap-2">
                  {group.links.map(l => (
                    <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-green/60 pt-6">
            <p className="text-center text-brand-cream/65">
              © {new Date().getFullYear()} Business Yoo — Uganda&apos;s platform for business, work &amp; opportunity
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
