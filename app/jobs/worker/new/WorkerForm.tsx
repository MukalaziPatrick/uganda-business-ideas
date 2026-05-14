"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SkillOption } from "@/lib/constants/skills";
import { ALL_SKILLS, UGANDA_DISTRICTS, EDUCATION_LEVELS, LANGUAGES, JOB_TYPES, PAY_PERIODS } from "@/lib/constants/skills";

const OPTIONAL_FIELDS = [
  { key: "skills_extra",      label: "Additional skills (up to 2 more)" },
  { key: "experience_years",  label: "Years of experience" },
  { key: "pay_expectation",   label: "Pay expectation" },
  { key: "job_type_pref",     label: "Job type preference" },
  { key: "education",         label: "Education level" },
  { key: "languages",         label: "Languages spoken" },
  { key: "own_tools",         label: "I own my tools / equipment" },
  { key: "willing_to_travel", label: "Willing to travel for work" },
  { key: "bio",               label: "Short bio (max 100 characters)" },
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

export default function WorkerForm() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enabledOptionals, setEnabledOptionals] = useState<string[]>([]);
  const [profileId, setProfileId] = useState("");
  const router = useRouter();

  const [form, setForm] = useState<{
    name: string;
    skill_primary: string;
    district: string;
    town: string;
    contact_whatsapp: string;
    contact_phone: string;
    skills_extra: string[];
    experience_years: string;
    pay_expectation: string;
    pay_period: string;
    job_type_pref: string[];
    education: string;
    languages: string[];
    own_tools: boolean;
    willing_to_travel: boolean;
    bio: string;
  }>({
    name: "", skill_primary: "", district: "", town: "",
    contact_whatsapp: "", contact_phone: "",
    skills_extra: [], experience_years: "",
    pay_expectation: "", pay_period: "", job_type_pref: [],
    education: "", languages: [],
    own_tools: false, willing_to_travel: false, bio: "",
  });

  function toggle(field: string) {
    setEnabledOptionals(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.contact_whatsapp && !form.contact_phone) {
      setError("Please provide at least one contact method.");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      name: form.name, skill_primary: form.skill_primary,
      district: form.district, town: form.town || undefined,
      contact_whatsapp: form.contact_whatsapp || undefined,
      contact_phone: form.contact_phone || undefined,
    };
    if (enabledOptionals.includes("skills_extra"))     payload.skills_extra     = form.skills_extra;
    if (enabledOptionals.includes("experience_years")) payload.experience_years = form.experience_years;
    if (enabledOptionals.includes("pay_expectation")) { payload.pay_expectation = form.pay_expectation; payload.pay_period = form.pay_period; }
    if (enabledOptionals.includes("job_type_pref"))    payload.job_type_pref    = form.job_type_pref;
    if (enabledOptionals.includes("education"))        payload.education        = form.education;
    if (enabledOptionals.includes("languages"))        payload.languages        = form.languages;
    if (enabledOptionals.includes("own_tools"))        payload.own_tools        = form.own_tools;
    if (enabledOptionals.includes("willing_to_travel")) payload.willing_to_travel = form.willing_to_travel;
    if (enabledOptionals.includes("bio"))              payload.bio              = form.bio;

    const res = await fetch("/api/workers", {
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
    const data = await res.json();
    setProfileId(data.id);
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl bg-white border border-[#e0d8cc] p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Profile Created!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Employers across Uganda can now find and contact you directly.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("I just registered as a worker on Uganda Business Hub! Employers can find me here: https://ugandabiz.com/jobs")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white text-center"
            >
              📲 Share Your Profile on WhatsApp
            </a>
            <button
              onClick={() => router.push("/jobs")}
              className="rounded-xl border border-[#e0d8cc] py-3 text-sm font-bold text-[#1C3A2A]"
            >
              Browse Jobs →
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
      <h1 className="text-2xl font-black text-slate-900 mb-1">Register as a Worker</h1>
      <p className="text-sm text-slate-500 mb-8">Free to register. Employers will contact you directly.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <ProgressBar current={1} total={2} label="Your Details" />
        <div>
          <label className={labelCls}>Full Name *</label>
          <input required value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g. Okello James" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Primary Skill *</label>
          <select required value={form.skill_primary} onChange={e => set("skill_primary", e.target.value)} className={inputCls}>
            <option value="">Select your main skill...</option>
  {ALL_SKILLS.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>District *</label>
            <select required value={form.district} onChange={e => set("district", e.target.value)} className={inputCls}>
              <option value="">Select district...</option>
  {UGANDA_DISTRICTS.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Town / Area</label>
            <input value={form.town} onChange={e => set("town", e.target.value)}
              placeholder="e.g. Bwaise" className={inputCls} />
          </div>
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
          </div>
        </div>
        <ProgressBar current={2} total={2} label="Skills & Availability" />
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
        {enabledOptionals.includes("skills_extra") && (
          <div>
            <label className={labelCls}>Additional Skills (pick up to 2)</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
  {ALL_SKILLS.filter((s: string) => s !== form.skill_primary).map((s: string) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox"
                    checked={form.skills_extra.includes(s)}
                    disabled={!form.skills_extra.includes(s) && form.skills_extra.length >= 2}
                    onChange={() => set("skills_extra", form.skills_extra.includes(s)
                      ? form.skills_extra.filter(x => x !== s)
                      : [...form.skills_extra, s]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("experience_years") && (
          <div>
            <label className={labelCls}>Years of Experience</label>
            <input type="number" min="0" max="50" value={form.experience_years}
              onChange={e => set("experience_years", e.target.value)}
              placeholder="e.g. 3" className={inputCls} />
          </div>
        )}
        {enabledOptionals.includes("pay_expectation") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Expected Pay (UGX)</label>
              <input type="number" value={form.pay_expectation}
                onChange={e => set("pay_expectation", e.target.value)}
                placeholder="e.g. 50000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Per</label>
              <select value={form.pay_period} onChange={e => set("pay_period", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
  {PAY_PERIODS.map((p: SkillOption) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        )}
        {enabledOptionals.includes("job_type_pref") && (
          <div>
            <label className={labelCls}>Job Type Preference</label>
            <div className="flex flex-col gap-2">
  {JOB_TYPES.map((j: SkillOption) => (
                <label key={j.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form.job_type_pref.includes(j.value)}
                    onChange={() => set("job_type_pref", form.job_type_pref.includes(j.value)
                      ? form.job_type_pref.filter(x => x !== j.value)
                      : [...form.job_type_pref, j.value]
                    )}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-700">{j.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {enabledOptionals.includes("education") && (
          <div>
            <label className={labelCls}>Education Level</label>
            <select value={form.education} onChange={e => set("education", e.target.value)} className={inputCls}>
              <option value="">Select...</option>
  {EDUCATION_LEVELS.map((e: SkillOption) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        )}
        {enabledOptionals.includes("languages") && (
          <div>
            <label className={labelCls}>Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
  {LANGUAGES.map((lang: string) => (
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
        {enabledOptionals.includes("own_tools") && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.own_tools}
              onChange={e => set("own_tools", e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 accent-violet-600" />
            <span className="text-sm text-slate-700">I own my tools / equipment</span>
          </label>
        )}
        {enabledOptionals.includes("willing_to_travel") && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.willing_to_travel}
              onChange={e => set("willing_to_travel", e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 accent-violet-600" />
            <span className="text-sm text-slate-700">Willing to travel for work</span>
          </label>
        )}
        {enabledOptionals.includes("bio") && (
          <div>
            <label className={labelCls}>Short Bio (max 100 characters)</label>
            <input maxLength={100} value={form.bio} onChange={e => set("bio", e.target.value)}
              placeholder="e.g. Experienced carpenter based in Kampala, 5 years in furniture" className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">{form.bio.length}/100</p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 active:scale-95 disabled:opacity-60">
          {submitting ? "Submitting..." : "Create Profile →"}
        </button>
      </form>
    </div>
  );
}
