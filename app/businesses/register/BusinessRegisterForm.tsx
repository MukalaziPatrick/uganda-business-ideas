"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_CATEGORIES, UGANDA_REGIONS, DISTRICTS_BY_REGION } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";
import type { BusinessInsert } from "@/lib/supabase/types";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function BusinessRegisterForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState<UgandaRegion | "">("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const districts = region ? DISTRICTS_BY_REGION[region] : [];

  const validate = (): string => {
    if (!name.trim()) return "Business name is required.";
    if (!category) return "Please select a category.";
    if (!region) return "Please select a region.";
    if (!district) return "Please select a district.";
    if (!whatsapp.trim() && !phone.trim()) return "Please provide at least a WhatsApp number or phone number.";
    if (description.length > 300) return "Description must be 300 characters or less.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");

    const payload: BusinessInsert = {
      name: name.trim(),
      category,
      region: region as UgandaRegion,
      district,
      ...(town.trim()        && { town: town.trim() }),
      ...(description.trim() && { description: description.trim() }),
      ...(hours.trim()       && { hours: hours.trim() }),
      ...(whatsapp.trim()    && { whatsapp: whatsapp.trim() }),
      ...(phone.trim()       && { phone: phone.trim() }),
      ...(website.trim()     && { website: website.trim() }),
      ...(facebook.trim()    && { facebook: facebook.trim() }),
      ...(instagram.trim()   && { instagram: instagram.trim() }),
      ...(tiktok.trim()      && { tiktok: tiktok.trim() }),
    };

    const { error: sbError } = await getSupabase().from("businesses").insert(payload);

    setSubmitting(false);
    if (sbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-[#1C3A2A] mb-2" style={{ fontFamily: "Georgia, serif" }}>
          Listing submitted!
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Thanks! We'll review and publish your listing within 24 hours.
        </p>
      </div>
    );
  }

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1";
  const sectionClass = "space-y-3";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Business Details</h2>
        <div>
          <label className={labelClass}>Business name *</label>
          <input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mama's Kitchen" />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select className={fieldClass} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description <span className="text-gray-400 font-normal">({description.length}/300)</span></label>
          <textarea
            className={`${fieldClass} resize-none`}
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What do you offer? Keep it short and clear."
            maxLength={300}
          />
        </div>
        <div>
          <label className={labelClass}>Opening hours</label>
          <input className={fieldClass} value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. Mon–Fri 7am–9pm" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Location *</h2>
        <div>
          <label className={labelClass}>Region *</label>
          <select className={fieldClass} value={region} onChange={e => { setRegion(e.target.value as UgandaRegion); setDistrict(""); }}>
            <option value="">Select region</option>
            {UGANDA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>District *</label>
          <select className={fieldClass} value={district} onChange={e => setDistrict(e.target.value)} disabled={!region}>
            <option value="">{region ? "Select district" : "Select region first"}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Town / Area <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className={fieldClass} value={town} onChange={e => setTown(e.target.value)} placeholder="e.g. Wandegeya" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Contact <span className="font-normal text-gray-500">(at least one required)</span></h2>
        <div>
          <label className={labelClass}>WhatsApp number</label>
          <input className={fieldClass} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+256 7XX XXX XXX" type="tel" />
        </div>
        <div>
          <label className={labelClass}>Phone number</label>
          <input className={fieldClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" type="tel" />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-sm font-black text-[#1C3A2A] border-b border-gray-200 pb-1">Online Presence <span className="font-normal text-gray-500">(optional)</span></h2>
        <div>
          <label className={labelClass}>Website</label>
          <input className={fieldClass} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" type="url" />
        </div>
        <div>
          <label className={labelClass}>Facebook</label>
          <input className={fieldClass} value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="facebook.com/yourpage or @handle" />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input className={fieldClass} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" />
        </div>
        <div>
          <label className={labelClass}>TikTok</label>
          <input className={fieldClass} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@yourhandle" />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#1C3A2A] py-4 text-sm font-black text-[#F5C842] disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit for Review →"}
      </button>
    </form>
  );
}
