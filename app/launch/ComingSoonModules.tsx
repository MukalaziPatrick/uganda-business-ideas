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
            className="flex items-center gap-2 rounded-full border border-[#1C3A2A]/20 bg-white/60 px-4 py-2 text-[13px] font-semibold text-[#1C3A2A] transition hover:border-[#F5C842] hover:bg-white"
          >
            <span>{module.emoji}</span>
            {module.label}
            <span className="rounded-full bg-[#F5C842]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1C3A2A]">
              Soon
            </span>
          </button>
        ))}
      </div>
      {noted && (
        <p className="mt-3 text-[13px] font-medium text-[#1C3A2A]/70">
          Noted — we&apos;ll prioritize this. Want it sooner? Mention it in your launch application.
        </p>
      )}
    </div>
  );
}
