import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-10">
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
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-green-100">
                About the platform
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Helping people find business ideas they can realistically start
              </h1>

              <p className="mt-5 text-base leading-8 text-green-50/90 md:text-lg">
                Uganda Business Ideas is built to help people discover practical
                businesses based on budget, skills, and real-world starting
                conditions. The goal is to make business discovery simpler,
                clearer, and more useful.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">What this website does</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This platform helps users explore business ideas in Uganda,
              compare them by budget and category, and open detailed guides
              showing how to start.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Who it is for</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              It is designed for beginners, students, job seekers, side-hustle
              builders, and anyone looking for practical income opportunities.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Why it matters</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Many people want to start a business but do not know what fits
              their capital, location, or skill level. This platform is meant
              to reduce that confusion.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Long-term vision</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The vision is to grow this into a trusted platform for practical
              business discovery, startup guidance, and opportunity mapping in
              Uganda.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}