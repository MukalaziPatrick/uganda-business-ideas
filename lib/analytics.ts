export type AnalyticsEventName =
  | "advertise_cta_click"
  | "guide_cta_click"
  | "guide_purchase_intent_click"
  | "idea_start_cta_click"
  | "lead_form_submit"
  | "supplier_click"
  | "whatsapp_click";

type AnalyticsEventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event",
      eventName: string,
      params?: AnalyticsEventProperties
    ) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsEventProperties = {}
) {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID && !GTM_ID) return;

  if (GTM_ID && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...properties,
    });
  }

  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
    window.gtag("event", eventName, properties);
  }
}
