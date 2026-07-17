"use client";

import { useState } from "react";
import Link from "next/link";
import type { BusinessIdea, IdeaBudgetBand } from "@/lib/supabase/ideas-types";

const budgetLabels: Record<IdeaBudgetBand, string> = {
  under_200k: "Under 200k",
  "200k_500k": "200k–500k",
  "500k_2m": "500k–2M",
  above_2m: "Above 2M",
};

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Agriculture: "🌾", Food: "🍽️", Retail: "🛒", Services: "🔧", Digital: "💻",
  };
  return map[category] ?? "💡";
}

function updatedLabel(updatedAt: string): string | null {
  const t = Date.parse(updatedAt);
  if (Number.isNaN(t)) return null;
  return new Date(t).toLocaleDateString("en-UG", { month: "short", year: "numeric" });
}

export default function IdeaCard({ idea }: { idea: BusinessIdea }) {
  const [open, setOpen] = useState(false);
  const panelId = `idea-req-${idea.slug}`;
  const requirements = idea.skills ?? [];
  const updated = updatedLabel(idea.updated_at);

  return (
    <article className="motion-card flex flex-col rounded-2xl border border-brand-beige bg-brand-surface p-4 shadow-sm hover:border-brand-gold">
      <p className="mb-2 text-xs font-semibold text-brand-green">
        {categoryEmoji(idea.category)} {idea.category}
        {idea.budget_band ? ` · ${budgetLabels[idea.budget_band]}` : ""}
      </p>
      <h3 className="mb-1 text-sm font-black leading-snug text-brand-forest">
        <Link
          href={`/ideas/${idea.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          {idea.title}
        </Link>
      </h3>
      <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-brand-green">{idea.description}</p>
      <p className="text-xs font-bold text-brand-forest">{idea.capital}</p>
      {(idea.scoring_demand != null || idea.scoring_ease != null) && (
        <p className="mt-1 text-[11px] font-semibold text-brand-green">
          {idea.scoring_demand != null ? `Demand ${idea.scoring_demand}/10` : ""}
          {idea.scoring_demand != null && idea.scoring_ease != null ? " · " : ""}
          {idea.scoring_ease != null ? `Ease ${idea.scoring_ease}/10` : ""}
        </p>
      )}

      {requirements.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="motion-press mt-3 min-h-11 w-full rounded-lg bg-brand-cream py-2 text-xs font-bold text-brand-forest transition-colors hover:bg-brand-beige/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          What you need ({requirements.length}) {open ? "▴" : "▾"}
        </button>
      )}

      {open && (
        <div id={panelId} className="mt-3 rounded-xl bg-brand-cream/60 p-3">
          <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-brand-forest">
            {requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-bold text-brand-forest">Capital: {idea.capital}</p>
          {updated && <p className="mt-1 text-[11px] text-brand-green">Updated {updated}</p>}
          <p className="mt-1 text-[11px] italic text-brand-green">
            Research estimate — not a guaranteed price.
          </p>
          <Link
            href={`/ideas/${idea.slug}`}
            className="mt-2 inline-block text-xs font-bold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            View full guide →
          </Link>
        </div>
      )}
    </article>
  );
}
