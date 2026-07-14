import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMarketListingById } from '@/lib/land/market-queries';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getMarketListingById(id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} | Land Market — Business Yoo`,
    description: `${listing.size_acres ? `${listing.size_acres} acres` : 'Land'} in ${listing.district ?? 'Uganda'}. Source: ${listing.source_site}.`,
  };
}

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function daysSince(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function TrustDots({ score }: { score: number | null }) {
  const s = score ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full ${i <= s ? 'bg-land-cream/450' : 'bg-land-cream'}`} />
        ))}
      </div>
      <span className="text-sm text-land-forest/75">{s}/5 trust score</span>
    </div>
  );
}

export default async function MarketListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getMarketListingById(id);
  if (!listing) notFound();

  const whatsappHref = listing.contact_phone
    ? `https://wa.me/${listing.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw your land listing: ${listing.title}`)}`
    : null;

  return (
    <main className="min-h-screen bg-land-cream/30">
      {/* Back nav */}
      <div className="bg-white border-b border-land-mint/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/land/market" className="text-sm text-land-primary hover:underline">
            ← Back to Land Market
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo placeholder */}
          <div className="bg-white rounded-2xl border border-land-mint/50 overflow-hidden">
            <div className="w-full aspect-video bg-land-cream/60 flex flex-col items-center justify-center text-land-forest/60 gap-2">
              <span className="text-5xl">🏞</span>
              <span className="text-sm">No photos — view on {listing.source_site}</span>
            </div>
          </div>

          {/* Title + price */}
          <div className="bg-white rounded-2xl border border-land-mint/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl font-bold text-land-ink leading-tight">{listing.title}</h1>
              <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-land-mint/20 text-land-forest border border-land-mint/40">
                ⚠️ Unverified
              </span>
            </div>

            <p className="text-2xl font-bold text-land-primary mb-4">{formatPrice(listing.price_ugx)}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {listing.district && (
                <div>
                  <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">District</p>
                  <p className="font-medium text-land-ink">📍 {listing.district}</p>
                </div>
              )}
              {listing.road_area && (
                <div>
                  <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">Area</p>
                  <p className="font-medium text-land-ink">{listing.road_area}</p>
                </div>
              )}
              {listing.size_acres && (
                <div>
                  <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">Size</p>
                  <p className="font-medium text-land-ink">📐 {listing.size_acres} acres</p>
                </div>
              )}
              {listing.land_type && (
                <div>
                  <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">Land type</p>
                  <p className="font-medium text-land-ink capitalize">🏷 {listing.land_type}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">Title</p>
                <p className="font-medium">
                  {listing.has_title === true && <span className="text-land-secondary">✓ Has title</span>}
                  {listing.has_title === false && <span className="text-red-500">✗ No title</span>}
                  {listing.has_title === null && <span className="text-land-forest/60">Unknown</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-land-forest/75 uppercase tracking-wide font-medium mb-0.5">Source</p>
                <p className="font-medium text-land-ink uppercase">{listing.source_site}</p>
              </div>
            </div>
          </div>

          {/* Trust score */}
          <div className="bg-white rounded-2xl border border-land-mint/50 p-5">
            <h2 className="font-bold text-land-ink mb-3">Trust Assessment</h2>
            <TrustDots score={listing.trust_score} />
            {listing.trust_flags?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {listing.trust_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-land-forest/85">
                    <span className="text-land-secondary shrink-0 mt-0.5">⚠</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-land-forest/60 mt-4">
              Trust score is auto-generated from listing data. This listing has not been verified by a SafeLands surveyor.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-land-cream/60 border border-land-mint/40 rounded-2xl p-4 text-sm text-land-forest">
            <p className="font-semibold mb-1">⚠️ Unverified listing</p>
            <p>This listing was scraped from {listing.source_site.toUpperCase()} and has not been verified. Always do your own due diligence before any land transaction.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* WhatsApp CTA */}
          <div className="bg-white rounded-2xl border border-land-mint/50 p-5">
            <h3 className="font-bold text-land-ink mb-1">Contact seller</h3>
            <p className="text-xs text-land-forest/75 mb-4">Scraped {daysSince(listing.scraped_at)} from {listing.source_site.toUpperCase()}</p>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-land-primary text-white font-semibold hover:bg-land-forest transition-colors"
              >
                📲 WhatsApp Seller
              </a>
            ) : (
              <p className="text-sm text-land-forest/60 text-center">No contact number available</p>
            )}
            <a
              href={listing.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mt-3 rounded-xl border border-land-mint/50 text-land-ink/85 text-sm font-medium hover:bg-land-cream/30 transition-colors"
            >
              View original listing ↗
            </a>
          </div>

          {/* Get verified CTA */}
          <div className="bg-land-cream/60 rounded-2xl border border-land-mint/40 p-5 text-center">
            <p className="text-sm font-semibold text-land-primary mb-1">Want verified land?</p>
            <p className="text-xs text-land-forest/75 mb-3">Browse surveyor-verified listings with trust certificates</p>
            <Link
              href="/land/browse"
              className="inline-block text-sm font-semibold text-land-primary border border-land-primary px-4 py-2 rounded-full hover:bg-land-primary hover:text-white transition-colors"
            >
              Browse verified listings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
