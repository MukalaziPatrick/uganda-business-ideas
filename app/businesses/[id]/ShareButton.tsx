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
      className="w-full rounded-xl bg-[#f5f0e8] border border-gray-200 py-3 text-sm font-bold text-[#1C3A2A]"
    >
      🔗 Share this business
    </button>
  );
}
