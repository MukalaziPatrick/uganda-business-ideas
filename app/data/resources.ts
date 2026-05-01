// app/data/resources.ts
// ─────────────────────────────────────────────────────────────────────────────
// CURATED EXTERNAL RESOURCES
//
// Each resource has a categories[] array.
// Use categories: ["All"] to show it on every idea page.
// Otherwise, it only appears on idea pages whose idea.category matches.
//
// ── HOW TO ADD A NEW RESOURCE ────────────────────────────────────────────────
//   1. Copy any block below
//   2. Fill in all fields
//   3. Set categories: ["Agriculture"] — or ["All"] to show everywhere
//   4. Save — it appears automatically on the right idea pages
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceType = "Government" | "Training" | "Finance" | "Market" | "Community";

export type Resource = {
  title: string;
  url: string;
  desc: string;
  type: ResourceType;
  categories: string[]; // use ["All"] for every page
  free: boolean;
};

export const resources: Resource[] = [
  // ── Government & Registration ─────────────────────────────────────────────
  {
    title: "KCCA — Business Registration",
    url: "https://www.kcca.go.ug",
    desc: "Register your trading licence with Kampala Capital City Authority. Required before you can legally operate in Kampala.",
    type: "Government",
    categories: ["All"],
    free: false,
  },
  {
    title: "URSB — Register a Business Name",
    url: "https://eservices.ursb.go.ug",
    desc: "Uganda Registration Services Bureau. Register a business name or company online. Required to open a business bank account.",
    type: "Government",
    categories: ["All"],
    free: false,
  },
  {
    title: "URA — Get Your Tax ID (TIN)",
    url: "https://www.ura.go.ug",
    desc: "Register for a Tax Identification Number at Uganda Revenue Authority. Required once your business starts generating income.",
    type: "Government",
    categories: ["All"],
    free: true,
  },

  // ── Finance & Loans ───────────────────────────────────────────────────────
  {
    title: "Uganda Development Bank — SME Loans",
    url: "https://www.udb.ug",
    desc: "Government-backed development loans for small businesses at lower interest rates than commercial banks.",
    type: "Finance",
    categories: ["All"],
    free: false,
  },
  {
    title: "PostBank Uganda — Small Business Banking",
    url: "https://www.postbank.co.ug",
    desc: "Low-cost business accounts and accessible small business loans in most Ugandan towns — beginner friendly.",
    type: "Finance",
    categories: ["All"],
    free: false,
  },

  // ── Agriculture ───────────────────────────────────────────────────────────
  {
    title: "NARO — Certified Seeds & Farmer Advice",
    url: "https://naro.go.ug",
    desc: "National Agricultural Research Organisation. Offers free certified seeds, agronomist advice, and extension services for registered farmers.",
    type: "Government",
    categories: ["Agriculture"],
    free: true,
  },
  {
    title: "NAADS — Free Farming Support",
    url: "https://www.naads.or.ug",
    desc: "National Agricultural Advisory Services. Free technical advice and input support for smallholder farmers. Contact your nearest district office.",
    type: "Government",
    categories: ["Agriculture"],
    free: true,
  },
  {
    title: "Ministry of Agriculture — Price Bulletins",
    url: "https://www.agriculture.go.ug",
    desc: "Government agricultural policies, seasonal price bulletins, and guidelines for livestock and crop farming across Uganda.",
    type: "Government",
    categories: ["Agriculture"],
    free: true,
  },

  // ── Services ──────────────────────────────────────────────────────────────
  {
    title: "MTN Uganda — Become a MoMo Agent",
    url: "https://www.mtn.co.ug/mtn-mobile-money",
    desc: "Official MTN registration page for mobile money agents. Includes requirements, float minimums, and commission structure details.",
    type: "Market",
    categories: ["Services"],
    free: true,
  },
  {
    title: "Airtel Uganda — Become an Airtel Money Agent",
    url: "https://www.airtel.co.ug/airtel-money",
    desc: "Register as an Airtel Money agent in Uganda. Run both MTN and Airtel from one point to maximise daily transaction volume.",
    type: "Market",
    categories: ["Services"],
    free: true,
  },

  // ── Retail & Food ─────────────────────────────────────────────────────────
  {
    title: "Jumia Uganda — Start Selling Online",
    url: "https://www.jumia.ug/sp-sell-on-jumia",
    desc: "List your products on Uganda's largest e-commerce platform. Good for retail products, food packaging, and handmade goods.",
    type: "Market",
    categories: ["Retail", "Food"],
    free: false,
  },
  {
    title: "Jiji Uganda — Free Local Ads",
    url: "https://jiji.ug",
    desc: "Free classified ads site popular across Uganda. Post your products or services to reach buyers in your area at no cost.",
    type: "Market",
    categories: ["Retail", "Services", "Food"],
    free: true,
  },

  // ── Training ──────────────────────────────────────────────────────────────
  {
    title: "Google Digital Skills for Africa",
    url: "https://learndigital.withgoogle.com/digitalskills",
    desc: "Free online courses covering digital marketing, business basics, and online selling — all free with a certificate on completion.",
    type: "Training",
    categories: ["All"],
    free: true,
  },
  {
    title: "Outbox Uganda — Business Mentorship",
    url: "https://outboxhub.com",
    desc: "Ugandan innovation hub offering business development training, startup mentorship, and entrepreneur support programmes.",
    type: "Training",
    categories: ["All"],
    free: false,
  },
  {
    title: "UNBS — Uganda National Bureau of Standards",
    url: "https://www.unbs.go.ug",
    desc: "Required if you produce and sell food or cleaning products. Get your product certified so schools, hospitals, and shops can legally stock it.",
    type: "Government",
    categories: ["Food", "Services"],
    free: false,
  },
];