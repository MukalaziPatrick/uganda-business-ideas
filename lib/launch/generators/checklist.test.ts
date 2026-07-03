import { describe, expect, it } from "vitest";
import { buildLaunchChecklist } from "./checklist";
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

describe("buildLaunchChecklist", () => {
  it("returns exactly 30 items covering days 1 through 30 in order", () => {
    const items = buildLaunchChecklist(baseProfile);
    expect(items).toHaveLength(30);
    expect(items.map((item) => item.dayNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1)
    );
  });

  it("every item has a non-empty title and detail", () => {
    for (const item of buildLaunchChecklist(baseProfile)) {
      expect(item.title.length).toBeGreaterThan(5);
      expect(item.detail.length).toBeGreaterThan(10);
    }
  });

  it("adds URSB registration guidance on day 25 when registration help is requested", () => {
    const items = buildLaunchChecklist({ ...baseProfile, helpNeeded: ["registration"] });
    const day25 = items.find((item) => item.dayNumber === 25);
    expect(day25?.title.toLowerCase()).toContain("registration");
    expect(day25?.detail).toContain("ursb.go.ug");
  });

  it("swaps the day-2 task for sellers to focus on existing customers", () => {
    const items = buildLaunchChecklist({ ...baseProfile, stage: "selling" });
    const day2 = items.find((item) => item.dayNumber === 2);
    expect(day2?.title.toLowerCase()).toContain("best existing customers");
  });
});
