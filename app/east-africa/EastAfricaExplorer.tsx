"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  filterOpportunitySignals,
  type CountryCode,
  type EastAfricaCatalog,
  type ResearchPriority,
} from "@/lib/east-africa/catalog";

type EastAfricaExplorerProps = {
  catalog: EastAfricaCatalog;
};

const PRIORITIES: Array<"All" | ResearchPriority> = [
  "All",
  "High",
  "Medium",
  "Low",
];

export default function EastAfricaExplorer({
  catalog,
}: EastAfricaExplorerProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>("uganda");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<"All" | ResearchPriority>("All");

  const country =
    catalog.countries.find((item) => item.code === countryCode) ??
    catalog.countries[0];

  const opportunities = useMemo(
    () => filterOpportunitySignals(country.opportunities, { query, priority }),
    [country.opportunities, priority, query],
  );

  const selectCountry = (code: CountryCode) => {
    setCountryCode(code);
    setQuery("");
    setPriority("All");
  };

  const clearFilters = () => {
    setQuery("");
    setPriority("All");
  };

  return (
    <div className="motion-page min-h-screen bg-brand-cream text-brand-forest">
      <header className="relative overflow-hidden border-b border-brand-gold/30 bg-brand-forest px-4 py-10 text-brand-cream sm:py-14">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #F5C842 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div aria-hidden className="absolute -right-12 top-4 h-48 w-48 rounded-full border-[28px] border-brand-gold/15" />
        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/apps"
            className="inline-flex min-h-11 items-center text-xs font-bold text-brand-gold underline decoration-brand-gold/50 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            ← Everything on Business Yoo
          </Link>
          <div className="mt-5 max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-gold">
              Regional field desk · Research edition
            </p>
            <h1
              className="mt-3 text-4xl font-black leading-[1.02] text-white sm:text-6xl"
              style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}
            >
              East Africa
              <span className="block text-brand-gold">Opportunity Atlas</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-cream/80 sm:text-base">
              Compare commercial hubs, opportunity signals, and public starting
              sources across Uganda, Kenya, Tanzania, and Rwanda—without
              confusing research with live listings.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:py-10">
        <section
          aria-label="Choose a country"
          className="grid grid-cols-2 gap-2 rounded-[1.75rem] border border-brand-beige bg-brand-surface p-2 shadow-sm shadow-brand-forest/5 sm:grid-cols-4"
        >
          {catalog.countries.map((item) => {
            const selected = item.code === country.code;
            return (
              <button
                key={item.code}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCountry(item.code)}
                className={`motion-press min-h-14 rounded-2xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
                  selected
                    ? "bg-brand-forest text-white shadow-md"
                    : "text-brand-forest hover:bg-brand-cream"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-black">
                  <span aria-hidden className="text-xl">
                    {item.flag}
                  </span>
                  {item.name}
                </span>
                <span
                  className={`mt-1 block text-[10px] font-bold uppercase tracking-wide ${
                    selected ? "text-brand-gold" : "text-brand-green"
                  }`}
                >
                  {item.coverage === "home_market"
                    ? "Home market"
                    : "Research preview"}
                </span>
              </button>
            );
          })}
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-brand-beige bg-brand-surface shadow-sm shadow-brand-forest/5">
          <div className="grid gap-6 border-b border-brand-beige p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl" aria-hidden>
                  {country.flag}
                </span>
                <h2
                  className="text-2xl font-black text-brand-forest sm:text-3xl"
                  style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}
                >
                  {country.name} desk
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                    country.coverage === "home_market"
                      ? "bg-brand-gold text-brand-forest"
                      : "border border-brand-beige bg-brand-cream text-brand-green"
                  }`}
                >
                  {country.coverage === "home_market"
                    ? "Home market"
                    : "Research preview"}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-green">
                Planning signals, not live listings. This view comes from
                Business Yoo&apos;s checked-in regional research. Verify providers,
                rules, prices, and availability before acting.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                [country.hubs.length, "Hubs"],
                [country.opportunities.length, "Signals"],
                [country.sources.length, "Sources"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-brand-cream px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-green">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-lg font-black text-brand-forest">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <label className="text-xs font-black text-brand-forest">
                Search opportunity signals
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try logistics, agriculture, Nairobi…"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-beige bg-white px-3.5 text-sm font-medium outline-none placeholder:text-brand-green/60 focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/50"
                />
              </label>
              <label className="text-xs font-black text-brand-forest">
                Research priority
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as "All" | ResearchPriority)
                  }
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-beige bg-white px-3.5 text-sm font-bold outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-gold/50"
                >
                  {PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All priorities" : item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-brand-beige pb-4">
              <p className="text-xs font-semibold text-brand-green">
                {opportunities.length} of {country.opportunities.length}{" "}
                opportunity signals
              </p>
              {(query || priority !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 items-center text-xs font-black text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="hubs-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
                Where activity concentrates
              </p>
              <h2 id="hubs-heading" className="mt-1 text-xl font-black text-brand-forest">
                Commercial hubs
              </h2>
            </div>
            <span aria-hidden className="text-3xl">
              🧭
            </span>
          </div>
          {country.hubs.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-brand-beige bg-brand-surface p-6 text-sm text-brand-green">
              No commercial hubs are recorded for this preview yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {country.hubs.map((hub) => (
                <article
                  key={`${hub.country}-${hub.city}`}
                  className="motion-card rounded-2xl border border-brand-beige bg-brand-surface p-4 shadow-sm shadow-brand-forest/5 hover:border-brand-gold"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-brand-forest">{hub.city}</h3>
                      <p className="mt-0.5 text-xs font-bold text-brand-green">
                        {hub.commercialRole}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-gold px-2 py-1 text-[10px] font-black text-brand-forest">
                      {hub.priorityScore}/10
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-brand-green">
                    {hub.whyItMatters}
                  </p>
                  <p className="mt-3 border-t border-brand-beige pt-3 text-[11px] font-semibold leading-5 text-brand-forest">
                    First research: {hub.firstCategoriesToResearch}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="signals-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
                Problems worth investigating
              </p>
              <h2 id="signals-heading" className="mt-1 text-xl font-black text-brand-forest">
                Opportunity signals
              </h2>
            </div>
            <span aria-hidden className="text-3xl">
              📌
            </span>
          </div>
          {opportunities.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-12 text-center">
              <p className="text-sm font-black text-brand-forest">
                No opportunity signals match these filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand-forest px-4 text-xs font-black text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {opportunities.map((signal) => (
                <article
                  key={`${signal.country}-${signal.city}-${signal.businessCategory}-${signal.subcategory}`}
                  className="rounded-2xl border border-brand-beige bg-brand-surface p-4 shadow-sm shadow-brand-forest/5 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-forest px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-brand-gold">
                      {signal.researchPriority} priority
                    </span>
                    <span className="text-[11px] font-bold text-brand-green">
                      {signal.city} · {signal.businessType}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black leading-snug text-brand-forest">
                    {signal.businessCategory}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-brand-green">
                    {signal.subcategory}
                  </p>
                  <div className="mt-3 rounded-xl border-l-4 border-brand-gold bg-brand-cream px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-brand-green">
                      App opportunity
                    </p>
                    <p className="mt-1 text-sm font-bold leading-5 text-brand-forest">
                      {signal.appOpportunity}
                    </p>
                  </div>
                  <details className="group mt-3 border-t border-brand-beige pt-2">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-xs font-black text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold [&::-webkit-details-marker]:hidden">
                      Why this is a signal
                      <span aria-hidden className="text-brand-green transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="pb-2 text-xs leading-5 text-brand-green">
                      <p>
                        <strong className="text-brand-forest">Problem:</strong>{" "}
                        {signal.problem}
                      </p>
                      <p className="mt-2">
                        <strong className="text-brand-forest">Who feels it:</strong>{" "}
                        {signal.targetCustomer}
                      </p>
                      <p className="mt-2">
                        <strong className="text-brand-forest">Research trail:</strong>{" "}
                        {signal.sourcesToSearch}
                      </p>
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                        Planning signal — verify before acting.
                      </p>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="sources-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
                Where verification can begin
              </p>
              <h2 id="sources-heading" className="mt-1 text-xl font-black text-brand-forest">
                Public starting sources
              </h2>
            </div>
            <span aria-hidden className="text-3xl">
              🔎
            </span>
          </div>
          {country.sources.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-brand-beige bg-brand-surface p-6 text-sm text-brand-green">
              No starting sources are recorded for this preview yet.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-brand-beige bg-brand-surface">
              {country.sources.map((source, index) => {
                const hasExternalUrl = source.urlOrSearchQuery.startsWith("https://");
                return (
                  <article
                    key={`${source.country}-${source.sourceName}`}
                    className={`grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center ${
                      index > 0 ? "border-t border-brand-beige" : ""
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-brand-forest">
                          {source.sourceName}
                        </h3>
                        {source.country === "Regional" && (
                          <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-green">
                            Regional
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-brand-green">
                        {source.dataType} · {source.updateFrequency} review ·{" "}
                        {source.collectionMode}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-brand-green/80">
                        {source.notes}
                      </p>
                    </div>
                    {hasExternalUrl ? (
                      <a
                        href={source.urlOrSearchQuery}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="motion-press inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-forest px-4 text-xs font-black text-brand-forest transition-colors hover:bg-brand-forest hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      >
                        External source ↗
                      </a>
                    ) : (
                      <p className="rounded-xl bg-brand-cream px-3 py-2 text-[11px] font-semibold text-brand-green sm:max-w-52">
                        Search guidance: {source.urlOrSearchQuery}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[2rem] bg-brand-forest p-6 text-brand-cream sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-gold">
              Connect the signal to supply
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              See what Business Yoo is verifying next.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-cream/75">
              The Supplier Network shows categories in the verification queue—not
              invented businesses or untested contacts.
            </p>
          </div>
          <Link
            href="/suppliers"
            className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-gold px-5 text-sm font-black text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-forest sm:mt-0"
          >
            Open Supplier Network →
          </Link>
        </section>
      </main>
    </div>
  );
}
