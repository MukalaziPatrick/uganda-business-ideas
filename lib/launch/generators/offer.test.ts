import { describe, expect, it } from "vitest";
import { buildOfferStatement } from "./offer";
import type { IntakeProfile } from "../types";

const baseProfile: IntakeProfile = {
  founderName: "Aisha",
  businessIdea: "a fresh juice delivery service",
  niche: "food and drinks",
  audience: "office workers in Kampala",
  stage: "idea",
  budget: "UGX 300,000",
  goals: "get my first 20 paying customers",
  helpNeeded: ["launch"],
};

describe("buildOfferStatement", () => {
  it("builds a single sentence containing audience and idea", () => {
    const offer = buildOfferStatement(baseProfile);
    expect(offer).toContain("office workers in Kampala");
    expect(offer).toContain("a fresh juice delivery service");
    expect(offer.startsWith("We help ")).toBe(true);
    expect(offer.endsWith(".")).toBe(true);
  });

  it("uses a food-specific outcome for food niches", () => {
    const offer = buildOfferStatement(baseProfile);
    expect(offer).toContain("food");
  });

  it("falls back to a generic outcome for unknown niches", () => {
    const offer = buildOfferStatement({
      ...baseProfile,
      niche: "quantum consulting",
      businessIdea: "a niche advisory practice",
    });
    expect(offer).toContain("solve a real everyday problem");
  });

  it("defaults the audience when blank", () => {
    const offer = buildOfferStatement({ ...baseProfile, audience: "  " });
    expect(offer).toContain("customers in Uganda");
  });
});
