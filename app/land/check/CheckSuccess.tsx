'use client';
export function CheckSuccess({ phone, listingTitle }: { phone: string; listingTitle?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-land-ink mb-2">Payment received!</h2>
      <p className="text-land-forest/85 mb-4">
        Your 24-hour assisted check for{listingTitle ? ` "${listingTitle}"` : ' this land'} is now active.
      </p>
      <p className="text-land-forest/75 text-sm mb-6">
        An agent will contact you on <strong>{phone}</strong> via WhatsApp shortly.
      </p>
      <a
        href={`https://wa.me/256700000000?text=${encodeURIComponent('Hi, I just paid for an assisted land check.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-land-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-land-forest transition-colors"
      >
        📲 Open WhatsApp
      </a>
    </div>
  );
}
