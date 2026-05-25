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
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '32px 24px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>← Business Yoo</Link>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#e94560' }}>🎵 SoundPitch</h1>
          <p style={{ color: '#aaa', margin: '0 0 24px', fontSize: 15 }}>
            Find the right contacts and let AI write your pitch letter. Free for independent artists.
          </p>

          <input
            type="text"
            placeholder="Search by name, genre, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #333', background: '#111', color: '#fff',
              fontSize: 14, boxSizing: 'border-box', marginBottom: 16,
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['all', ...GATEKEEPER_TYPES] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: activeFilter === type ? '#e94560' : '#222',
                  color: activeFilter === type ? '#fff' : '#aaa',
                }}
              >
                {type === 'all' ? 'All' : GATEKEEPER_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
          {filtered.length} contact{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((g) => (
            <div
              key={g.id}
              style={{
                background: '#1a1a2e', borderRadius: 10, padding: '16px 20px',
                border: '1px solid #222', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</span>
                  <span style={{ background: '#0f3460', color: '#7eb8f7', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
                    {GATEKEEPER_TYPE_LABELS[g.type]}
                  </span>
                </div>
                <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{g.location}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{g.genres.join(' · ')}</div>
              </div>
              <Link
                href={`/pitch/${g.id}`}
                style={{
                  background: '#e94560', color: '#fff', padding: '8px 18px',
                  borderRadius: 8, textDecoration: 'none', fontSize: 14,
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                Pitch Now →
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#555', padding: '60px 0' }}>
            No contacts match your search. Try a different filter.
          </div>
        )}

        <div style={{
          marginTop: 40, padding: '16px 20px', background: '#111',
          borderRadius: 10, border: '1px solid #222', textAlign: 'center',
        }}>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
            🎁 <strong style={{ color: '#fff' }}>Free:</strong> 3 AI pitch letters per month.{' '}
            <strong style={{ color: '#e94560' }}>Pro (UGX 30,000/mo):</strong> Unlimited pitches + premium contacts.
          </p>
        </div>
      </div>
    </div>
  );
}
