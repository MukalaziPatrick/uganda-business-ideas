import Link from 'next/link';
import type { MarketListing } from '@/lib/land/market-queries';
import { getTrustTier } from '@/lib/land/market-queries';

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function daysSince(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

const TRUST_BADGE: Record<'high' | 'medium' | 'low', { label: string; className: string }> = {
  high:   { label: 'High trust',   className: 'bg-green-100 text-green-800 border border-green-200' },
  medium: { label: 'Partially checked', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
  low:    { label: 'Self-listed',  className: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

function TrustBadge({ score }: { score: number | null }) {
  const tier = getTrustTier(score);
  const { label, className } = TRUST_BADGE[tier];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {tier === 'high' ? '✓' : tier === 'medium' ? '~' : '!'} {label}
    </span>
  );
}

function TrustDots({ score }: { score: number | null }) {
  const s = score ?? 0;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= s ? 'bg-green-500' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export function MarketListingCard({ listing }: { listing: MarketListing }) {
  const whatsappHref = listing.contact_phone
    ? `https://wa.me/${listing.contact_phone.replace(/\D/g, '')}`
    : null;

  return (
    <Link href={`/land/market/${listing.id}`} className="block group">
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col gap-2 h-full">
      {/* Trust badge */}
      <div className="flex items-center justify-between">
        <TrustBadge score={listing.trust_score} />
        <TrustDots score={listing.trust_score} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{listing.title}</h3>

      {/* Meta */}
      <div className="text-xs text-gray-500 space-y-0.5">
        {listing.district && <div>📍 {listing.district}{listing.road_area ? `, ${listing.road_area}` : ''}</div>}
        {listing.size_acres && <div>📐 {listing.size_acres} acres</div>}
        {listing.land_type && <div>🏷 {listing.land_type}</div>}
        <div>
          {listing.has_title === true && <span className="text-green-600">✓ Has title · </span>}
          {listing.has_title === false && <span className="text-red-500">✗ No title · </span>}
          {listing.source_site.toUpperCase()} · {daysSince(listing.scraped_at)}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="font-bold text-[#2d6a4f] text-sm">{formatPrice(listing.price_ugx)}</span>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-green-700 border border-green-200 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
          >
            📲 WhatsApp
          </a>
        ) : (
          <span className="text-xs text-gray-400">View details →</span>
        )}
      </div>
    </div>
    </Link>
  );
}
