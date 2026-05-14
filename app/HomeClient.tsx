"use client";

import { useState } from "react";
import Link from "next/link";
import { ideas } from "./data/ideas";

type Job = {
  id: string;
  title: string;
  skill_category: string;
  district: string;
  town: string | null;
  employer_name: string;
  pay_amount: number | null;
  pay_period: string | null;
  created_at: string;
};

type Worker = {
  id: string;
  name: string;
  skill_primary: string;
  district: string;
  available: boolean;
};

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒",
    Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

function skillEmoji(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes("driv") || s.includes("transport")) return "🚗";
  if (s.includes("farm") || s.includes("agri")) return "🌾";
  if (s.includes("tailor") || s.includes("sew")) return "✂️";
  if (s.includes("tech") || s.includes("digital")) return "💻";
  if (s.includes("cook") || s.includes("food")) return "🍳";
  if (s.includes("build") || s.includes("construct")) return "🏗️";
  return "💼";
}

// Top 3 ideas by demand score for homepage teaser
const featuredIdeas = [...ideas]
  .sort((a, b) => (b.scoring?.incomeSpeed ?? 0) - (a.scoring?.incomeSpeed ?? 0))
  .slice(0, 3);

const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function HomeClient({
  jobs,
  workers,
  ideasCount,
}: {
  jobs: Job[];
  workers: Worker[];
  ideasCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-20 bg-[#1C3A2A] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-black text-[#F5C842] text-base" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 UgandaBiz
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex gap-5 text-sm font-semibold text-white/70">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#F5C842] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/jobs/post"
          className="hidden sm:inline-block rounded-lg bg-[#F5C842] px-4 py-2 text-xs font-bold text-[#1C3A2A] hover:bg-yellow-300 transition-colors"
        >
          Post a Job
        </Link>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-[#F5C842] text-2xl leading-none"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-10 bg-[#1C3A2A] pt-16 px-6 flex flex-col gap-5 sm:hidden">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-bold text-white hover:text-[#F5C842] transition-colors py-2 border-b border-white/10"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jobs/post"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-xl bg-[#F5C842] py-4 text-center text-base font-black text-[#1C3A2A]"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] px-4 py-14 text-center text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5C842] mb-3">
          Uganda's Business Hub
        </p>
        <h1
          className="text-3xl sm:text-4xl font-black leading-tight text-[#F5C842] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Grow Your Business.<br />Find Your Next Job.
        </h1>
        <p className="text-sm text-white/80 mb-8 max-w-xs mx-auto leading-relaxed">
          Hundreds of proven business ideas, job listings, and guides — built for every Ugandan.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          <Link
            href="/ideas"
            className="rounded-xl bg-[#F5C842] px-6 py-3 text-sm font-black text-[#1C3A2A] hover:bg-yellow-300 transition-colors"
          >
            Browse Ideas
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            Find Work
          </Link>
        </div>
        <span className="inline-block rounded-full bg-white/10 border border-white/20 text-white/70 text-[11px] px-4 py-1.5">
          {ideasCount}+ Ideas · {jobs.length > 0 ? `${jobs.length * 10}+` : "Growing"} Jobs · All Uganda Districts
        </span>
      </div>

      {/* ── Pillars ── */}
      <div className="bg-white px-4 py-6 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        <Link
          href="/jobs/post"
          className="rounded-2xl bg-[#f5f0e8] border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
        >
          <div className="text-2xl mb-2">💼</div>
          <p className="font-black text-[#1C3A2A] text-sm mb-1">Post a Job</p>
          <p className="text-xs text-slate-500 leading-relaxed">Hire skilled workers across Uganda quickly.</p>
          <p className="mt-3 text-xs font-bold text-[#1C3A2A]">Post Now →</p>
        </Link>
        <Link
          href="/jobs"
          className="rounded-2xl bg-[#f5f0e8] border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
        >
          <div className="text-2xl mb-2">🔍</div>
          <p className="font-black text-[#1C3A2A] text-sm mb-1">Find Work</p>
          <p className="text-xs text-slate-500 leading-relaxed">Browse jobs and register your skills.</p>
          <p className="mt-3 text-xs font-bold text-[#1C3A2A]">Browse Jobs →</p>
        </Link>
      </div>

      {/* ── Featured Ideas ── */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-black text-[#1C3A2A]" style={{ fontFamily: "Georgia, serif" }}>
            💡 Featured Business Ideas
          </h2>
          <Link href="/ideas" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
            View all {ideasCount}+ →
          </Link>
        </div>

        {/* Featured card */}
        {featuredIdeas[0] && (
          <Link
            href={`/ideas/${featuredIdeas[0].slug}`}
            className="block rounded-2xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] p-5 mb-3 hover:opacity-95 transition-opacity"
          >
            <span className="inline-block rounded-full bg-[#F5C842] text-[#1C3A2A] text-[10px] font-bold px-2 py-0.5 mb-3">
              ⭐ Editor&apos;s Pick
            </span>
            <h3 className="text-base font-black text-[#F5C842] leading-snug mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {featuredIdeas[0].title}
            </h3>
            <p className="text-xs text-white/75 leading-relaxed mb-4 line-clamp-2">
              {featuredIdeas[0].desc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">{featuredIdeas[0].capital}</span>
              <span className="rounded-lg bg-[#F5C842] px-3 py-1.5 text-xs font-bold text-[#1C3A2A]">
                Read More
              </span>
            </div>
          </Link>
        )}

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-3">
          {featuredIdeas.slice(1, 3).map(idea => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="rounded-2xl bg-white border border-[#e0d8cc] p-4 hover:border-[#1C3A2A] transition-colors"
            >
              <div className="text-xl mb-2">{categoryEmoji(idea.category)}</div>
              <p className="font-black text-[#1C3A2A] text-sm leading-snug mb-1">{idea.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{idea.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-bold text-[#1C3A2A]">{idea.capital}</span>
                <span className="text-[10px] rounded-full bg-[#f5f0e8] px-2 py-0.5 text-slate-500 font-semibold">
                  {idea.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Jobs Teaser ── */}
      {jobs.length > 0 && (
        <div className="bg-white px-4 py-6 max-w-2xl mx-auto w-full">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-black text-[#1C3A2A]" style={{ fontFamily: "Georgia, serif" }}>
              💼 Latest Job Listings
            </h2>
            <Link href="/jobs" className="text-xs font-bold text-[#1C3A2A] underline underline-offset-2">
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {jobs.slice(0, 3).map(job => (
              <Link
                key={job.id}
                href="/jobs"
                className="flex items-center gap-3 rounded-xl border border-[#e0d8cc] bg-[#f5f0e8] px-4 py-3 hover:border-[#1C3A2A] transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] flex items-center justify-center text-base">
                  {skillEmoji(job.skill_category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1C3A2A] truncate">{job.title}</p>
                  <p className="text-xs text-slate-500">{[job.town, job.district].filter(Boolean).join(", ")}</p>
                </div>
                {job.pay_amount && (
                  <span className="text-xs font-black text-[#1C3A2A] shrink-0">
                    UGX {job.pay_amount.toLocaleString()}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#1C3A2A] px-4 py-8 text-center text-white/50 text-xs mt-auto">
        <p className="font-black text-[#F5C842] mb-3" style={{ fontFamily: "Georgia, serif" }}>
          🇺🇬 UgandaBiz
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-3 text-white/60 font-semibold">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#F5C842] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="hover:text-[#F5C842] transition-colors">Contact</Link>
          <Link href="/advertise" className="hover:text-[#F5C842] transition-colors">Advertise</Link>
        </div>
        <p>© {new Date().getFullYear()} Uganda Business Hub</p>
      </footer>

    </div>
  );
}