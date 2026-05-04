import { createSupabaseAdminClient } from "@/lib/supabase/server";
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
    <main>
      <h1>Leads</h1>
      <form method="get">
        <label>
          Search
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Name, phone, or interest"
          />
        </label>
        <label>
          Interest
          <select name="interest" defaultValue={selectedInterest}>
            <option value="">All interests</option>
            {interests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Search</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Interest</th>
            <th>Status</th>
            <th>Created at</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name || ""}</td>
              <td>{lead.phone || ""}</td>
              <td>{lead.business_interest || ""}</td>
              <td>{formatLeadStatus(lead.status)}</td>
              <td>{lead.created_at}</td>
              <td>
                {lead.status === "contacted" ? (
                  "Contacted"
                ) : (
                  <form action={markLeadContacted}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button type="submit">Mark contacted</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
