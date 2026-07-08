import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "../data/blogPosts";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Uganda Business Blog | Startup Tips and Ideas",
  description:
    "Practical Uganda business articles about startup costs, choosing ideas, suppliers, guides, and beginner-friendly planning.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10">
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
              href="/ideas"
              className="rounded-xl border border-brand-beige bg-brand-surface px-4 py-2 text-[13px] font-semibold text-brand-green shadow-sm hover:bg-brand-beige/40"
            >
              Ideas
            </Link>
            <Link
              href="/start"
              className="rounded-xl bg-brand-gold px-4 py-2 text-[13px] font-bold text-brand-forest shadow-sm hover:bg-brand-beige"
            >
              Get help starting
            </Link>
          </div>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-forest">
            Startup articles
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-brand-forest sm:text-5xl">
            Practical business guidance for Uganda.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-green">
            Read focused guides on choosing a business, estimating startup
            costs, finding suppliers, and taking the next step with confidence.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="flex h-full flex-col rounded-3xl border border-brand-beige bg-brand-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-gold hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-gold px-3 py-1 text-[11px] font-bold text-brand-forest ring-1 ring-brand-gold">
                    {post.category}
                  </span>
                  <span className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1 text-[11px] font-semibold text-brand-green">
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-black leading-snug tracking-tight text-brand-forest group-hover:text-brand-green">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-brand-green">
                  {post.description}
                </p>
                <div className="mt-5 border-t border-brand-beige pt-4 text-[12px] font-semibold text-brand-green/70">
                  Updated {post.updatedAt}
                </div>
              </article>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
