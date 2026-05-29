// lib/land/sync.ts
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { LandSyncPayload } from '@/lib/supabase/land-types';

function generateQrToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join('');
}

export type SyncResult = {
  success: boolean;
  listing_id?: string;
  listing_url?: string;
  qr_url?: string;
  error?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://businessyoo.lugandastudio.com';

export async function syncLandListing(payload: LandSyncPayload): Promise<SyncResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  // 1. Upsert agent
  const { data: agent, error: agentError } = await supabase
    .from('land_agents')
    .upsert(
      {
        safelands_agent_id: payload.agent.safelands_agent_id,
        name: payload.agent.name,
        phone: payload.agent.phone,
        whatsapp: payload.agent.whatsapp ?? null,
        photo: payload.agent.photo ?? null,
        district: payload.agent.district ?? null,
        bio: payload.agent.bio ?? null,
        is_verified: true,
      },
      { onConflict: 'safelands_agent_id' }
    )
    .select('id')
    .single();

  if (agentError) return { success: false, error: `Agent upsert failed: ${agentError.message}` };

  // 2. Check if listing already has a qr_token
  const { data: existing } = await supabase
    .from('land_listings')
    .select('qr_token')
    .eq('safelands_id', payload.safelands_id)
    .single();

  const qr_token = existing?.qr_token ?? generateQrToken();

  // 3. Upsert listing
  const { data: listing, error: listingError } = await supabase
    .from('land_listings')
    .upsert(
      {
        safelands_id: payload.safelands_id,
        title: payload.title,
        district: payload.district,
        parish: payload.parish ?? null,
        lat: payload.coordinates.lat,
        lng: payload.coordinates.lng,
        size_acres: payload.size_acres ?? null,
        price_ugx: payload.price_ugx ?? null,
        land_type: payload.land_type ?? null,
        intended_use: payload.intended_use ?? null,
        title_status: payload.title_status ?? 'unknown',
        verification_stage: payload.verification_stage,
        trust_score: payload.trust_score ?? 0,
        qr_token,
        agent_id: agent.id,
        photos: payload.photos ?? [],
        verified_at: payload.verification_stage === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'safelands_id' }
    )
    .select('id, qr_token')
    .single();

  if (listingError) return { success: false, error: `Listing upsert failed: ${listingError.message}` };

  return {
    success: true,
    listing_id: listing.id,
    listing_url: `${BASE_URL}/land/browse/${listing.id}`,
    qr_url: `${BASE_URL}/land/verify/${listing.qr_token}`,
  };
}
