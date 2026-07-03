import { afterEach, describe, expect, it } from "vitest";
import { refineWithAI } from "./refine";

const ORIGINAL_FLAG = process.env.FOS_AI_REFINE;

afterEach(() => {
  if (ORIGINAL_FLAG === undefined) {
    delete process.env.FOS_AI_REFINE;
  } else {
    process.env.FOS_AI_REFINE = ORIGINAL_FLAG;
  }
});

describe("refineWithAI", () => {
  it("returns the input unchanged when the flag is off", () => {
    delete process.env.FOS_AI_REFINE;
    expect(refineWithAI("hello founder")).toBe("hello founder");
  });

  it("still returns the input unchanged in V1 even when the flag is on", () => {
    process.env.FOS_AI_REFINE = "true";
    expect(refineWithAI("hello founder")).toBe("hello founder");
  });
});
