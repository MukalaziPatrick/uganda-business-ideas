import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLandListings } from '@/lib/land/queries';
import { LandListingCard } from './LandListingCard';
import { LandFilterChips } from './LandFilterChips';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Browse Land in Uganda | SafeLands UG',
};

export default async function LandBrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const listings = await getLandListings({
    district: params.district,
    land_type: params.land_type,
    intended_use: params.intended_use,
    verification_stage: params.verification_stage,
    q: params.q,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/land" className="text-[#2d6a4f] font-bold text-lg">🏞 Land</Link>
          <span className="text-gray-300">|</span>
          <input
            readOnly
            placeholder="Search by district, area, or landmark..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 cursor-pointer"
          />
        </div>
        <Suspense>
          <LandFilterChips />
        </Suspense>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          {params.district ? ` in ${params.district}` : ' across Uganda'}
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">No listings found in this area yet.</h3>
            <p className="text-gray-500 text-sm mb-6">Save your search and we&apos;ll WhatsApp you when something matches.</p>
            <Link
              href="/land/browse"
              className="text-[#2d6a4f] font-medium text-sm hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <LandListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
