import type { Category } from "./ideas";

export type BlogPostSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type BlogPostLink = {
  label: string;
  href: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: Category | "Planning";
  readingTime: string;
  audience: string;
  heroSummary: string;
  sections: BlogPostSection[];
  relatedLinks: BlogPostLink[];
  guideSlug?: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "businesses-to-start-under-500k-uganda",
    title: "Businesses You Can Start Under 500k UGX in Uganda",
    description:
      "Practical low-capital business ideas in Uganda, with startup cautions, first steps, and links to detailed UBI idea guides.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-01",
    category: "Planning",
    readingTime: "6 min read",
    audience: "First-time entrepreneurs with limited savings",
    heroSummary:
      "Starting small is often smarter than waiting for perfect capital. These ideas can begin lean, but they still need testing, record keeping, and careful buying.",
    guideSlug: "businesses-under-500k",
    relatedLinks: [
      { label: "Liquid Soap Business", href: "/ideas/liquid-soap-business" },
      { label: "Chapati Business", href: "/ideas/chapati-business" },
      { label: "Mitumba Clothes Business", href: "/ideas/mitumba-clothes-business" },
      { label: "Get help choosing", href: "/start?interest=Businesses%20under%20500k" },
    ],
    sections: [
      {
        heading: "Start with a business you can test quickly",
        body:
          "A low-capital business should let you test demand before you spend heavily on rent, stock, or equipment. In Uganda, this usually means selling to people you can reach directly: neighbours, school communities, market customers, churches, salons, offices, or boda stages.",
        bullets: [
          "Pick one narrow product or service first.",
          "Use a small first batch instead of buying stock for a full shop.",
          "Track every sale and expense from day one.",
        ],
      },
      {
        heading: "Good first options under 500k",
        body:
          "Liquid soap, chapati or snacks, fruit selling, simple cleaning services, tuition, and selected digital services can all start lean. The right choice depends on your skills, location, and how quickly you need cashflow.",
        bullets: [
          "Food ideas can move daily but need strict hygiene and a good spot.",
          "Service ideas can start with fewer materials but need trust and consistency.",
          "Retail ideas need careful stock selection because unsold stock ties up cash.",
        ],
      },
      {
        heading: "Common mistake to avoid",
        body:
          "Do not spend the whole 500k on setup before speaking to buyers. Keep part of the money for transport, packaging, phone data, replacement stock, and unexpected costs. A small reserve can keep the business alive during the first slow weeks.",
      },
    ],
  },
  {
    slug: "how-to-choose-business-idea-uganda",
    title: "How to Choose the Right Business Idea in Uganda",
    description:
      "A simple decision framework for choosing a Uganda business idea by budget, location, skills, demand, and risk.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-01",
    category: "Planning",
    readingTime: "7 min read",
    audience: "Beginners comparing several business options",
    heroSummary:
      "The best business idea is not always the one with the biggest profit story. It is the one that fits your capital, location, skills, time, and risk tolerance.",
    relatedLinks: [
      { label: "Browse all ideas", href: "/ideas" },
      { label: "Mobile Money Business", href: "/ideas/mobile-money-business" },
      { label: "Businesses under 500k guide", href: "/guides/businesses-under-500k" },
      { label: "Start form", href: "/start?interest=Choosing%20a%20business%20idea" },
    ],
    sections: [
      {
        heading: "Check your real starting capital",
        body:
          "Write down the money you can use without affecting rent, food, school fees, or debt payments. Then separate startup setup from operating cash. A business that needs 1M may still fail if all 1M goes into equipment and nothing remains for the first month.",
      },
      {
        heading: "Match the idea to your location",
        body:
          "A strong business in Kikuubo may not work the same way in a quiet village, and a farming idea may not fit someone renting one room in town. Watch foot traffic, buyer habits, transport costs, and nearby competitors before choosing.",
        bullets: [
          "Food and retail need visible demand nearby.",
          "Agriculture needs land, water, labour, and buyer access.",
          "Digital and service businesses need reliable communication and trust.",
        ],
      },
      {
        heading: "Choose a risk you understand",
        body:
          "Every business has risk: spoilage, disease, rent pressure, slow buyers, fraud, poor location, or changing prices. Pick an idea where you can name the main risks and explain how you will reduce them.",
      },
    ],
  },
  {
    slug: "poultry-farming-costs-uganda-beginners",
    title: "Poultry Farming Costs in Uganda for Beginners",
    description:
      "A beginner-friendly overview of poultry farming startup costs, risks, and planning questions before buying chicks in Uganda.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-01",
    category: "Agriculture",
    readingTime: "6 min read",
    audience: "Small farmers and households considering poultry",
    heroSummary:
      "Poultry can create regular income, but feed, disease control, housing, and buyer planning matter more than simply buying chicks.",
    guideSlug: "poultry-starter-guide",
    relatedLinks: [
      { label: "Poultry Farming idea", href: "/ideas/poultry-farming" },
      { label: "Animal Feed Supply Business", href: "/ideas/animal-feed-supply-business" },
      { label: "Poultry starter guide", href: "/guides/poultry-starter-guide" },
      { label: "Ask for startup help", href: "/start?interest=Poultry%20farming" },
    ],
    sections: [
      {
        heading: "Budget beyond chicks",
        body:
          "Many beginners budget for chicks and forget the full cycle. Poultry costs usually include housing, feeders, drinkers, brooder heat, feed, vaccines, medicine, litter, transport, and losses from mortality.",
      },
      {
        heading: "Start smaller than your maximum capital",
        body:
          "If you can afford 100 chicks, starting with 30 to 50 may be wiser for your first cycle. A smaller flock helps you learn feeding, cleaning, vaccination timing, and buyer outreach without risking all your capital.",
      },
      {
        heading: "Plan buyers before sale week",
        body:
          "Do not wait until birds are ready before looking for buyers. Speak to neighbours, restaurants, market vendors, traders, and local WhatsApp groups early. Delayed selling increases feed costs and can reduce profit.",
      },
    ],
  },
  {
    slug: "where-to-find-suppliers-small-business-uganda",
    title: "Where to Find Suppliers for a Small Business in Uganda",
    description:
      "How beginners can think about suppliers, price comparison, verification, and safer buying before starting a small business in Uganda.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-01",
    category: "Retail",
    readingTime: "5 min read",
    audience: "Beginners buying stock, inputs, or equipment",
    heroSummary:
      "Supplier choice can decide your margin before you make your first sale. Compare prices, verify claims, and start with quantities you can sell.",
    relatedLinks: [
      { label: "Retail ideas", href: "/ideas?category=Retail" },
      { label: "Mitumba Clothes Business", href: "/ideas/mitumba-clothes-business" },
      { label: "Advertise as a supplier", href: "/advertise" },
      { label: "Start form", href: "/start?interest=Finding%20suppliers" },
    ],
    sections: [
      {
        heading: "Compare before committing",
        body:
          "Visit or contact at least three suppliers before buying. Ask about price, minimum quantity, delivery, return policy, warranty, and whether prices change by season or exchange rate.",
      },
      {
        heading: "Buy for demand, not excitement",
        body:
          "New entrepreneurs often buy too many items because a supplier gives a discount. A discount is only useful if the stock can move. Start with fast-moving items, then expand after real sales data.",
      },
      {
        heading: "Verify before paying",
        body:
          "Be careful with online suppliers, screenshots, and pressure to pay quickly. Use known shops where possible, ask for receipts, inspect goods, and avoid sending large deposits to people you cannot verify.",
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
