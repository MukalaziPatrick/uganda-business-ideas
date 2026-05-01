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
  verified: "border-green-200 bg-green-50 text-green-700",
  needs_verification: "border-amber-200 bg-amber-50 text-amber-700",
  placeholder: "border-slate-200 bg-slate-50 text-slate-500",
};

export default function SupplierCard({ supplier, ideaTitle }: SupplierCardProps) {
  const canShowContact = supplier.contactStatus === "verified";
  const source = "idea_detail_supplier_card";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold text-slate-900">{supplier.name}</p>
          <p className="mt-1 text-[12.5px] font-medium text-slate-500">
            {supplier.location} · {supplier.category}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${statusStyles[supplier.contactStatus]}`}>
          {statusLabels[supplier.contactStatus]}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
        {supplier.description}
      </p>

      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Verification note
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
          {supplier.verificationSummary}
        </p>
      </div>

      {canShowContact && (
        <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-semibold text-slate-600">
          {supplier.phone && (
            <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-green-700">
              Phone: {supplier.phone}
            </span>
          )}
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50"
            >
              Website
            </a>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] text-slate-400">
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
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-[12.5px] font-bold text-green-700 transition-all hover:border-green-300 hover:bg-green-100 active:scale-95"
        />
      </div>
    </article>
  );
}
