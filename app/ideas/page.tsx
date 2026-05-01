import type { Metadata } from "next";
import Link from "next/link";
import IdeasDiscoveryClient from "./IdeasDiscoveryClient";
import { ideas } from "../data/ideas";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Business Ideas in Uganda | Uganda Business Ideas",
  description:
    "Search and filter 50 Uganda business ideas by category, budget, audience, demand, startup ease, and supplier potential.",
  alternates: {
    canonical: `${SITE_URL}/ideas`,
  },
};

export default function IdeasPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-[11px] font-black text-white">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-slate-800">
              Uganda Business Ideas
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/start"
              className="rounded-xl bg-green-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-green-700"
            >
              Get help starting
            </Link>
            <Link
              href="/guides"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Guides
            </Link>
            <Link
              href="/advertise"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Advertise
            </Link>
          </div>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600">
            Browse all ideas
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Find a Uganda business idea that fits your budget and situation.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Search all {ideas.length} business ideas, filter by category,
            budget, and audience, then sort by demand, startup ease, or supplier
            potential.
          </p>
        </section>

        <IdeasDiscoveryClient ideas={ideas} />
      </section>
    </main>
  );
}
