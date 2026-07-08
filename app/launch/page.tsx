import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import ComingSoonModules from "./ComingSoonModules";

export const metadata: Metadata = {
  title: "Founder OS — Launch Your Business in 30 Days | Business Yoo",
  description:
    "Founder OS helps first-time Ugandan founders go from idea to launch to first customers in 30 days — with a real launch plan and real human support.",
  alternates: {
    canonical: `${SITE_URL}/launch`,
  },
};

const STEPS = [
  {
    number: "01",
    title: "Tell us your idea",
    text: "Answer a few sharp questions about your idea, your audience, and where you are today. Takes under 5 minutes.",
  },
  {
    number: "02",
    title: "Get your launch plan",
    text: "A 30-day launch checklist, a one-sentence offer, content starters, and a lead magnet idea — built for your exact business.",
  },
  {
    number: "03",
    title: "Launch with support",
    text: "A real operator walks with you: weekly check-ins, content review, and guidance on registration and payments when you need it.",
  },
];

const OFFERS = [
  {
    name: "Founder Readiness Assessment",
    price: "Free",
    text: "Your readiness snapshot plus a personalised 30-day launch plan. No payment, no obligation.",
    highlight: false,
  },
  {
    name: "Assisted Launch",
    price: "Paid package",
    text: "We work the plan with you: offer positioning, landing setup, content engine, and weekly operator check-ins until you launch.",
    highlight: true,
  },
  {
    name: "Growth Support",
    price: "Monthly",
    text: "After launch: ongoing content, lead follow-up systems, and next-module guidance as your business grows.",
    highlight: false,
  },
];

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-brand-surface text-brand-forest">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex items-center justify-between border-b border-brand-forest/10 pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest text-[11px] font-black text-brand-gold">
              FO
            </div>
            <div>
              <span className="block text-[15px] font-bold leading-tight">Founder OS</span>
              <span className="block text-[11px] font-medium text-brand-forest">
                by Business Yoo
              </span>
            </div>
          </Link>
          <Link
            href="/launch/start"
            className="rounded-xl bg-brand-forest px-5 py-2.5 text-[13px] font-bold text-brand-gold shadow-sm transition hover:opacity-90"
          >
            Start your launch
          </Link>
        </header>

        <section className="py-16 sm:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-forest">
            For first-time founders in Uganda
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Launch your business in 30 days.{" "}
            <span className="text-brand-forest">Get your first customers.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-brand-forest/75">
            You have the idea. Founder OS gives you the plan, the tools, and a real human
            walking with you — from a clear offer to your first paying customer.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/launch/start"
              className="rounded-xl bg-brand-gold px-7 py-3.5 text-[15px] font-black text-brand-forest shadow-md transition hover:brightness-95"
            >
              Get your free launch plan →
            </Link>
            <span className="text-[13px] font-medium text-brand-forest/55">
              Free assessment · under 5 minutes
            </span>
          </div>
        </section>

        <section className="border-t border-brand-forest/10 py-14">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-brand-gold px-2.5 py-1 text-[13px] font-black text-brand-forest">{step.number}</span>
                <h3 className="mt-2 text-[17px] font-bold">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-brand-forest/70">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-brand-forest/10 py-14">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Choose your rung</h2>
          <p className="mt-2 max-w-xl text-[14px] text-brand-forest/70">
            Start free. Upgrade when you want a real operator in your corner.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {OFFERS.map((offer) => (
              <div
                key={offer.name}
                className={
                  offer.highlight
                    ? "rounded-2xl bg-brand-forest p-6 text-brand-surface shadow-lg"
                    : "rounded-2xl bg-white p-6 shadow-sm"
                }
              >
                <h3 className="text-[17px] font-bold">{offer.name}</h3>
                <p
                  className={
                    offer.highlight
                      ? "mt-1 text-[13px] font-black uppercase tracking-wide text-brand-gold"
                      : "mt-1 text-[13px] font-black uppercase tracking-wide text-brand-forest"
                  }
                >
                  {offer.price}
                </p>
                <p
                  className={
                    offer.highlight
                      ? "mt-3 text-[14px] leading-relaxed text-brand-surface/80"
                      : "mt-3 text-[14px] leading-relaxed text-brand-forest/70"
                  }
                >
                  {offer.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-brand-forest/10 py-14">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Coming next on Founder OS
          </h2>
          <p className="mt-2 max-w-xl text-[14px] text-brand-forest/70">
            Tap what you need most — it tells us what to build for you first.
          </p>
          <div className="mt-6">
            <ComingSoonModules />
          </div>
        </section>

        <section className="rounded-3xl bg-brand-forest px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-black tracking-tight text-brand-surface sm:text-3xl">
            Your first customer is 30 days away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-brand-surface/70">
            Start with the free assessment. If the plan makes sense, we launch together.
          </p>
          <Link
            href="/launch/start"
            className="mt-6 inline-block rounded-xl bg-brand-gold px-8 py-3.5 text-[15px] font-black text-brand-forest shadow-md transition hover:brightness-95"
          >
            Start your launch →
          </Link>
        </section>

        <footer className="flex items-center justify-between py-8 text-[12px] text-brand-forest">
          <span>Founder OS — a Business Yoo product</span>
          <Link href="/" className="font-semibold hover:text-brand-forest">
            ← Back to Business Yoo
          </Link>
        </footer>
      </section>
    </main>
  );
}
