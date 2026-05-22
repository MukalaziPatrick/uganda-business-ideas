import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { BusinessInsert } from "@/lib/supabase/types";

export type ImportRow = {
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town: string | null;
  phone: string | null;
  source: string;
  external_id: string;
};

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows: ImportRow[] = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const externalIds = rows.map((r) => r.external_id).filter(Boolean);
  const { data: existing } = await supabase
    .from("businesses")
    .select("external_id")
    .in("external_id", externalIds);

  const existingSet = new Set((existing ?? []).map((r) => r.external_id));
  const newRows = rows.filter((r) => !existingSet.has(r.external_id));

  if (newRows.length === 0) {
    return NextResponse.json({ imported: 0, skipped: rows.length });
  }

  const inserts: BusinessInsert[] = newRows.map((r) => ({
    name:        r.name,
    category:    r.category,
    region:      r.region,
    district:    r.district,
    ...(r.town  && { town: r.town }),
    ...(r.phone && { phone: r.phone }),
    source:      r.source,
    external_id: r.external_id,
  }));

  const { error } = await supabase.from("businesses").insert(inserts);
  if (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: newRows.length, skipped: rows.length - newRows.length });
}
