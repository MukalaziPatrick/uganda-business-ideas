"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Supplier, SupplierCategory } from "@/app/data/suppliers";
import SupplierCard from "@/components/SupplierCard";
import {
  deriveSupplierCategories,
  filterSuppliers,
} from "@/lib/suppliers/filtering";

type SupplierDirectoryClientProps = {
  suppliers: Supplier[];
};

export default function SupplierDirectoryClient({
  suppliers,
}: SupplierDirectoryClientProps) {
  const [category, setCategory] = useState<"All" | SupplierCategory>("All");
  const categories = useMemo(
    () => deriveSupplierCategories(suppliers),
    [suppliers],
  );
  const filteredSuppliers = useMemo(
    () => filterSuppliers(suppliers, category),
    [category, suppliers],
  );

  return (
    <div className="motion-page min-h-screen bg-brand-cream text-brand-forest">
      <header className="relative overflow-hidden bg-brand-forest px-4 py-10 text-brand-cream sm:py-14">
        <div aria-hidden className="absolute -left-20 top-8 h-56 w-56 rotate-12 rounded-[3rem] border-[32px] border-brand-gold/10" />
        <div aria-hidden className="absolute -right-8 -top-12 h-52 w-52 rounded-full bg-brand-green/70 blur-2xl" />
        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/apps"
            className="inline-flex min-h-11 items-center text-xs font-bold text-brand-gold underline decoration-brand-gold/50 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            ← Everything on Business Yoo
          </Link>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-gold">
                Verification desk preview
              </p>
              <h1
                className="mt-3 text-4xl font-black leading-[1.02] text-white sm:text-6xl"
                style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}
              >
                Suppliers
                <span className="block text-brand-gold">&amp; Wholesale</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-cream/80 sm:text-base">
                See the supply categories Business Yoo is preparing to verify,
                with contact details kept private until the trust checks are done.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-brand-gold/20 bg-white/5 p-3 backdrop-blur-sm">
              <div className="rounded-xl bg-brand-gold p-3 text-brand-forest">
                <p className="text-2xl font-black">{suppliers.length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide">
                  Verification slots
                </p>
              </div>
              <div className="rounded-xl bg-brand-cream p-3 text-brand-forest">
                <p className="text-2xl font-black">
                  {suppliers.filter((item) => item.contactStatus === "verified").length}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide">
                  Contacts cleared
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:py-10">
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:p-6">
          <div className="flex gap-3">
            <span aria-hidden className="mt-0.5 text-xl">
              🛡️
            </span>
            <div>
              <h2 className="text-sm font-black">What this preview means</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                These are supplier categories Business Yoo is preparing to
                verify—not recommended businesses. Contact details stay hidden
                until the owner, location, offer, and phone or WhatsApp have been
                checked.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-brand-beige bg-brand-surface p-4 shadow-sm shadow-brand-forest/5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
                Browse the verification queue
              </p>
              <h2 className="mt-1 text-xl font-black text-brand-forest">
                Supplier categories
              </h2>
            </div>
            <p className="text-xs font-semibold text-brand-green">
              {filteredSuppliers.length}{" "}
              verification {filteredSuppliers.length === 1 ? "slot" : "slots"} shown
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter supplier categories">
            {(["All", ...categories] as Array<"All" | SupplierCategory>).map(
              (item) => {
                const selected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item)}
                    className={`motion-press min-h-11 rounded-full px-4 text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
                      selected
                        ? "bg-brand-forest text-brand-gold"
                        : "border border-brand-beige bg-white text-brand-forest hover:border-brand-gold"
                    }`}
                  >
                    {item === "All" ? "All categories" : item}
                  </button>
                );
              },
            )}
          </div>
        </section>

        {filteredSuppliers.length === 0 ? (
          <section className="mt-5 rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-14 text-center">
            <p className="text-3xl" aria-hidden>
              📦
            </p>
            <p className="mt-3 text-sm font-black text-brand-forest">
              No supplier category matches this filter.
            </p>
          </section>
        ) : (
          <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="Supplier verification slots">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                contextLabel="the Supplier Network directory"
              />
            ))}
          </section>
        )}

        <section className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-brand-beige bg-brand-surface p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
              Know a real supplier?
            </p>
            <h2 className="mt-2 text-lg font-black text-brand-forest">
              Help move a slot toward verification.
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-green">
              Business Yoo checks the business name, owner contact, operating
              area, offer, and permission to publish.
            </p>
            <Link
              href="/advertise"
              className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-forest px-4 text-xs font-black text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              List or verify a supplier →
            </Link>
          </div>
          <div className="rounded-[1.75rem] bg-brand-gold p-5 text-brand-forest sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-green">
              Start from the market signal
            </p>
            <h2 className="mt-2 text-lg font-black">
              Compare opportunities across four countries.
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-green">
              The regional atlas shows where supplier, logistics, professional
              service, and tender needs are worth researching next.
            </p>
            <Link
              href="/east-africa"
              className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-forest px-4 text-xs font-black text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
            >
              Explore regional opportunities →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
