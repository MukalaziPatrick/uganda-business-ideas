import { createClient } from "@supabase/supabase-js";
import { ideas } from "./data/ideas";
import HomeClient from "./HomeClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60;

export default async function HomePage() {
  const [{ data: jobs }, { data: workers }] = await Promise.all([
    supabase.from("jobs").select("id,title,skill_category,district,town,employer_name,pay_amount,pay_period,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(3),
    supabase.from("worker_profiles").select("id,name,skill_primary,district,available").eq("status", "active").eq("available", true).order("created_at", { ascending: false }).limit(6),
  ]);

  return <HomeClient jobs={jobs ?? []} workers={workers ?? []} ideasCount={ideas.length} />;
}