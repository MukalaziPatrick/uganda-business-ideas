import { getSafeLandsAppUrl } from "@/lib/land/safelands-app";

export default function SafeLandsAppActions() {
  const appUrl = getSafeLandsAppUrl();

  if (!appUrl) {
    return (
      <p className="mt-4 text-sm text-land-cream/75">
        Full SafeLands app — link coming soon
      </p>
    );
  }

  return (
    <a
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the full SafeLands app (opens in a new tab)"
      className="motion-press mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/60 px-8 py-3 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
    >
      Open the full SafeLands app <span aria-hidden>↗</span>
    </a>
  );
}
