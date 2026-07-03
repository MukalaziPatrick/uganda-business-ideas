import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import AdminPharmacyClient from "./AdminPharmacyClient";

type PharmacyRow = {
  id: string;
  name: string;
  district: string | null;
  service_area: string | null;
  whatsapp: string | null;
  phone: string | null;
  is_24_hour?: boolean;
  has_delivery?: boolean;
  google_rating?: number | null;
  google_review_count?: number | null;
  phone_verified?: boolean;
  map_verified?: boolean;
  licence_verified?: boolean;
  rank_score?: number;
  ranking_notes?: string | null;
  ranking_updated_at?: string | null;
  status?: string;
  created_at: string;
};

export default async function AdminPharmacyPage() {
  if (!(await requireAdmin())) {
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
      .select(
        "id,name,district,service_area,whatsapp,phone,is_24_hour,has_delivery,google_rating,google_review_count,phone_verified,map_verified,licence_verified,rank_score,ranking_notes,ranking_updated_at,status,created_at"
      )
      .in("status", ["active", "featured"])
      .order("rank_score", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminPharmacyClient
      pending={(pending ?? []) as PharmacyRow[]}
      active={(active ?? []) as PharmacyRow[]}
    />
  );
}
