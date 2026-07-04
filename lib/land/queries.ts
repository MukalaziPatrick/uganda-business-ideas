// lib/land/queries.ts
//
// B6: these are all public reads used by land browse/detail/guides pages and
// read-only API flows. Using the shared anon client means the visibility rules
// in supabase/migrations/20260613000001_land_rls.sql actually enforce what the
// public can see instead of being bypassed by the service-role client.
import { getSupabasePublicClient } from '@/lib/supabase/public';
import type { LandListing, LandContent, LandAgent } from '@/lib/supabase/land-types';

export type LandListingFilters = {
  district?: string;
  land_type?: string;
  intended_use?: string;
  price_max?: number;
  size_min?: number;
  verification_stage?: string;
  q?: string;
  bbox?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
};

export async function getLandListings(
  filters: LandListingFilters = {},
  limit = 24
): Promise<LandListing[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return [];

  let query = supabase
    .from('land_listings')
    .select(`
      *,
      agent:land_agents(*),
      insight:land_insights(*)
    `)
    .order('trust_score', { ascending: false })
    .limit(limit);

  if (filters.district) query = query.eq('district', filters.district);
  if (filters.land_type) query = query.eq('land_type', filters.land_type);
  if (filters.intended_use) query = query.eq('intended_use', filters.intended_use);
  if (filters.price_max) query = query.lte('price_ugx', filters.price_max);
  if (filters.size_min) query = query.gte('size_acres', filters.size_min);
  if (filters.verification_stage) query = query.eq('verification_stage', filters.verification_stage);
  if (filters.q) query = query.ilike('title', `%${filters.q}%`);
  if (filters.bbox) {
    query = query
      .gte('lat', filters.bbox.minLat)
      .lte('lat', filters.bbox.maxLat)
      .gte('lng', filters.bbox.minLng)
      .lte('lng', filters.bbox.maxLng);
  }

  const { data, error } = await query;
  if (error) { console.error('getLandListings:', error); return []; }

  const STAGE_ORDER: Record<string, number> = { verified: 0, checked: 1, self_listed: 2 };
  const listings = (data ?? []) as LandListing[];
  listings.sort((a, b) => {
    const sa = STAGE_ORDER[a.verification_stage] ?? 3;
    const sb = STAGE_ORDER[b.verification_stage] ?? 3;
    if (sa !== sb) return sa - sb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return listings;
}

export async function getLandListingById(id: string): Promise<LandListing | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as LandListing;
}

export async function getLandListingByQr(qr_token: string): Promise<LandListing | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('qr_token', qr_token)
    .single();

  if (error) return null;
  return data as LandListing;
}

export async function getFeaturedLandListings(limit = 6): Promise<LandListing[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('land_listings')
    .select(`*, agent:land_agents(*), insight:land_insights(*)`)
    .eq('verification_stage', 'verified')
    .order('trust_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as LandListing[];
}

export async function getLandContent(limit = 12): Promise<LandContent[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('land_content')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as LandContent[];
}

export async function getLandContentBySlug(slug: string): Promise<LandContent | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('land_content')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as LandContent;
}

export async function getLandAgents(): Promise<LandAgent[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('land_agents')
    .select('*')
    .eq('is_verified', true)
    .order('rating', { ascending: false });
  if (error) return [];
  return (data ?? []) as LandAgent[];
}
