import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Worker = {
  id: string; name: string; skill_primary: string; skills_extra: string[] | null;
  district: string; town: string | null; contact_whatsapp: string | null;
  contact_phone: string | null; experience_years: number | null;
  pay_expectation: number | null; pay_period: string | null;
  job_type_pref: string[] | null; education: string | null;
  languages: string[] | null; own_tools: boolean | null;
  willing_to_travel: boolean | null; bio: string | null;
  available: boolean; created_at: string;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("worker_profiles").select("name,skill_primary,district").eq("id", id).single();
  if (!data) return { title: "Worker Profile | Uganda Business Hub" };
  return {
    title: `${data.name} — ${data.skill_primary} in ${data.district} | Uganda Business Hub`,
    description: `Hire ${data.name}, a ${data.skill_primary} based in ${data.district}, Uganda.`,
  };
}

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single<Worker>();

  if (!worker) notFound();

  const displayName = worker.name.split(" ").map((w, i) => i === 0 ? w : w[0] + ".").join(" ");
  const initial = worker.name[0].toUpperCase();
  const allSkills = [worker.skill_primary, ...(worker.skills_extra ?? [])];

  function whatsappHref(phone: string) {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
    return `https://wa.me/${num}?text=Hi%20${encodeURIComponent(worker?.name ?? '')}%2C%20I%20found%20your%20profile%20on%20Uganda%20Business%20Hub`;
  }

  function Breadcrumb() {
    return (
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-6">
        <Link href="/" className="hover:text-[#1C3A2A] transition-colors">Home</Link>
        <span className="text-slate-300">›</span>
        <Link href="/jobs" className="hover:text-[#1C3A2A] transition-colors">Jobs</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[#1C3A2A]">Worker Profile</span>
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-lg px-4 py-10">
        <Breadcrumb />
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 shrink-0 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-black text-white">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-slate-900">{displayName}</h1>
              <p className="text-sm font-semibold text-violet-700 mt-0.5">{allSkills.join(" · ")}</p>
              <p className="text-xs text-slate-500 mt-1">📍 {[worker.town, worker.district].filter(Boolean).join(", ")}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${worker.available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {worker.available ? "Available" : "Not available"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {worker.experience_years != null && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{worker.experience_years} yr{worker.experience_years !== 1 ? "s" : ""}</p>
              </div>
            )}
            {worker.pay_expectation != null && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pay Expectation</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  UGX {worker.pay_expectation.toLocaleString()}{worker.pay_period ? `/${worker.pay_period}` : ""}
                </p>
              </div>
            )}
            {worker.job_type_pref?.length && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Type</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{worker.job_type_pref.join(", ")}</p>
              </div>
            )}
            {worker.education && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 uppercase">{worker.education}</p>
              </div>
            )}
          </div>

          {(worker.languages?.length || worker.own_tools || worker.willing_to_travel) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {worker.languages?.map(l => (
                <span key={l} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{l}</span>
              ))}
              {worker.own_tools && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Own tools</span>
              )}
              {worker.willing_to_travel && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Can travel</span>
              )}
            </div>
          )}

          {worker.bio && (
            <p className="text-sm text-slate-600 italic mb-6">"{worker.bio}"</p>
          )}

          <div className="flex flex-col gap-3">
            {worker.contact_whatsapp && (
              <a
                href={whatsappHref(worker.contact_whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] py-4 text-base font-black text-white shadow-md hover:opacity-90 transition-opacity"
              >
                📲 WhatsApp {worker.name.split(" ")[0]}
              </a>
            )}
            {worker.contact_phone && (
              <a
                href={`tel:${worker.contact_phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#f5f0e8] py-3 text-sm font-bold text-[#1C3A2A] hover:bg-[#e8e2d6] transition-colors"
              >
                📞 Call {worker.name.split(" ")[0]}
              </a>
            )}
            {!worker.contact_whatsapp && worker.contact_phone && (
              <a
                href={`tel:${worker.contact_phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-[#1C3A2A] py-4 text-base font-black text-[#1C3A2A] hover:bg-[#f5f0e8] transition-colors"
              >
                📞 Call {worker.name.split(" ")[0]}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}