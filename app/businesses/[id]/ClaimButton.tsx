"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function ClaimButton({ businessId, businessName }: { businessId: string; businessName: string }) {
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
        className="w-full rounded-xl bg-white border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]"
      >
        🏷️ Is this your business? Claim it
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      {submitted ? (
        <div className="text-center py-4">
          <p className="text-3xl mb-2">✅</p>
          <h3 className="text-base font-black text-[#1C3A2A] mb-1" style={{ fontFamily: "Georgia, serif" }}>
            Claim submitted!
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We'll reach out to you on WhatsApp or by phone within 24–48 hours to verify and hand over {businessName}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-sm font-bold text-[#1C3A2A]">Claim {businessName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              We'll verify by phone or WhatsApp before handing over the listing — usually within 24–48 hours.
            </p>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white"
              placeholder="e.g. Sarah Nakato"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Phone or WhatsApp number</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white"
              placeholder="e.g. 0772 123 456"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Your role (optional)</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white"
              placeholder="e.g. Owner, Manager"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#1C3A2A] py-2.5 text-sm font-bold text-[#F5C842] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
