import { createClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/supabase/types";
import BusinessesClient from "./BusinessesClient";

export const revalidate = 60;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; category?: string }>;
}) {
  const params = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("businesses")
    .select("id,name,category,region,district,town,whatsapp,phone,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const businesses = (data ?? []) as Pick<
    Business,
    "id" | "name" | "category" | "region" | "district" | "town" | "whatsapp" | "phone" | "status"
  >[];

  return (
    <BusinessesClient
      initialBusinesses={businesses}
      initialQuery={params.q ?? ""}
      initialRegion={(params.region as Business["region"]) ?? ""}
      initialCategory={params.category ?? ""}
    />
  );
}
