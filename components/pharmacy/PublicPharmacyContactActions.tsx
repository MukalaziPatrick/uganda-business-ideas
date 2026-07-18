"use client";

import { useState } from "react";
import { buildPharmacyContactInfo } from "@/lib/pharmacy/public-contact";

type Props = {
  phone: string | null;
  whatsapp: string | null;
};

export default function PublicPharmacyContactActions({ phone, whatsapp }: Props) {
  const contact = buildPharmacyContactInfo({ phone, whatsapp });
  const [copied, setCopied] = useState(false);

  const copyPhoneNumber = async () => {
    if (!contact.phoneCopyValue) {
      return;
    }

    try {
      await navigator.clipboard.writeText(contact.phoneCopyValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-3">
        {contact.whatsappHref ? (
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="motion-press flex-1 rounded-xl bg-brand-forest py-2 text-center text-sm font-bold text-white transition-colors hover:bg-brand-green"
          >
            💬 WhatsApp
          </a>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-brand-beige bg-brand-cream/60 py-2 text-center text-sm text-brand-green">
            WhatsApp not listed
          </div>
        )}

        {contact.phoneHref ? (
          <a
            href={contact.phoneHref}
            className="motion-press flex-1 rounded-xl border border-brand-beige bg-white py-2 text-center text-sm font-bold text-brand-forest transition-colors hover:border-brand-gold hover:bg-brand-cream"
          >
            📞 Call
          </a>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-brand-beige bg-brand-cream/60 py-2 text-center text-sm text-brand-green">
            Call not listed
          </div>
        )}
      </div>

      {contact.phoneDisplay && (
        <div className="rounded-xl border border-brand-beige bg-brand-cream/60 px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-green">Phone number</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-brand-forest">{contact.phoneDisplay}</span>
            <button
              type="button"
              onClick={copyPhoneNumber}
              className="motion-press rounded-lg border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest transition-colors hover:border-brand-gold hover:bg-brand-cream"
            >
              {copied ? "Copied ✓" : "Copy number"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
