"use client";

import { useState } from "react";
import type { Business } from "@/lib/supabase/types";
import { saveBusinessEdits } from "./actions";

export default function EditBusinessForm({
  token,
  business,
}: {
  token: string;
  business: Business;
}) {
  const [hours, setHours] = useState(business.hours ?? "");
  const [whatsapp, setWhatsapp] = useState(business.whatsapp ?? "");
  const [phone, setPhone] = useState(business.phone ?? "");
  const [description, setDescription] = useState(business.description ?? "");
  const [website, setWebsite] = useState(business.website ?? "");
  const [facebook, setFacebook] = useState(business.facebook ?? "");
  const [instagram, setInstagram] = useState(business.instagram ?? "");
  const [tiktok, setTiktok] = useState(business.tiktok ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const fieldClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-forest";
  const labelClass = "mb-1 block text-xs font-bold text-gray-600";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("hours", hours);
    fd.set("whatsapp", whatsapp);
    fd.set("phone", phone);
    fd.set("description", description);
    fd.set("website", website);
    fd.set("facebook", facebook);
    fd.set("instagram", instagram);
    fd.set("tiktok", tiktok);

    const result = await saveBusinessEdits(token, fd);
    setSaving(false);
    setMessage({ ok: result.ok, text: result.message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-green">
          {business.category} - {business.district}
        </p>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>WhatsApp number</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 0772 123 456"
              inputMode="tel"
            />
            <p className="mt-1 text-[11px] text-brand-green">
              This powers the &quot;Chat on WhatsApp&quot; button on your listing. Save
              the real number customers should message.
            </p>
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 0772 123 456"
              inputMode="tel"
            />
            <p className="mt-1 text-[11px] text-brand-green">
              Use this if customers should call you directly, even when you do not
              want WhatsApp messages.
            </p>
          </div>
          <div>
            <label className={labelClass}>Opening hours</label>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Mon-Sat 8am-8pm"
            />
          </div>
          <div>
            <label className={labelClass}>About / description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              className={fieldClass}
              placeholder="Tell customers what makes your business stand out (max 300 characters)"
            />
            <p className="mt-1 text-[11px] text-brand-green">{description.length}/300</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-green">
          Online presence (optional)
        </p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={fieldClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className={fieldClass}
              placeholder="Facebook page URL or @handle"
            />
          </div>
          <div>
            <label className={labelClass}>Instagram</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={fieldClass}
              placeholder="@handle"
            />
          </div>
          <div>
            <label className={labelClass}>TikTok</label>
            <input
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className={fieldClass}
              placeholder="@handle"
            />
          </div>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="text-center text-xs text-brand-green">
        Once saved, these contact details appear on your public listing so customers
        can see whether they can call or send a WhatsApp message.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-brand-forest py-3.5 text-sm font-black text-brand-gold disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>

      <p className="pb-4 text-center text-[11px] text-brand-green">
        Keep this page&apos;s link private - it&apos;s the only way to manage your
        listing without an account.
      </p>
    </form>
  );
}
