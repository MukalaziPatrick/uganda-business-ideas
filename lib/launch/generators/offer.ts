import type { IntakeProfile } from "../types";

const NICHE_OUTCOMES: Array<{ keywords: string[]; outcome: string }> = [
  {
    keywords: ["food", "restaurant", "catering", "snack", "juice", "drink"],
    outcome: "get fresh, reliable food and drinks without the usual hassle",
  },
  {
    keywords: ["fashion", "clothes", "boutique", "shoes", "tailor"],
    outcome: "look sharp with quality pieces at fair prices",
  },
  {
    keywords: ["farm", "agri", "poultry", "produce", "livestock"],
    outcome: "get trusted farm-fresh supply, consistently",
  },
  {
    keywords: ["digital", "app", "online", "software", "design", "marketing"],
    outcome: "get real results online without the technical stress",
  },
  {
    keywords: ["salon", "beauty", "spa", "barber"],
    outcome: "look and feel their best without overpaying",
  },
  {
    keywords: ["transport", "boda", "delivery", "logistics"],
    outcome: "move goods and people quickly and safely",
  },
];

const DEFAULT_OUTCOME = "solve a real everyday problem quickly and affordably";

export function buildOfferStatement(profile: IntakeProfile): string {
  const audience = profile.audience.trim() || "customers in Uganda";
  const idea = profile.businessIdea.trim();
  const nicheText = `${profile.niche} ${profile.businessIdea}`.toLowerCase();
  const match = NICHE_OUTCOMES.find((entry) =>
    entry.keywords.some((keyword) => nicheText.includes(keyword))
  );
  const outcome = match ? match.outcome : DEFAULT_OUTCOME;

  return `We help ${audience} ${outcome} through ${idea}.`;
}
