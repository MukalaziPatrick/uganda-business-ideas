import type { Metadata } from "next";
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Find a Licensed Pharmacy</h1>
        <p className="text-gray-500 mb-6">Verified, NDA-licensed pharmacies near you.</p>

        {/* Compliance disclaimer — required */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          This is an informational directory. Business Yoo does not sell or dispense
          medicines. We list licensed pharmacies only — for prescriptions and orders,
          contact the pharmacy directly.
        </div>

        {pharmacies.length === 0 && (
          <p className="text-gray-400">
            We&apos;re verifying pharmacies in your area. Check back soon.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {pharmacies.map((p) => {
            const waNumber = p.whatsapp.replace(/[^0-9]/g, "");
            const telNumber = (p.phone ?? p.whatsapp).replace(/[^0-9+]/g, "");
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-gray-200 bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[#0A2540] text-lg">{p.name}</div>
                  {p.status === "featured" && (
                    <span className="text-xs font-semibold text-[#3DA9FC] bg-[#eef6ff] px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {p.nda_licence_no && (
                  <div className="text-xs font-medium text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-2">
                    ✓ NDA Licensed · #{p.nda_licence_no}
                  </div>
                )}

                {p.service_area && (
                  <div className="text-xs text-gray-400 mt-2">📍 {p.service_area}</div>
                )}
                {p.hours && <div className="text-xs text-gray-400 mt-1">🕐 {p.hours}</div>}

                {(p.is_24_hour || p.has_delivery) && (
                  <div className="flex gap-2 mt-2">
                    {p.is_24_hour && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        24-Hour
                      </span>
                    )}
                    {p.has_delivery && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        🛵 Delivery available
                      </span>
                    )}
                  </div>
                )}

                {p.supervising_pharmacist && (
                  <div className="text-xs text-gray-400 mt-2">
                    Supervising pharmacist: {p.supervising_pharmacist}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <a
                    href={`https://wa.me/${waNumber}`}
                    className="flex-1 text-center text-sm font-medium text-white bg-[#25D366] rounded-xl py-2 hover:opacity-90 transition-opacity"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${telNumber}`}
                    className="flex-1 text-center text-sm font-medium text-[#0A2540] border border-gray-300 rounded-xl py-2 hover:bg-gray-50 transition-colors"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
