// app/page.tsx
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { ideas } from "./data/ideas";
import HomeClient from "./HomeClient";
import HomeJobsTeaser from "./HomeJobsTeaser";

export const metadata: Metadata = {
  title: "Uganda Business Hub — Ideas, Businesses & Jobs",
  description: "Find business ideas, locate businesses, and browse jobs across all Uganda districts.",
};

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: workers } = await supabase
    .from("worker_profiles")
    .select("id,name,skill_primary,district,available")
    .eq("status", "active")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <HomeClient workers={workers ?? []} ideasCount={ideas.length} />
      <HomeJobsTeaser />
    </>
  );
}
