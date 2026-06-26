import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AdminPharmacyClient from "./AdminPharmacyClient";

type PharmacyRow = {
  id: string;
  name: string;
  district: string | null;
  service_area: string | null;
  whatsapp: string | null;
  phone: string | null;
  status?: string;
  created_at: string;
};

export default async function AdminPharmacyPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return <p className="p-6">Supabase not configured.</p>;
  }

  const [{ data: pending }, { data: active }] = await Promise.all([
    supabase
      .from("pharmacy_businesses")
      .select("id,name,district,service_area,whatsapp,phone,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("pharmacy_businesses")
      .select("id,name,district,service_area,whatsapp,phone,status,created_at")
      .in("status", ["active", "featured"])
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminPharmacyClient
      pending={(pending ?? []) as PharmacyRow[]}
      active={(active ?? []) as PharmacyRow[]}
    />
  );
}
