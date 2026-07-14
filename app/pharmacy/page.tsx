import type { Metadata } from "next";
import PublicPharmacyContactActions from "@/components/pharmacy/PublicPharmacyContactActions";
import { getActivePharmacies } from "@/lib/pharmacy/queries";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find a Licensed Pharmacy in Uganda | Business Yoo",
  description:
    "A directory of NDA-licensed pharmacies across Uganda. Find verified pharmacies near you and contact them directly by WhatsApp or phone.",
  alternates: { canonical: `${SITE_URL}/pharmacy` },
  openGraph: {
    title: "Find a Licensed Pharmacy in Uganda | Business Yoo",
    description: "A directory of NDA-licensed pharmacies across Uganda.",
    url: `${SITE_URL}/pharmacy`,
    siteName: "Business Yoo",
    locale: "en_UG",
    type: "website",
  },
};

export default async function PharmacyPage() {
  const pharmacies = await getActivePharmacies();

  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <div className="motion-page relative overflow-hidden bg-brand-forest px-4 py-8 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />
        <h1 className="relative mb-1 text-2xl font-black text-brand-gold sm:text-3xl" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          💊 Find a Licensed Pharmacy
        </h1>
        <p className="relative text-sm text-brand-cream/80">Verified, NDA-licensed pharmacies near you.</p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 rounded-2xl border border-brand-gold/40 bg-brand-gold/15 p-4 text-sm leading-relaxed text-brand-forest">
          This is an informational directory. Business Yoo does not sell or dispense
          medicines. We list licensed pharmacies only - for prescriptions and orders,
          contact the pharmacy directly.
        </div>

        {pharmacies.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-beige bg-brand-surface px-4 py-14 text-center">
            <p className="mb-3 text-3xl">💊</p>
            <p className="text-sm font-semibold text-brand-forest">
              We&apos;re verifying pharmacies in your area.
            </p>
            <p className="mt-1 text-xs text-brand-green">Check back soon.</p>
          </div>
        )}

        <div className="motion-page-delay grid grid-cols-1 gap-4">
          {pharmacies.map((pharmacy) => {
            const location = [pharmacy.district, pharmacy.service_area]
              .filter(Boolean)
              .join(" - ");

            return (
              <div
                key={pharmacy.id}
                className={`motion-card rounded-2xl border bg-brand-surface p-5 shadow-sm shadow-brand-forest/5 ${
                  pharmacy.status === "featured" ? "border-brand-gold" : "border-brand-beige"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-black text-brand-forest">{pharmacy.name}</div>
                  {pharmacy.status === "featured" && (
                    <span className="shrink-0 rounded-full bg-brand-gold px-2.5 py-0.5 text-xs font-black uppercase tracking-wide text-brand-forest">
                      Featured
                    </span>
                  )}
                </div>

                {pharmacy.nda_licence_no && (
                  <div className="mt-2 inline-block rounded-full border border-brand-green/25 bg-brand-green/10 px-2.5 py-0.5 text-xs font-semibold text-brand-green">
                    ✅ NDA Licensed #{pharmacy.nda_licence_no}
                  </div>
                )}

                {location && <div className="mt-2 text-xs text-brand-green">📍 {location}</div>}
                {pharmacy.hours && <div className="mt-1 text-xs text-brand-green">🕐 {pharmacy.hours}</div>}

                {(pharmacy.is_24_hour || pharmacy.has_delivery) && (
                  <div className="mt-2 flex gap-2">
                    {pharmacy.is_24_hour && (
                      <span className="rounded-full bg-brand-cream px-2.5 py-0.5 text-xs font-semibold text-brand-forest">
                        24-Hour
                      </span>
                    )}
                    {pharmacy.has_delivery && (
                      <span className="rounded-full bg-brand-cream px-2.5 py-0.5 text-xs font-semibold text-brand-forest">
                        Delivery available
                      </span>
                    )}
                  </div>
                )}

                {pharmacy.supervising_pharmacist && (
                  <div className="mt-2 text-xs text-brand-green/80">
                    Supervising pharmacist: {pharmacy.supervising_pharmacist}
                  </div>
                )}

                <PublicPharmacyContactActions
                  phone={pharmacy.phone}
                  whatsapp={pharmacy.whatsapp}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
