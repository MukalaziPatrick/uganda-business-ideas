"use client";

import { useState } from "react";
import Link from "next/link";
import { UGANDA_DISTRICTS } from "@/lib/constants/skills";

type Job = {
  id: string; title: string; skill_category: string; district: string; town: string | null;
  employer_name: string; contact_whatsapp: string | null; contact_phone: string | null;
  contact_walkin: string | null; pay_amount: number | null; pay_period: string | null;
  job_type: string | null; gender_pref: string | null; min_education: string | null;
  accommodation: string | null; food_provided: string | null; languages: string[] | null;
  description: string | null; featured: boolean; created_at: string;
  source: string | null;
  source_url: string | null;
  expires_at: string | null;
};

type Worker = {
  id: string; name: string; skill_primary: string; skills_extra: string[] | null;
  district: string; town: string | null; contact_whatsapp: string | null;
  contact_phone: string | null; experience_years: number | null;
  pay_expectation: number | null; pay_period: string | null;
  job_type_pref: string[] | null; education: string | null;
  languages: string[] | null; own_tools: boolean | null;
  willing_to_travel: boolean | null; bio: string | null; available: boolean;
};

export default function JobsClient({ jobs, workers }: { jobs: Job[]; workers: Worker[] }) {
  const [tab, setTab] = useState<"jobs" | "workers">("jobs");
  const [district, setDistrict] = useState("");
  const [skill, setSkill] = useState("");
  const [now] = useState(() => Date.now());

  const filteredJobs = jobs.filter(j =>
    (!district || j.district === district) &&
    (!skill || j.skill_category.toLowerCase().includes(skill.toLowerCase()) || j.title.toLowerCase().includes(skill.toLowerCase()))
  );

  const filteredWorkers = workers.filter(w =>
    (!district || w.district === district) &&
    (!skill || w.skill_primary.toLowerCase().includes(skill.toLowerCase()))
  );

  function whatsappHref(phone: string, name: string) {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
    return `https://wa.me/${num}?text=Hi%20${encodeURIComponent(name)}%2C%20I%20saw%20your%20listing%20on%20Uganda%20Business%20Hub`;
  }

  function timeAgo(dateStr: string): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  function expiryLabel(expiresAt: string | null): string | null {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return "Closes today";
    if (days <= 5) return `Closes in ${days}d`;
    return null;
  }

  function sourceLabel(source: string | null): string | null {
    if (source === "brightermonday") return "Via BrighterMonday";
    if (source === "psc") return "Via PSC Uganda";
    return null;
  }

  function skillEmoji(skill: string): string {
    const s = skill.toLowerCase();
    if (s.includes("driv") || s.includes("transport")) return "🚗";
    if (s.includes("farm") || s.includes("agri")) return "🌾";
    if (s.includes("tailor") || s.includes("sew")) return "✂️";
    if (s.includes("tech") || s.includes("digital")) return "💻";
    if (s.includes("cook") || s.includes("food") || s.includes("cater")) return "🍳";
    if (s.includes("build") || s.includes("construct") || s.includes("mason")) return "🏗️";
    if (s.includes("clean") || s.includes("domestic")) return "🧹";
    if (s.includes("security") || s.includes("guard")) return "🛡️";
    return "💼";
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-black text-brand-forest mb-1">Uganda Jobs</h1>
        <p className="text-sm text-brand-green/80 mb-6">Find work or hire skilled workers across Uganda</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["jobs", "workers"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${tab === t ? "bg-brand-forest text-white" : "bg-white text-brand-forest border border-brand-beige hover:bg-brand-surface"}`}>
              {t === "jobs" ? `Jobs (${jobs.length})` : `Workers (${workers.length})`}
            </button>
          ))}
          <Link href="/jobs/post"
            className="ml-auto rounded-full bg-brand-gold px-4 py-2 text-sm font-bold text-brand-forest hover:bg-brand-gold/85">
            + Post Job
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          <input value={skill} onChange={e => setSkill(e.target.value)}
            aria-label={tab === "jobs" ? "Search jobs by skill or title" : "Search workers by skill"}
            placeholder={tab === "jobs" ? "Search skill or title..." : "Search skill..."}
            className="flex-1 rounded-xl border border-brand-beige bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60" />
          <select value={district} onChange={e => setDistrict(e.target.value)}
            aria-label="Filter by district"
            className="rounded-xl border border-brand-beige bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60">
            <option value="">All districts</option>
            {UGANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Jobs list */}
        {tab === "jobs" && (
          <div className="flex flex-col gap-3">
            {filteredJobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-beige bg-white p-10 text-center">
                <p className="text-3xl mb-3">💼</p>
                <p className="font-bold text-brand-forest mb-1">No jobs found in this category</p>
                <p className="text-sm text-brand-green/80 mb-4">Try a different district or skill, or be the first to post.</p>
                <Link href="/jobs/post" className="rounded-xl bg-brand-gold px-5 py-2 text-sm font-bold text-brand-forest">
                  Post a Job →
                </Link>
              </div>
            )}
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${job.featured ? "border-brand-gold" : "border-brand-beige"}`}
              >
                {job.featured && (
                  <span className="mb-2 inline-block rounded-full bg-brand-gold/25 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-forest">
                    Featured
                  </span>
                )}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-forest to-brand-green flex items-center justify-center text-lg">
                    {skillEmoji(job.skill_category)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-brand-forest text-sm">{job.title}</p>
                    <p className="text-xs text-brand-green/70 mt-0.5">
                      {job.employer_name} · {[job.town, job.district].filter(Boolean).join(", ")}
                    </p>
                    {job.pay_amount && (
                      <p className="text-xs font-black text-brand-forest mt-1">
                        UGX {job.pay_amount.toLocaleString()}{job.pay_period ? `/${job.pay_period}` : ""}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                        {job.skill_category}
                      </span>
                      {job.job_type && (
                        <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-semibold text-brand-forest capitalize">
                          {job.job_type}
                        </span>
                      )}
                      {job.accommodation === "yes" && (
                        <span className="rounded-full border border-brand-gold/40 bg-brand-gold/15 px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                          Accommodation
                        </span>
                      )}
                      {job.food_provided === "yes" && (
                        <span className="rounded-full border border-brand-gold/40 bg-brand-gold/15 px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                          Food
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-xs text-brand-green/75 mt-2 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] text-brand-green">{timeAgo(job.created_at)}</span>
                      {job.source && job.source_url && (
                        <a
                          href={job.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-brand-green hover:underline"
                        >
                          {sourceLabel(job.source)} ↗
                        </a>
                      )}
                      {expiryLabel(job.expires_at) && (
                        <span className="rounded-full border border-brand-gold/40 bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold text-brand-forest">
                          {expiryLabel(job.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {job.contact_whatsapp && (
                      <a
                        href={whatsappHref(job.contact_whatsapp, job.employer_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-brand-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-green"
                      >
                        WhatsApp
                      </a>
                    )}
                    {job.contact_phone && (
                      <a
                        href={`tel:${job.contact_phone}`}
                        className="rounded-xl bg-brand-cream px-3 py-1.5 text-xs font-bold text-brand-forest hover:bg-brand-beige/60"
                      >
                        Call
                      </a>
                    )}
                    {job.contact_walkin && (
                      <span className="rounded-xl bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-forest">
                        Walk-in
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Workers list */}
        {tab === "workers" && (
          <div className="flex flex-col gap-3">
            {filteredWorkers.length === 0 && (
              <p className="text-center text-sm text-brand-green/75 py-12">No workers found. <Link href="/jobs/worker/new" className="text-brand-forest font-semibold underline decoration-brand-gold decoration-2 underline-offset-4">Register as a worker?</Link></p>
            )}
            {filteredWorkers.map(w => (
              <Link key={w.id} href={`/jobs/worker/${w.id}`}
                className="rounded-2xl border border-brand-beige bg-white p-4 shadow-sm hover:border-brand-gold transition-colors block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-brand-forest flex items-center justify-center text-lg font-black text-white">
                    {w.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-brand-forest">{w.name.split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ")}</p>
                    <p className="text-xs text-brand-green font-semibold">{[w.skill_primary, ...(w.skills_extra ?? [])].join(" · ")}</p>
                    <p className="text-xs text-brand-green/70 mt-0.5">📍 {[w.town, w.district].filter(Boolean).join(", ")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${w.available ? "bg-brand-gold/20 text-brand-forest" : "bg-brand-cream text-brand-green"}`}>
                      {w.available ? "Available" : "Unavailable"}
                    </span>
                    {w.pay_expectation && (
                      <span className="text-[10px] font-semibold text-brand-green/70">UGX {w.pay_expectation.toLocaleString()}{w.pay_period ? `/${w.pay_period}` : ""}</span>
                    )}
                  </div>
                </div>
                {w.bio && <p className="text-xs text-brand-green/70 italic mt-2 line-clamp-1">&ldquo;{w.bio}&rdquo;</p>}
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTAs */}
        <div className="mt-8 flex gap-3">
          <Link href="/jobs/post" className="flex-1 rounded-2xl bg-brand-gold py-3 text-center text-sm font-bold text-brand-forest hover:bg-brand-gold/85">
            Post a Job
          </Link>
          <Link href="/jobs/worker/new" className="flex-1 rounded-2xl border border-brand-forest py-3 text-center text-sm font-bold text-brand-forest hover:bg-brand-surface">
            Register as Worker
          </Link>
        </div>
      </div>
    </div>
  );
}
