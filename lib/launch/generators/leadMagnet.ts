import type { IntakeProfile } from "../types";

const MAGNETS: Array<{ keywords: string[]; magnet: string }> = [
  {
    keywords: ["food", "catering", "juice", "snack", "restaurant", "drink"],
    magnet:
      "A free tasting sample or first-order discount voucher, shared through WhatsApp status and local groups",
  },
  {
    keywords: ["fashion", "boutique", "clothes", "tailor", "shoes"],
    magnet: "A free style lookbook (photo set) customers can browse and share with friends",
  },
  {
    keywords: ["farm", "agri", "poultry", "produce"],
    magnet: "A free one-page buying guide: how to spot quality produce and fair prices",
  },
  {
    keywords: ["digital", "app", "online", "design", "software", "marketing"],
    magnet: "A free 15-minute audit call with one concrete improvement they can use immediately",
  },
  {
    keywords: ["salon", "beauty", "barber", "spa"],
    magnet: "A first-visit discount card plus a before/after photo series",
  },
];

const DEFAULT_MAGNET =
  "A free one-page checklist that helps your audience solve one small piece of the problem your business solves";

export function buildLeadMagnetIdea(profile: IntakeProfile): string {
  const nicheText = `${profile.niche} ${profile.businessIdea}`.toLowerCase();
  const match = MAGNETS.find((entry) =>
    entry.keywords.some((keyword) => nicheText.includes(keyword))
  );
  return match ? match.magnet : DEFAULT_MAGNET;
}
