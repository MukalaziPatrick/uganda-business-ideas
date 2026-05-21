import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { TravelStay, TravelStayRoom, TravelStayPhoto, TravelDestination } from "@/lib/supabase/travel-types";
import { STAY_TYPE_LABELS } from "@/app/data/travel";
import { SITE_URL } from "@/lib/site";
import RequestToBookForm from "./RequestToBookForm";

export const revalidate = 60;

function makeSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await makeSupabase().from("travel_stays").select("name, description, town").eq("id", id).in("status", ["active", "featured"]).single();
  if (!data) return { title: "Stay Not Found | ZuulaUganda" };
  return {
    title: `${data.name} | ${data.town} Uganda | ZuulaUganda`,
    description: data.description.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/travel/stays/${id}` },
  };
}

export default async function StayProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = makeSupabase();

  const [{ data: stayData }, { data: roomsData }, { data: photosData }] = await Promise.all([
    supabase.from("travel_stays").select("*, travel_destinations(name, slug)").eq("id", id).in("status", ["active", "featured"]).single(),
    supabase.from("travel_stay_rooms").select("*").eq("stay_id", id).order("sort_order"),
    supabase.from("travel_stay_photos").select("*").eq("stay_id", id).order("sort_order"),
  ]);

  if (!stayData) notFound();

  const stay = stayData as TravelStay & { travel_destinations: Pick<TravelDestination, "name" | "slug"> };
  const rooms = (roomsData ?? []) as TravelStayRoom[];
  const photos = (photosData ?? []) as TravelStayPhoto[];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(stay.name + " " + stay.district + " Uganda")}`;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1 flex-wrap">
        <Link href="/travel" className="hover:text-[#1C3A2A]">ZuulaUganda</Link>
        <span>›</span>
        <Link href={`/travel/destinations/${stay.travel_destinations.slug}`} className="hover:text-[#1C3A2A]">{stay.travel_destinations.name}</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{stay.name}</span>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-5 py-8 text-white">
        {stay.status === "featured" && (
          <span className="absolute top-3 right-3 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-1 rounded-full">⭐ FEATURED</span>
        )}
        <p className="text-xs text-white/50 mb-1">{STAY_TYPE_LABELS[stay.type]} · {stay.town}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>{stay.name}</h1>
        <p className="text-sm font-bold text-white/80">From UGX {stay.price_from.toLocaleString()} / night</p>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="p-3 bg-[#f5f0e8]">
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
            <div className="col-span-2 relative rounded-xl overflow-hidden" style={{ height: 140 }}>
              <Image src={photos[0].photo_url} alt={photos[0].caption ?? stay.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              {photos[1] && (
                <div className="relative rounded-xl overflow-hidden flex-1">
                  <Image src={photos[1].photo_url} alt={photos[1].caption ?? stay.name} fill className="object-cover" />
                </div>
              )}
              {photos.length > 2 && (
                <div className="relative rounded-xl overflow-hidden flex-1 bg-black/40 flex items-center justify-center">
                  {photos[2] && <Image src={photos[2].photo_url} alt="" fill className="object-cover opacity-50" />}
                  <span className="relative text-white text-xs font-bold">+{photos.length - 2} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b border-gray-200">
        {stay.whatsapp && (
          <a href={`https://wa.me/${stay.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#25d366] text-white rounded-xl py-3 text-xs font-bold">💬 WhatsApp</a>
        )}
        {stay.booking_com_url && (
          <a href={stay.booking_com_url} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#003580] text-white rounded-xl py-3 text-xs font-bold">🌐 Booking.com</a>
        )}
        <a href="#request" className="flex flex-col items-center justify-center gap-1 bg-[#1C3A2A] text-white rounded-xl py-3 text-xs font-bold">📋 Request</a>
      </div>

      {/* Info strip */}
      <div className="bg-[#f0f7f0] px-4 py-2.5 border-b border-[#d0e8d0] text-xs text-[#2d6a4f] flex gap-4 flex-wrap">
        <span>{STAY_TYPE_LABELS[stay.type]}</span>
        <span>👥 Up to {stay.capacity} guests</span>
        <span>🔑 Check-in {stay.checkin_time}</span>
        <span>📍 {stay.town}, {stay.district}</span>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* About */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">About</p>
          <p className="text-sm text-gray-700 leading-relaxed">{stay.description}</p>
        </div>

        {/* Amenities */}
        {stay.amenities.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {stay.amenities.map((a) => (
                <span key={a} className="bg-[#f0f0f0] text-gray-700 text-xs px-3 py-1.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Rooms */}
        {rooms.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Room Types & Prices</p>
            <div className="divide-y divide-gray-100">
              {rooms.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-semibold text-[#1C3A2A]">{r.name}</p>
                    <p className="text-xs text-gray-400">Up to {r.capacity} guest{r.capacity > 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-sm font-bold text-[#2d6a4f]">UGX {r.price_per_night.toLocaleString()}/night</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request to Book */}
        <div id="request" className="bg-[#f5f0e8] rounded-xl border border-[#e0d8cc] p-4">
          <p className="text-xs font-bold text-[#1C3A2A] uppercase tracking-wide mb-3">📋 Request to Book</p>
          <RequestToBookForm stayName={stay.name} stayWhatsapp={stay.whatsapp} />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Location</p>
          <p className="text-sm text-gray-600 mb-3">{stay.town}, {stay.district}, Uganda</p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full bg-[#e8f5e8] text-[#2d6a4f] text-sm font-bold text-center py-3 rounded-xl">
            🗺️ Open in Google Maps
          </a>
        </div>

        <Link href={`/travel/destinations/${stay.travel_destinations.slug}`}
          className="block text-center text-sm font-bold text-[#1C3A2A] underline underline-offset-2 pb-4">
          ← Back to {stay.travel_destinations.name}
        </Link>
      </div>
    </div>
  );
}
