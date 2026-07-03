import { describe, expect, it } from "vitest";
import { buildContentStarters } from "./content";
import type { IntakeProfile } from "../types";

const baseProfile: IntakeProfile = {
  founderName: "Aisha",
  businessIdea: "a fresh juice delivery service",
  niche: "food and drinks",
  audience: "office workers in Kampala",
  stage: "idea",
  budget: "UGX 300,000",
  goals: "get my first 20 paying customers",
  helpNeeded: ["content"],
};

describe("buildContentStarters", () => {
  it("returns 10 ideas, 3 post drafts, 5 headlines, and 1 email CTA", () => {
    const items = buildContentStarters(baseProfile);
    expect(items.filter((item) => item.kind === "content_idea")).toHaveLength(10);
    expect(items.filter((item) => item.kind === "post_draft")).toHaveLength(3);
    expect(items.filter((item) => item.kind === "headline")).toHaveLength(5);
    expect(items.filter((item) => item.kind === "email_cta")).toHaveLength(1);
    expect(items).toHaveLength(19);
  });

  it("weaves the business idea and audience into the copy", () => {
    const items = buildContentStarters(baseProfile);
    const allText = items.map((item) => item.body).join(" ");
    expect(allText).toContain("a fresh juice delivery service");
    expect(allText).toContain("office workers in Kampala");
  });

  it("every item has a non-trivial body", () => {
    for (const item of buildContentStarters(baseProfile)) {
      expect(item.body.length).toBeGreaterThan(20);
    }
  });
});
