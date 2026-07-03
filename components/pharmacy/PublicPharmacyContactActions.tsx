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
            className="flex-1 rounded-xl bg-[#25D366] py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            WhatsApp
          </a>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-2 text-center text-sm text-gray-500">
            WhatsApp not listed
          </div>
        )}

        {contact.phoneHref ? (
          <a
            href={contact.phoneHref}
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

      {contact.phoneDisplay && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Phone number</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#0A2540]">{contact.phoneDisplay}</span>
            <button
              type="button"
              onClick={copyPhoneNumber}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0A2540] transition-colors hover:bg-gray-100"
            >
              {copied ? "Copied" : "Copy number"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
