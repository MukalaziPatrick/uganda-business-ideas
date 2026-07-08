import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <section className="mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-10">
        <header className="mb-6 rounded-2xl border border-brand-beige bg-brand-surface px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-sm font-bold text-brand-gold shadow-sm">
                UBI
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-forest">
                  Business Yoo
                </p>
                <p className="text-sm text-brand-green">
                  Practical opportunities. Clear guidance. Real starting points.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-brand-cream transition hover:bg-brand-green"
            >
              ← Back to home
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-forest via-brand-green to-brand-forest shadow-xl">
          <div className="px-6 py-10 md:px-10 md:py-14">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-brand-cream/90">
                About the platform
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-cream md:text-5xl">
                Helping people find business ideas they can realistically start
              </h1>

              <p className="mt-5 text-base leading-8 text-brand-cream/90 md:text-lg">
                Business Yoo is built to help people discover practical
                businesses based on budget, skills, and real-world starting
                conditions. The goal is to make business discovery simpler,
                clearer, and more useful.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-forest">What this website does</h2>
            <p className="mt-4 text-sm leading-7 text-brand-green">
              This platform helps users explore business ideas in Uganda,
              compare them by budget and category, and open detailed guides
              showing how to start.
            </p>
          </div>

          <div className="rounded-[28px] border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-forest">Who it is for</h2>
            <p className="mt-4 text-sm leading-7 text-brand-green">
              It is designed for beginners, students, job seekers, side-hustle
              builders, and anyone looking for practical income opportunities.
            </p>
          </div>

          <div className="rounded-[28px] border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-forest">Why it matters</h2>
            <p className="mt-4 text-sm leading-7 text-brand-green">
              Many people want to start a business but do not know what fits
              their capital, location, or skill level. This platform is meant
              to reduce that confusion.
            </p>
          </div>

          <div className="rounded-[28px] border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-forest">Long-term vision</h2>
            <p className="mt-4 text-sm leading-7 text-brand-green">
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