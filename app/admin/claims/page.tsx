import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

type ClaimRow = {
  id: string;
  business_id: string;
  claimant_name: string;
  claimant_phone: string | null;
  claimant_whatsapp: string | null;
  role: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  businesses: { name: string; category: string; district: string } | null;
};

function generateEditToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function approveClaim(formData: FormData) {
  "use server";
  const claimId = formData.get("claimId");
  const businessId = formData.get("businessId");
  const claimantName = formData.get("claimantName");
  const claimantContact = formData.get("claimantContact");
  if (typeof claimId !== "string" || typeof businessId !== "string") return;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  // Only proceed if this claim is still pending — guards against a double-click
  // (or two open tabs) regenerating the edit token after it's already been issued.
  const { data: claimedRows } = await supabase
    .from("business_claims")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", claimId)
    .eq("status", "pending")
    .select("id");

  if (!claimedRows || claimedRows.length === 0) return;

  const editToken = generateEditToken();

  await supabase
    .from("businesses")
    .update({
      claimed_by: typeof claimantName === "string" ? claimantName : null,
      owner_contact: typeof claimantContact === "string" ? claimantContact : null,
      edit_token: editToken,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  revalidatePath("/admin/claims");
}

async function rejectClaim(formData: FormData) {
  "use server";
  const claimId = formData.get("claimId");
  if (typeof claimId !== "string") return;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase
    .from("business_claims")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", claimId)
    .eq("status", "pending");

  revalidatePath("/admin/claims");
}

export default async function AdminClaimsPage() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return <p>Supabase not configured.</p>;

  const { data, error } = await supabase
    .from("business_claims")
    .select("id,business_id,claimant_name,claimant_phone,claimant_whatsapp,role,status,created_at,businesses(name,category,district)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return <p>Could not load claims.</p>;

  const claims = (data ?? []) as unknown as ClaimRow[];

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-[#1C3A2A]">Pending Business Claims ({claims.length})</h1>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Verify each claimant by phone/WhatsApp before approving — approving generates a private edit link for the owner.
      </p>
      {claims.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending claims. All clear!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1C3A2A] text-white">
                <th className="text-left p-3">Business</th>
                <th className="text-left p-3">Claimant</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Submitted</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => {
                const contact = c.claimant_whatsapp || c.claimant_phone || "";
                return (
                  <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-semibold">{c.businesses?.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{c.businesses?.category} · {c.businesses?.district}</p>
                    </td>
                    <td className="p-3 font-semibold">{c.claimant_name}</td>
                    <td className="p-3">{c.role || "—"}</td>
                    <td className="p-3">
                      {contact ? (
                        <a href={`https://wa.me/${contact.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[#25d366] font-semibold underline">
                          💬 {contact}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <form action={approveClaim}>
                          <input type="hidden" name="claimId" value={c.id} />
                          <input type="hidden" name="businessId" value={c.business_id} />
                          <input type="hidden" name="claimantName" value={c.claimant_name} />
                          <input type="hidden" name="claimantContact" value={contact} />
                          <button type="submit" className="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700">
                            Approve
                          </button>
                        </form>
                        <form action={rejectClaim}>
                          <input type="hidden" name="claimId" value={c.id} />
                          <button type="submit" className="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600">
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
