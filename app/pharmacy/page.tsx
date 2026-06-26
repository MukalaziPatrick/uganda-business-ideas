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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Find a Licensed Pharmacy</h1>
        <p className="mb-6 text-gray-500">Verified, NDA-licensed pharmacies near you.</p>

        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This is an informational directory. Business Yoo does not sell or dispense
          medicines. We list licensed pharmacies only - for prescriptions and orders,
          contact the pharmacy directly.
        </div>

        {pharmacies.length === 0 && (
          <p className="text-gray-400">
            We&apos;re verifying pharmacies in your area. Check back soon.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {pharmacies.map((pharmacy) => {
            const whatsappNumber = pharmacy.whatsapp?.replace(/[^0-9]/g, "") ?? "";
            const phoneNumber = pharmacy.phone?.replace(/[^0-9+]/g, "") ?? "";
            const location = [pharmacy.district, pharmacy.service_area]
              .filter(Boolean)
              .join(" - ");

            return (
              <div
                key={pharmacy.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-semibold text-[#0A2540]">{pharmacy.name}</div>
                  {pharmacy.status === "featured" && (
                    <span className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-xs font-semibold text-[#3DA9FC]">
                      Featured
                    </span>
                  )}
                </div>

                {pharmacy.nda_licence_no && (
                  <div className="mt-2 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    NDA Licensed #{pharmacy.nda_licence_no}
                  </div>
                )}

                {location && <div className="mt-2 text-xs text-gray-400">{location}</div>}
                {pharmacy.hours && <div className="mt-1 text-xs text-gray-400">{pharmacy.hours}</div>}

                {(pharmacy.is_24_hour || pharmacy.has_delivery) && (
                  <div className="mt-2 flex gap-2">
                    {pharmacy.is_24_hour && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        24-Hour
                      </span>
                    )}
                    {pharmacy.has_delivery && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        Delivery available
                      </span>
                    )}
                  </div>
                )}

                {pharmacy.supervising_pharmacist && (
                  <div className="mt-2 text-xs text-gray-400">
                    Supervising pharmacist: {pharmacy.supervising_pharmacist}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      className="flex-1 rounded-xl bg-[#25D366] py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <div className="flex-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-2 text-center text-sm text-gray-500">
                      WhatsApp not listed
                    </div>
                  )}

                  {phoneNumber ? (
                    <a
                      href={`tel:${phoneNumber}`}
                      className="flex-1 rounded-xl border border-gray-300 py-2 text-center text-sm font-medium text-[#0A2540] transition-colors hover:bg-gray-50"
                    >
                      Call
                    </a>
                  ) : (
                    <div className="flex-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-2 text-center text-sm text-gray-500">
                      Call not listed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
