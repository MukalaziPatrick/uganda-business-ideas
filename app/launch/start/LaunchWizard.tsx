"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HELP_OPTIONS, type HelpOption } from "@/lib/launch/types";

const HELP_LABELS: Record<HelpOption, string> = {
  launch: "Launching fast",
  content: "Content & visibility",
  leads: "Getting leads",
  registration: "Business registration",
  operations: "Daily operations",
};

const STAGES = [
  { value: "idea", label: "Just an idea" },
  { value: "started", label: "Started, not selling yet" },
  { value: "selling", label: "Already selling" },
] as const;

const TOTAL_STEPS = 5;

type WizardForm = {
  founderName: string;
  phone: string;
  businessIdea: string;
  niche: string;
  audience: string;
  stage: "" | "idea" | "started" | "selling";
  budget: string;
  goals: string;
  helpNeeded: HelpOption[];
  email: string;
  password: string;
};

const INITIAL_FORM: WizardForm = {
  founderName: "",
  phone: "",
  businessIdea: "",
  niche: "",
  audience: "",
  stage: "",
  budget: "",
  goals: "",
  helpNeeded: [],
  email: "",
  password: "",
};

const inputClass =
  "w-full rounded-xl border border-brand-forest/20 bg-white px-4 py-3 text-[15px] text-brand-forest outline-none transition focus:border-brand-gold";
const labelClass = "mb-1.5 block text-[13px] font-bold text-brand-forest";

export default function LaunchWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof WizardForm>(field: K, value: WizardForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleHelp(option: HelpOption) {
    setForm((current) => ({
      ...current,
      helpNeeded: current.helpNeeded.includes(option)
        ? current.helpNeeded.filter((entry) => entry !== option)
        : [...current.helpNeeded, option],
    }));
  }

  async function saveStep(payload: Record<string, unknown>, complete = false) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/launch/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeId: intakeId ?? undefined,
          step,
          complete: complete || undefined,
          ...payload,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return null;
      }
      if (typeof data.intakeId === "string") setIntakeId(data.intakeId);
      return data as { intakeId?: string; planId?: string };
    } catch {
      setError("Network problem — please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (step === 1) {
      if (!form.founderName.trim() || !form.phone.trim()) {
        setError("Please add your name and phone number.");
        return;
      }
      const result = await saveStep({ founderName: form.founderName, phone: form.phone });
      if (result) setStep(2);
      return;
    }
    if (step === 2) {
      if (!form.businessIdea.trim()) {
        setError("Please describe your business idea.");
        return;
      }
      const result = await saveStep({ businessIdea: form.businessIdea, niche: form.niche });
      if (result) setStep(3);
      return;
    }
    if (step === 3) {
      if (!form.audience.trim() || !form.stage) {
        setError("Please describe your audience and pick your stage.");
        return;
      }
      const result = await saveStep({ audience: form.audience, stage: form.stage });
      if (result) setStep(4);
      return;
    }
    if (step === 4) {
      const result = await saveStep({
        budget: form.budget,
        goals: form.goals,
        helpNeeded: form.helpNeeded,
      });
      if (result) setStep(5);
      return;
    }
    if (step === 5) {
      if (!form.email.trim() || form.password.length < 8) {
        setError("Please add your email and a password of at least 8 characters.");
        return;
      }
      const result = await saveStep(
        { email: form.email, password: form.password },
        true
      );
      if (result?.planId) {
        router.push(`/launch/plan/${result.planId}`);
      }
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <div
            key={index}
            className={
              index < step
                ? "h-1.5 flex-1 rounded-full bg-brand-gold"
                : "h-1.5 flex-1 rounded-full bg-brand-forest/10"
            }
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-brand-forest">
            First, who are you?
          </h2>
          <div>
            <label htmlFor="founderName" className={labelClass}>Your name</label>
            <input
              id="founderName"
              className={inputClass}
              value={form.founderName}
              onChange={(event) => updateField("founderName", event.target.value)}
              placeholder="e.g. Aisha Namutebi"
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone number</label>
            <input
              id="phone"
              className={inputClass}
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="e.g. +256 7xx xxx xxx"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-brand-forest">
            What are you building?
          </h2>
          <div>
            <label htmlFor="businessIdea" className={labelClass}>Your business idea, in one or two sentences</label>
            <textarea
              id="businessIdea"
              className={inputClass}
              rows={3}
              value={form.businessIdea}
              onChange={(event) => updateField("businessIdea", event.target.value)}
              placeholder="e.g. A fresh juice delivery service for offices in Kampala"
            />
          </div>
          <div>
            <label htmlFor="niche" className={labelClass}>What space is it in?</label>
            <input
              id="niche"
              className={inputClass}
              value={form.niche}
              onChange={(event) => updateField("niche", event.target.value)}
              placeholder="e.g. food and drinks, fashion, digital services"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-brand-forest">
            Who is it for, and where are you now?
          </h2>
          <div>
            <label htmlFor="audience" className={labelClass}>Who exactly is your customer?</label>
            <input
              id="audience"
              className={inputClass}
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
              placeholder="e.g. office workers in Kampala"
            />
          </div>
          <div>
            <span className={labelClass}>Where are you today?</span>
            <div className="flex flex-col gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => updateField("stage", stage.value)}
                  className={
                    form.stage === stage.value
                      ? "rounded-xl border-2 border-brand-gold bg-white px-4 py-3 text-left text-[15px] font-bold text-brand-forest"
                      : "rounded-xl border border-brand-forest/20 bg-white px-4 py-3 text-left text-[15px] font-medium text-brand-forest/80 hover:border-brand-forest/40"
                  }
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-brand-forest">
            Budget, goals, and where you want help
          </h2>
          <div>
            <label htmlFor="budget" className={labelClass}>Rough starting budget</label>
            <input
              id="budget"
              className={inputClass}
              value={form.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              placeholder="e.g. UGX 300,000"
            />
          </div>
          <div>
            <label htmlFor="goals" className={labelClass}>What does success look like in 30 days?</label>
            <textarea
              id="goals"
              className={inputClass}
              rows={2}
              value={form.goals}
              onChange={(event) => updateField("goals", event.target.value)}
              placeholder="e.g. my first 20 paying customers"
            />
          </div>
          <div>
            <span className={labelClass}>Where do you want help? (pick any)</span>
            <div className="flex flex-wrap gap-2">
              {HELP_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleHelp(option)}
                  className={
                    form.helpNeeded.includes(option)
                      ? "rounded-full border-2 border-brand-gold bg-brand-gold/20 px-4 py-2 text-[13px] font-bold text-brand-forest"
                      : "rounded-full border border-brand-forest/20 bg-white px-4 py-2 text-[13px] font-medium text-brand-forest/80 hover:border-brand-forest/40"
                  }
                >
                  {HELP_LABELS[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-brand-forest">
            Last step — secure your plan
          </h2>
          <p className="text-[14px] leading-relaxed text-brand-forest/70">
            Your account keeps your launch plan safe and unlocks your founder dashboard
            when it goes live.
          </p>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password (8+ characters)</label>
            <input
              id="password"
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-[13px] font-bold text-brand-forest/60 hover:text-brand-forest"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="rounded-xl bg-brand-forest px-7 py-3 text-[15px] font-black text-brand-gold shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : step === TOTAL_STEPS ? "Get my launch plan →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
