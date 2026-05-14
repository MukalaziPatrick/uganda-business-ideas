import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const body = await req.json();
  const required = ["title", "skill_category", "district", "employer_name"];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  if (!body.contact_whatsapp && !body.contact_phone && !body.contact_walkin) {
    return NextResponse.json({ error: "At least one contact method required" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("jobs").insert({
    title: body.title, skill_category: body.skill_category,
    district: body.district, town: body.town ?? null,
    employer_name: body.employer_name,
    contact_whatsapp: body.contact_whatsapp ?? null,
    contact_phone: body.contact_phone ?? null,
    contact_walkin: body.contact_walkin ?? null,
    pay_amount: body.pay_amount ? Number(body.pay_amount) : null,
    pay_period: body.pay_period ?? null, job_type: body.job_type ?? null,
    gender_pref: body.gender_pref ?? null, min_education: body.min_education ?? null,
    accommodation: body.accommodation ?? null, food_provided: body.food_provided ?? null,
    languages: body.languages ?? null, description: body.description ?? null,
    status: "pending", featured: false,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}