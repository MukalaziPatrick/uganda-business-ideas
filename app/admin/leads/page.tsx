import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { LeadStatus } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  business_interest: string | null;
  status: LeadStatus;
  created_at: string;
};

type AdminLeadsPageProps = {
  searchParams?: Promise<{
    q?: string;
    interest?: string;
  }>;
};

function cleanSearchParam(value: string | undefined) {
  return value?.trim() || "";
}

function cleanPostgrestSearchValue(value: string) {
  return value.replace(/[%,()]/g, "");
}

function formatLeadStatus(status: LeadStatus) {
  return status.replace("_", " ");
}

async function markLeadContacted(formData: FormData) {
  "use server";

  if (!(await requireAdmin())) return;

  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("leads")
    .update({ status: "contacted", last_contacted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/leads");
}

export default async function AdminLeadsPage({
  searchParams,
}: AdminLeadsPageProps) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return <p>Supabase is not configured.</p>;
  }

  const params = await searchParams;
  const search = cleanSearchParam(params?.q);
  const selectedInterest = cleanSearchParam(params?.interest);

  const { data: interestRows } = await supabase
    .from("leads")
    .select("business_interest")
    .not("business_interest", "is", null)
    .order("business_interest", { ascending: true });

  const interests = Array.from(
    new Set(
      (interestRows || [])
        .map((lead) => lead.business_interest)
        .filter((interest): interest is string => Boolean(interest))
    )
  );

  let leadsQuery = supabase
    .from("leads")
    .select("id, name, phone, business_interest, status, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    const safeSearch = cleanPostgrestSearchValue(search);

    if (safeSearch) {
      leadsQuery = leadsQuery.or(
        `name.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%,business_interest.ilike.%${safeSearch}%`
      );
    }
  }

  if (selectedInterest) {
    leadsQuery = leadsQuery.eq("business_interest", selectedInterest);
  }

  const { data, error } = await leadsQuery;

  if (error) {
    return <p>Could not load leads.</p>;
  }

  const leads = (data || []) as LeadRow[];

  return (
    <main className="p-6 text-brand-forest">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-black text-brand-forest">Leads ({leads.length})</h1>
        <form method="POST" action="/api/auth/logout">
          <button
            type="submit"
            className="rounded-lg border border-brand-beige bg-brand-surface px-4 py-1.5 text-xs font-bold text-brand-forest transition-colors hover:border-brand-gold hover:bg-brand-cream"
          >
            Sign out
          </button>
        </form>
      </div>

      <form method="get" className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold text-brand-forest">
          Search
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Name, phone, or interest"
            className="w-56 rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-brand-forest">
          Interest
          <select
            name="interest"
            defaultValue={selectedInterest}
            className="rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40"
          >
            <option value="">All interests</option>
            {interests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-forest px-4 py-2 text-xs font-bold text-brand-cream transition-colors hover:bg-brand-green"
        >
          Search
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-beige bg-brand-surface p-6 text-center text-sm text-brand-green">
          No leads found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-beige bg-brand-surface shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-forest text-left text-white">
                <th className="p-3 font-bold">Name</th>
                <th className="p-3 font-bold">Phone</th>
                <th className="p-3 font-bold">Interest</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Created at</th>
                <th className="p-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-brand-beige last:border-b-0 hover:bg-brand-cream/60">
                  <td className="p-3 font-semibold">{lead.name || "—"}</td>
                  <td className="p-3">{lead.phone || "—"}</td>
                  <td className="p-3">{lead.business_interest || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        lead.status === "contacted"
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-brand-gold/20 text-brand-forest"
                      }`}
                    >
                      {formatLeadStatus(lead.status)}
                    </span>
                  </td>
                  <td className="p-3 text-brand-green">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    {lead.status === "contacted" ? (
                      <span className="text-xs font-semibold text-brand-green">Contacted ✓</span>
                    ) : (
                      <form action={markLeadContacted}>
                        <input type="hidden" name="id" value={lead.id} />
                        <button
                          type="submit"
                          className="rounded bg-brand-green px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-brand-forest"
                        >
                          Mark contacted
                        </button>
                      </form>
                    )}
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
