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
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <section className="motion-page relative overflow-hidden rounded-[2rem] bg-brand-forest p-6 text-brand-cream shadow-xl shadow-brand-forest/10 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand-green/60 blur-3xl" />
          <div className="relative mb-5 inline-flex rounded-full bg-brand-gold px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand-forest">
            Kampala pickup network
          </div>
          <h1 className="relative max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="block">Laundry Pickup</span>
            <span className="block">&amp; <span className="text-brand-gold">Delivery</span></span>
          </h1>
          <p className="relative mt-4 max-w-lg text-sm leading-7 text-brand-cream/85 text-pretty sm:text-base">
            Doorstep pickup and delivery across Kampala. Pay with MoMo or cash, then track the order by WhatsApp.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-semibold text-brand-cream/75">
            <span>🧺 Wash &amp; fold</span>
            <span>👔 Ironing</span>
            <span>✨ Dry cleaning</span>
            <span>📲 Order by WhatsApp</span>
          </div>
        </section>

        {providers.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-brand-beige bg-brand-surface p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-2xl">🧺</div>
            <p className="text-sm font-semibold text-brand-forest">No laundry services listed yet.</p>
            <p className="mt-1 text-xs text-brand-green">New pickup providers are joining — check back soon.</p>
          </div>
        )}

        <div className="motion-page-delay mt-6 grid grid-cols-1 gap-4">
          {providers.map((p) => {
            const cta = p.app_url
              ? `${p.app_url}?ref=businessyoo`
              : `https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`;
            return (
              <a
                key={p.id}
                href={cta}
                className="motion-card group block rounded-3xl border border-brand-beige bg-brand-surface p-5 shadow-sm shadow-brand-forest/5 hover:border-brand-gold hover:shadow-lg hover:shadow-brand-forest/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-black text-brand-forest">{p.name}</div>
                    {p.promise && <div className="mt-1 text-sm leading-6 text-brand-green">{p.promise}</div>}
                  </div>
                  {p.status === "featured" && (
                    <span className="shrink-0 rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-brand-forest">
                      Featured
                    </span>
                  )}
                </div>
                {p.service_area && (
                  <div className="mt-4 rounded-2xl bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-green">
                    📍 {p.service_area}
                  </div>
                )}
                <div className="mt-4 text-sm font-black text-brand-forest group-hover:underline">
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
