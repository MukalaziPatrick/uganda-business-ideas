import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import {
  supplierListingPackages,
  supplierVerificationChecklist,
} from "../data/suppliers";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise on Business Yoo | Supplier Listings",
  description:
    "List your Uganda supplier, training, or business support service where entrepreneurs are looking for startup help.",
  alternates: {
    canonical: `${SITE_URL}/advertise`,
  },
};

const verificationSteps = [
  {
    title: "Submit details",
    body: "Send your business name, category, service area, products or services, and best contact person.",
  },
  {
    title: "UBI checks fit",
    body: "Listings are matched only to relevant idea pages where beginners are likely to need that supplier.",
  },
  {
    title: "Confirm contact",
    body: "UBI tests the public phone or WhatsApp number before contact details are shown.",
  },
  {
    title: "Approve listing copy",
    body: "The supplier approves the final wording, listing package, service area, and visible contact details before publishing.",
  },
];

const advertiseMessage =
  "Hello UBI, I want to list my business on Business Yoo. Please send me the supplier listing details.";

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa] text-brand-ink">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-brand-beige pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-[11px] font-black text-white">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-brand-ink">
              Business Yoo
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex w-fit rounded-xl border border-brand-beige bg-white px-4 py-2 text-[13px] font-semibold text-brand-forest shadow-sm hover:bg-brand-cream"
          >
            Back to home
          </Link>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-green">
            Supplier listings
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-brand-ink sm:text-5xl">
            Reach Ugandans looking for suppliers and startup support.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-forest">
            UBI helps people compare business ideas and take the next step. If
            you sell inputs, equipment, training, or business services, your
            listing can appear beside relevant idea pages after verification.
          </p>
          <div className="mt-6">
            <WhatsAppCTA
              label="List my business on UBI"
              message={advertiseMessage}
              eventName="advertise_cta_click"
              eventProperties={{ source: "advertise_page" }}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {supplierListingPackages.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-brand-beige bg-white p-5 shadow-sm"
            >
              <h2 className="text-[17px] font-black text-brand-ink">
                {item.name}
              </h2>
              <p className="mt-2 text-2xl font-black text-brand-forest">
                {item.price}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-brand-forest">
                {item.includes}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-brand-beige bg-white p-6 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-green">
              Verification workflow
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-ink">
              Listings are checked before contacts go public.
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-brand-beige/60 bg-brand-cream p-4"
                >
                  <span className="rounded-full bg-brand-green px-2.5 py-1 text-[10px] font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[14px] font-bold text-brand-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-brand-forest">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-amber-950">
              Owner checklist
            </h2>
            <ul className="mt-4 space-y-3">
              {supplierVerificationChecklist.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 text-[13px] leading-relaxed text-amber-900"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-brand-beige bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-brand-ink">
            Good fit for
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Agro-input shops",
              "Feed suppliers",
              "Equipment sellers",
              "Printing and cyber services",
              "Training providers",
              "Wholesale market vendors",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1.5 text-[12.5px] font-semibold text-brand-forest"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
