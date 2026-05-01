export type Guide = {
  id: string;
  slug: string;
  title: string;
  priceUGX: number;
  summary: string;
  format: "PDF";
  deliveryTime: string;
  buyerPromise: string;
  targetAudience: string[];
  relatedIdeaSlugs: string[];
  whatYouGet: string[];
  fulfillmentChecklist: string[];
  paymentStatus: "manual_mobile_money" | "coming_soon";
  paymentMethod: "Manual Mobile Money";
  deliveryExpectation: string;
  salesRoutingTag: string;
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const guides: Guide[] = [
  {
    id: "businesses-under-500k",
    slug: "businesses-under-500k",
    title: "Businesses You Can Start Under 500k UGX",
    priceUGX: 15000,
    summary:
      "A practical starter guide for people who want realistic Uganda business ideas with low capital and simple first steps.",
    format: "PDF",
    deliveryTime: "Sent after Mobile Money confirmation",
    buyerPromise:
      "Helps you compare low-capital options, avoid common first-spend mistakes, and choose a realistic first-week action plan.",
    targetAudience: [
      "Students and youth",
      "First-time entrepreneurs",
      "People starting with limited savings",
    ],
    relatedIdeaSlugs: [
      "liquid-soap-business",
      "chapati-business",
      "fruit-selling",
      "mitumba-clothes-business",
    ],
    whatYouGet: [
      "Low-capital business ideas grouped by skill level",
      "Simple startup checklists for each idea",
      "Common mistakes to avoid before spending money",
      "WhatsApp-ready action plan for your first week",
    ],
    fulfillmentChecklist: [
      "Confirm buyer name and WhatsApp number",
      "Confirm guide title and price",
      "Send Mobile Money payment instructions",
      "Verify payment before delivery",
      "Send the PDF and note delivery time",
    ],
    paymentStatus: "manual_mobile_money",
    paymentMethod: "Manual Mobile Money",
    deliveryExpectation:
      "PDF is sent on WhatsApp after UBI confirms Mobile Money payment.",
    salesRoutingTag: "guide-businesses-under-500k",
    faqs: [
      {
        question: "How do I receive this guide?",
        answer:
          "UBI sends the PDF on WhatsApp after confirming the manual Mobile Money payment.",
      },
      {
        question: "Does the guide guarantee I will make money?",
        answer:
          "No. The guide helps you compare options and plan carefully, but income depends on your location, effort, costs, and execution.",
      },
      {
        question: "Can I ask a question after buying?",
        answer:
          "Yes. After delivery, UBI can receive one practical follow-up question about using the guide.",
      },
    ],
  },
  {
    id: "poultry-starter-guide",
    slug: "poultry-starter-guide",
    title: "Poultry Starter Guide in Uganda",
    priceUGX: 20000,
    summary:
      "A beginner-friendly guide for planning a small poultry setup, estimating costs, reducing risk, and finding your first buyers.",
    format: "PDF",
    deliveryTime: "Sent after Mobile Money confirmation",
    buyerPromise:
      "Helps you plan a small poultry setup with cost prompts, risk reminders, and buyer outreach before buying chicks.",
    targetAudience: [
      "Small farmers",
      "Rural and peri-urban households",
      "People interested in broilers or layers",
    ],
    relatedIdeaSlugs: ["poultry-farming", "animal-feed-supply-business"],
    whatYouGet: [
      "Startup checklist for a small flock",
      "Cost planning prompts for chicks, feed, medicine, and housing",
      "Disease and feed-risk reminders",
      "Buyer outreach script for restaurants, neighbours, and traders",
    ],
    fulfillmentChecklist: [
      "Confirm buyer wants the poultry guide",
      "Ask whether they are planning broilers, layers, or still deciding",
      "Send Mobile Money payment instructions",
      "Verify payment before delivery",
      "Send the PDF and invite one follow-up question on WhatsApp",
    ],
    paymentStatus: "manual_mobile_money",
    paymentMethod: "Manual Mobile Money",
    deliveryExpectation:
      "PDF is sent on WhatsApp after UBI confirms Mobile Money payment.",
    salesRoutingTag: "guide-poultry-starter",
    faqs: [
      {
        question: "Is this for broilers or layers?",
        answer:
          "It is for beginners planning a small poultry setup and includes prompts that help you think through broilers, layers, or deciding between them.",
      },
      {
        question: "When is the PDF sent?",
        answer:
          "UBI sends the PDF on WhatsApp after checking and confirming the Mobile Money payment.",
      },
      {
        question: "Will this guide replace veterinary advice?",
        answer:
          "No. It helps with planning and risk awareness, but poultry health decisions should be checked with a qualified vet or extension worker.",
      },
    ],
  },
  {
    id: "chapati-rollex-starter-guide",
    slug: "chapati-rollex-starter-guide",
    title: "Chapati and Rollex Starter Guide",
    priceUGX: 20000,
    summary:
      "A simple street-food startup guide for choosing a location, buying equipment, pricing products, and growing daily sales.",
    format: "PDF",
    deliveryTime: "Sent after Mobile Money confirmation",
    buyerPromise:
      "Helps you plan a chapati or rolex setup with location checks, equipment needs, pricing prompts, and daily sales tracking.",
    targetAudience: [
      "Youth in busy trading centres",
      "Food-business beginners",
      "People who want daily cashflow",
    ],
    relatedIdeaSlugs: ["chapati-business", "fresh-juice-business"],
    whatYouGet: [
      "Equipment and ingredient checklist",
      "Location scoring prompts for schools, stages, and markets",
      "Simple daily sales and cost tracker",
      "Starter menu and pricing ideas",
    ],
    fulfillmentChecklist: [
      "Confirm buyer wants the chapati and rolex guide",
      "Ask intended location or trading centre if available",
      "Send Mobile Money payment instructions",
      "Verify payment before delivery",
      "Send the PDF and remind buyer to test location before spending heavily",
    ],
    paymentStatus: "manual_mobile_money",
    paymentMethod: "Manual Mobile Money",
    deliveryExpectation:
      "PDF is sent on WhatsApp after UBI confirms Mobile Money payment.",
    salesRoutingTag: "guide-chapati-rollex",
    faqs: [
      {
        question: "Does this include exact equipment needs?",
        answer:
          "Yes. It includes a starter checklist for common chapati and rolex equipment, ingredients, and location checks.",
      },
      {
        question: "How do I pay?",
        answer:
          "Start on WhatsApp. UBI replies manually with Mobile Money instructions, then sends the PDF after payment is confirmed.",
      },
      {
        question: "Does the guide promise daily profit?",
        answer:
          "No. It gives planning and tracking prompts, but daily sales depend on location, pricing, consistency, and costs.",
      },
    ],
  },
];

export function formatUGX(amount: number) {
  return `UGX ${amount.toLocaleString("en-US")}`;
}
