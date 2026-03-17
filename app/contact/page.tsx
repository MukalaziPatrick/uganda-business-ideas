import Link from "next/link";

export default function ContactPage() {
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
                Contact
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Get in touch
              </h1>

              <p className="mt-5 text-base leading-8 text-green-50/90 md:text-lg">
                Want to share feedback, suggest a business idea, or collaborate
                on improving this platform? Reach out through the channels below.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Email</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Add your real email here later.
            </p>
            <p className="mt-2 text-sm font-medium text-green-700">
              yourname@example.com
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Phone / WhatsApp</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Add your real contact number here later.
            </p>
            <p className="mt-2 text-sm font-medium text-green-700">
              +256 XXX XXX XXX
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Collaboration</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This platform is growing step by step. Future collaborations may
              include local market research, startup support, practical business
              content, and tools that help people make better business decisions.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}