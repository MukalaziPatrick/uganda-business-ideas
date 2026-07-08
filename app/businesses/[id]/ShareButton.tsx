"use client";

export default function ShareButton({ name }: { name: string }) {
  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: name, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        }
      }}
      className="w-full rounded-xl bg-brand-cream border border-gray-200 py-3 text-sm font-bold text-brand-forest"
    >
      🔗 Share this business
    </button>
  );
}
