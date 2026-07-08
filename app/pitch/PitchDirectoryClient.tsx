'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Gatekeeper, GatekeeperType } from '@/app/data/gatekeepers';
import { GATEKEEPER_TYPES, GATEKEEPER_TYPE_LABELS } from '@/app/data/gatekeepers';

export default function PitchDirectoryClient({ gatekeepers }: { gatekeepers: Gatekeeper[] }) {
  const [activeFilter, setActiveFilter] = useState<GatekeeperType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return gatekeepers.filter((g) => {
      const matchesFilter = activeFilter === 'all' || g.type === activeFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        g.name.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.genres.some((genre) => genre.toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [gatekeepers, activeFilter, query]);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-forest">
      <header className="border-b border-brand-forest/10 bg-brand-forest px-6 py-8 text-brand-cream">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm font-semibold text-brand-cream/70 hover:text-brand-cream">
            ← Business Yoo
          </Link>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-cream">🎵 SoundPitch</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-brand-cream/75">
            Find the right contacts and let AI write your pitch letter. Free for independent artists.
          </p>

          <input
            type="text"
            placeholder="Search by name, genre, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-6 w-full rounded-xl border border-brand-cream/20 bg-brand-cream px-4 py-3 text-sm text-brand-forest outline-none placeholder:text-brand-green/55 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {(['all', ...GATEKEEPER_TYPES] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                  activeFilter === type
                    ? 'bg-brand-gold text-brand-forest'
                    : 'border border-brand-cream/20 bg-brand-cream/10 text-brand-cream hover:bg-brand-cream/15'
                }`}
              >
                {type === 'all' ? 'All' : GATEKEEPER_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <p className="mb-4 text-[13px] font-semibold text-brand-green">
          {filtered.length} contact{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div className="flex flex-col gap-3">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-base font-black text-brand-forest">{g.name}</span>
                  <span className="rounded-full bg-brand-gold/25 px-2 py-0.5 text-[11px] font-bold text-brand-forest">
                    {GATEKEEPER_TYPE_LABELS[g.type]}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-brand-green">{g.location}</div>
                <div className="mt-1 text-xs text-brand-green/70">{g.genres.join(' · ')}</div>
              </div>
              <Link
                href={`/pitch/${g.id}`}
                className="whitespace-nowrap rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-black text-brand-forest transition hover:brightness-95"
              >
                Pitch Now →
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm font-medium text-brand-green/70">
            No contacts match your search. Try a different filter.
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-brand-beige bg-brand-surface p-5 text-center">
          <p className="text-[13px] leading-relaxed text-brand-green">
            🎁 <strong className="text-brand-forest">Free:</strong> 3 AI pitch letters per month.{' '}
            <strong className="text-brand-forest">Pro (UGX 30,000/mo):</strong> Unlimited pitches + premium contacts.
          </p>
        </div>
      </main>
    </div>
  );
}
