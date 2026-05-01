"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

type WhatsAppCTAProps = {
  message: string;
  label: string;
  phone?: string;
  className?: string;
  eventName?: AnalyticsEventName;
  eventProperties?: Record<string, string | number | boolean | null | undefined>;
};

export default function WhatsAppCTA({
  message,
  label,
  phone,
  className,
  eventName = "whatsapp_click",
  eventProperties,
}: WhatsAppCTAProps) {
  return (
    <a
      href={buildWhatsAppUrl({ phone, message })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent(eventName, eventProperties)}
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-green-700 active:scale-95"
      }
    >
      {label}
    </a>
  );
}
