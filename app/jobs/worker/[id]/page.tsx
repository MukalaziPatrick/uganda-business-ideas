import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-brand-green font-semibold mb-6">
      <Link href="/" className="hover:text-brand-forest transition-colors">Home</Link>
      <span className="text-brand-beige">›</span>
      <Link href="/jobs" className="hover:text-brand-forest transition-colors">Jobs</Link>
      <span className="text-brand-beige">›</span>
      <span className="text-brand-forest">Worker Profile</span>
    </nav>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSupabase().from("worker_profiles").select("name,skill_primary,district").eq("id", id).single();
  if (!data) return { title: "Worker Profile | Uganda Business Hub" };
  return {
    title: `${data.name} — ${data.skill_primary} in ${data.district} | Uganda Business Hub`,
    description: `Hire ${data.name}, a ${data.skill_primary} based in ${data.district}, Uganda.`,
  };
}

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: worker } = await getSupabase()
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

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto max-w-lg px-4 py-10">
        <Breadcrumb />
        <div className="rounded-3xl border border-brand-beige bg-white shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 shrink-0 rounded-full bg-brand-forest flex items-center justify-center text-2xl font-black text-white">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-brand-forest">{displayName}</h1>
              <p className="text-sm font-semibold text-brand-green mt-0.5">{allSkills.join(" · ")}</p>
              <p className="text-xs text-brand-green mt-1">📍 {[worker.town, worker.district].filter(Boolean).join(", ")}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${worker.available ? "bg-brand-gold/20 text-brand-forest" : "bg-brand-beige/50 text-brand-green"}`}>
              {worker.available ? "Available" : "Not available"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {worker.experience_years != null && (
              <div className="rounded-xl bg-brand-cream p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Experience</p>
                <p className="text-sm font-semibold text-brand-ink mt-0.5">{worker.experience_years} yr{worker.experience_years !== 1 ? "s" : ""}</p>
              </div>
            )}
            {worker.pay_expectation != null && (
              <div className="rounded-xl bg-brand-cream p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Pay Expectation</p>
                <p className="text-sm font-semibold text-brand-ink mt-0.5">
                  UGX {worker.pay_expectation.toLocaleString()}{worker.pay_period ? `/${worker.pay_period}` : ""}
                </p>
              </div>
            )}
            {worker.job_type_pref?.length && (
              <div className="rounded-xl bg-brand-cream p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Job Type</p>
                <p className="text-sm font-semibold text-brand-ink mt-0.5 capitalize">{worker.job_type_pref.join(", ")}</p>
              </div>
            )}
            {worker.education && (
              <div className="rounded-xl bg-brand-cream p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Education</p>
                <p className="text-sm font-semibold text-brand-ink mt-0.5 uppercase">{worker.education}</p>
              </div>
            )}
          </div>

          {(worker.languages?.length || worker.own_tools || worker.willing_to_travel) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {worker.languages?.map(l => (
                <span key={l} className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-forest">{l}</span>
              ))}
              {worker.own_tools && (
                <span className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-forest">Own tools</span>
              )}
              {worker.willing_to_travel && (
                <span className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-forest">Can travel</span>
              )}
            </div>
          )}

          {worker.bio && (
            <p className="text-sm text-brand-forest italic mb-6">&ldquo;{worker.bio}&rdquo;</p>
          )}

          <div className="flex flex-col gap-3">
            {worker.contact_whatsapp && (
              <a
                href={whatsappHref(worker.contact_whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-forest py-4 text-base font-black text-white shadow-md hover:bg-brand-green transition-colors"
              >
                📲 WhatsApp {worker.name.split(" ")[0]}
              </a>
            )}
            {worker.contact_phone && (
              <a
                href={`tel:${worker.contact_phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-cream py-3 text-sm font-bold text-brand-forest hover:bg-brand-beige/60 transition-colors"
              >
                📞 Call {worker.name.split(" ")[0]}
              </a>
            )}
            {!worker.contact_whatsapp && worker.contact_phone && (
              <a
                href={`tel:${worker.contact_phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-brand-forest py-4 text-base font-black text-brand-forest hover:bg-brand-cream transition-colors"
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