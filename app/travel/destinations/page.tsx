import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import type { TravelDestination } from "@/lib/supabase/travel-types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Destinations in Uganda | ZuulaUganda",
  description: "Browse all travel destinations in Uganda — national parks, lakes, cities, and adventure spots.",
  alternates: { canonical: `${SITE_URL}/travel/destinations` },
};

const GRADIENTS = [
  "from-[#1a3a1a] to-[#2d5a27]", "from-[#1a4a6e] to-[#0d3a5c]",
  "from-[#5a3a1a] to-[#3a2010]", "from-[#1a5a3a] to-[#0d3a27]",
  "from-[#3a1a5a] to-[#2a0d3a]", "from-[#5a1a1a] to-[#3a0d0d]",
];

export default async function DestinationsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("travel_destinations").select("*").order("sort_order");
  const destinations = (data ?? []) as TravelDestination[];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 py-6 text-center text-white">
        <Link href="/travel" className="text-xs text-white/60 mb-2 block">← ZuulaUganda</Link>
        <h1 className="text-2xl font-black text-[#F5C842]" style={{ fontFamily: "Georgia, serif" }}>All Destinations</h1>
        <p className="text-sm text-white/70 mt-1">{destinations.length} destinations across Uganda</p>
      </div>
      <div className="px-4 py-5 max-w-2xl mx-auto grid grid-cols-2 gap-3">
        {destinations.map((d, i) => (
          <Link key={d.id} href={`/travel/destinations/${d.slug}`}
            className={`relative rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-4 text-white min-h-[90px] flex flex-col justify-end`}>
            {d.is_featured && (
              <span className="absolute top-2 right-2 bg-[#F5C842] text-[#1C3A2A] text-[9px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>
            )}
            {d.activities[0] && <p className="text-[10px] text-white/60 mb-1">{d.activities[0]}</p>}
            <p className="font-black text-sm leading-tight">{d.name}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{d.region}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
