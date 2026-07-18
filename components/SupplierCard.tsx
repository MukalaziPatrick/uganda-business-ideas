import type { Supplier } from "@/app/data/suppliers";
import WhatsAppCTA from "./WhatsAppCTA";
import { buildSupplierLeadMessage } from "@/lib/whatsapp";

type SupplierCardProps = {
  supplier: Supplier;
  ideaTitle: string;
};

const statusLabels: Record<Supplier["contactStatus"], string> = {
  verified: "Verified",
  needs_verification: "Needs verification",
  placeholder: "Placeholder",
};

const statusStyles: Record<Supplier["contactStatus"], string> = {
  verified: "border-brand-green/30 bg-brand-cream text-brand-forest",
  needs_verification: "border-amber-200 bg-amber-50 text-amber-700",
  placeholder: "border-brand-beige bg-brand-cream text-brand-green/80",
};

export default function SupplierCard({ supplier, ideaTitle }: SupplierCardProps) {
  const canShowContact = supplier.contactStatus === "verified";
  const source = "idea_detail_supplier_card";

  return (
    <article className="rounded-2xl border border-brand-beige bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold text-brand-ink">{supplier.name}</p>
          <p className="mt-1 text-[12.5px] font-medium text-brand-green/80">
            {supplier.location} · {supplier.category}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${statusStyles[supplier.contactStatus]}`}>
          {statusLabels[supplier.contactStatus]}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-brand-forest">
        {supplier.description}
      </p>

      <div className="mt-3 rounded-xl border border-brand-beige/60 bg-brand-cream px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-green/70">
          Verification note
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-brand-forest">
          {supplier.verificationSummary}
        </p>
      </div>

      {canShowContact && (
        <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-semibold text-brand-forest">
          {supplier.phone && (
            <span className="rounded-full border border-brand-green/20 bg-brand-cream px-3 py-1 text-brand-forest">
              Phone: {supplier.phone}
            </span>
          )}
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-beige bg-white px-3 py-1 hover:bg-brand-cream"
            >
              Website
            </a>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-brand-beige/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] text-brand-green/70">
          {canShowContact
            ? "UBI has checked this listing before publishing contact details."
            : "Contact details are shown only after verification."}
        </p>
        <WhatsAppCTA
          label="Ask UBI for supplier help"
          message={buildSupplierLeadMessage({
            supplierName: supplier.name,
            supplierSlug: supplier.slug,
            supplierCategory: supplier.category,
            ideaTitle,
            source,
            leadRoutingTag: supplier.leadRoutingTag,
          })}
          eventName="supplier_click"
          eventProperties={{
            supplier_slug: supplier.slug,
            supplier_category: supplier.category,
            supplier_routing_tag: supplier.leadRoutingTag,
            idea_title: ideaTitle,
            source,
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-green/30 bg-brand-cream px-4 py-2 text-[12.5px] font-bold text-brand-forest transition-all hover:border-brand-gold hover:bg-brand-beige/50 active:scale-95"
        />
      </div>
    </article>
  );
}
