import { describe, expect, it } from "vitest";
import { buildLeadMagnetIdea } from "./leadMagnet";
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

describe("buildLeadMagnetIdea", () => {
  it("returns a niche-matched magnet for food businesses", () => {
    const magnet = buildLeadMagnetIdea(baseProfile);
    expect(magnet.toLowerCase()).toContain("tasting");
  });

  it("falls back to the generic checklist magnet for unknown niches", () => {
    const magnet = buildLeadMagnetIdea({ ...baseProfile, niche: "quantum consulting", businessIdea: "advisory" });
    expect(magnet.toLowerCase()).toContain("checklist");
  });
});
