// app/land/verify/[qr]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLandListingByQr } from '@/lib/land/queries';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ qr: string }> }): Promise<Metadata> {
  const { qr } = await params;
  const listing = await getLandListingByQr(qr);
  if (!listing) return { title: 'Trust Certificate | SafeLands UG' };
  return {
    title: `Trust Certificate — ${listing.title} | SafeLands UG`,
    description: `Verification status for ${listing.title} in ${listing.district}.`,
  };
}

export default async function LandVerifyPage({
  params,
}: {
  params: Promise<{ qr: string }>;
}) {
  const { qr } = await params;
  const listing = await getLandListingByQr(qr);
  if (!listing) notFound();

  const isVerified = listing.verification_stage === 'verified';

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-8 text-center ${isVerified ? 'bg-land-primary' : 'bg-gray-700'}`}>
          <div className="text-5xl mb-3">{isVerified ? '✅' : '⚠️'}</div>
          <h1 className="text-xl font-bold text-white mb-1">
            {isVerified ? 'This listing has been verified.' : 'Verification in progress.'}
          </h1>
          <p className="text-land-cream/90 text-sm">
            {isVerified
              ? 'A certified surveyor has reviewed this property.'
              : 'This property has not yet been fully verified by our surveyor.'}
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Property</p>
            <p className="font-semibold text-gray-900">{listing.title}</p>
            <p className="text-sm text-gray-500">{listing.district}{listing.parish ? `, ${listing.parish}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Title status</p>
              <p className="font-medium text-sm capitalize">
                {listing.title_status === 'clean' ? '✅ Clean' :
                 listing.title_status === 'caution' ? '⚠️ Caution' :
                 listing.title_status === 'pending' ? '⏳ Pending' : '❓ Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Land type</p>
              <p className="font-medium text-sm capitalize">{listing.land_type ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Size</p>
              <p className="font-medium text-sm">{listing.size_acres ? `${listing.size_acres} acres` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Trust score</p>
              <p className="font-medium text-sm text-land-primary">{listing.trust_score}/100</p>
            </div>
          </div>

          {listing.verified_at && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Verified on</p>
              <p className="text-sm text-gray-700">{new Date(listing.verified_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <Link
            href={`/land/browse/${listing.id}`}
            className="block w-full text-center py-3 rounded-xl bg-land-primary text-white font-semibold text-sm hover:bg-land-forest transition-colors"
          >
            View Full Listing
          </Link>
          <p className="text-xs text-center text-gray-400">
            Issued by SafeLands UG · Business Yoo · Certificate ID: {listing.qr_token}
          </p>
        </div>
      </div>
    </main>
  );
}
