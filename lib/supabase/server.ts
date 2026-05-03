import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "./env";

export function createSupabaseAdminClient() {
  const env = getSupabaseServerEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
