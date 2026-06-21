"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SaveResult = { ok: boolean; message: string };

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
    whatsapp: get("whatsapp") || null,
    phone: get("phone") || null,
    description: description || null,
    website: get("website") || null,
    facebook: get("facebook") || null,
    instagram: get("instagram") || null,
    tiktok: get("tiktok") || null,
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
