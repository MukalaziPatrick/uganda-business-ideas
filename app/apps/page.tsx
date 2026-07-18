import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedIdeasCount } from "@/lib/ideas/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Everything on Business Yoo",
  description: "Explore land, jobs, business ideas, salons, travel, and more - all in one place.",
  robots: { index: false, follow: false },
};

const BASE_APPS = [
  {
    href: "/ideas",
    emoji: "💡",
    name: "Business Ideas",
    tagline: "Curated ideas to start your business",
    iconClass: "bg-brand-gold text-brand-forest",
  },
  {
    href: "/businesses",
    emoji: "💼",
    name: "Find Businesses",
    tagline: "Discover real businesses across Uganda",
    iconClass: "bg-brand-forest text-brand-cream",
  },
  {
    href: "/salons",
    emoji: "✂️",
    name: "Find Salons",
    tagline: "Book nearby salons via WhatsApp",
    iconClass: "bg-brand-green text-brand-cream",
  },
  {
    href: "/laundry",
    emoji: "🧺",
    name: "Laundry Pickup",
    tagline: "Doorstep laundry pickup & delivery",
    iconClass: "bg-brand-cream text-brand-forest ring-1 ring-brand-beige",
  },
  {
    href: "/travel",
    emoji: "✈️",
    name: "Explore Uganda",
    tagline: "Destinations, stays, and local tourism",
    iconClass: "bg-brand-beige text-brand-forest",
  },
  {
    href: "/jobs",
    emoji: "👷",
    name: "Find Work",
    tagline: "Browse jobs and post your skills",
    iconClass: "bg-brand-forest text-brand-gold",
  },
  {
    href: "/pharmacy",
    emoji: "💊",
    name: "Find a Pharmacy",
    tagline: "Licensed pharmacies near you",
    iconClass: "bg-brand-green text-brand-gold",
  },
  {
    href: "/pitch",
    emoji: "🎵",
    name: "Pitch Your Music",
    tagline: "Get your music heard by radios & blogs",
    iconClass: "bg-brand-gold text-brand-forest",
  },
  {
    href: "/launch",
    emoji: "🚀",
    name: "Launch Your Business",
    tagline: "Step-by-step plan to launch in 30 days",
    iconClass: "bg-brand-forest text-brand-cream",
  },
];

export default async function AppsPage() {
  const ideaCount = await getPublishedIdeasCount();
  const apps = BASE_APPS.map((app) =>
    app.href === "/ideas"
      ? { ...app, tagline: `${ideaCount} curated ideas to start your business` }
      : app
  );

  return (
    <main className="motion-page min-h-screen bg-brand-cream text-brand-forest">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="mb-4 inline-flex rounded-full bg-brand-gold px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand-forest">
            Discovery hub
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-brand-forest sm:text-5xl">
            <span className="block sm:inline">Everything on</span>{" "}
            <span className="block sm:inline">Business Yoo</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-brand-green text-pretty sm:text-base">
            Explore land, jobs, business ideas, salons, travel, and more - all in one place.
          </p>
        </div>

        <section className="motion-card mb-6 rounded-[2rem] border border-land-secondary/30 bg-land-cream p-5 shadow-sm shadow-land-forest/5 sm:p-7">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-land-primary text-2xl text-white">🏞</span>
            <div>
              <h2 className="text-lg font-black text-land-forest">Find Land in Uganda</h2>
              <p className="mt-1 text-xs leading-5 text-land-primary sm:text-sm">
                Verified listings + open market radar - updated daily
              </p>
            </div>
          </div>
          <form action="/land/market" method="get" className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              name="q"
              type="text"
              aria-label="Search land listings"
              placeholder="Kayunga road, 5 acres, Milo land..."
              className="min-h-11 flex-1 rounded-xl border border-land-secondary/30 bg-white px-3.5 py-2 text-sm text-land-forest outline-none placeholder:text-land-primary/60 focus:border-land-secondary focus:ring-2 focus:ring-land-secondary"
            />
            <button
              type="submit"
              className="motion-press min-h-11 rounded-xl bg-land-primary px-5 py-2 text-sm font-black text-white transition-colors hover:bg-land-forest"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/land/browse" className="font-black text-land-forest hover:underline">
              Browse Verified →
            </Link>
            <Link href="/land/market" className="font-semibold text-land-primary hover:underline">
              Open Market Radar →
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="motion-card group flex items-start gap-4 rounded-3xl border border-brand-beige bg-brand-surface p-5 shadow-sm shadow-brand-forest/5 transition-all hover:border-brand-gold hover:shadow-lg hover:shadow-brand-forest/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${app.iconClass}`}
              >
                {app.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-black text-brand-forest">
                  {app.name}
                </h2>
                <p className="mt-1 text-sm leading-6 text-brand-green">{app.tagline}</p>
              </div>
              <span
                aria-hidden
                className="mt-1 shrink-0 text-brand-beige transition-all group-hover:translate-x-0.5 group-hover:text-brand-gold"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xs text-center text-xs font-semibold leading-5 text-brand-green sm:max-w-none">
          Business Yoo - Uganda&apos;s platform for land, work, business, and opportunity.
        </p>
      </div>
    </main>
  );
}
