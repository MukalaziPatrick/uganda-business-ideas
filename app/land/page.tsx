// app/land/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getFeaturedLandListings } from '@/lib/land/queries';
import { LandListingCard } from './browse/LandListingCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Discover Land in Uganda | SafeLands UG',
  description: 'Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.',
};

const DISTRICTS = [
  'Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbale',
  'Gulu','Mbarara','Masaka','Lira','Fort Portal','Arua',
];

export default async function LandHomePage() {
  const featured = await getFeaturedLandListings(6);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#2d6a4f] text-white py-20 px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Discover land you can trust.
          </h1>
          <p className="text-lg text-green-100 mb-8">
            Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/land/browse"
              className="bg-white text-[#2d6a4f] font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition-colors"
            >
              Browse Land
            </Link>
            <Link
              href="/land/ask"
              className="border border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Ask about land
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#f0faf4] border-b border-green-100 py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-[#2d6a4f] font-medium">
          <span>✅ Surveyor-verified listings</span>
          <span>🗺 Visual land inspection</span>
          <span>📲 WhatsApp agents instantly</span>
        </div>
      </section>

      {/* Browse by district */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by district</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Link
              key={d}
              href={`/land/browse?district=${encodeURIComponent(d)}`}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
            >
              {d}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Verified listings</h2>
            <Link href="/land/browse" className="text-sm text-[#2d6a4f] font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((listing) => (
              <LandListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Assisted check CTA */}
      <section className="bg-[#2d6a4f] text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Need expert help?</h2>
        <p className="text-green-100 mb-6">Get a full land check — UGX 10,000 for 24-hour expert access</p>
        <Link
          href="/land/check"
          className="bg-white text-[#2d6a4f] font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition-colors inline-block"
        >
          Request Assisted Check
        </Link>
      </section>
    </main>
  );
}
