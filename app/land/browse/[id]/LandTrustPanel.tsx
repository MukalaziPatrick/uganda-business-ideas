import type { LandListing } from '@/lib/supabase/land-types';
import Link from 'next/link';

function TrustBar({ score }: { score: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-land-primary h-2 rounded-full transition-all"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function LandTrustPanel({ listing }: { listing: LandListing }) {
  const stageBadges: Record<string, { label: string; color: string }> = {
    verified: { label: '✅ Surveyor Verified', color: 'bg-land-cream/80 text-land-primary' },
    'in-review': { label: '🔍 Under Review', color: 'bg-land-mint/25 text-land-forest' },
    submitted: { label: '📋 Submitted', color: 'bg-land-cream/70 text-land-primary' },
    unverified: { label: '⚠️ Unverified', color: 'bg-gray-100 text-gray-500' },
  };
  const badge = stageBadges[listing.verification_stage] ?? stageBadges.unverified;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="font-bold text-gray-900 mb-4">Trust & Verification</h2>

      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${badge.color}`}>
        {badge.label}
      </span>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Trust score</span>
          <span className="font-bold text-land-primary">{listing.trust_score}/100</span>
        </div>
        <TrustBar score={listing.trust_score} />
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Title status</span>
        <span className={`font-medium ${listing.title_status === 'clean' ? 'text-land-primary' : 'text-land-forest'}`}>
          {listing.title_status === 'clean' ? '✅ Clean' :
           listing.title_status === 'caution' ? '⚠️ Caution' :
           listing.title_status === 'pending' ? '⏳ Pending' : '❓ Unknown'}
        </span>
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Land type</span>
        <span className="font-medium text-gray-900 capitalize">{listing.land_type ?? 'Unknown'}</span>
      </div>

      <div className="flex justify-between text-sm mb-5">
        <span className="text-gray-600">Intended use</span>
        <span className="font-medium text-gray-900 capitalize">{listing.intended_use ?? 'Not specified'}</span>
      </div>

      {listing.qr_token && (
        <Link
          href={`/land/verify/${listing.qr_token}`}
          className="block w-full text-center py-2 rounded-xl border border-land-primary text-land-primary text-sm font-medium hover:bg-land-cream/60 transition-colors mb-3"
        >
          🔗 View Trust Certificate
        </Link>
      )}

      {listing.agent?.whatsapp && (
        <a
          href={`https://wa.me/${listing.agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${listing.title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl bg-land-primary text-white font-semibold hover:bg-land-forest transition-colors"
        >
          📲 WhatsApp Agent
        </a>
      )}
    </div>
  );
}
