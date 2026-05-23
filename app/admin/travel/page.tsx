import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminTravelClient from "./AdminTravelClient";
import type { TravelDestination } from "@/lib/supabase/travel-types";

export default async function AdminTravelPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) redirect("/admin/login");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: pending }, { data: active }, { data: destinations }] = await Promise.all([
    supabase.from("travel_stays").select("id,name,type,town,whatsapp,created_at").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("travel_stays").select("id,name,type,town,status,created_at").in("status", ["active", "featured"]).order("created_at", { ascending: false }),
    supabase.from("travel_destinations").select("*").order("sort_order"),
  ]);

  return (
    <AdminTravelClient
      pending={pending ?? []}
      active={active ?? []}
      destinations={(destinations ?? []) as TravelDestination[]}
    />
  );
}
