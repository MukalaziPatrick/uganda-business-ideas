export default function EstimateDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-3 text-[12.5px] leading-relaxed text-brand-forest ${className}`}
    >
      <span className="font-bold">Estimates, not promises:</span> figures shown are
      research estimates, not guaranteed prices or income. Location, supplier, season,
      exchange rate, and negotiation can change them.
    </p>
  );
}
