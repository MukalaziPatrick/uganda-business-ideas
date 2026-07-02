"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SaveResult = { ok: boolean; message: string };

// Ensures a stored link is only ever http(s) — never javascript:, data:, or
// another scheme that would execute when a claimant-supplied edit renders as
// an <a href>. Bare values (e.g. "facebook.com/name" or "myhandle") get
// https:// prepended rather than rejected, matching how the display layer
// already treats social handles.
function sanitizeLinkUrl(value: string): string | null {
  if (!value) return null;
  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function saveBusinessEdits(token: string, formData: FormData): Promise<SaveResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, message: "Supabase not configured." };

  // Confirm token still maps to a business before writing anything
  const { data: existing, error: lookupError } = await supabase
    .from("businesses")
    .select("id")
    .eq("edit_token", token)
    .single();

  if (lookupError || !existing) {
    return { ok: false, message: "This edit link is no longer valid." };
  }

  const get = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const description = get("description");
  if (description.length > 300) {
    return { ok: false, message: "Description must be 300 characters or less." };
  }

  const updates = {
    hours: get("hours") || null,
    whatsapp: get("whatsapp").replace(/\s+/g, " ").trim() || null,
    phone: get("phone").replace(/\s+/g, " ").trim() || null,
    description: description || null,
    website: sanitizeLinkUrl(get("website")),
    facebook: sanitizeLinkUrl(get("facebook")),
    instagram: sanitizeLinkUrl(get("instagram")),
    tiktok: sanitizeLinkUrl(get("tiktok")),
  };

  const { error: updateError } = await supabase
    .from("businesses")
    .update(updates)
    .eq("edit_token", token);

  if (updateError) {
    return { ok: false, message: "Could not save changes. Please try again." };
  }

  revalidatePath(`/businesses/edit/${token}`);
  revalidatePath(`/businesses/${existing.id}`);

  return { ok: true, message: "Changes saved!" };
}
