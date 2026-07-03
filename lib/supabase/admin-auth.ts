import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Re-checks admin identity inside a server action, independent of the
 * middleware gate — server actions are HTTP endpoints in their own right and
 * shouldn't rely solely on middleware having run first.
 * Returns true only if the request's session cookie belongs to a verified
 * Supabase user present in admin_profiles (via the public.is_admin() RPC).
 *
 * Kept out of lib/supabase/server.ts because that module is also imported by
 * client-bundled code (e.g. lib/land/market-queries.ts) and next/headers
 * cannot be pulled into a client bundle.
 */
export async function requireAdmin(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  if (!accessToken) return false;

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (!user || authError) return false;

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  return !rpcError && isAdmin === true;
}
