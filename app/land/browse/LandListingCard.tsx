// app/land/browse/LandListingCard.tsx
import Link from 'next/link';
import type { LandListing } from '@/lib/supabase/land-types';

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function TrustBadge({ stage, score }: { stage: string; score: number }) {
  if (stage === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-[#2d6a4f]">
        ✅ Surveyor Verified
      </span>
    );
  }
  if (stage === 'in-review') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        🔍 Under Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      ⚠️ Unverified
    </span>
  );
}

export function LandListingCard({ listing }: { listing: LandListing }) {
  const photo = listing.photos?.[0];

  return (
    <Link href={`/land/browse/${listing.id}`} className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {photo ? (
          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#f0faf4]">🏞</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <TrustBadge stage={listing.verification_stage} score={listing.trust_score} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{listing.title}</h3>
        <p className="text-xs text-gray-500 mb-3">
          {listing.district}{listing.parish ? `, ${listing.parish}` : ''} ·
          {listing.size_acres ? ` ${listing.size_acres} acres` : ''}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#2d6a4f] text-sm">{formatPrice(listing.price_ugx)}</span>
          {listing.agent?.whatsapp && (
            <a
              href={`https://wa.me/${listing.agent.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-green-700 border border-green-200 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
            >
              📲 WhatsApp
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
