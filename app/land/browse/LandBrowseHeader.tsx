'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LandFilterChips } from './LandFilterChips';
import { LandDrawSearch } from './LandDrawSearch';

function LandSearchForm() {
  const searchParams = useSearchParams();
  return (
    <form action="/land/browse" method="get" role="search" className="order-last flex basis-full min-w-0 gap-2 sm:order-none sm:basis-auto sm:flex-1">
      {/* Keep active filters when searching */}
      {['district', 'land_type', 'intended_use', 'verification_stage'].map((key) => {
        const value = searchParams.get(key);
        return value ? <input key={key} type="hidden" name={key} value={value} /> : null;
      })}
      <input
        type="search"
        name="q"
        defaultValue={searchParams.get('q') ?? ''}
        aria-label="Search land listings by title"
        placeholder="Search plots, e.g. Mukono farmland..."
        className="min-h-11 w-full min-w-0 flex-1 rounded-full border border-land-mint/50 bg-land-cream/40 px-4 text-sm text-land-ink placeholder:text-land-forest/70 focus:outline-none focus:border-land-primary focus:ring-2 focus:ring-land-mint/60"
      />
      <button
        type="submit"
        className="motion-press min-h-11 shrink-0 rounded-full bg-land-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-land-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-mint"
      >
        Search
      </button>
    </form>
  );
}

export function LandBrowseHeader() {
  const [showDraw, setShowDraw] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-land-mint/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link href="/land" className="text-land-primary font-bold text-lg shrink-0">🏞 Land</Link>
          <Suspense>
            <LandSearchForm />
          </Suspense>
          <button
            onClick={() => setShowDraw(true)}
            className="motion-press min-h-11 text-xs text-land-primary border border-land-primary rounded-full px-3 font-medium hover:bg-land-cream/60 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-mint"
          >
            ✏️ Draw area
          </button>
        </div>
        <Suspense>
          <LandFilterChips />
        </Suspense>
      </div>

      {showDraw && <LandDrawSearch onClose={() => setShowDraw(false)} />}
    </>
  );
}
