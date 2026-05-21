import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { TravelDestination } from "@/lib/supabase/travel-types";
import TravelHomeClient from "./TravelHomeClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Places to Stay in Uganda | ZuulaUganda",
  description: "Discover hotels, guesthouses, lodges, and campsites across Uganda. Browse by destination — Bwindi, Jinja, Murchison Falls, and more.",
  alternates: { canonical: `${SITE_URL}/travel` },
  openGraph: {
    title: "Find Places to Stay in Uganda | ZuulaUganda",
    description: "Discover accommodation across Uganda's top destinations.",
    url: `${SITE_URL}/travel`,
    siteName: "ZuulaUganda",
    locale: "en_UG",
    type: "website",
  },
};

export default async function TravelHomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("travel_destinations")
    .select("*")
    .order("sort_order", { ascending: true });

  const destinations = (data ?? []) as TravelDestination[];

  return <TravelHomeClient destinations={destinations} />;
}
