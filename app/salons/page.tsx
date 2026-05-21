import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { Salon } from "@/lib/supabase/salon-types";
import SalonsClient from "./SalonsClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Salons & Barbers in Uganda | Business Yoo",
  description:
    "Browse salons, barbershops, and mobile stylists across Uganda. See services, prices, and portfolio photos. Contact via WhatsApp.",
  alternates: { canonical: `${SITE_URL}/salons` },
  openGraph: {
    title: "Find Salons & Barbers in Uganda | Business Yoo",
    description: "Browse salons, barbershops, and mobile stylists across Uganda.",
    url: `${SITE_URL}/salons`,
    siteName: "Business Yoo",
    locale: "en_UG",
    type: "website",
  },
};

export default async function SalonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gender?: string; type?: string }>;
}) {
  const params = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("salons")
    .select("id,name,type,gender,district,town,region,service_area,whatsapp,cover_photo_url,status")
    .in("status", ["active", "featured"])
    .order("status", { ascending: false }) // featured first
    .order("created_at", { ascending: false })
    .limit(20);

  const salons = (data ?? []) as Pick<
    Salon,
    "id" | "name" | "type" | "gender" | "district" | "town" | "region" | "service_area" | "whatsapp" | "cover_photo_url" | "status"
  >[];

  return (
    <SalonsClient
      initialSalons={salons}
      initialQuery={params.q ?? ""}
      initialGender={params.gender ?? ""}
      initialType={params.type ?? ""}
    />
  );
}
