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
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10">
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
              href="/ideas"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Ideas
            </Link>
            <Link
              href="/start"
              className="rounded-xl bg-green-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-green-700"
            >
              Get help starting
            </Link>
          </div>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600">
            Startup articles
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Practical business guidance for Uganda.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Read focused guides on choosing a business, estimating startup
            costs, finding suppliers, and taking the next step with confidence.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-green-200 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-100">
                    {post.category}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-black leading-snug tracking-tight text-slate-900 group-hover:text-green-700">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600">
                  {post.description}
                </p>
                <div className="mt-5 border-t border-slate-100 pt-4 text-[12px] font-semibold text-slate-400">
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
