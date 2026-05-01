import type { Metadata } from "next";
import Link from "next/link";
import { guides, formatUGX } from "../data/guides";
import { SITE_URL } from "@/lib/site";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { buildGuidePurchaseMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Paid Business Guides in Uganda | Uganda Business Ideas",
  description:
    "Buy practical Uganda business startup guides manually through WhatsApp and Mobile Money.",
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
};

export default function GuidesPage() {
  const purchaseSteps = [
    "Choose a guide",
    "Send WhatsApp request",
    "Receive Mobile Money instructions",
    "Receive PDF after payment confirmation",
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-[11px] font-black text-white">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-slate-800">
              Uganda Business Ideas
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Back to ideas
          </Link>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600">
            Practical paid guides
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Start with a focused guide, then ask for help on WhatsApp.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            These starter guides are sold manually for now. Click a guide, send
            the WhatsApp request, receive Mobile Money instructions from UBI,
            and get the PDF after payment is confirmed.
          </p>
        </section>

        <section className="mb-6 grid gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 sm:grid-cols-4 sm:p-5">
          {purchaseSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-[11px] font-black text-white">
                {index + 1}
              </span>
              <p className="text-[12.5px] font-bold text-green-900">{step}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-100">
                  {formatUGX(guide.priceUGX)}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
                  Manual payment
                </span>
              </div>
              <h2 className="mt-4 text-[17px] font-black leading-snug text-slate-900">
                {guide.title}
              </h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-600">
                {guide.summary}
              </p>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Delivery
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
                  {guide.format} · {guide.deliveryExpectation}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-100"
                >
                  View guide
                </Link>
                <WhatsAppCTA
                  label="Buy on WhatsApp"
                  message={buildGuidePurchaseMessage({
                    guideTitle: guide.title,
                    guideSlug: guide.slug,
                    priceUGX: guide.priceUGX,
                    source: "guides_index",
                    paymentMethod: guide.paymentMethod,
                    deliveryExpectation: guide.deliveryExpectation,
                    salesRoutingTag: guide.salesRoutingTag,
                  })}
                  eventName="guide_purchase_intent_click"
                  eventProperties={{
                    guide_slug: guide.slug,
                    guide_price_ugx: guide.priceUGX,
                    payment_method: guide.paymentMethod,
                    sales_routing_tag: guide.salesRoutingTag,
                    source: "guides_index",
                  }}
                />
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
