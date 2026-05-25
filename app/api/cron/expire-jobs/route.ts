import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeBrighterMonday } from "@/lib/scrapers/brightermonday";

export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: expiredRows } = await supabase
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString())
    .select("id");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: deletedRows } = await supabase
    .from("jobs")
    .delete()
    .eq("status", "expired")
    .not("expires_at", "is", null)
    .lt("expires_at", sevenDaysAgo.toISOString())
    .select("id");

  let vanishedCount = 0;
  try {
    const liveJobs = await scrapeBrighterMonday();
    const liveIds = new Set(liveJobs.map(j => j.source_job_id));

    const { data: dbJobs } = await supabase
      .from("jobs")
      .select("id, source_job_id")
      .eq("source", "brightermonday")
      .eq("status", "active");

    const vanishedIds = (dbJobs ?? [])
      .filter(j => !liveIds.has(j.source_job_id))
      .map(j => j.id);

    if (vanishedIds.length > 0) {
      await supabase
        .from("jobs")
        .update({ status: "expired" })
        .in("id", vanishedIds);
      vanishedCount = vanishedIds.length;
    }
  } catch {
    // Don't fail the whole cron if re-check fails
  }

  return NextResponse.json({
    expired: (expiredRows?.length ?? 0) + vanishedCount,
    deleted: deletedRows?.length ?? 0,
    vanished: vanishedCount,
  });
}
