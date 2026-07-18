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
  // self_listed — neutral badge so the state is visible, not hidden
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-land-cream/80 text-land-forest">
      📋 Self-listed
    </span>
  );
}

export function LandListingCard({ listing }: { listing: LandListing }) {
  const photo = listing.photos?.[0];
  const listingHref = `/land/browse/${listing.id}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-land-mint/50 bg-white transition-shadow hover:shadow-md">
      {/* Photo */}
      <Link
        href={listingHref}
        aria-label={`View ${listing.title}`}
        className="block aspect-[4/3] overflow-hidden bg-land-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary focus-visible:ring-inset"
      >
        {photo ? (
          <Image src={photo} alt="" width={600} height={450} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-land-cream/60 text-4xl" aria-hidden>🏞</span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 pr-16 sm:pr-4">
        <div className="mb-2">
          <TrustBadge stage={listing.verification_stage} />
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-land-ink">
          <Link
            href={listingHref}
            className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary"
          >
            {listing.title}
          </Link>
        </h3>
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
              aria-label={`Contact the agent about ${listing.title} on WhatsApp (opens in a new tab)`}
              className="inline-flex min-h-11 items-center rounded-full border border-land-mint/50 px-3 text-xs text-land-primary transition-colors hover:bg-land-cream/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary"
            >
              📲 WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
