"use client";

import { useState } from "react";

const MODULES = [
  { id: "registration", label: "Business Registration", emoji: "📋" },
  { id: "compliance", label: "Tax & Compliance", emoji: "🧾" },
  { id: "payments", label: "Payments Setup", emoji: "💳" },
  { id: "banking", label: "Business Banking", emoji: "🏦" },
] as const;

export default function ComingSoonModules() {
  const [noted, setNoted] = useState<string | null>(null);

  function handleClick(moduleId: string) {
    setNoted(moduleId);
    void fetch("/api/launch/module-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: moduleId }),
    }).catch(() => {
      // Demand logging must never break the page.
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => handleClick(module.id)}
            className="flex items-center gap-2 rounded-full border border-brand-forest/20 bg-white/60 px-4 py-2 text-[13px] font-semibold text-brand-forest transition hover:border-brand-gold hover:bg-white"
          >
            <span>{module.emoji}</span>
            {module.label}
            <span className="rounded-full bg-brand-gold/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-forest">
              Soon
            </span>
          </button>
        ))}
      </div>
      {noted && (
        <p className="mt-3 text-[13px] font-medium text-brand-forest/70">
          Noted — we&apos;ll prioritize this. Want it sooner? Mention it in your launch application.
        </p>
      )}
    </div>
  );
}
