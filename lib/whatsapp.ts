import { WHATSAPP_NUMBER } from "./site";

type WhatsAppOptions = {
  phone?: string;
  message: string;
};

export function buildWhatsAppUrl({
  phone = WHATSAPP_NUMBER,
  message,
}: WhatsAppOptions) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildIdeaHelpMessage(ideaTitle: string, budgetRange: string) {
  return `Hello UBI, I want help with ${ideaTitle}. My budget is ${budgetRange}. Please guide me.`;
}

type GuidePurchaseMessageInput = {
  guideTitle: string;
  guideSlug: string;
  priceUGX: number;
  source: string;
  paymentMethod: string;
  deliveryExpectation: string;
  salesRoutingTag?: string;
};

export function buildGuidePurchaseMessage({
  guideTitle,
  guideSlug,
  priceUGX,
  source,
  paymentMethod,
  deliveryExpectation,
  salesRoutingTag,
}: GuidePurchaseMessageInput) {
  return [
    `Hello UBI, I want to buy ${guideTitle}.`,
    `Guide slug: ${guideSlug}`,
    `Price: UGX ${priceUGX.toLocaleString("en-US")}`,
    `Payment method: ${paymentMethod}`,
    `Delivery: ${deliveryExpectation}`,
    `Source: ${source}`,
    `Routing tag: ${salesRoutingTag || "Not assigned"}`,
    "Please send me the Mobile Money payment instructions.",
  ].join("\n");
}

type SupplierLeadMessageInput = {
  supplierName: string;
  supplierSlug: string;
  supplierCategory: string;
  ideaTitle: string;
  source: string;
  leadRoutingTag?: string;
};

export function buildSupplierLeadMessage({
  supplierName,
  supplierSlug,
  supplierCategory,
  ideaTitle,
  source,
  leadRoutingTag,
}: SupplierLeadMessageInput) {
  return [
    `Hello UBI, I want supplier help for ${ideaTitle}.`,
    `Supplier: ${supplierName}`,
    `Supplier slug: ${supplierSlug}`,
    `Supplier category: ${supplierCategory}`,
    `Source: ${source}`,
    `Routing tag: ${leadRoutingTag || "Not assigned"}`,
    "Please guide me.",
  ].join("\n");
}

type LeadMessageInput = {
  name: string;
  phone: string;
  location: string;
  budget: string;
  businessInterest: string;
  timeline: string;
  notes: string;
};

export function buildLeadCaptureMessage({
  name,
  phone,
  location,
  budget,
  businessInterest,
  timeline,
  notes,
}: LeadMessageInput) {
  return [
    "Hello UBI, I want help starting a business.",
    `Name: ${name || "Not provided"}`,
    `Phone/WhatsApp: ${phone || "Not provided"}`,
    `Location: ${location || "Not provided"}`,
    `Budget: ${budget || "Not provided"}`,
    `Business interest: ${businessInterest || "Not provided"}`,
    `Timeline: ${timeline || "Not provided"}`,
    `Notes: ${notes || "Not provided"}`,
  ].join("\n");
}
