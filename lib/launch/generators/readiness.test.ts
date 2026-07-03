import { describe, expect, it } from "vitest";
import { buildReadinessSummary } from "./readiness";
import type { IntakeProfile } from "../types";

const baseProfile: IntakeProfile = {
  founderName: "Aisha",
  businessIdea: "a fresh juice delivery service",
  niche: "food and drinks",
  audience: "office workers in Kampala",
  stage: "idea",
  budget: "UGX 300,000",
  goals: "get my first 20 paying customers",
  helpNeeded: ["launch", "content"],
};

describe("buildReadinessSummary", () => {
  it("includes the founder name and budget", () => {
    const summary = buildReadinessSummary(baseProfile);
    expect(summary).toContain("Aisha");
    expect(summary).toContain("UGX 300,000");
  });

  it("mentions the requested help areas", () => {
    const summary = buildReadinessSummary(baseProfile);
    expect(summary).toContain("launch");
    expect(summary).toContain("content");
  });

  it("changes the framing by stage", () => {
    const ideaSummary = buildReadinessSummary(baseProfile);
    const sellingSummary = buildReadinessSummary({ ...baseProfile, stage: "selling" });
    expect(ideaSummary).not.toEqual(sellingSummary);
    expect(sellingSummary).toContain("already selling");
  });

  it("handles an empty help list without crashing", () => {
    const summary = buildReadinessSummary({ ...baseProfile, helpNeeded: [] });
    expect(summary.length).toBeGreaterThan(50);
  });
});
