"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_SKILLS, UGANDA_DISTRICTS, EDUCATION_LEVELS, LANGUAGES, JOB_TYPES, PAY_PERIODS } from "@/lib/constants/skills";

const OPTIONAL_FIELDS = [
  { key: "pay",           label: "Pay amount & period" },
  { key: "job_type",      label: "Job type (Permanent / Casual / Contract)" },
  { key: "gender_pref",   label: "Gender preference" },
  { key: "min_education", label: "Minimum education" },
  { key: "accommodation", label: "Accommodation provided" },
  { key: "food_provided", label: "Food provided" },
  { key: "languages",     label: "Languages required" },
  { key: "description",   label: "Additional description" },
];

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>{label}</span>
        <span>Step {current} of {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#e0d8cc] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1C3A2A] transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function PostJobForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enabledOptionals, setEnabledOptionals] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", skill_category: "", district: "", town: "", employer_name: "",
    contact_whatsapp: "", contact_phone: "", contact_walkin: "",
    pay_amount: "", pay_period: "", job_type: "", gender_pref: "",
    min_education: "", accommodation: "", food_provided: "",
    languages: [] as string[], description: "",
  });

  function toggle(field: string) {
    setEnabledOptionals(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }

  function set(field: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.contact_whatsapp && !form.contact_phone && !form.contact_walkin) {
      setError("Please provide at least one contact method.");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      title: form.title, skill_category: form.skill_category,
      district: form.district, town: form.town || undefined,
      employer_name: form.employer_name,
      contact_whatsapp: form.contact_whatsapp || undefined,
      contact_phone: form.contact_phone || undefined,
      contact_walkin: form.contact_walkin || undefined,
    };
    if (enabledOptionals.includes("pay")) { payload.pay_amount = form.pay_amount; payload.pay_period = form.pay_period; }
    if (enabledOptionals.includes("job_type"))      payload.job_type      = form.job_type;
    if (enabledOptionals.includes("gender_pref"))   payload.gender_pref   = form.gender_pref;
    if (enabledOptionals.includes("min_education")) payload.min_education = form.min_education;
    if (enabledOptionals.includes("accommodation")) payload.accommodation = form.accommodation;
    if (enabledOptionals.includes("food_provided")) payload.food_provided = form.food_provided;
    if (enabledOptionals.includes("languages"))     payload.languages     = form.languages;
    if (enabledOptionals.includes("description"))   payload.description   = form.description;

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl bg-white border border-[#e0d8cc] p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Job Posted!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your job listing is live. Workers across Uganda can now find and contact you.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("I just posted a job on Uganda Business Hub! Find work here: https://ugandabiz.com/jobs")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white text-center"
            >
              📲 Share on WhatsApp
            </a>
            <button
              onClick={() => router.push("/jobs")}
              className="rounded-xl border border-[#e0d8cc] py-3 text-sm font-bold text-[#1C3A2A]"
            >
              View All Jobs →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-black text-slate-900 mb-1">Post a Job</h1>
      <p className="text-sm text-slate-500 mb-8">Free to post. Goes live after review.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <ProgressBar current={1} total={2} label="Job Details" />
        <div>
          <label className={labelCls}>Job Title *</label>
          <input required maxLength={60} value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="e.g. Experienced Carpenter Needed" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Skill Category *</label>
          <select required value={form.skill_category} onChange={e => set("skill_category", e.target.value)} className={inputCls}>
            <option value="">Select a skill...</option>
            {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>District *</label>
            <select required value={form.district} onChange={e => set("district", e.target.value)} className={inputCls}>
            <option value="">Select district...</option>
            {UGANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Town / Stage / Area</label>
            <input value={form.town} onChange={e => set("town", e.target.value)}
              placeholder="e.g. Bwaise, Nakawa" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Your Name / Business Name *</label>
          <input required value={form.employer_name} onChange={e => set("employer_name", e.target.value)}
            placeholder="e.g. Mukalazi Hardware" className={inputCls} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">Contact Method * (at least one)</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input type="tel" value={form.contact_whatsapp} onChange={e => set("contact_whatsapp", e.target.value)}
                placeholder="256700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)}
                placeholder="0700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Walk-in Address</label>
              <input value={form.contact_walkin} onChange={e => set("contact_walkin", e.target.value)}
                placeholder="e.g. Plot 5, Kampala Road, Nakawa" className={inputCls} />
            </div>
          </div>
        </div>
        <ProgressBar current={2} total={2} label="Optional Details" />
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-semibold text-violet-800 mb-3">Add optional details (tick what you want to show)</p>
          <div className="flex flex-col gap-2">
            {OPTIONAL_FIELDS.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={enabledOptionals.includes(f.key)}
                  onChange={() => toggle(f.key)}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                <span className="text-sm text-slate-700">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
        {enabledOptionals.includes("pay") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Pay Amount (UGX)</label>
              <input type="number" value={form.pay_amount} onChange={e => set("pay_amount", e.target.value)}
                placeholder="e.g. 80000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pay Period</label>
              <select value={form.pay_period} onChange={e => set("pay_period", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {PAY_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {enabledOptionals.includes("job_type") && (
          <div>
            <label className={labelCls}>Job Type</label>
            <select value={form.job_type} onChange={e => set("job_type", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              {JOB_TYPES.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("gender_pref") && (
          <div>
            <label className={labelCls}>Gender Preference</label>
            <select value={form.gender_pref} onChange={e => set("gender_pref", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="any">No preference</option>
              <option value="male">Male preferred</option>
              <option value="female">Female preferred</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("min_education") && (
          <div>
            <label className={labelCls}>Minimum Education</label>
            <select value={form.min_education} onChange={e => set("min_education", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("accommodation") && (
          <div>
            <label className={labelCls}>Accommodation Provided</label>
            <select value={form.accommodation} onChange={e => set("accommodation", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="yes">Yes</option><option value="no">No</option><option value="negotiable">Negotiable</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("food_provided") && (
          <div>
            <label className={labelCls}>Food Provided</label>
            <select value={form.food_provided} onChange={e => set("food_provided", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
              <option value="yes">Yes</option><option value="no">No</option><option value="negotiable">Negotiable</option>
            </select>
          </div>
        )}
        {enabledOptionals.includes("languages") && (
          <div>
            <label className={labelCls}>Languages Required</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox"
                    checked={form.languages.includes(lang)}
                    onChange={() => set("languages", form.languages.includes(lang)
                      ? form.languages.filter(l => l !== lang)
                      : [...form.languages, lang]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{lang}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("description") && (
          <div>
            <label className={labelCls}>Additional Description</label>
            <textarea maxLength={300} rows={3} value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Any extra details about the job..." className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">{form.description.length}/300</p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 active:scale-95 disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Job →"}
        </button>
      </form>
    </div>
  );
}