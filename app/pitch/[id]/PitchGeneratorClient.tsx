'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Gatekeeper } from '@/app/data/gatekeepers';
import { GATEKEEPER_TYPE_LABELS } from '@/app/data/gatekeepers';

const FREE_LIMIT = 3;

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('soundpitch_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('soundpitch_session', id);
  }
  return id;
}

type UsageState = { count: number; isPro: boolean; canGenerate: boolean; loaded: boolean };

export default function PitchGeneratorClient({ gatekeeper }: { gatekeeper: Gatekeeper }) {
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [songDescription, setSongDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');

  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [usage, setUsage] = useState<UsageState>({ count: 0, isPro: false, canGenerate: true, loaded: false });

  const fetchUsage = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/pitch/usage?session_id=${sessionId}`);
      const data = await res.json();
      setUsage({ count: data.count, isPro: data.isPro, canGenerate: data.canGenerate, loaded: true });
    } catch {
      setUsage((u) => ({ ...u, loaded: true }));
    }
  }, []);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (sessionId) fetchUsage(sessionId);
  }, [fetchUsage]);

  const handleGenerate = async () => {
    if (!songTitle || !artistName || !genre || !songDescription || !musicLink) {
      setError('Please fill in all fields.');
      return;
    }
    if (!usage.canGenerate) return;

    setLoading(true);
    setError('');
    setPitch('');

    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatekeeperName: gatekeeper.name,
          gatekeeperType: GATEKEEPER_TYPE_LABELS[gatekeeper.type],
          gatekeeperGenres: gatekeeper.genres.join(', '),
          songTitle,
          artistName,
          genre,
          songDescription,
          musicLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      setPitch(data.pitch);

      await fetch('/api/pitch/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      await fetchUsage(sessionId);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #333', background: '#111', color: '#fff',
    fontSize: 14, boxSizing: 'border-box' as const, marginTop: 4,
  };

  const remainingPitches = Math.max(0, FREE_LIMIT - usage.count);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Link href="/pitch" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>← Back to Directory</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '12px 0 4px', color: '#e94560' }}>
            Pitch to: {gatekeeper.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#0f3460', color: '#7eb8f7', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
              {GATEKEEPER_TYPE_LABELS[gatekeeper.type]}
            </span>
            <span style={{ color: '#666', fontSize: 13 }}>{gatekeeper.location}</span>
            <span style={{ color: '#555', fontSize: 13 }}>· {gatekeeper.genres.join(', ')}</span>
          </div>
          <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>{gatekeeper.description}</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
        {usage.loaded && (
          <div style={{
            background: usage.isPro ? '#0f3460' : '#1a1a2e',
            border: `1px solid ${usage.canGenerate ? '#333' : '#e94560'}`,
            borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13,
          }}>
            {usage.isPro
              ? '⭐ Pro Plan — Unlimited pitch letters'
              : usage.canGenerate
              ? `🎁 Free plan: ${remainingPitches} of ${FREE_LIMIT} pitches remaining this month`
              : '🔒 You\'ve used all 3 free pitches this month. Upgrade to Pro for UGX 30,000/mo for unlimited pitches.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Song Title *', value: songTitle, onChange: setSongTitle, placeholder: 'e.g. Mukama Ayinza' },
            { label: 'Your Artist Name *', value: artistName, onChange: setArtistName, placeholder: 'e.g. Isaac Ssemwanga' },
            { label: 'Genre *', value: genre, onChange: setGenre, placeholder: 'e.g. Gospel / Luganda' },
            { label: 'Music Link (YouTube, Spotify, SoundCloud) *', value: musicLink, onChange: setMusicLink, placeholder: 'https://...' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: 13, color: '#aaa', display: 'block' }}>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
                disabled={!usage.canGenerate}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block' }}>
              What is the song about? (2–3 sentences) *
            </label>
            <textarea
              value={songDescription}
              onChange={(e) => setSongDescription(e.target.value)}
              placeholder="e.g. This is a Gospel song about trusting God during hard times. It was inspired by my personal journey through loss. The production blends Luganda lyrics with contemporary Afrobeats rhythms."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              disabled={!usage.canGenerate}
            />
          </div>

          {error && <p style={{ color: '#e94560', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || !usage.canGenerate}
            style={{
              background: usage.canGenerate ? '#e94560' : '#333',
              color: usage.canGenerate ? '#fff' : '#666',
              border: 'none', borderRadius: 8, padding: '12px 24px',
              fontSize: 15, fontWeight: 700, cursor: usage.canGenerate ? 'pointer' : 'not-allowed',
              width: '100%',
            }}
          >
            {loading ? '✨ Generating your pitch...' : '✨ Generate Pitch Letter'}
          </button>
        </div>

        {pitch && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Your Pitch — Ready to Send!</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? '#22c55e' : '#e94560', color: '#fff',
                    border: 'none', borderRadius: 6, padding: '6px 14px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !usage.canGenerate}
                  style={{
                    background: '#222', color: '#aaa',
                    border: '1px solid #333', borderRadius: 6, padding: '6px 14px',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div style={{
              background: '#1a1a2e', border: '1px solid #333', borderRadius: 10,
              padding: '20px', fontSize: 14, lineHeight: 1.7, color: '#ddd',
              whiteSpace: 'pre-wrap',
            }}>
              {pitch}
            </div>

            <div style={{ marginTop: 16, padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #222' }}>
              <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>
                <strong style={{ color: '#aaa' }}>How to send this:</strong>
              </p>
              <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
                Copy the pitch above → Open your email or WhatsApp → Paste and send to {gatekeeper.name}.{' '}
                <span style={{ color: '#888' }}>{gatekeeper.contactHint}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
