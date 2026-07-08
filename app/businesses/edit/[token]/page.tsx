import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Business } from "@/lib/supabase/types";
import EditBusinessForm from "./EditBusinessForm";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return <p className="p-6">Supabase not configured.</p>;

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("edit_token", token)
    .single();

  if (error || !data) notFound();

  const business = data as Business;

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-forest px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-brand-gold" style={{ fontFamily: "Georgia, serif" }}>
          Manage Your Listing
        </h1>
        <p className="text-sm text-white/70 mt-1">{business.name} · keep this link private</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <EditBusinessForm token={token} business={business} />
      </div>
    </div>
  );
}
