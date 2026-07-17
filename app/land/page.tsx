// app/land/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getFeaturedLandListings } from '@/lib/land/queries';
import { LandListingCard } from './browse/LandListingCard';
import SafeLandsAppActions from './SafeLandsAppActions';

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
      <section className="motion-page relative bg-land-primary text-white py-20 px-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-land-mint/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-land-forest/70 blur-3xl" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-business-serif), Georgia, serif' }}>
            Discover land you can trust.
          </h1>
          <p className="text-lg text-land-cream/90 mb-9 max-w-xl mx-auto">
            Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/land/browse"
              className="motion-press bg-white text-land-primary font-semibold px-8 py-3 rounded-full shadow-lg shadow-land-forest/20 hover:bg-land-cream transition-colors"
            >
              Browse SafeLands listings
            </Link>
            <Link
              href="/land/ask"
              className="motion-press border border-white/60 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 hover:border-white transition-colors"
            >
              Ask about land
            </Link>
          </div>
          <SafeLandsAppActions />
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-land-cream/60 border-b border-land-mint/40 py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-land-primary font-medium">
          <span>✅ Surveyor-verified listings</span>
          <span>🗺 Visual land inspection</span>
          <span>📲 WhatsApp agents instantly</span>
        </div>
      </section>

      {/* Browse by district */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-land-ink mb-4">Browse by district</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Link
              key={d}
              href={`/land/browse?district=${encodeURIComponent(d)}`}
              className="motion-press px-4 py-2 rounded-full border border-land-mint/50 bg-white text-sm font-medium text-land-ink/85 hover:border-land-primary hover:text-land-primary transition-colors"
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
            <h2 className="text-xl font-bold text-land-ink">Verified listings</h2>
            <Link href="/land/browse" className="text-sm text-land-primary font-medium hover:underline">
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
      <section className="bg-land-primary text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Need expert help?</h2>
        <p className="text-land-cream/90 mb-6">Get a full land check — UGX 10,000 for 24-hour expert access</p>
        <Link
          href="/land/check"
          className="bg-white text-land-primary font-semibold px-8 py-3 rounded-full hover:bg-land-cream/45 transition-colors inline-block"
        >
          Request Assisted Check
        </Link>
      </section>
    </main>
  );
}
