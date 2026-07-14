// app/land/browse/LandListingCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { LandListing } from '@/lib/supabase/land-types';

function formatPrice(ugx: number | null): string {
  if (!ugx) return 'Price on request';
  if (ugx >= 1_000_000_000) return `UGX ${(ugx / 1_000_000_000).toFixed(1)}B`;
  if (ugx >= 1_000_000) return `UGX ${(ugx / 1_000_000).toFixed(0)}M`;
  return `UGX ${ugx.toLocaleString()}`;
}

function TrustBadge({ stage }: { stage: string }) {
  if (stage === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-land-cream/80 text-land-primary">
        ✅ Verified
      </span>
    );
  }
  if (stage === 'checked') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-land-mint/25 text-land-forest">
        🔍 Partially checked
      </span>
    );
  }
  // self_listed — no badge
  return null;
}

export function LandListingCard({ listing }: { listing: LandListing }) {
  const photo = listing.photos?.[0];

  return (
    <Link href={`/land/browse/${listing.id}`} className="group block bg-white rounded-2xl border border-land-mint/50 overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-[4/3] bg-land-cream/60 overflow-hidden">
        {photo ? (
          <Image src={photo} alt={listing.title} width={600} height={450} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-land-cream/60">🏞</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <TrustBadge stage={listing.verification_stage} />
        </div>
        <h3 className="font-semibold text-land-ink text-sm line-clamp-2 mb-1">{listing.title}</h3>
        <p className="text-xs text-land-forest/75 mb-3">
          {listing.district}{listing.parish ? `, ${listing.parish}` : ''} ·
          {listing.size_acres ? ` ${listing.size_acres} acres` : ''}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-land-primary text-sm">{formatPrice(listing.price_ugx)}</span>
          {listing.agent?.whatsapp && (
            <a
              href={`https://wa.me/${listing.agent.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-land-primary border border-land-mint/50 rounded-full px-3 py-1 hover:bg-land-cream/45 transition-colors"
            >
              📲 WhatsApp
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
