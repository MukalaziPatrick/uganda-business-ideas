'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function LandSaveSearch() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/land/save-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_phone: phone,
        district: searchParams.get('district'),
        land_type: searchParams.get('land_type'),
        intended_use: searchParams.get('intended_use'),
        price_max: searchParams.get('price_max'),
        size_min: searchParams.get('size_min'),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      setError('Could not save. Try again.');
      return;
    }
    setSaved(true);
    setOpen(false);
  }

  if (saved) {
    return (
      <div aria-live="polite" className="px-4 py-2 text-sm font-medium text-land-primary">
        ✅ Search saved — we&apos;ll WhatsApp you when new listings match
      </div>
    );
  }

  return (
    <div className="px-4 mb-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 w-full items-center text-left text-sm font-medium text-land-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary sm:w-auto"
        >
          🔔 Get WhatsApp alerts for new listings here
        </button>
      ) : (
        <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Your WhatsApp number"
            aria-label="WhatsApp number for land alerts"
            className="min-h-11 min-w-0 flex-[1_1_190px] rounded-full border border-land-mint/50 px-4 text-sm focus:outline-none focus:border-land-primary focus:ring-2 focus:ring-land-secondary/50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-full bg-land-primary px-4 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary"
          >
            {loading ? '...' : 'Save'}
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cancel saving this search" className="min-h-11 min-w-11 rounded-full text-sm text-land-forest/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-secondary">✕</button>
        </form>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
