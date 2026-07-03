export type PharmacyRankingInput = {
  googleRating: number | null;
  googleReviewCount: number | null;
  phoneVerified: boolean;
  mapVerified: boolean;
  licenceVerified: boolean;
  hasDelivery: boolean;
  is24Hour: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculatePharmacyRankScore(input: PharmacyRankingInput): number {
  const rating = input.googleRating == null ? 0 : clamp(input.googleRating, 0, 5);
  const reviews = Math.max(0, input.googleReviewCount ?? 0);

  const ratingScore = rating >= 4.5 ? 15 : rating >= 3.5 ? 10 : rating > 0 ? 5 : 0;
  const reviewScore = reviews >= 50 ? 10 : reviews >= 10 ? 5 : 0;
  const verificationScore =
    (input.phoneVerified ? 15 : 0) +
    (input.mapVerified ? 15 : 0) +
    (input.licenceVerified ? 25 : 0);
  const serviceScore = (input.hasDelivery ? 5 : 0) + (input.is24Hour ? 5 : 0);

  return ratingScore + reviewScore + verificationScore + serviceScore;
}
