import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const MODULES = ["registration", "compliance", "payments", "banking"] as const;

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: { module?: unknown; intakeId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const moduleName =
    typeof body.module === "string" && (MODULES as readonly string[]).includes(body.module)
      ? body.module
      : null;

  if (!moduleName) {
    return NextResponse.json({ error: "Unknown module." }, { status: 400 });
  }

  const { error } = await supabase.from("fos_module_clicks").insert({
    module: moduleName,
    intake_id: typeof body.intakeId === "string" ? body.intakeId : null,
  });

  if (error) {
    console.error("Founder OS module click insert failed:", error.message);
    return NextResponse.json({ error: "Could not record interest." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
