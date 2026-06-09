'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckForm() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/land/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? 'Payment failed. Try again or use WhatsApp.');
      return;
    }

    // Redirect to Pesapal hosted payment page
    window.location.href = data.redirect_url;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your mobile money number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. 0772000000"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2d6a4f]"
          required
        />
        <p className="text-xs text-gray-400 mt-1">MTN or Airtel — choose on the next screen</p>
      </div>

      {error && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          <a
            href={`https://wa.me/256700000000?text=${encodeURIComponent('Hi, I want to do an assisted land check. My phone is ' + phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] text-sm font-medium hover:bg-[#f0faf4]"
          >
            📲 Pay via WhatsApp instead
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !phone.trim()}
        className="w-full bg-[#2d6a4f] text-white font-semibold py-4 rounded-xl hover:bg-[#235840] transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirecting to payment...' : 'Pay UGX 10,000 — Get 24hr Access'}
      </button>
    </form>
  );
}

export default function LandCheckPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        <Link href="/land" className="text-sm text-[#2d6a4f] hover:underline">← Back to Land</Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Assisted Land Check
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            A certified agent will verify this property and contact you within 24 hours.
          </p>

          <div className="bg-[#f0faf4] rounded-2xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-[#2d6a4f] uppercase tracking-wide mb-2">What you get</p>
            {[
              '✅ Title check via MLHUD portal',
              '📋 Surveyor verification status',
              '🗺 Site visit confirmation',
              '📲 WhatsApp updates from agent',
              '⏰ 24-hour access window',
            ].map(item => (
              <p key={item} className="text-sm text-gray-700">{item}</p>
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl font-bold text-[#2d6a4f]">UGX 10,000</span>
            <span className="text-gray-500 text-sm ml-2">/ 24 hours</span>
          </div>

          <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading...</div>}>
            <CheckForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
