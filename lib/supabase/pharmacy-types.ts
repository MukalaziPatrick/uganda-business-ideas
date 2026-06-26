export type PharmacyBusinessStatus = 'pending' | 'active' | 'featured';

export interface PharmacyBusiness {
  id: string;
  slug: string;
  name: string;

  // Location
  region: string | null;
  district: string | null;
  service_area: string | null;
  address: string | null;

  // Contact (the only action — off-platform)
  whatsapp: string;
  phone: string | null;

  // Facility info (no drug names / prices / stock)
  hours: string | null;
  is_24_hour: boolean;
  has_delivery: boolean;
  supervising_pharmacist: string | null;

  // Compliance / verification
  nda_licence_no: string | null;
  licence_expiry: string | null;

  // Lifecycle
  status: PharmacyBusinessStatus;
  created_at: string;
}
