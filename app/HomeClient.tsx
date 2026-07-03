"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";
import GetHelp from "@/components/GetHelp";

// Brand: forest #1C3A2A · mid #2D5A40 · gold #F5C842 · cream #f5f0e8 · beige #e0d8cc

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
  { href: "/land", emoji: "🏞️", name: "Land", tagline: "Verified plots + market radar" },
  { href: "/laundry", emoji: "🧺", name: "Laundry", tagline: "Doorstep pickup & delivery" },
  { href: "/salons", emoji: "✂️", name: "Salons", tagline: "Book your next visit nearby" },
  { href: "/travel", emoji: "✈️", name: "Travel", tagline: "Stays & destinations in Uganda" },
  { href: "/pitch", emoji: "🎵", name: "Music", tagline: "Get your music heard by radios & blogs" },
  { href: "/pharmacy", emoji: "💊", name: "Pharmacy", tagline: "Find medicine & pharmacies near you" },
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
    <div className="min-h-screen bg-[#f5f0e8] text-[#1C3A2A] font-sans flex flex-col">

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-[#1C3A2A] px-4 pt-14 pb-16 text-center">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#F5C842]/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#2D5A40]/60 blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C842] mb-4">
            Uganda&apos;s Everything-Business App
          </p>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-[#f5f0e8] mb-4">
            Start something new.<br />
            <span className="text-[#F5C842]">Grow</span> what you have.
          </h1>
          <p className="text-sm sm:text-base text-[#cfe0d5] mb-8 max-w-md mx-auto leading-relaxed">
            Ideas, jobs, land, laundry, salons, travel — one app for starters, business owners, and workers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/start"
              className="rounded-xl bg-[#F5C842] px-6 py-3.5 text-sm font-black text-[#1C3A2A] hover:bg-[#ffd95e] transition-colors w-full sm:w-auto"
            >
              Start a business
            </Link>
            <a
              href="#grow"
              className="rounded-xl border-2 border-[#F5C842]/60 px-6 py-3.5 text-sm font-bold text-[#F5C842] hover:bg-[#2D5A40] transition-colors w-full sm:w-auto"
            >
              Grow my business
            </a>
            <Link
              href="/jobs"
              className="rounded-xl border-2 border-[#2D5A40] px-6 py-3.5 text-sm font-bold text-[#f5f0e8] hover:bg-[#2D5A40] transition-colors w-full sm:w-auto"
            >
              Find work
            </Link>
          </div>
          <span className="inline-block rounded-full border border-[#2D5A40] text-[#F5C842] font-semibold text-[11px] px-4 py-1.5">
            {ideasCount}+ Ideas · Growing Jobs · All Uganda Districts
          </span>
        </div>
      </header>

      {/* ── Service grid: every vertical, one screen ── */}
      <section className="px-4 py-10 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-black tracking-tight mb-1">Everything on Business Yoo</h2>
        <p className="text-xs text-[#5c6f63] mb-5">Tap a service — it&apos;s all in one place.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICES.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl bg-white border border-[#e0d8cc] p-4 hover:border-[#F5C842] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f5f0e8] group-hover:bg-[#F5C842]/25 flex items-center justify-center text-xl mb-3 transition-colors">
                {s.emoji}
              </div>
              <p className="font-black text-sm mb-0.5">{s.name}</p>
              <p className="text-[11px] text-[#5c6f63] leading-snug">{s.tagline}</p>
            </Link>
          ))}
        </div>
        <form
          onSubmit={handleBizSearch}
          className="mt-4 flex gap-2 rounded-2xl bg-white border border-[#e0d8cc] p-3 shadow-sm"
        >
          <input
            type="search"
            value={bizSearch}
            onChange={e => setBizSearch(e.target.value)}
            placeholder="Find a business… e.g. restaurant in Gulu"
            className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm bg-[#f5f0e8] outline-none focus:ring-2 focus:ring-[#F5C842]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#1C3A2A] px-5 py-2.5 text-sm font-bold text-[#F5C842] hover:bg-[#2D5A40] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Coming-soon categories */}
        <div className="mt-8">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-sm font-black tracking-tight">Coming soon</h3>
            <span className="rounded-full bg-[#F5C842] text-[#1C3A2A] text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
              {COMING_SOON.length} more services
            </span>
          </div>
          <p className="text-[11px] text-[#5c6f63] mb-3">Business Yoo is growing — these are on the way.</p>
          <div className="flex flex-wrap gap-2">
            {COMING_SOON.map(c => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/60 border border-dashed border-[#e0d8cc] px-3 py-1.5 text-xs font-semibold text-[#5c6f63]"
              >
                <span>{c.emoji}</span>{c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grow: for EXISTING business owners ── */}
      <section id="grow" className="bg-[#1C3A2A] px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C842] mb-2">For business owners</p>
          <h2 className="text-2xl font-black text-[#f5f0e8] tracking-tight mb-1">Already running a business?</h2>
          <p className="text-sm text-[#cfe0d5] mb-6">Business Yoo works for you too — get found, reach customers, grow.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Link
              href="/contact"
              className="rounded-2xl bg-[#2D5A40]/40 border border-[#2D5A40] p-5 hover:border-[#F5C842] transition-colors"
            >
              <div className="text-2xl mb-2">📍</div>
              <p className="font-black text-[#f5f0e8] text-sm mb-1">Get found</p>
              <p className="text-xs text-[#cfe0d5] leading-relaxed mb-3">List your business in the directory so customers find you.</p>
              <p className="text-xs font-bold text-[#F5C842]">List my business →</p>
            </Link>

            <div className="rounded-2xl bg-[#2D5A40]/40 border border-[#2D5A40] p-5">
              <div className="text-2xl mb-2">🤝</div>
              <p className="font-black text-[#f5f0e8] text-sm mb-1">Reach customers</p>
              <p className="text-xs text-[#cfe0d5] leading-relaxed mb-3">Offer your services through our verticals.</p>
              <div className="flex gap-3 text-xs font-bold text-[#F5C842]">
                <Link href="/laundry" className="hover:underline">Laundry →</Link>
                <Link href="/salons" className="hover:underline">Salons →</Link>
              </div>
            </div>

            <Link
              href="/advertise"
              className="rounded-2xl bg-[#2D5A40]/40 border border-[#2D5A40] p-5 hover:border-[#F5C842] transition-colors"
            >
              <div className="text-2xl mb-2">📣</div>
              <p className="font-black text-[#f5f0e8] text-sm mb-1">Advertise</p>
              <p className="text-xs text-[#cfe0d5] leading-relaxed mb-3">Put your brand in front of thousands of Ugandans.</p>
              <p className="text-xs font-bold text-[#F5C842]">Advertise with us →</p>
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#F5C842]/50 p-5 flex items-center gap-4">
            <div className="text-2xl">📜</div>
            <div>
              <p className="font-black text-[#f5f0e8] text-sm mb-0.5">
                Tenders &amp; contracts
                <span className="ml-2 align-middle rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5">COMING SOON</span>
              </p>
              <p className="text-xs text-[#cfe0d5]">Public &amp; private tenders matched to your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl font-black mb-6 tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Pick your path", d: "A new idea to start — or grow the business you run." },
              { n: "2", t: "Get the plan", d: "Guides, real costs in UGX, and simple tools." },
              { n: "3", t: "Earn & grow", d: "Customers, jobs, and buyers — all on one app." },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#2D5A40] text-[#F5C842] font-black flex items-center justify-center text-lg mb-3">
                  {step.n}
                </div>
                <h3 className="font-bold text-sm mb-1">{step.t}</h3>
                <p className="text-xs text-[#5c6f63]">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jobs teaser (server slot) ── */}
      {jobsTeaser}

      {/* ── Featured ideas ── */}
      <section className="px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-black tracking-tight">Featured Ideas</h2>
          <Link href="/ideas" className="text-xs font-bold text-[#2D5A40] hover:underline">
            View all {ideasCount}+ →
          </Link>
        </div>

        {featuredIdeas[0] && (
          <Link
            href={`/ideas/${featuredIdeas[0].slug}`}
            className="block rounded-2xl bg-[#1C3A2A] p-6 mb-4 shadow-lg hover:bg-[#22452F] transition-colors"
          >
            <span className="inline-block rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 mb-3">
              ⭐ Editor&apos;s Pick
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#f5f0e8] leading-snug mb-2">
              {featuredIdeas[0].title}
            </h3>
            <p className="text-sm text-[#cfe0d5] leading-relaxed mb-5 line-clamp-2">
              {featuredIdeas[0].desc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9db8a8]">{featuredIdeas[0].capital}</span>
              <span className="rounded-lg bg-[#F5C842] px-4 py-2 text-xs font-bold text-[#1C3A2A]">
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
              className="rounded-2xl bg-white border border-[#e0d8cc] p-5 hover:border-[#F5C842] transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-3">{categoryEmoji(idea.category)}</div>
                <h3 className="font-black text-sm leading-snug mb-2">{idea.title}</h3>
                <p className="text-xs text-[#5c6f63] line-clamp-2 mb-4">{idea.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold">{idea.capital}</span>
                <span className="text-[10px] rounded-full bg-[#f5f0e8] px-2 py-1 text-[#2D5A40] font-bold">
                  {idea.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Support ── */}
      <section className="px-4 py-8 max-w-2xl mx-auto w-full">
        <GetHelp message="Hello Business Yoo, I want help starting or growing a business." />
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1C3A2A] px-4 py-12 text-[#cfe0d5] text-xs mt-auto">
        <div className="max-w-2xl mx-auto">
          <p className="font-black text-[#f5f0e8] text-base mb-6 text-center">
            🇺🇬 Business <span className="text-[#F5C842]">Yoo</span>
          </p>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {FOOTER_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#F5C842] mb-3">{group.title}</p>
                <div className="flex flex-col gap-2">
                  {group.links.map(l => (
                    <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[#9db8a8]">© {new Date().getFullYear()} Business Yoo — Uganda&apos;s platform for business, work &amp; opportunity</p>
        </div>
      </footer>

    </div>
  );
}
