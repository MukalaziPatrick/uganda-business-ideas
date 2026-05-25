import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeBrighterMonday } from "@/lib/scrapers/brightermonday";
import { scrapePSC } from "@/lib/scrapers/psc";
import type { ScrapedJob } from "@/lib/scrapers/types";

export const maxDuration = 60;

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [bmJobs, pscJobs] = await Promise.all([
    scrapeBrighterMonday().catch(() => [] as ScrapedJob[]),
    scrapePSC().catch(() => [] as ScrapedJob[]),
  ]);

  const allJobs = [...bmJobs, ...pscJobs];

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const job of allJobs) {
    try {
      const row = {
        title: job.title,
        employer_name: job.employer_name,
        district: job.district,
        skill_category: job.skill_category,
        job_type: job.job_type,
        description: job.description,
        source: job.source,
        source_url: job.source_url,
        source_job_id: job.source_job_id,
        expires_at: job.expires_at ?? defaultExpiresAt(),
        status: "active",
        featured: false,
        contact_whatsapp: null,
        contact_phone: null,
        contact_walkin: null,
        town: null,
        pay_amount: null,
        pay_period: null,
        gender_pref: null,
        min_education: null,
        accommodation: null,
        food_provided: null,
        languages: null,
      };

      const { error, data } = await supabase
        .from("jobs")
        .upsert(row, { onConflict: "source,source_job_id", ignoreDuplicates: false })
        .select("id")
        .single();

      if (error) {
        errors++;
      } else if (data) {
        inserted++;
      } else {
        updated++;
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    brightermonday: bmJobs.length,
    psc: pscJobs.length,
    inserted,
    updated,
    errors,
  });
}
