import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedIdeasCount } from '@/lib/ideas/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Everything on Business Yoo',
  description: 'Explore land, jobs, business ideas, salons, travel, and more — all in one place.',
  robots: { index: false, follow: false },
};

const BASE_APPS = [
  {
    href: '/ideas',
    emoji: '💡',
    name: 'Business Ideas',
    tagline: 'Curated ideas to start your business',
    color: '#c05621',
    bg: '#fff8f0',
  },
  {
    href: '/businesses',
    emoji: '💼',
    name: 'Find Businesses',
    tagline: 'Discover real businesses across Uganda',
    color: '#374151',
    bg: '#f9fafb',
  },
  {
    href: '/salons',
    emoji: '✂️',
    name: 'Find Salons',
    tagline: 'Book nearby salons via WhatsApp',
    color: '#6b21a8',
    bg: '#faf5ff',
  },
  {
    href: '/travel',
    emoji: '✈️',
    name: 'Explore Uganda',
    tagline: 'Destinations, stays, and local tourism',
    color: '#0e7490',
    bg: '#f0fdff',
  },
  {
    href: '/jobs',
    emoji: '👷',
    name: 'Find Work',
    tagline: 'Browse jobs and post your skills',
    color: '#1a56db',
    bg: '#eff6ff',
  },
];

export default async function AppsPage() {
  const ideaCount = await getPublishedIdeasCount();
  const APPS = BASE_APPS.map((app) =>
    app.href === '/ideas'
      ? { ...app, tagline: `${ideaCount} curated ideas to start your business` }
      : app
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Everything on Business Yoo</h1>
          <p className="text-gray-500">Explore land, jobs, business ideas, salons, travel, and more — all in one place.</p>
        </div>

        {/* Featured Land card */}
        <div className="mb-6 p-5 rounded-2xl border-2 border-[#2d6a4f] bg-[#f0faf4]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏞</span>
            <div>
              <div className="font-bold text-[#2d6a4f] text-lg">Find Land in Uganda</div>
              <div className="text-xs text-gray-500">Verified listings + open market radar · updated daily</div>
            </div>
          </div>
          <form action="/land/market" method="get" className="flex gap-2 mb-3">
            <input
              name="q"
              type="text"
              placeholder="Kayunga road, 5 acres, Milo land..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
            <button type="submit" className="bg-[#2d6a4f] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e4d38] transition-colors">
              Search
            </button>
          </form>
          <div className="flex gap-3 text-sm">
            <Link href="/land/browse" className="text-[#2d6a4f] font-medium hover:underline">Browse Verified →</Link>
            <Link href="/land/market" className="text-gray-500 hover:underline">Open Market Radar →</Link>
          </div>
        </div>

        {/* Other apps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APPS.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: app.bg }}
              >
                {app.emoji}
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:underline" style={{ color: app.color }}>
                  {app.name}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{app.tagline}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center">
          Business Yoo — Uganda&apos;s platform for land, work, business, and opportunity.
        </p>
      </div>
    </main>
  );
}
