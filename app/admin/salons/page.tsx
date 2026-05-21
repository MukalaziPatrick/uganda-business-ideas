import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminSalonsClient from "./AdminSalonsClient";

export default async function AdminSalonsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pending } = await supabase
    .from("salons")
    .select("id,name,type,gender,district,whatsapp,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: active } = await supabase
    .from("salons")
    .select("id,name,type,gender,district,status,created_at")
    .in("status", ["active", "featured"])
    .order("created_at", { ascending: false });

  return <AdminSalonsClient pending={pending ?? []} active={active ?? []} />;
}
