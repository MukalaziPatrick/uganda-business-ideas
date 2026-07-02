import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Job = {
  id: string; title: string; skill_category: string;
  district: string; town: string | null; employer_name: string;
  contact_whatsapp: string | null; contact_phone: string | null;
  pay_amount: number | null; pay_period: string | null;
  featured: boolean; created_at: string;
};

function whatsappHref(phone: string, title: string) {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "256" + clean.slice(1) : clean;
  return `https://wa.me/${num}?text=${encodeURIComponent(`Hi, I am interested in the ${title} job listed on Uganda Business Hub.`)}`;
}

export default async function HomeJobsTeaser() {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id,title,skill_category,district,town,employer_name,contact_whatsapp,contact_phone,pay_amount,pay_period,featured,created_at")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const eyebrow = "text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600";

  return (
    <section className="bg-slate-50 px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={eyebrow}>💼 Work Near You</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Latest Jobs</h2>
          </div>
          <Link href="/jobs" className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-100">
            View all →
          </Link>
        </div>

        {(!jobs || jobs.length === 0) ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
            <p className="mb-3">No jobs posted yet — be the first!</p>
            <Link href="/jobs/post" className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">
              Post a Job (Free)
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(jobs as Job[]).map(job => {
              const applyHref = job.contact_whatsapp
                ? whatsappHref(job.contact_whatsapp, job.title)
                : job.contact_phone ? `tel:${job.contact_phone}` : "/jobs";
              return (
                <div key={job.id} className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 ${job.featured ? "border-amber-400" : "border-slate-200"}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {job.featured && <span className="text-[10px] font-bold text-amber-500">⭐</span>}
                      <p className="truncate text-sm font-black text-slate-900">{job.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {[job.town, job.district].filter(Boolean).join(", ")}
                      {job.pay_amount ? ` · UGX ${job.pay_amount.toLocaleString()}/${job.pay_period}` : ""}
                    </p>
                  </div>
                  <a href={applyHref} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                    Apply
                  </a>
                </div>
              );
            })}
            <Link href="/jobs/post"
              className="block rounded-2xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-green-600 hover:bg-slate-50">
              + Post a Job (Free)
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
