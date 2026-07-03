import { describe, expect, it } from "vitest";
import { calculatePharmacyRankScore } from "./ranking";

describe("calculatePharmacyRankScore", () => {
  it("rewards strong review signals and verified pharmacy details", () => {
    const score = calculatePharmacyRankScore({
      googleRating: 4.7,
      googleReviewCount: 80,
      phoneVerified: true,
      mapVerified: true,
      licenceVerified: true,
      hasDelivery: true,
      is24Hour: true,
    });

    expect(score).toBe(90);
  });

  it("keeps weak or unverified rows lower even when they are active", () => {
    const score = calculatePharmacyRankScore({
      googleRating: 3.8,
      googleReviewCount: 6,
      phoneVerified: false,
      mapVerified: false,
      licenceVerified: false,
      hasDelivery: false,
      is24Hour: false,
    });

    expect(score).toBe(10);
  });

  it("normalizes missing and out-of-range review inputs", () => {
    const score = calculatePharmacyRankScore({
      googleRating: 9,
      googleReviewCount: -20,
      phoneVerified: true,
      mapVerified: true,
      licenceVerified: false,
      hasDelivery: false,
      is24Hour: false,
    });

    expect(score).toBe(45);
  });
});
