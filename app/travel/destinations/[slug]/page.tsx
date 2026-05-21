import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { TravelDestination, TravelStay } from "@/lib/supabase/travel-types";
import DestinationClient from "./DestinationClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

function makeSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await makeSupabase().from("travel_destinations").select("name, description, region").eq("slug", slug).single();
  if (!data) return { title: "Destination Not Found | ZuulaUganda" };
  return {
    title: `Places to Stay near ${data.name}, Uganda | ZuulaUganda`,
    description: `Find hotels, guesthouses, and lodges near ${data.name}. ${data.description}`,
    alternates: { canonical: `${SITE_URL}/travel/destinations/${slug}` },
    openGraph: { title: `Places to Stay near ${data.name} | ZuulaUganda`, description: data.description, url: `${SITE_URL}/travel/destinations/${slug}`, siteName: "ZuulaUganda", locale: "en_UG", type: "website" },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = makeSupabase();

  const { data: destData } = await supabase.from("travel_destinations").select("*").eq("slug", slug).single();

  if (!destData) notFound();
  const destination = destData as TravelDestination;

  const { data: staysData } = await supabase
    .from("travel_stays")
    .select("id,name,type,town,district,price_from,whatsapp,booking_com_url,cover_photo_url,status")
    .eq("destination_id", destination.id)
    .in("status", ["active", "featured"])
    .order("status", { ascending: false })
    .order("price_from", { ascending: true })
    .limit(20);

  const stays = (staysData ?? []) as Pick<TravelStay, "id" | "name" | "type" | "town" | "district" | "price_from" | "whatsapp" | "booking_com_url" | "cover_photo_url" | "status">[];

  return <DestinationClient destination={destination} initialStays={stays} />;
}
