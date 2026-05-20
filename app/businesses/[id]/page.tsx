import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Business } from "@/lib/supabase/types";
import { categoryEmoji } from "@/app/data/businesses";
import ShareButton from "./ShareButton";

export const revalidate = 60;

async function incrementSignal(id: string, signal: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.rpc("increment_business_signal", {
    business_id: id,
    signal_col: signal,
  });
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data) notFound();

  const business = data as Business;

  incrementSignal(id, "view_count").catch(() => {});

  const socials = [
    business.website  && { label: "🌐 Website",   href: business.website },
    business.facebook && { label: "📘 Facebook",  href: business.facebook.startsWith("http") ? business.facebook : `https://facebook.com/${business.facebook}` },
    business.instagram && { label: "📸 Instagram", href: business.instagram.startsWith("http") ? business.instagram : `https://instagram.com/${business.instagram}` },
    business.tiktok   && { label: "🎵 TikTok",    href: business.tiktok.startsWith("http") ? business.tiktok : `https://tiktok.com/@${business.tiktok}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex gap-1">
        <Link href="/businesses" className="hover:text-[#1C3A2A]">Businesses</Link>
        <span>›</span>
        <span className="text-[#1C3A2A] font-semibold truncate">{business.name}</span>
      </div>

      <div className="bg-gradient-to-br from-[#1C3A2A] to-[#2D5A40] px-5 py-8 text-white">
        <p className="text-3xl mb-3">{categoryEmoji(business.category)}</p>
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          {business.name}
        </h1>
        <p className="text-sm text-white/70">
          {business.category} · {business.town ? `${business.town}, ` : ""}{business.district}, {business.region}
        </p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {business.description && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About</p>
            <p className="text-sm text-gray-700 leading-relaxed">{business.description}</p>
          </div>
        )}

        {business.hours && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Opening Hours</p>
            <p className="text-sm text-gray-700">🕐 {business.hours}</p>
          </div>
        )}

        <div className="space-y-2">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25d366] py-4 text-sm font-black text-white"
            >
              💬 Chat on WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-white border-2 border-[#1C3A2A] py-4 text-sm font-black text-[#1C3A2A]"
            >
              📞 Call {business.phone}
            </a>
          )}
        </div>

        {socials.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Find us online</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#f5f0e8] border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#1C3A2A] hover:bg-[#e8f5ee] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <ShareButton name={business.name} />

        <Link href="/businesses" className="block text-center text-sm font-bold text-[#1C3A2A] underline underline-offset-2 pb-4">
          ← Back to all businesses
        </Link>
      </div>
    </div>
  );
}
