"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deriveJobFilterOptions, deriveDistricts, filterJobs } from "@/lib/jobs/filtering";
import { decodeEntities, sourceLabel } from "@/lib/jobs/format";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [payStatedOnly, setPayStatedOnly] = useState(false);
  const [now] = useState(() => Date.now());

  const { categories, jobTypes } = useMemo(() => deriveJobFilterOptions(jobs), [jobs]);
  const jobDistricts = useMemo(() => deriveDistricts(jobs), [jobs]);
  const workerDistricts = useMemo(() => deriveDistricts(workers), [workers]);

  const filteredJobs = filterJobs(jobs, { category, district, jobType, payStatedOnly, search });

  const filteredWorkers = workers.filter(w =>
    (!district || w.district === district) &&
    (!search || w.skill_primary.toLowerCase().includes(search.toLowerCase()))
  );

  const anyJobFilterActive = Boolean(category || district || jobType || payStatedOnly || search);

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
        <header className="motion-page mb-6">
          <h1 className="text-2xl font-black tracking-tight text-brand-forest sm:text-3xl">👷 Uganda Jobs</h1>
          <p className="mt-1 text-sm text-brand-green">Find work or hire skilled workers across Uganda</p>
        </header>

        {/* Tabs */}
        <div className="mb-5 flex gap-2" role="tablist" aria-label="Jobs or workers">
          {(["jobs", "workers"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}
              className={`motion-press rounded-full px-5 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${tab === t ? "bg-brand-forest text-white shadow-sm" : "bg-brand-surface text-brand-forest border border-brand-beige hover:border-brand-gold"}`}>
              {t === "jobs" ? `Jobs (${jobs.length})` : `Workers (${workers.length})`}
            </button>
          ))}
          <Link href="/jobs/post"
            className="motion-press ml-auto rounded-full bg-brand-gold px-4 py-2 text-sm font-bold text-brand-forest transition-colors hover:bg-brand-gold/85">
            + Post Job
          </Link>
        </div>

        {/* Filters */}
        {tab === "jobs" ? (
          <div className="mb-5 flex flex-col gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              aria-label="Search jobs by title or category"
              placeholder="Search jobs..."
              className="w-full min-h-11 rounded-xl border border-brand-beige bg-white px-3.5 text-sm placeholder:text-brand-green/70 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60" />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <label className="flex flex-col gap-1 text-[11px] font-bold text-brand-green">
                Category
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="min-h-11 rounded-xl border border-brand-beige bg-white px-3 text-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60">
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.value} ({c.count})</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold text-brand-green">
                District
                <select value={district} onChange={e => setDistrict(e.target.value)}
                  className="min-h-11 rounded-xl border border-brand-beige bg-white px-3 text-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60">
                  <option value="">All districts</option>
                  {jobDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              {jobTypes.length > 0 && (
                <label className="flex flex-col gap-1 text-[11px] font-bold text-brand-green">
                  Job type
                  <select value={jobType} onChange={e => setJobType(e.target.value)}
                    className="min-h-11 rounded-xl border border-brand-beige bg-white px-3 text-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60">
                    <option value="">All types</option>
                    {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              )}
              <label className="flex min-h-11 items-center gap-2 self-end rounded-xl border border-brand-beige bg-white px-3 text-xs font-bold text-brand-forest">
                <input type="checkbox" checked={payStatedOnly} onChange={e => setPayStatedOnly(e.target.checked)}
                  className="accent-brand-forest" />
                Stated pay only
              </label>
            </div>
            <p aria-live="polite" className="text-xs font-semibold text-brand-green">
              {filteredJobs.length} of {jobs.length} jobs
            </p>
          </div>
        ) : (
          <div className="flex gap-2 mb-5">
            <input value={search} onChange={e => setSearch(e.target.value)}
              aria-label="Search workers by skill"
              placeholder="Search skill..."
              className="flex-1 min-h-11 rounded-xl border border-brand-beige bg-white px-3.5 py-2 text-sm placeholder:text-brand-green/70 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60" />
            <select value={district} onChange={e => setDistrict(e.target.value)}
              aria-label="Filter by district"
              className="min-h-11 rounded-xl border border-brand-beige bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/60">
              <option value="">All districts</option>
              {workerDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

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
                {anyJobFilterActive && (
                  <div>
                    <button type="button"
                      onClick={() => { setCategory(""); setDistrict(""); setJobType(""); setPayStatedOnly(false); setSearch(""); }}
                      className="motion-press mt-3 rounded-xl border border-brand-forest px-5 py-2 text-sm font-bold text-brand-forest">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className={`motion-card rounded-2xl border bg-brand-surface p-4 shadow-sm ${job.featured ? "border-brand-gold" : "border-brand-beige"}`}
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
                    <p className="font-black text-brand-forest text-sm">{decodeEntities(job.title)}</p>
                    <p className="text-xs text-brand-green/70 mt-0.5">
                      {decodeEntities(job.employer_name)} · {[job.town, job.district].filter(Boolean).join(", ")}
                    </p>
                    {job.pay_amount && (
                      <p className="text-xs font-black text-brand-forest mt-1">
                        UGX {job.pay_amount.toLocaleString()}{job.pay_period ? `/${job.pay_period}` : ""}
                      </p>
                    )}
                    {!job.pay_amount && (
                      <p className="text-xs text-brand-green/60 mt-1">Pay not stated</p>
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
                      <p className="text-xs text-brand-green/75 mt-2 line-clamp-2">{decodeEntities(job.description)}</p>
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
                        className="motion-press rounded-xl bg-brand-forest px-3 py-1.5 text-center text-xs font-bold text-white transition-colors hover:bg-brand-green"
                      >
                        WhatsApp
                      </a>
                    )}
                    {job.contact_phone && (
                      <a
                        href={`tel:${job.contact_phone}`}
                        className="motion-press rounded-xl bg-brand-cream px-3 py-1.5 text-center text-xs font-bold text-brand-forest transition-colors hover:bg-brand-beige/60"
                      >
                        Call
                      </a>
                    )}
                    {job.contact_walkin && (
                      <span className="rounded-xl bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-forest">
                        Walk-in
                      </span>
                    )}
                    {!job.contact_whatsapp && !job.contact_phone && !job.contact_walkin && job.source_url && (
                      <a
                        href={job.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="motion-press rounded-xl bg-brand-forest px-3 py-1.5 text-center text-xs font-bold text-white transition-colors hover:bg-brand-green"
                      >
                        View job <span aria-hidden>↗</span>
                      </a>
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
                className="motion-card rounded-2xl border border-brand-beige bg-brand-surface p-4 shadow-sm hover:border-brand-gold block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
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
          <Link href="/jobs/post" className="motion-press flex-1 rounded-2xl bg-brand-gold py-3 text-center text-sm font-bold text-brand-forest transition-colors hover:bg-brand-gold/85">
            Post a Job
          </Link>
          <Link href="/jobs/worker/new" className="motion-press flex-1 rounded-2xl border border-brand-forest py-3 text-center text-sm font-bold text-brand-forest transition-colors hover:bg-brand-surface">
            Register as Worker
          </Link>
        </div>
      </div>
    </div>
  );
}
