import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { Business } from "@/lib/supabase/types";
import BusinessesClient from "./BusinessesClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Local Businesses in Uganda | Business Yoo",
  description:
    "Browse and search real businesses across Uganda by region, district, and category. Find contact details, WhatsApp numbers, and more.",
  alternates: { canonical: `${SITE_URL}/businesses` },
  openGraph: {
    title: "Find Local Businesses in Uganda | Business Yoo",
    description: "Browse and search real businesses across Uganda by region, district, and category.",
    url: `${SITE_URL}/businesses`,
    siteName: "Business Yoo",
    locale: "en_UG",
    type: "website",
  },
};

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; category?: string }>;
}) {
  const params = await searchParams;
  const region = params.region ?? "";
  const category = params.category ?? "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from("businesses")
    .select("id,name,category,region,district,town,whatsapp,phone,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (region) query = query.eq("region", region);
  if (category) query = query.eq("category", category);

  const { data } = await query;

  // Fetch per-region counts for the map (unfiltered)
  const { data: regionRows } = await supabase
    .from("businesses")
    .select("region")
    .eq("status", "active");

  const regionCounts: Partial<Record<string, number>> = {};
  for (const row of regionRows ?? []) {
    regionCounts[row.region] = (regionCounts[row.region] ?? 0) + 1;
  }

  const businesses = (data ?? []) as Pick<
    Business,
    "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status"
  >[];

  return (
    <BusinessesClient
      initialBusinesses={businesses}
      initialQuery={params.q ?? ""}
      initialRegion={(region as Business["region"]) ?? ""}
      initialCategory={category}
      regionCounts={regionCounts}
    />
  );
}
