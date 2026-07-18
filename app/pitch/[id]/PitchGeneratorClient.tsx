'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Gatekeeper } from '@/app/data/gatekeepers';
import { GATEKEEPER_TYPE_LABELS } from '@/app/data/gatekeepers';

const FREE_LIMIT = 3;
const inputClass =
  'mt-1 w-full rounded-xl border border-brand-beige bg-brand-surface px-4 py-3 text-sm text-brand-forest outline-none placeholder:text-brand-green/45 focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/10 disabled:opacity-60';
const labelClass = 'block text-[13px] font-bold text-brand-forest';

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

  const remainingPitches = Math.max(0, FREE_LIMIT - usage.count);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-forest">
      <header className="border-b border-brand-forest/10 bg-brand-forest px-6 py-7 text-brand-cream">
        <div className="mx-auto max-w-3xl">
          <Link href="/pitch" className="text-sm font-semibold text-brand-cream/70 hover:text-brand-cream">
            ← Back to Directory
          </Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-brand-cream">
            Pitch to: {gatekeeper.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-gold px-2.5 py-1 text-[11px] font-black text-brand-forest">
              {GATEKEEPER_TYPE_LABELS[gatekeeper.type]}
            </span>
            <span className="text-[13px] text-brand-cream/70">{gatekeeper.location}</span>
            <span className="text-[13px] text-brand-cream/85">· {gatekeeper.genres.join(', ')}</span>
          </div>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-brand-cream/75">{gatekeeper.description}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {usage.loaded && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-[13px] font-semibold ${
              usage.canGenerate
                ? 'border-brand-beige bg-brand-surface text-brand-green'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {usage.isPro
              ? '⭐ Pro Plan — Unlimited pitch letters'
              : usage.canGenerate
                ? `🎁 Free plan: ${remainingPitches} of ${FREE_LIMIT} pitches remaining this month`
                : '🔒 You\'ve used all 3 free pitches this month. Upgrade to Pro for UGX 30,000/mo for unlimited pitches.'}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {[
            { label: 'Song Title *', value: songTitle, onChange: setSongTitle, placeholder: 'e.g. Mukama Ayinza' },
            { label: 'Your Artist Name *', value: artistName, onChange: setArtistName, placeholder: 'e.g. Isaac Ssemwanga' },
            { label: 'Genre *', value: genre, onChange: setGenre, placeholder: 'e.g. Gospel / Luganda' },
            { label: 'Music Link (YouTube, Spotify, SoundCloud) *', value: musicLink, onChange: setMusicLink, placeholder: 'https://...' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
                disabled={!usage.canGenerate}
              />
            </div>
          ))}

          <div>
            <label className={labelClass}>What is the song about? (2–3 sentences) *</label>
            <textarea
              value={songDescription}
              onChange={(e) => setSongDescription(e.target.value)}
              placeholder="e.g. This is a Gospel song about trusting God during hard times. It was inspired by my personal journey through loss. The production blends Luganda lyrics with contemporary Afrobeats rhythms."
              rows={4}
              className={`${inputClass} resize-y`}
              disabled={!usage.canGenerate}
            />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || !usage.canGenerate}
            className="motion-press w-full rounded-xl bg-brand-gold px-6 py-3 text-[15px] font-black text-brand-forest transition hover:brightness-95 disabled:bg-brand-beige disabled:text-brand-green"
          >
            {loading ? '✨ Generating your pitch...' : '✨ Generate Pitch Letter'}
          </button>
        </div>

        {pitch && (
          <section className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-black text-brand-forest">Your Pitch — Ready to Send!</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`rounded-lg px-4 py-2 text-[13px] font-bold ${
                    copied ? 'bg-brand-forest text-white' : 'bg-brand-gold text-brand-forest'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !usage.canGenerate}
                  className="rounded-lg border border-brand-beige bg-brand-surface px-4 py-2 text-[13px] font-bold text-brand-green disabled:opacity-50"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap rounded-2xl border border-brand-beige bg-brand-surface p-5 text-sm leading-7 text-brand-forest shadow-sm">
              {pitch}
            </div>

            <div className="mt-4 rounded-2xl border border-brand-beige bg-brand-surface p-4">
              <p className="mb-1 text-xs font-black text-brand-forest">How to send this:</p>
              <p className="text-xs leading-relaxed text-brand-green">
                Copy the pitch above → Open your email or WhatsApp → Paste and send to {gatekeeper.name}.{' '}
                <span>{gatekeeper.contactHint}</span>
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
