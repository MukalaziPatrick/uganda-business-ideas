import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { LaundryBusiness } from "@/lib/supabase/laundry-types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Laundry Pickup & Delivery in Uganda | Business Yoo",
  description:
    "Doorstep laundry pickup and delivery across Kampala. Wash & fold, ironing, dry cleaning — pay with MoMo or cash. Order via WhatsApp.",
  alternates: { canonical: `${SITE_URL}/laundry` },
  openGraph: {
    title: "Laundry Pickup & Delivery in Uganda | Business Yoo",
    description: "Doorstep laundry pickup and delivery across Kampala.",
    url: `${SITE_URL}/laundry`,
    siteName: "Business Yoo",
    locale: "en_UG",
    type: "website",
  },
};

type Provider = Pick<
  LaundryBusiness,
  "id" | "slug" | "name" | "region" | "service_area" | "whatsapp" | "promise" | "app_url" | "status"
>;

export default async function LaundryPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("laundry_businesses")
    .select("id,slug,name,region,service_area,whatsapp,promise,app_url,status")
    .in("status", ["active", "featured"])
    .order("status", { ascending: false }) // featured first
    .order("created_at", { ascending: false })
    .limit(20);

  const providers = (data ?? []) as Provider[];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Laundry Pickup &amp; Delivery</h1>
        <p className="text-gray-500 mb-8">
          Doorstep pickup and delivery across Kampala. Pay with MoMo or cash.
        </p>

        {providers.length === 0 && (
          <p className="text-gray-400">No laundry services listed yet — check back soon.</p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {providers.map((p) => {
            const cta = p.app_url
              ? `${p.app_url}?ref=businessyoo`
              : `https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`;
            return (
              <a
                key={p.id}
                href={cta}
                className="block p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#0A2540] text-lg">{p.name}</div>
                  {p.status === "featured" && (
                    <span className="text-xs font-semibold text-[#3DA9FC] bg-[#eef6ff] px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                {p.promise && <div className="text-sm text-gray-600 mt-1">{p.promise}</div>}
                {p.service_area && (
                  <div className="text-xs text-gray-400 mt-2">📍 {p.service_area}</div>
                )}
                <div className="text-sm text-[#3DA9FC] font-medium mt-3">
                  {p.app_url ? "Order now →" : "Message on WhatsApp →"}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
