import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import IdeasDiscoveryClient from "./IdeasDiscoveryClient";
import { getPublishedIdeas } from "@/lib/ideas/queries";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Business Ideas in Uganda | Business Yoo",
  description:
    "Search and filter Uganda business ideas by category, budget, audience, demand, startup ease, and supplier potential.",
  alternates: {
    canonical: `${SITE_URL}/ideas`,
  },
};

export default async function IdeasPage() {
  const ideas = await getPublishedIdeas();

  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-brand-beige pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest text-[11px] font-black text-brand-gold">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-brand-forest">
              Business Yoo
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/start"
              className="motion-press rounded-xl bg-brand-forest px-4 py-2 text-[13px] font-bold text-brand-cream shadow-sm transition-colors hover:bg-brand-green"
            >
              Get help starting
            </Link>
            <Link
              href="/guides"
              className="rounded-xl border border-brand-beige bg-white px-4 py-2 text-[13px] font-semibold text-brand-green shadow-sm hover:bg-brand-cream/60"
            >
              Guides
            </Link>
            <Link
              href="/advertise"
              className="rounded-xl border border-brand-beige bg-white px-4 py-2 text-[13px] font-semibold text-brand-green shadow-sm hover:bg-brand-cream/60"
            >
              Advertise
            </Link>
          </div>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-green">
            Browse all ideas
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-brand-forest sm:text-5xl">
            Find a Uganda business idea that fits your budget and situation.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-green">
            Search all {ideas.length} business ideas, filter by category,
            budget, and audience, then sort by demand, startup ease, or supplier
            potential.
          </p>
        </section>

        <Suspense fallback={<div className="py-10 text-center text-brand-green">Loading ideas…</div>}>
          <IdeasDiscoveryClient ideas={ideas} />
        </Suspense>
      </section>
    </main>
  );
}
