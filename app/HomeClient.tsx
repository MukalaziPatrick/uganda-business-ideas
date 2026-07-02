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

// Top 3 ideas by demand score for homepage teaser
const featuredIdeas = [...ideas]
  .sort((a, b) => (b.scoring?.incomeSpeed ?? 0) - (a.scoring?.incomeSpeed ?? 0))
  .slice(0, 3);

const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/businesses", label: "Businesses" },
  { href: "/jobs", label: "Jobs" },
  { href: "/pitch", label: "SoundPitch" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function HomeClient({
  ideasCount,
  jobsTeaser,
}: {
  ideasCount: number;
  jobsTeaser: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bizSearch, setBizSearch] = useState("");

  const handleBizSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bizSearch.trim()) {
      window.location.href = `/businesses?q=${encodeURIComponent(bizSearch.trim())}`;
    } else {
      window.location.href = "/businesses";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-20 bg-slate-900 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="font-black text-white text-base flex items-center gap-2">
          🇺🇬 Business Yoo
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex gap-5 text-sm font-semibold text-slate-300">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-green-400 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/jobs/post"
          className="hidden sm:inline-block rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
        >
          Post a Job
        </Link>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-white text-2xl leading-none"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-10 bg-slate-900 pt-16 px-6 flex flex-col gap-5 sm:hidden">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-bold text-white hover:text-green-400 transition-colors py-2 border-b border-slate-800"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jobs/post"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-xl bg-green-500 py-4 text-center text-base font-black text-slate-900"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="bg-slate-900 px-4 py-16 text-center text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-green-400 mb-3">
          Uganda's Business Hub
        </p>
        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 tracking-tight">
          Grow Your Business.<br />Find Your Next <span className="text-amber-400">Job.</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-sm mx-auto leading-relaxed">
          Hundreds of proven business ideas, job listings, and guides — built for every Ugandan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/start"
            className="rounded-xl bg-green-500 px-6 py-3.5 text-sm font-black text-slate-900 hover:bg-green-400 transition-colors w-full sm:w-auto"
          >
            Get a personalised start
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border-2 border-slate-700 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            Find Work
          </Link>
        </div>
        <span className="inline-block rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-semibold text-[11px] px-4 py-1.5">
          {ideasCount}+ Ideas · Growing Jobs · All Uganda Districts
        </span>
      </div>

      {/* ── How It Works / Trust ── */}
      <div className="bg-white px-4 py-10 border-b border-slate-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-black flex items-center justify-center text-lg mb-3">1</div>
               <h3 className="font-bold text-slate-900 text-sm mb-1">Pick an Idea</h3>
               <p className="text-xs text-slate-500">Explore businesses matching your budget.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-black flex items-center justify-center text-lg mb-3">2</div>
               <h3 className="font-bold text-slate-900 text-sm mb-1">Get a Plan</h3>
               <p className="text-xs text-slate-500">Read guides & calculate exact costs.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-black flex items-center justify-center text-lg mb-3">3</div>
               <h3 className="font-bold text-slate-900 text-sm mb-1">Launch & Earn</h3>
               <p className="text-xs text-slate-500">Find buyers and grow your business.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pillars ── */}
      <div className="bg-slate-50 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/ideas"
            className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-green-500 transition-colors shadow-sm"
          >
            <div className="text-2xl mb-2">💡</div>
            <p className="font-black text-slate-900 text-sm mb-1">Business Ideas</p>
            <p className="mt-3 text-xs font-bold text-green-600">Browse →</p>
          </Link>
          
          <Link
            href="/jobs"
            className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-green-500 transition-colors shadow-sm"
          >
            <div className="text-2xl mb-2">💼</div>
            <p className="font-black text-slate-900 text-sm mb-1">Find Jobs</p>
            <p className="mt-3 text-xs font-bold text-green-600">Browse Jobs →</p>
          </Link>

          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-slate-200 p-5 hover:border-green-500 transition-colors shadow-sm">
            <div className="text-2xl mb-2">📍</div>
            <p className="font-black text-slate-900 text-sm mb-1">Find Businesses</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">Restaurants, salons & more.</p>
            <form onSubmit={handleBizSearch} className="flex gap-2">
              <input
                type="search"
                value={bizSearch}
                onChange={e => setBizSearch(e.target.value)}
                placeholder="e.g. restaurant"
                className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                Go
              </button>
            </form>
            <Link href="/businesses" className="mt-3 block text-xs font-bold text-green-600">Browse all →</Link>
          </div>
          
          <Link
            href="/travel"
            className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 hover:opacity-95 transition-opacity shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">🏨</div>
              <p className="font-black text-amber-400 text-sm mb-1">ZuulaUganda</p>
              <p className="text-xs text-slate-300 leading-relaxed">Book local stays.</p>
            </div>
            <p className="mt-3 text-xs font-bold text-white">Find stays →</p>
          </Link>
        </div>
      </div>

      {/* ── Jobs Teaser ── */}
      {jobsTeaser}

      {/* ── Featured Ideas ── */}
      <div className="px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Featured Ideas
          </h2>
          <Link href="/ideas" className="text-xs font-bold text-green-600 hover:underline">
            View all {ideasCount}+ →
          </Link>
        </div>

        {/* Featured card */}
        {featuredIdeas[0] && (
          <Link
            href={`/ideas/${featuredIdeas[0].slug}`}
            className="block rounded-2xl bg-slate-900 p-6 mb-4 shadow-lg hover:bg-slate-800 transition-colors"
          >
            <span className="inline-block rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 mb-3">
              ⭐ Editor's Pick
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
              {featuredIdeas[0].title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-5 line-clamp-2">
              {featuredIdeas[0].desc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{featuredIdeas[0].capital}</span>
              <span className="rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-slate-900">
                Read More
              </span>
            </div>
          </Link>
        )}

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-4">
          {featuredIdeas.slice(1, 3).map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-green-500 transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-3">{categoryEmoji(idea.category)}</div>
                <h3 className="font-black text-slate-900 text-sm leading-snug mb-2">{idea.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{idea.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-slate-900">{idea.capital}</span>
                <span className="text-[10px] rounded-full bg-slate-100 px-2 py-1 text-slate-600 font-bold">
                  {idea.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* ── Support ── */}
      <div className="px-4 py-8 max-w-2xl mx-auto w-full">
         <GetHelp message="Hello Business Yoo, I want help starting a business." />
      </div>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 px-4 py-12 text-center text-slate-400 text-xs mt-auto">
        <p className="font-black text-white text-base mb-4">
          🇺🇬 Business Yoo
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6 font-semibold max-w-lg mx-auto">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-green-400 transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="hover:text-green-400 transition-colors">Contact</Link>
          <Link href="/advertise" className="hover:text-green-400 transition-colors">Advertise</Link>
        </div>
        <p>© {new Date().getFullYear()} Uganda Business Hub</p>
      </footer>

    </div>
  );
}