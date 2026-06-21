"use client";

import { useState } from "react";
import type { Business } from "@/lib/supabase/types";
import { saveBusinessEdits } from "./actions";

export default function EditBusinessForm({ token, business }: { token: string; business: Business }) {
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

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1";

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
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{business.category} · {business.district}</p>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>WhatsApp number</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={fieldClass} placeholder="e.g. 0772 123 456" inputMode="tel" />
            <p className="text-[11px] text-gray-400 mt-1">This powers the "Chat on WhatsApp" button on your listing.</p>
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="e.g. 0772 123 456" inputMode="tel" />
          </div>
          <div>
            <label className={labelClass}>Opening hours</label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} className={fieldClass} placeholder="e.g. Mon–Sat 8am–8pm" />
          </div>
          <div>
            <label className={labelClass}>About / description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} rows={3} className={fieldClass} placeholder="Tell customers what makes your business stand out (max 300 characters)" />
            <p className="text-[11px] text-gray-400 mt-1">{description.length}/300</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Online presence (optional)</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Website</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className={fieldClass} placeholder="https://…" />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={fieldClass} placeholder="Facebook page URL or @handle" />
          </div>
          <div>
            <label className={labelClass}>Instagram</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={fieldClass} placeholder="@handle" />
          </div>
          <div>
            <label className={labelClass}>TikTok</label>
            <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={fieldClass} placeholder="@handle" />
          </div>
        </div>
      </div>

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-[#1C3A2A] py-3.5 text-sm font-black text-[#F5C842] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      <p className="text-[11px] text-gray-400 text-center pb-4">
        Keep this page's link private — it's the only way to manage your listing without an account.
      </p>
    </form>
  );
}
