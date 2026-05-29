'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { LandFilterChips } from './LandFilterChips';
import { LandDrawSearch } from './LandDrawSearch';

export function LandBrowseHeader() {
  const [showDraw, setShowDraw] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/land" className="text-[#2d6a4f] font-bold text-lg">🏞 Land</Link>
          <span className="text-gray-300">|</span>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500">
            Search by district, area, or landmark...
          </div>
          <button
            onClick={() => setShowDraw(true)}
            className="text-xs text-[#2d6a4f] border border-[#2d6a4f] rounded-full px-3 py-2 font-medium hover:bg-[#f0faf4] whitespace-nowrap"
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
