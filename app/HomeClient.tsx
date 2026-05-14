"use client";

import { useState } from "react";
import Link from "next/link";

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

      {/* remaining sections — added in Task 4 */}
      <div className="px-4 py-8 text-center text-slate-400 text-sm">More sections coming in Task 4…</div>

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