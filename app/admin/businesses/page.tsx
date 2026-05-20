import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Business } from "@/lib/supabase/types";

type BusinessRow = Pick<Business, "id" | "name" | "category" | "district" | "region" | "whatsapp" | "phone" | "status" | "created_at">;

async function approveBusiness(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase.from("businesses").update({ status: "active" }).eq("id", id);
  revalidatePath("/admin/businesses");
}

async function rejectBusiness(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase.from("businesses").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/businesses");
}

export default async function AdminBusinessesPage() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return <p>Supabase not configured.</p>;

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,category,district,region,whatsapp,phone,status,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return <p>Could not load businesses.</p>;

  const businesses = (data ?? []) as BusinessRow[];

  return (
    <main className="p-6">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-4">Pending Businesses ({businesses.length})</h1>
      {businesses.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending businesses. All clear!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1C3A2A] text-white">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">District</th>
                <th className="text-left p-3">Region</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Submitted</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-semibold">{b.name}</td>
                  <td className="p-3">{b.category}</td>
                  <td className="p-3">{b.district}</td>
                  <td className="p-3">{b.region}</td>
                  <td className="p-3">{b.whatsapp || b.phone || "—"}</td>
                  <td className="p-3">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <form action={approveBusiness}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700">
                          Approve
                        </button>
                      </form>
                      <form action={rejectBusiness}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600">
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
