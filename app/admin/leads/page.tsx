import { createSupabaseAdminClient } from "@/lib/supabase/server";

type LeadRow = {
  name: string | null;
  phone: string | null;
  business_interest: string | null;
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
    .select("name, phone, business_interest, created_at")
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
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={`${lead.created_at}-${lead.phone || lead.name || "lead"}`}>
              <td>{lead.name || ""}</td>
              <td>{lead.phone || ""}</td>
              <td>{lead.business_interest || ""}</td>
              <td>{lead.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
