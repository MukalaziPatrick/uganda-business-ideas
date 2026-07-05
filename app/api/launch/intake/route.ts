import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildReadinessSummary } from "@/lib/launch/generators/readiness";
import { buildOfferStatement } from "@/lib/launch/generators/offer";
import { buildLeadMagnetIdea } from "@/lib/launch/generators/leadMagnet";
import { buildLaunchChecklist } from "@/lib/launch/generators/checklist";
import { buildContentStarters } from "@/lib/launch/generators/content";
import {
  HELP_OPTIONS,
  type FounderStage,
  type HelpOption,
  type IntakeProfile,
} from "@/lib/launch/types";

const MAX_FIELD_LENGTH = 500;
const MAX_LONG_FIELD_LENGTH = 2000;

function cleanText(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function cleanStage(value: unknown): FounderStage | null {
  return value === "idea" || value === "started" || value === "selling" ? value : null;
}

function cleanHelpNeeded(value: unknown): HelpOption[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is HelpOption =>
      typeof entry === "string" && (HELP_OPTIONS as readonly string[]).includes(entry)
  );
}

function hasOwn(body: IntakeRequestBody, key: keyof IntakeRequestBody) {
  return Object.prototype.hasOwnProperty.call(body, key);
}

type IntakeRequestBody = {
  intakeId?: unknown;
  step?: unknown;
  complete?: unknown;
  password?: unknown;
  founderName?: unknown;
  phone?: unknown;
  email?: unknown;
  businessIdea?: unknown;
  niche?: unknown;
  audience?: unknown;
  stage?: unknown;
  budget?: unknown;
  goals?: unknown;
  helpNeeded?: unknown;
};

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: IntakeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fields = {
    founder_name: cleanText(body.founderName),
    phone: cleanText(body.phone),
    email: cleanText(body.email),
    business_idea: cleanText(body.businessIdea),
    niche: cleanText(body.niche),
    audience: cleanText(body.audience),
    stage: cleanStage(body.stage),
    budget: cleanText(body.budget),
    goals: cleanText(body.goals, MAX_LONG_FIELD_LENGTH),
    help_needed: cleanHelpNeeded(body.helpNeeded),
  };
  const step = typeof body.step === "number" ? Math.min(Math.max(body.step, 1), 5) : 1;
  const intakeId = typeof body.intakeId === "string" ? body.intakeId : null;

  // --- First save: create lead + intake ---------------------------------
  if (!intakeId) {
    if (!fields.founder_name || !fields.phone) {
      return NextResponse.json(
        { error: "Please include your name and phone number." },
        { status: 400 }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name: fields.founder_name,
        phone: fields.phone,
        source: "launch_wizard",
        vertical: "founder_os",
        status: "new",
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error("Founder OS lead insert failed:", leadError?.message);
      return NextResponse.json({ error: "Could not save your details." }, { status: 502 });
    }

    const { data: intake, error: intakeError } = await supabase
      .from("fos_intakes")
      .insert({
        lead_id: lead.id,
        current_step: step,
        founder_name: fields.founder_name,
        phone: fields.phone,
      })
      .select("id")
      .single();

    if (intakeError || !intake) {
      console.error("Founder OS intake insert failed:", intakeError?.message);
      return NextResponse.json({ error: "Could not save your details." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, intakeId: intake.id });
  }

  // --- Subsequent saves: update only fields that were sent ---------------
  const update: Record<string, unknown> = { current_step: step };
  if (hasOwn(body, "founderName")) update.founder_name = fields.founder_name;
  if (hasOwn(body, "phone")) update.phone = fields.phone;
  if (hasOwn(body, "email")) update.email = fields.email;
  if (hasOwn(body, "businessIdea")) update.business_idea = fields.business_idea;
  if (hasOwn(body, "niche")) update.niche = fields.niche;
  if (hasOwn(body, "audience")) update.audience = fields.audience;
  if (hasOwn(body, "stage")) update.stage = fields.stage;
  if (hasOwn(body, "budget")) update.budget = fields.budget;
  if (hasOwn(body, "goals")) update.goals = fields.goals;
  if (hasOwn(body, "helpNeeded")) update.help_needed = fields.help_needed;

  const { error: updateError } = await supabase
    .from("fos_intakes")
    .update(update)
    .eq("id", intakeId);

  if (updateError) {
    console.error("Founder OS intake update failed:", updateError.message);
    return NextResponse.json({ error: "Could not save your answers." }, { status: 502 });
  }

  if (body.complete !== true) {
    return NextResponse.json({ ok: true, intakeId });
  }

  // --- Completion: validate, create account, generate the plan -----------
  const { data: intake, error: fetchError } = await supabase
    .from("fos_intakes")
    .select("*")
    .eq("id", intakeId)
    .single();

  if (fetchError || !intake) {
    return NextResponse.json({ error: "Intake not found." }, { status: 404 });
  }

  if (
    !intake.founder_name ||
    !intake.phone ||
    !intake.business_idea ||
    !intake.audience ||
    !intake.stage
  ) {
    return NextResponse.json(
      { error: "Some answers are missing — please complete the earlier steps." },
      { status: 400 }
    );
  }

  let userId: string | null = null;
  const password = typeof body.password === "string" ? body.password : null;
  if (intake.email && password && password.length >= 8) {
    const { data: created, error: userError } = await supabase.auth.admin.createUser({
      email: intake.email,
      password,
      email_confirm: true,
    });
    if (userError) {
      // Existing email or auth hiccup must never block the plan.
      console.error("Founder OS account creation skipped:", userError.message);
    } else if (created?.user) {
      userId = created.user.id;
    }
  }

  const profile: IntakeProfile = {
    founderName: intake.founder_name,
    businessIdea: intake.business_idea,
    niche: intake.niche ?? "",
    audience: intake.audience,
    stage: intake.stage as FounderStage,
    budget: intake.budget ?? "",
    goals: intake.goals ?? "",
    helpNeeded: (intake.help_needed ?? []) as HelpOption[],
  };

  const { data: plan, error: planError } = await supabase
    .from("fos_launch_plans")
    .insert({
      intake_id: intakeId,
      user_id: userId,
      offer_statement: buildOfferStatement(profile),
      lead_magnet_idea: buildLeadMagnetIdea(profile),
      readiness_summary: buildReadinessSummary(profile),
    })
    .select("id")
    .single();

  if (planError || !plan) {
    console.error("Founder OS plan insert failed:", planError?.message);
    return NextResponse.json({ error: "Could not create your plan." }, { status: 502 });
  }

  const taskRows = buildLaunchChecklist(profile).map((item, index) => ({
    plan_id: plan.id,
    day_number: item.dayNumber,
    title: item.title,
    detail: item.detail,
    sort_order: index,
  }));
  const { error: tasksError } = await supabase.from("fos_plan_tasks").insert(taskRows);
  if (tasksError) {
    console.error("Founder OS tasks insert failed:", tasksError.message);
    return NextResponse.json({ error: "Could not create your plan." }, { status: 502 });
  }

  const contentRows = buildContentStarters(profile).map((item, index) => ({
    plan_id: plan.id,
    kind: item.kind,
    body: item.body,
    sort_order: index,
  }));
  const { error: contentError } = await supabase.from("fos_content_items").insert(contentRows);
  if (contentError) {
    console.error("Founder OS content insert failed:", contentError.message);
    return NextResponse.json({ error: "Could not create your plan." }, { status: 502 });
  }

  const { error: completeError } = await supabase
    .from("fos_intakes")
    .update({ status: "complete", user_id: userId })
    .eq("id", intakeId);

  if (completeError) {
    console.error("Founder OS intake completion failed:", completeError.message);
  }

  return NextResponse.json({ ok: true, intakeId, planId: plan.id });
}
