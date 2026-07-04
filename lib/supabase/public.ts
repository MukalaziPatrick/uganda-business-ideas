// lib/supabase/public.ts
//
// Shared anon-key Supabase client for PUBLIC reads. Unlike
// createSupabaseAdminClient() (service-role, bypasses RLS entirely), this
// client is subject to the RLS policies shipped in supabase/migrations
// (20260613000001_land_rls.sql, 20260617000002_ideas_rls.sql, etc.) — so
// using it is what actually turns those policies into the real security
// boundary instead of just documentation.
//
// Reserve createSupabaseAdminClient() for admin pages, webhooks, and server
// actions that need to see rows the public shouldn't (or write at all).
//
// Follows the pattern app/laundry/page.tsx used before this module existed
// (B12): same anon key, just constructed once and imported everywhere
// instead of re-created per render.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabasePublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return client;
}
