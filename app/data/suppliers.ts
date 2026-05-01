export type SupplierCategory =
  | "Agriculture"
  | "Digital"
  | "Food"
  | "Retail"
  | "Services"
  | "General";

export type SupplierContactStatus =
  | "verified"
  | "needs_verification"
  | "placeholder";

export type SupplierPackage = "starter" | "standard" | "featured";

export type SupplierListingPackage = {
  id: SupplierPackage;
  name: string;
  price: string;
  includes: string;
};

export type SupplierVerificationCheck =
  | "business_name_confirmed"
  | "phone_confirmed"
  | "location_confirmed"
  | "offer_confirmed"
  | "owner_approved";

export type Supplier = {
  id: string;
  slug: string;
  name: string;
  category: SupplierCategory;
  location: string;
  description: string;
  ideaSlugs: string[];
  contactStatus: SupplierContactStatus;
  verificationSummary: string;
  verificationChecks: SupplierVerificationCheck[];
  isFeatured: boolean;
  serviceArea?: string;
  leadRoutingTag?: string;
  listingPackage?: SupplierPackage;
  onboardingNotes?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
};

export const supplierListingPackages: SupplierListingPackage[] = [
  {
    id: "starter",
    name: "Starter",
    price: "UGX 50,000/month",
    includes: "Supplier card on one relevant idea page",
  },
  {
    id: "standard",
    name: "Standard",
    price: "UGX 100,000/month",
    includes: "Supplier card on category placement plus three idea pages",
  },
  {
    id: "featured",
    name: "Featured",
    price: "UGX 200,000/month",
    includes: "Priority placement across selected high-intent idea pages",
  },
];

export const suppliers: Supplier[] = [
  {
    id: "placeholder-agro-input-shop",
    slug: "placeholder-agro-input-shop",
    name: "Agro-input supplier slot",
    category: "Agriculture",
    location: "Uganda",
    description:
      "Placeholder listing for seed, feed, veterinary, and farm-input suppliers. Contact details need owner verification before publishing.",
    ideaSlugs: [
      "poultry-farming",
      "pig-farming",
      "animal-feed-supply-business",
    ],
    contactStatus: "needs_verification",
    verificationSummary:
      "Owner must confirm business name, active contact, location, offer, and relevant idea placement before this slot can publish supplier details.",
    verificationChecks: [],
    isFeatured: false,
    serviceArea: "Uganda",
    leadRoutingTag: "agro-inputs",
    listingPackage: "starter",
    onboardingNotes:
      "Collect business name, owner approval, farm-input categories, buyer support terms, operating location, and tested WhatsApp or phone before publishing.",
  },
  {
    id: "placeholder-food-supplies",
    slug: "placeholder-food-supplies",
    name: "Food equipment and ingredients slot",
    category: "Food",
    location: "Uganda",
    description:
      "Placeholder listing for cooking equipment, packaging, ingredients, and small food-business supplies. No supplier contact is published until verified.",
    ideaSlugs: ["chapati-business", "fresh-juice-business"],
    contactStatus: "needs_verification",
    verificationSummary:
      "Contact details are intentionally hidden until UBI confirms the supplier exists, serves food-business buyers, and approves the listing copy.",
    verificationChecks: [],
    isFeatured: false,
    serviceArea: "Uganda",
    leadRoutingTag: "food-supplies",
    listingPackage: "starter",
    onboardingNotes:
      "Confirm equipment or ingredient categories, food-business fit, service area, pricing basics, and public contact approval before publishing.",
  },
  {
    id: "placeholder-retail-wholesale",
    slug: "placeholder-retail-wholesale",
    name: "Retail wholesale supplier slot",
    category: "Retail",
    location: "Uganda",
    description:
      "Placeholder listing for retail stockists, mitumba suppliers, and general wholesale sources. Details should be replaced only after verification.",
    ideaSlugs: ["fruit-selling", "mitumba-clothes-business"],
    contactStatus: "needs_verification",
    verificationSummary:
      "Replace this placeholder only after confirming wholesale category, buying terms, location, and a reachable owner contact.",
    verificationChecks: [],
    isFeatured: false,
    serviceArea: "Uganda",
    leadRoutingTag: "retail-wholesale",
    listingPackage: "starter",
    onboardingNotes:
      "Confirm wholesale category, buyer terms, service area, public listing copy, and owner-approved contact details before publishing.",
  },
  {
    id: "placeholder-service-equipment",
    slug: "placeholder-service-equipment",
    name: "Service equipment supplier slot",
    category: "Services",
    location: "Uganda",
    description:
      "Placeholder listing for tools, machines, cleaning inputs, salon supplies, and service-business equipment. Contact details are intentionally omitted.",
    ideaSlugs: [
      "liquid-soap-business",
      "mobile-money-business",
      "salon-business",
      "tailoring-business",
      "boda-boda-business",
      "water-vending-business",
    ],
    contactStatus: "needs_verification",
    verificationSummary:
      "Publish contact details only after confirming equipment/service category, location, active phone or WhatsApp, and owner approval.",
    verificationChecks: [],
    isFeatured: false,
    serviceArea: "Uganda",
    leadRoutingTag: "service-equipment",
    listingPackage: "starter",
    onboardingNotes:
      "Confirm equipment categories, service-business fit, operating area, availability, and owner-approved contact details before publishing.",
  },
  {
    id: "placeholder-digital-services",
    slug: "placeholder-digital-services",
    name: "Digital tools and training supplier slot",
    category: "Digital",
    location: "Uganda",
    description:
      "Placeholder listing for computer training, printing support, software setup, design tools, and digital-business services. No contact is published until verified.",
    ideaSlugs: [
      "online-store-uganda",
      "social-media-marketing-and-content-services-for-smes-uganda",
      "freelance-graphic-design-and-branding-uganda",
      "basic-it-training-small-cyber-caf-uganda",
    ],
    contactStatus: "needs_verification",
    verificationSummary:
      "Confirm service scope, examples of work, reachable contact, and buyer support terms before listing as a digital supplier.",
    verificationChecks: [],
    isFeatured: false,
    serviceArea: "Uganda",
    leadRoutingTag: "digital-services",
    listingPackage: "starter",
    onboardingNotes:
      "Confirm digital service scope, proof or examples of work, support terms, service area, and owner-approved public contact before publishing.",
  },
];

export const supplierVerificationChecklist: {
  id: SupplierVerificationCheck;
  label: string;
}[] = [
  {
    id: "business_name_confirmed",
    label: "Business name and owner/contact person confirmed",
  },
  {
    id: "phone_confirmed",
    label: "Phone or WhatsApp number tested successfully",
  },
  {
    id: "location_confirmed",
    label: "Operating location or service area confirmed",
  },
  {
    id: "offer_confirmed",
    label: "Products, services, prices, and buyer terms reviewed",
  },
  {
    id: "owner_approved",
    label: "Owner approved public listing copy and contact visibility",
  },
];
