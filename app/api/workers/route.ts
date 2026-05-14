import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const body = await req.json();
  const required = ["name", "skill_primary", "district"];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  if (!body.contact_whatsapp && !body.contact_phone) {
    return NextResponse.json({ error: "At least one contact method required" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("worker_profiles").insert({
    name: body.name, skill_primary: body.skill_primary,
    skills_extra: body.skills_extra ?? null, district: body.district,
    town: body.town ?? null,
    contact_whatsapp: body.contact_whatsapp ?? null,
    contact_phone: body.contact_phone ?? null,
    experience_years: body.experience_years ? Number(body.experience_years) : null,
    pay_expectation: body.pay_expectation ? Number(body.pay_expectation) : null,
    pay_period: body.pay_period ?? null, job_type_pref: body.job_type_pref ?? null,
    education: body.education ?? null, languages: body.languages ?? null,
    own_tools: body.own_tools ?? null, willing_to_travel: body.willing_to_travel ?? null,
    bio: body.bio ?? null, available: true, status: "active",
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}