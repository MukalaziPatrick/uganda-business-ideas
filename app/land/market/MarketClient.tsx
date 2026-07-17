'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { MarketListing } from '@/lib/land/market-queries';
import { getTrustTier } from '@/lib/land/market-queries';
import { MarketListingCard } from './MarketListingCard';
import Link from 'next/link';

const DISTRICTS = ['Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbale','Gulu','Mbarara','Masaka','Lira','Fort Portal','Arua'];
const LAND_TYPES = ['Mailo','Freehold','Leasehold','Kibanja'];
const SOURCES = ['olx','lamudi'];

export default function MarketClient({ listings, total }: { listings: MarketListing[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [highTrustOnly, setHighTrustOnly] = useState(false);

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/land/market?${p.toString()}`);
  }, [params, router]);

  const q = params.get('q') ?? '';
  const district = params.get('district') ?? '';
  const land_type = params.get('land_type') ?? '';
  const has_title = params.get('has_title') ?? '';
  const source_site = params.get('source_site') ?? '';

  const visibleListings = useMemo(
    () => highTrustOnly ? listings.filter(l => getTrustTier(l.trust_score) === 'high') : listings,
    [listings, highTrustOnly]
  );

  return (
    <div className="min-h-screen bg-land-cream/30">
      {/* Header */}
      <div className="bg-white border-b border-land-mint/50 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-land-ink mb-1">Open Market Land Radar</h1>
          <p className="text-sm text-land-forest/75 mb-4">Scraped daily from OLX and Lamudi · {total} listings · Not verified by surveyors</p>

          {/* Search bar */}
          <input
            type="text"
            defaultValue={q}
            placeholder="Search by location, road, or keyword..."
            onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value); }}
            className="w-full border border-land-secondary/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-land-primary mb-3"
          />

          {/* Disclaimer */}
          <p className="text-xs text-land-forest bg-land-cream/60 border border-land-mint/40 rounded-lg px-3 py-2 mb-3">
            Self-listed plots have not been checked by SafeLands. Verify before paying.
          </p>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={district}
              onChange={(e) => setParam('district', e.target.value)}
              className="border border-land-mint/50 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={land_type}
              onChange={(e) => setParam('land_type', e.target.value)}
              className="border border-land-mint/50 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All types</option>
              {LAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={has_title}
              onChange={(e) => setParam('has_title', e.target.value)}
              className="border border-land-mint/50 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">Title: any</option>
              <option value="true">Has title</option>
              <option value="false">No title</option>
            </select>

            <select
              value={source_site}
              onChange={(e) => setParam('source_site', e.target.value)}
              className="border border-land-mint/50 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>

            {/* High trust toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none border border-land-mint/50 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-land-cream/45 transition-colors">
              <input
                type="checkbox"
                checked={highTrustOnly}
                onChange={(e) => setHighTrustOnly(e.target.checked)}
                className="accent-land-primary"
              />
              <span className={highTrustOnly ? 'text-land-forest font-medium' : 'text-land-forest/85'}>Show high trust only</span>
            </label>

            {(q || district || land_type || has_title || source_site) && (
              <button
                onClick={() => router.push('/land/market')}
                className="border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-sm hover:bg-red-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {visibleListings.length === 0 ? (
          <div className="text-center py-20 text-land-forest/75">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium mb-1">
              {highTrustOnly && listings.length > 0
                ? 'No high-trust listings match your filters.'
                : 'No listings found for your search.'}
            </p>
            <p className="text-sm">The scraper runs daily at 6AM — check back tomorrow.</p>
            <Link href="/land/browse" className="inline-block mt-4 text-sm text-land-primary hover:underline">
              Browse SafeLands verified listings →
            </Link>
          </div>
        ) : (
          <>
            {highTrustOnly && (
              <p className="text-xs text-land-primary mb-3">Showing {visibleListings.length} high-trust listing{visibleListings.length !== 1 ? 's' : ''} (trust score 4–5)</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleListings.map(l => <MarketListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </div>

      {/* SafeLands CTA */}
      <div className="bg-land-primary text-white py-8 px-4 text-center">
        <p className="font-medium mb-2">Want a surveyor-verified listing?</p>
        <Link href="/land/browse" className="inline-block bg-white text-land-primary font-semibold px-6 py-2 rounded-full hover:bg-land-cream/45 transition-colors text-sm">
          Browse SafeLands verified listings →
        </Link>
      </div>
    </div>
  );
}
