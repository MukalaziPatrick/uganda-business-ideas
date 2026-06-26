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
    color: "#c05621",
    bg: "#fff8f0",
  },
  {
    href: "/businesses",
    emoji: "💼",
    name: "Find Businesses",
    tagline: "Discover real businesses across Uganda",
    color: "#374151",
    bg: "#f9fafb",
  },
  {
    href: "/salons",
    emoji: "✂️",
    name: "Find Salons",
    tagline: "Book nearby salons via WhatsApp",
    color: "#6b21a8",
    bg: "#faf5ff",
  },
  {
    href: "/laundry",
    emoji: "🧺",
    name: "Laundry Pickup",
    tagline: "Doorstep laundry pickup & delivery",
    color: "#0A2540",
    bg: "#eef6ff",
  },
  {
    href: "/travel",
    emoji: "✈️",
    name: "Explore Uganda",
    tagline: "Destinations, stays, and local tourism",
    color: "#0e7490",
    bg: "#f0fdff",
  },
  {
    href: "/jobs",
    emoji: "👷",
    name: "Find Work",
    tagline: "Browse jobs and post your skills",
    color: "#1a56db",
    bg: "#eff6ff",
  },
  {
    href: "/pharmacy",
    emoji: "💊",
    name: "Find a Pharmacy",
    tagline: "Licensed pharmacies near you",
    color: "#DC2626",
    bg: "#FEE2E2",
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Everything on Business Yoo</h1>
          <p className="text-gray-500">
            Explore land, jobs, business ideas, salons, travel, and more - all in one place.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border-2 border-[#2d6a4f] bg-[#f0faf4] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🏞</span>
            <div>
              <div className="text-lg font-bold text-[#2d6a4f]">Find Land in Uganda</div>
              <div className="text-xs text-gray-500">Verified listings + open market radar - updated daily</div>
            </div>
          </div>
          <form action="/land/market" method="get" className="mb-3 flex gap-2">
            <input
              name="q"
              type="text"
              placeholder="Kayunga road, 5 acres, Milo land..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e4d38]"
            >
              Search
            </button>
          </form>
          <div className="flex gap-3 text-sm">
            <Link href="/land/browse" className="font-medium text-[#2d6a4f] hover:underline">
              Browse Verified →
            </Link>
            <Link href="/land/market" className="text-gray-500 hover:underline">
              Open Market Radar →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ background: app.bg }}
              >
                {app.emoji}
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:underline" style={{ color: app.color }}>
                  {app.name}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">{app.tagline}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Business Yoo - Uganda&apos;s platform for land, work, business, and opportunity.
        </p>
      </div>
    </main>
  );
}
