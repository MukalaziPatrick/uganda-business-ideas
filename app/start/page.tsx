import type { Metadata } from "next";
import Link from "next/link";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { SITE_URL } from "@/lib/site";

type StartPageProps = {
  searchParams: Promise<{
    interest?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Get Help Starting a Business in Uganda | Business Yoo",
  description:
    "Share your budget, location, timeline, and business interest to get startup help through UBI.",
  alternates: {
    canonical: `${SITE_URL}/start`,
  },
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const params = await searchParams;
  const interest = params.interest ?? "";

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-brand-ink">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-brand-beige pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-[11px] font-black text-white">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-brand-ink">
              Business Yoo
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex w-fit rounded-xl border border-brand-beige bg-white px-4 py-2 text-[13px] font-semibold text-brand-forest shadow-sm hover:bg-brand-cream"
          >
            Back to ideas
          </Link>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-green">
            Start here
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-brand-ink sm:text-5xl">
            Tell UBI what you want to start.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-forest">
            Share your budget, location, business interest, and timeline. UBI
            will use this to understand what help you need before replying.
          </p>
        </section>

        <LeadCaptureForm defaultBusinessInterest={interest} />
      </section>
    </main>
  );
}
