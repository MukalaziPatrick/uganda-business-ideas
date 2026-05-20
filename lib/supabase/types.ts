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

export type BusinessStatus = "pending" | "active" | "rejected";

export type Business = {
  id: string;
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town: string | null;
  description: string | null;
  hours: string | null;
  whatsapp: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  view_count: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  status: BusinessStatus;
  created_at: string;
};

export type BusinessInsert = {
  name: string;
  category: string;
  region: "Central" | "Eastern" | "Northern" | "Western";
  district: string;
  town?: string;
  description?: string;
  hours?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
};
