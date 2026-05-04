export type LeadStatus = "new" | "contacted" | "qualified" | "not_fit" | "closed";

export type LeadInsert = {
  name: string | null;
  phone: string | null;
  location: string | null;
  budget: string | null;
  business_interest: string | null;
  timeline: string | null;
  notes: string | null;
  source: string;
  status?: LeadStatus;
  assigned_tag?: string | null;
};
