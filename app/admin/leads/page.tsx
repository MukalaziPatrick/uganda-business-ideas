import { createSupabaseAdminClient } from "@/lib/supabase/server";

type LeadRow = {
  name: string | null;
  phone: string | null;
  business_interest: string | null;
  created_at: string;
};

export default async function AdminLeadsPage() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return <p>Supabase is not configured.</p>;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("name, phone, business_interest, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Could not load leads.</p>;
  }

  const leads = (data || []) as LeadRow[];

  return (
    <main>
      <h1>Leads</h1>
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
