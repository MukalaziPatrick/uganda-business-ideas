import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLandListings } from '@/lib/land/queries';
import { LandListingCard } from './LandListingCard';
import { LandSaveSearch } from './LandSaveSearch';
import { LandBrowseHeader } from './LandBrowseHeader';
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
  const bboxParams = params.minLat && params.maxLat && params.minLng && params.maxLng
    ? {
        minLat: parseFloat(params.minLat),
        maxLat: parseFloat(params.maxLat),
        minLng: parseFloat(params.minLng),
        maxLng: parseFloat(params.maxLng),
      }
    : undefined;
  const listings = await getLandListings({
    district: params.district,
    land_type: params.land_type,
    intended_use: params.intended_use,
    verification_stage: params.verification_stage,
    q: params.q,
    bbox: bboxParams,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <LandBrowseHeader />

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-1">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          {params.district ? ` in ${params.district}` : ' across Uganda'}
        </p>
        <p className="text-xs text-gray-400 italic mb-4">
          Self-listed plots have not been checked by SafeLands. Verify before paying.
        </p>

        <Suspense>
          <LandSaveSearch />
        </Suspense>

        <details className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <summary className="cursor-pointer font-medium text-gray-800 select-none">
            How trust works here
          </summary>
          <ul className="mt-3 space-y-2 list-none">
            <li><span className="font-medium text-land-primary">Verified</span> — SafeLands and a licensed agent reviewed the title and documents at the Ministry of Lands portal.</li>
            <li><span className="font-medium text-land-secondary">Partially checked</span> — Physically inspected by a licensed agent, but full document review pending.</li>
            <li><span className="font-medium text-gray-500">Self-listed</span> — Submitted by the seller. Not yet checked by SafeLands.</li>
          </ul>
          <p className="mt-3 italic text-xs text-gray-400">Always conduct your own search and a physical site visit before any payment.</p>
        </details>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">No listings found in this area yet.</h3>
            <p className="text-gray-500 text-sm mb-6">Save your search and we&apos;ll WhatsApp you when something matches.</p>
            <Link
              href="/land/browse"
              className="text-land-primary font-medium text-sm hover:underline"
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
