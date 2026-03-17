import { ideas } from "../../data/ideas";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";


export async function generateMetadata({ params }: any) {
  const idea = ideas.find((i) => i.slug === params.slug);

  if (!idea) return {};

  return {
    title: `${idea.title} in Uganda | Cost, Steps & Profit`,
    description: `${idea.desc} Learn startup capital, steps, risks, and profit potential in Uganda.`,
  };
}

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const idea = ideas.find((item) => item.slug === slug);

  if (!idea) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-800 text-sm font-bold text-white shadow-sm">
                UBI
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Uganda Business Ideas
                </p>
                <p className="text-sm text-slate-500">
                  Practical opportunities. Clear guidance. Real starting points.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit rounded-full bg-green-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900"
            >
              ← Back to home
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-green-950 via-green-900 to-emerald-700 shadow-xl">
          <div className="px-6 py-10 md:px-10 md:py-14">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-green-100">
                  {idea.category}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-green-100">
                  {idea.capital}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                {idea.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-green-50/90 md:text-lg md:leading-8">
                {idea.desc}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Skills Needed</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{idea.skills}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Best For</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{idea.bestFor}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Best Location</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{idea.location}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Risks</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{idea.risks}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">How to Start</h2>
            <ol className="mt-5 space-y-4">
              {idea.steps?.map((step: string, index: number) => (
                <li key={index} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Profit Potential</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{idea.profit}</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Helpful Tips</h2>
              <ul className="mt-4 space-y-3">
                {idea.tips?.map((tip: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-green-700"></span>
                    <p className="text-sm leading-7 text-slate-600">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}