import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type MarketListing = {
  id: string;
  title: string;
  price_ugx: number | null;
  size_acres: number | null;
  land_type: string | null;
  district: string | null;
  road_area: string | null;
  has_title: boolean | null;
  contact_phone: string | null;
  trust_score: number | null;
  trust_flags: string[];
  source_url: string;
  source_site: string;
  scraped_at: string;
  /** Derived from trust_score: 'high' (4-5), 'medium' (2-3), 'low' (0-1) */
  trust_tier?: 'high' | 'medium' | 'low';
};

const TRUST_ORDER = { high: 0, medium: 1, low: 2 };

export function getTrustTier(score: number | null): 'high' | 'medium' | 'low' {
  if (!score || score <= 1) return 'low';
  if (score <= 3) return 'medium';
  return 'high';
}

export function sortListings(listings: MarketListing[]): MarketListing[] {
  return [...listings].sort((a, b) => {
    const tierA = TRUST_ORDER[getTrustTier(a.trust_score)];
    const tierB = TRUST_ORDER[getTrustTier(b.trust_score)];
    if (tierA !== tierB) return tierA - tierB;
    return new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime();
  });
}

export type MarketFilters = {
  q?: string;
  district?: string;
  land_type?: string;
  has_title?: boolean;
  price_min?: number;
  price_max?: number;
  size_min?: number;
  size_max?: number;
  source_site?: string;
};

export async function getMarketListingById(id: string): Promise<MarketListing | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('land_market')
    .select('id,title,price_ugx,size_acres,land_type,district,road_area,has_title,contact_phone,trust_score,trust_flags,source_url,source_site,scraped_at')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as MarketListing;
}

export async function getMarketListings(
  filters: MarketFilters = {},
  limit = 48
): Promise<MarketListing[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from('land_market')
    .select('id,title,price_ugx,size_acres,land_type,district,road_area,has_title,contact_phone,trust_score,trust_flags,source_url,source_site,scraped_at')
    .eq('status', 'published')
    .order('scraped_at', { ascending: false })
    .limit(limit);

  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,road_area.ilike.%${filters.q}%,district.ilike.%${filters.q}%`);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.land_type) query = query.eq('land_type', filters.land_type);
  if (filters.has_title !== undefined) query = query.eq('has_title', filters.has_title);
  if (filters.price_min) query = query.gte('price_ugx', filters.price_min);
  if (filters.price_max) query = query.lte('price_ugx', filters.price_max);
  if (filters.size_min) query = query.gte('size_acres', filters.size_min);
  if (filters.size_max) query = query.lte('size_acres', filters.size_max);
  if (filters.source_site) query = query.eq('source_site', filters.source_site);

  const { data, error } = await query;
  if (error) { console.error('getMarketListings:', error); return []; }
  return (data ?? []) as MarketListing[];
}
