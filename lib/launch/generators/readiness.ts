import type { IntakeProfile } from "../types";

const STAGE_LINES: Record<IntakeProfile["stage"], string> = {
  idea: "You are at the idea stage, so the next 30 days are about proving one offer with real customers before spending on anything heavy.",
  started:
    "You have already started, so the next 30 days are about sharpening your offer and making sales activity consistent every single day.",
  selling:
    "You are already selling, so the next 30 days are about tightening what works and raising your visibility to grow revenue.",
};

export function buildReadinessSummary(profile: IntakeProfile): string {
  const budget = profile.budget.trim() || "a small starting budget";
  const helpLine = profile.helpNeeded.length
    ? `You asked for help with ${profile.helpNeeded.join(", ")} — your plan leans on those areas first.`
    : "You did not flag specific help areas, so your plan follows the standard launch arc.";

  return [
    `${profile.founderName.trim()}, here is your launch readiness snapshot.`,
    STAGE_LINES[profile.stage],
    `With ${budget}, the plan keeps costs near zero until the offer is proven with real buyers.`,
    helpLine,
  ].join(" ");
}
