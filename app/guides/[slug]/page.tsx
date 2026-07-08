import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnalyticsLink from "@/components/AnalyticsLink";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { SITE_URL } from "@/lib/site";
import { buildGuidePurchaseMessage } from "@/lib/whatsapp";
import { guides, formatUGX } from "../../data/guides";
import { ideas } from "../../data/ideas";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    return {
      title: "Guide Not Found | Business Yoo",
      description: "The requested business guide could not be found.",
    };
  }

  return {
    title: `${guide.title} | Business Yoo`,
    description: guide.summary,
    alternates: {
      canonical: `${SITE_URL}/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();

  const relatedIdeas = ideas.filter((idea) =>
    guide.relatedIdeaSlugs.includes(idea.slug)
  );

  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
        <header className="flex flex-col gap-4 border-b border-brand-beige pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest text-[11px] font-black text-brand-gold">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-brand-forest">
              Business Yoo
            </span>
          </Link>
          <Link
            href="/guides"
            className="inline-flex w-fit rounded-xl border border-brand-beige bg-brand-surface px-4 py-2 text-[13px] font-semibold text-brand-green shadow-sm hover:bg-brand-beige/40"
          >
            All guides
          </Link>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-forest via-brand-green to-brand-forest px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-gold">
            Paid PDF guide
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-cream/75">
            {guide.summary}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-[13px] font-black text-brand-green">
              {formatUGX(guide.priceUGX)}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold text-brand-cream/85">
              {guide.paymentMethod}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold text-brand-cream/85">
              {guide.format}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-brand-beige bg-brand-surface p-6">
          <h2 className="text-[15px] font-bold text-brand-forest">
            What this guide helps you do
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-brand-green">
            {guide.buyerPromise}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-brand-forest ring-1 ring-brand-beige">
              {guide.deliveryExpectation}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-brand-forest ring-1 ring-brand-beige">
              Manual confirmation
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-brand-forest">
              What you get
            </h2>
            <ul className="mt-4 space-y-3">
              {guide.whatYouGet.map((item) => (
                <li key={item} className="flex gap-3 text-[13.5px] text-brand-green">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-brand-forest">
              Best for
            </h2>
            <ul className="mt-4 space-y-3">
              {guide.targetAudience.map((item) => (
                <li key={item} className="flex gap-3 text-[13.5px] text-brand-green">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-brand-forest">
            Manual purchase flow
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Send the WhatsApp purchase request",
              "UBI replies with Mobile Money instructions",
              "Buyer sends payment confirmation",
              "UBI verifies payment before sending the PDF",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl bg-brand-cream px-4 py-3 text-[13px] text-brand-green">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-[10px] font-black text-brand-forest">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-xl border border-brand-gold/50 bg-brand-gold/20 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-forest">
              Delivery expectations
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-brand-forest">
              UBI sends Mobile Money instructions manually and delivers the PDF
              only after payment is confirmed. Keep the guide slug and amount in
              the WhatsApp conversation for manual sales tracking.
            </p>
          </div>
          <div className="mt-5">
            <h3 className="text-[13px] font-bold text-brand-forest">
              Fulfillment checklist
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {guide.fulfillmentChecklist.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[12.5px] leading-relaxed text-brand-green"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <WhatsAppCTA
              label="Buy this guide on WhatsApp"
              message={buildGuidePurchaseMessage({
                guideTitle: guide.title,
                guideSlug: guide.slug,
                priceUGX: guide.priceUGX,
                source: "guide_detail",
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
                source: "guide_detail",
              }}
            />
            <AnalyticsLink
              href={`/start?interest=${encodeURIComponent(guide.title)}`}
              eventName="idea_start_cta_click"
              eventProperties={{
                guide_slug: guide.slug,
                source: "guide_detail",
              }}
              className="mt-3 inline-flex justify-center rounded-xl border border-brand-beige bg-brand-surface px-5 py-2.5 text-[13px] font-bold text-brand-forest shadow-sm transition hover:bg-brand-gold/10 sm:ml-3 sm:mt-0"
            >
              Get help starting
            </AnalyticsLink>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-brand-forest">
            Guide FAQs
          </h2>
          <div className="mt-4 divide-y divide-brand-beige">
            {guide.faqs.map((faq) => (
              <details key={faq.question} className="group py-3">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:hidden">
                  <span className="text-[13.5px] font-bold text-brand-forest group-open:text-brand-forest">
                    {faq.question}
                  </span>
                  <span className="text-[16px] leading-none text-brand-green/70 group-open:text-brand-forest">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-brand-green">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {relatedIdeas.length > 0 && (
          <section className="mt-6 rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-brand-forest">
              Related business ideas
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedIdeas.map((idea) => (
                <Link
                  key={idea.slug}
                  href={`/ideas/${idea.slug}`}
                  className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1.5 text-[12.5px] font-semibold text-brand-green hover:bg-brand-beige/40"
                >
                  {idea.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
