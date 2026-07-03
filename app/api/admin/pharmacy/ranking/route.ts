import { NextRequest, NextResponse } from "next/server";
import { calculatePharmacyRankScore } from "@/lib/pharmacy/ranking";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type RankingPayload = {
  id?: string;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  phoneVerified?: boolean;
  mapVerified?: boolean;
  licenceVerified?: boolean;
  hasDelivery?: boolean;
  is24Hour?: boolean;
  rankingNotes?: string | null;
};

function normalizeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as RankingPayload;
  if (!payload.id) {
    return NextResponse.json({ error: "Missing pharmacy id" }, { status: 400 });
  }

  const rawGoogleRating = normalizeNumber(payload.googleRating);
  const googleRating = rawGoogleRating == null ? null : clamp(rawGoogleRating, 0, 5);
  const rawGoogleReviewCount = normalizeNumber(payload.googleReviewCount);
  const googleReviewCount =
    rawGoogleReviewCount == null ? null : Math.max(0, Math.floor(rawGoogleReviewCount));
  const phoneVerified = Boolean(payload.phoneVerified);
  const mapVerified = Boolean(payload.mapVerified);
  const licenceVerified = Boolean(payload.licenceVerified);

  const rankScore = calculatePharmacyRankScore({
    googleRating,
    googleReviewCount,
    phoneVerified,
    mapVerified,
    licenceVerified,
    hasDelivery: Boolean(payload.hasDelivery),
    is24Hour: Boolean(payload.is24Hour),
  });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server env is not configured" }, { status: 500 });
  }

  const { error } = await supabase
    .from("pharmacy_businesses")
    .update({
      google_rating: googleRating,
      google_review_count: googleReviewCount,
      phone_verified: phoneVerified,
      map_verified: mapVerified,
      licence_verified: licenceVerified,
      rank_score: rankScore,
      ranking_notes: payload.rankingNotes?.trim() || null,
      ranking_updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rankScore });
}
