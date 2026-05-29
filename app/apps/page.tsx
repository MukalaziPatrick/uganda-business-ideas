// app/apps/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Everything on Business Yoo',
  description: 'Explore land, jobs, business ideas, salons, travel, and more — all in one place.',
  robots: { index: false, follow: false },
};

const APPS = [
  {
    href: '/land',
    emoji: '🏞',
    name: 'Find Land',
    tagline: 'Browse verified plots across Uganda',
    color: '#2d6a4f',
    bg: '#f0faf4',
  },
  {
    href: '/ideas',
    emoji: '💡',
    name: 'Business Ideas',
    tagline: '48 curated ideas to start your business',
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

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Everything on Business Yoo</h1>
          <p className="text-gray-500">Explore land, jobs, business ideas, salons, travel, and more — all in one place.</p>
        </div>

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
