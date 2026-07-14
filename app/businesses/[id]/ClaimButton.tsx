"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function ClaimButton({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    if (!contact.trim()) return setError("Please enter a phone or WhatsApp number.");

    setSubmitting(true);
    setError("");

    const digits = contact.replace(/\D/g, "");
    const { error: sbError } = await getSupabase().from("business_claims").insert({
      business_id: businessId,
      claimant_name: name.trim(),
      claimant_phone: digits,
      claimant_whatsapp: digits,
      role: role.trim() || null,
    });

    setSubmitting(false);
    if (sbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-brand-forest bg-white py-3 text-sm font-bold text-brand-forest"
      >
        Is this your business? Claim it and confirm contacts
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-brand-beige bg-white p-4">
      {submitted ? (
        <div className="py-4 text-center">
          <p className="mb-2 text-3xl">OK</p>
          <h3
            className="mb-1 text-base font-black text-brand-forest"
            style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}
          >
            Claim submitted!
          </h3>
          <p className="text-xs leading-relaxed text-brand-green">
            We&apos;ll reach out to you on WhatsApp or by phone within 24-48 hours to verify
            and hand over {businessName}. After approval, you can confirm or correct the
            public contact numbers yourself.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-sm font-bold text-brand-forest">Claim {businessName}</p>
            <p className="mt-0.5 text-xs text-brand-green">
              We&apos;ll verify by phone or WhatsApp before handing over the listing -
              usually within 24-48 hours. Once approved, you can update the WhatsApp and
              call numbers shown to customers.
            </p>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div>
            <label className="mb-1 block text-xs font-bold text-brand-green">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-brand-beige bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-forest"
              placeholder="e.g. Sarah Nakato"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-brand-green">
              Phone or WhatsApp number we should verify
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-lg border border-brand-beige bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-forest"
              placeholder="e.g. 0772 123 456"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-brand-green">
              Your role (optional)
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-brand-beige bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-forest"
              placeholder="e.g. Owner, Manager"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-brand-beige py-2.5 text-sm font-bold text-brand-green"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-forest py-2.5 text-sm font-bold text-brand-gold disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit claim"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
