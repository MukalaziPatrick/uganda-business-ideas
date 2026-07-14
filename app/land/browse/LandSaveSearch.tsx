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
      <div className="text-sm text-land-primary font-medium px-4 py-2">
        ✅ Search saved — we&apos;ll WhatsApp you when new listings match
      </div>
    );
  }

  return (
    <div className="px-4 mb-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-land-primary font-medium hover:underline"
        >
          🔔 Get WhatsApp alerts for new listings here
        </button>
      ) : (
        <form onSubmit={handleSave} className="flex gap-2 items-center">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Your WhatsApp number"
            className="flex-1 border border-land-mint/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-land-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-land-primary text-white text-sm font-medium px-4 py-2 rounded-full disabled:opacity-50"
          >
            {loading ? '...' : 'Save'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-land-forest/60 text-sm">✕</button>
        </form>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
