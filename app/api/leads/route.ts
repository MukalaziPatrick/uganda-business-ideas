import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { LeadInsert } from "@/lib/supabase/types";

type LeadRequestBody = {
  name?: unknown;
  phone?: unknown;
  location?: unknown;
  budget?: unknown;
  businessInterest?: unknown;
  timeline?: unknown;
  notes?: unknown;
  source?: unknown;
};

const MAX_FIELD_LENGTH = 500;
const MAX_NOTES_LENGTH = 2000;

function cleanText(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.slice(0, maxLength);
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Lead storage is not configured." },
      { status: 503 }
    );
  }

  let body: LeadRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const lead: LeadInsert = {
    name: cleanText(body.name),
    phone: cleanText(body.phone),
    location: cleanText(body.location),
    budget: cleanText(body.budget),
    business_interest: cleanText(body.businessInterest),
    timeline: cleanText(body.timeline),
    notes: cleanText(body.notes, MAX_NOTES_LENGTH),
    source: cleanText(body.source) || "start_page",
    status: "new",
  };

  if (!lead.phone && !lead.business_interest && !lead.notes) {
    return NextResponse.json(
      { error: "Please include a phone number, business interest, or note." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("leads").insert(lead);

  if (error) {
    console.error("Supabase lead insert failed:", error.message);
    return NextResponse.json(
      { error: "Could not save lead." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
