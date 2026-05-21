import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Salon, SalonService, SalonPortfolio } from "@/lib/supabase/salon-types";
import { SALON_GENDER_LABELS, SALON_TYPE_LABELS, formatPrice, formatDuration } from "@/app/data/salons";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await makeSupabase()
    .from("salons")
    .select("name, gender, district, about")
    .eq("id", id)
    .in("status", ["active", "featured"])
    .single();
  if (!data) return { title: "Salon Not Found | Business Yoo" };
  const title = `${data.name} | ${SALON_GENDER_LABELS[data.gender]} Salon in ${data.district}, Uganda`;
  const description = data.about ?? `${data.name} — a salon in ${data.district}, Uganda. View services, prices and portfolio on Business Yoo.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/salons/${id}` },
    openGraph: { title, description, url: `${SITE_URL}/salons/${id}`, siteName: "Business Yoo", locale: "en_UG", type: "website" },
  };
}

export default async function SalonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = makeSupabase();

  const [{ data: salon }, { data: services }, { data: portfolio }] = await Promise.all([
    supabase.from("salons").select("*").eq("id", id).in("status", ["active", "featured"]).single(),
    supabase.from("salon_services").select("*").eq("salon_id", id).order("sort_order"),
    supabase.from("salon_portfolio").select("*").eq("salon_id", id).order("sort_order"),
  ]);

  if (!salon) notFound();

  const s = salon as Salon;
  const svcList = (services ?? []) as SalonService[];
  const photos = (portfolio ?? []) as SalonPortfolio[];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(s.name + " " + s.district + " Uganda")}`;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1">
        <Link href="/salons" className="hover:text-[#1C3A2A]">Salons</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{s.name}</span>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] px-5 py-8 text-white">
        {s.status === "featured" && (
          <span className="absolute top-3 right-3 bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-1 rounded-full">
            ⭐ FEATURED
          </span>
        )}
        <p className="text-3xl mb-2">✂️</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>{s.name}</h1>
        <p className="text-sm text-white/70">
          {SALON_GENDER_LABELS[s.gender]} · {SALON_TYPE_LABELS[s.type]} · {s.town ? `${s.town}, ` : ""}{s.district}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b border-gray-200">
        {s.whatsapp && (
          <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#25d366] text-white rounded-xl py-3 text-xs font-bold">
            💬 WhatsApp
          </a>
        )}
        {s.phone && (
          <a href={`tel:${s.phone}`}
            className="flex flex-col items-center justify-center gap-1 bg-[#1C3A2A] text-white rounded-xl py-3 text-xs font-bold">
            📞 Call
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 bg-[#f0f4ff] text-[#1C3A2A] rounded-xl py-3 text-xs font-bold">
          📍 Directions
        </a>
      </div>

      {/* Info strip */}
      <div className="bg-[#f0f7f0] px-4 py-2.5 border-b border-[#d0e8d0] text-xs text-[#2d6a4f] flex gap-4 flex-wrap">
        <span>🕐 {s.opening_hours}</span>
        <span>{s.walkin ? "✅ Walk-ins welcome" : "📅 Appointment only"}</span>
        {s.service_area && <span>🚗 Serves: {s.service_area}</span>}
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Services */}
        {svcList.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">✂️ Services & Prices</p>
            <div className="space-y-3">
              {svcList.map((svc) => (
                <div key={svc.id} className="flex gap-3 items-start">
                  {svc.photo_url ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={svc.photo_url} alt={svc.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#f5f0e8] flex-shrink-0 flex items-center justify-center text-2xl">✂️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1C3A2A] text-sm">{svc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {SALON_GENDER_LABELS[svc.gender]}{svc.duration_minutes ? ` · ${formatDuration(svc.duration_minutes)}` : ""}
                    </p>
                    <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">{formatPrice(svc.price_from, svc.price_to)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {photos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📸 Our Work</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((p, i) => (
                <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={p.photo_url} alt={p.caption ?? `Portfolio ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
              {photos.length > 6 && (
                <div className="aspect-square rounded-lg bg-[#f5f0e8] flex items-center justify-center text-xs font-bold text-[#1C3A2A]">
                  +{photos.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* About */}
        {s.about && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About</p>
            <p className="text-sm text-gray-700 leading-relaxed">{s.about}</p>
          </div>
        )}

        <Link href="/salons" className="block text-center text-sm font-bold text-[#1C3A2A] underline underline-offset-2 pb-4">
          ← Back to all salons
        </Link>
      </div>
    </div>
  );
}
