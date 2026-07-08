import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLandListingById } from '@/lib/land/queries';
import { LandTrustPanel } from './LandTrustPanel';
import { LandDetailMap } from './LandDetailMap';
import { LandChatBubble } from './LandChatBubble';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getLandListingById(id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} | SafeLands UG`,
    description: `${listing.size_acres ?? ''} acres in ${listing.district}. Trust score: ${listing.trust_score}/100.`,
  };
}

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

export default async function LandListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getLandListingById(id);
  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/land/browse" className="text-sm text-[#2d6a4f] hover:underline">← Back to listings</Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            {listing.photos?.[0] ? (
              <Image src={listing.photos[0]} alt={listing.title} width={1200} height={675} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-[#f0faf4] flex items-center justify-center text-6xl">🏞</div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {listing.title}
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              {listing.district}{listing.parish ? `, ${listing.parish}` : ''}
              {listing.size_acres ? ` · ${listing.size_acres} acres` : ''}
            </p>
            <p className="text-2xl font-bold text-[#2d6a4f]">{formatPrice(listing.price_ugx)}</p>
          </div>

          {listing.lat && listing.lng ? (
            <LandDetailMap lat={listing.lat} lng={listing.lng} title={listing.title} />
          ) : (
            <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
              🗺 No coordinates for this listing yet
            </div>
          )}

          {listing.insight && (
            <div className="bg-[#f0faf4] rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-[#2d6a4f] mb-3">🤖 Land Intelligence</h3>
              {listing.insight.farming_suitability && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farming suitability</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.farming_suitability}</p>
                </div>
              )}
              {listing.insight.access_road_quality && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Access road</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.access_road_quality}</p>
                </div>
              )}
              {listing.insight.risk_notes && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk notes</span>
                  <p className="text-sm text-gray-800 mt-0.5">{listing.insight.risk_notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <h3 className="font-bold text-gray-900 mb-1">Want expert verification?</h3>
            <p className="text-sm text-gray-500 mb-4">Get a full land check — UGX 10,000 for 24-hour expert access</p>
            <Link
              href={`/land/check?listing=${listing.id}`}
              className="inline-block bg-[#2d6a4f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#235840] transition-colors"
            >
              Request Assisted Check
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <LandTrustPanel listing={listing} />

          {listing.agent && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0faf4] flex items-center justify-center text-lg">👤</div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{listing.agent.name}</p>
                  <p className="text-xs text-gray-500">{listing.agent.district}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <LandChatBubble listingId={listing.id} />
    </main>
  );
}
