import { createClient } from "@supabase/supabase-js";
import JobsClient from "./JobsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs in Uganda | Uganda Business Hub",
  description: "Find jobs and skilled workers across Uganda. Post a job or register as a worker today.",
};

export const revalidate = 60;

export default async function JobsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [{ data: jobs }, { data: workers }] = await Promise.all([
    supabase.from("jobs").select("*").eq("status", "active").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(100),
    supabase.from("worker_profiles").select("*").eq("status", "active").eq("available", true).order("created_at", { ascending: false }).limit(100),
  ]);

  return <JobsClient jobs={jobs ?? []} workers={workers ?? []} />;
}
