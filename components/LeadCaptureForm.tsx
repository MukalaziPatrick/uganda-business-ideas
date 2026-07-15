"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { LEAD_FORM_URL } from "@/lib/site";
import { buildLeadCaptureMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

type LeadCaptureFormProps = {
  defaultBusinessInterest?: string;
};

export default function LeadCaptureForm({
  defaultBusinessInterest = "",
}: LeadCaptureFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "saved" | "fallback"
  >("idle");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    budget: "",
    businessInterest: defaultBusinessInterest,
    timeline: "",
    notes: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function runFallback() {
    if (LEAD_FORM_URL) {
      window.location.href = LEAD_FORM_URL;
      return;
    }

    const message = buildLeadCaptureMessage(form);
    window.location.href = buildWhatsAppUrl({ message });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackEvent("lead_form_submit", {
      has_external_form: Boolean(LEAD_FORM_URL),
      budget: form.budget,
      business_interest: form.businessInterest,
      timeline: form.timeline,
    });

    setSubmitStatus("submitting");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: "start_page",
        }),
      });

      if (response.ok) {
        setSubmitStatus("saved");
        return;
      }
    } catch {
      // Keep the existing WhatsApp/external form flow available if storage fails.
    }

    setSubmitStatus("fallback");
    runFallback();
  }

  const inputClass =
    "w-full rounded-xl border border-brand-beige bg-white px-4 py-3 text-[14px] text-brand-ink outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30";
  const labelClass = "text-[12px] font-bold uppercase tracking-[0.12em] text-brand-green/80";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-beige bg-white p-5 shadow-sm sm:p-6">
      {LEAD_FORM_URL && (
        <div className="mb-5 rounded-xl border border-brand-green/20 bg-brand-cream px-4 py-3">
          <p className="text-[13px] font-semibold text-brand-ink">
            Lead collection is connected to an external form.
          </p>
          <p className="mt-1 text-[12.5px] text-brand-forest">
            Submit below to continue to the configured form.
          </p>
        </div>
      )}

      {submitStatus === "saved" && (
        <div className="mb-5 rounded-xl border border-brand-green/20 bg-brand-cream px-4 py-3">
          <p className="text-[13px] font-semibold text-brand-ink">
            Your request has been received.
          </p>
          <p className="mt-1 text-[12.5px] text-brand-forest">
            UBI will use your details to understand the help you need before replying.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Name</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your name"
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Phone / WhatsApp</span>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="+256..."
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Location</span>
          <input
            className={inputClass}
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Kampala, Gulu, Mbarara..."
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Budget</span>
          <select
            className={inputClass}
            value={form.budget}
            onChange={(event) => updateField("budget", event.target.value)}
          >
            <option value="">Select budget</option>
            <option value="Under UGX 200,000">Under UGX 200,000</option>
            <option value="UGX 200,000 - 500,000">UGX 200,000 - 500,000</option>
            <option value="UGX 500,000 - 2,000,000">UGX 500,000 - 2,000,000</option>
            <option value="Above UGX 2,000,000">Above UGX 2,000,000</option>
          </select>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Business interest</span>
          <input
            className={inputClass}
            value={form.businessInterest}
            onChange={(event) => updateField("businessInterest", event.target.value)}
            placeholder="Poultry, chapati, mobile money..."
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Timeline</span>
          <select
            className={inputClass}
            value={form.timeline}
            onChange={(event) => updateField("timeline", event.target.value)}
          >
            <option value="">Select timeline</option>
            <option value="Immediately">Immediately</option>
            <option value="Within 30 days">Within 30 days</option>
            <option value="Within 3 months">Within 3 months</option>
            <option value="Still researching">Still researching</option>
          </select>
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Notes</span>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Tell us what you already have, what you need, or what is confusing."
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitStatus === "submitting" || submitStatus === "saved"}
        className="mt-5 inline-flex w-full justify-center rounded-xl bg-brand-green px-5 py-3 text-[14px] font-black text-white shadow-sm shadow-brand-green/20 transition hover:bg-brand-forest active:scale-95 sm:w-auto"
      >
        {submitStatus === "submitting"
          ? "Sending request..."
          : submitStatus === "saved"
            ? "Request received"
            : LEAD_FORM_URL
              ? "Continue to lead form"
              : "Send request on WhatsApp"}
      </button>
    </form>
  );
}
