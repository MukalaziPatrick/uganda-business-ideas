import { createClient } from '@supabase/supabase-js';
import type { PharmacyBusiness } from '@/lib/supabase/pharmacy-types';

export type PharmacyCard = Pick<
  PharmacyBusiness,
  | 'id'
  | 'slug'
  | 'name'
  | 'district'
  | 'service_area'
  | 'whatsapp'
  | 'phone'
  | 'hours'
  | 'is_24_hour'
  | 'has_delivery'
  | 'supervising_pharmacist'
  | 'nda_licence_no'
  | 'status'
>;

const CARD_COLUMNS =
  'id,slug,name,district,service_area,whatsapp,phone,hours,is_24_hour,has_delivery,supervising_pharmacist,nda_licence_no,status';

// Returns active/featured pharmacies with a valid (non-lapsed) NDA licence,
// featured first. Compliance: no drug/price/stock columns are ever selected.
export async function getActivePharmacies(): Promise<PharmacyCard[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data } = await supabase
    .from('pharmacy_businesses')
    .select(CARD_COLUMNS)
    .in('status', ['active', 'featured'])
    .or(`licence_expiry.is.null,licence_expiry.gte.${today}`)
    .order('status', { ascending: false }) // featured before active
    .order('created_at', { ascending: false })
    .limit(20);

  return (data ?? []) as PharmacyCard[];
}
