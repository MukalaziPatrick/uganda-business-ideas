export type LaundryBusinessStatus = 'pending' | 'active' | 'featured';

export interface LaundryBusiness {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  district: string | null;
  service_area: string | null;
  whatsapp: string;
  momo_code: string | null;
  code_prefix: string;
  promise: string | null;
  app_url: string | null;
  status: LaundryBusinessStatus;
  created_at: string;
}
