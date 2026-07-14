"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UGANDA_REGIONS, DISTRICTS_BY_REGION } from "@/app/data/businesses";
import type { UgandaRegion } from "@/app/data/businesses";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

type ServiceDraft = {
  name: string;
  gender: string;
  price_from: string;
  price_to: string;
  duration_minutes: string;
  photo_url: string;
};

export default function SalonRegisterForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [type, setType] = useState("salon");
  const [gender, setGender] = useState("unisex");
  const [region, setRegion] = useState<UgandaRegion | "">("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [walkin, setWalkin] = useState(false);
  const [about, setAbout] = useState("");

  // Step 2 fields
  const [services, setServices] = useState<ServiceDraft[]>([
    { name: "", gender: "unisex", price_from: "", price_to: "", duration_minutes: "", photo_url: "" },
  ]);

  // Step 3 fields
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([""]);

  const fieldClass = "w-full border border-brand-beige rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-forest bg-white";
  const labelClass = "block text-xs font-bold text-brand-green mb-1";

  const addService = () => {
    if (services.length < 20) {
      setServices([...services, { name: "", gender: "unisex", price_from: "", price_to: "", duration_minutes: "", photo_url: "" }]);
    }
  };

  const updateService = (i: number, field: keyof ServiceDraft, value: string) => {
    setServices(services.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const removeService = (i: number) => {
    if (services.length > 1) setServices(services.filter((_, idx) => idx !== i));
  };

  const validateStep1 = () => {
    if (!name.trim()) return "Salon name is required.";
    if (!region) return "Please select a region.";
    if (!district) return "Please select a district.";
    if (!whatsapp.trim()) return "WhatsApp number is required.";
    if (!openingHours.trim()) return "Opening hours are required.";
    if (about.length > 300) return "Description must be 300 characters or less.";
    return "";
  };

  const validateStep2 = () => {
    if (services.every(s => !s.name.trim())) return "Please add at least one service.";
    return "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const supabase = getSupabase();

    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .insert({
        name: name.trim(),
        slug: slugify(name.trim()),
        type,
        gender,
        district,
        town: town.trim() || null,
        region,
        service_area: type === "mobile" ? serviceArea.trim() || null : null,
        whatsapp: whatsapp.trim(),
        phone: phone.trim() || null,
        opening_hours: openingHours.trim(),
        walkin,
        about: about.trim() || null,
        cover_photo_url: coverPhotoUrl.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (salonError || !salonData) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    const salonId = salonData.id;

    const validServices = services.filter(s => s.name.trim());
    if (validServices.length > 0) {
      await supabase.from("salon_services").insert(
        validServices.map((s, i) => ({
          salon_id: salonId,
          name: s.name.trim(),
          gender: s.gender,
          price_from: s.price_from ? parseInt(s.price_from) : null,
          price_to: s.price_to ? parseInt(s.price_to) : null,
          duration_minutes: s.duration_minutes ? parseInt(s.duration_minutes) : null,
          photo_url: s.photo_url.trim() || null,
          sort_order: i,
        }))
      );
    }

    const validPhotos = portfolioUrls.filter(u => u.trim());
    if (validPhotos.length > 0) {
      await supabase.from("salon_portfolio").insert(
        validPhotos.map((url, i) => ({
          salon_id: salonId,
          photo_url: url.trim(),
          sort_order: i,
        }))
      );
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-brand-forest mb-2" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>Listing submitted!</h2>
        <p className="text-sm text-brand-green leading-relaxed">Your listing is under review. We&apos;ll contact you on WhatsApp once approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-brand-forest" : "bg-brand-beige"}`} />
        ))}
      </div>
      <p className="text-xs text-brand-green text-center">Step {step} of 4</p>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-brand-forest">Basic Info</h2>
          <div><label className={labelClass}>Salon name *</label><input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kampala Style Hub" /></div>
          <div>
            <label className={labelClass}>Type *</label>
            <select className={fieldClass} value={type} onChange={e => setType(e.target.value)}>
              <option value="salon">🏠 Salon (fixed location)</option>
              <option value="mobile">🚗 Mobile Stylist (comes to you)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Gender served *</label>
            <select className={fieldClass} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="men">👨 Men</option>
              <option value="women">👩 Women</option>
              <option value="unisex">✂️ Unisex (both men & women)</option>
            </select>
          </div>
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
              {(region ? DISTRICTS_BY_REGION[region] : []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Town / Area</label><input className={fieldClass} value={town} onChange={e => setTown(e.target.value)} placeholder="e.g. Nakasero" /></div>
          {type === "mobile" && (
            <div><label className={labelClass}>Service area</label><input className={fieldClass} value={serviceArea} onChange={e => setServiceArea(e.target.value)} placeholder="e.g. Serves Kampala & Wakiso" /></div>
          )}
          <div><label className={labelClass}>WhatsApp number *</label><input className={fieldClass} type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Phone number</label><input className={fieldClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Opening hours *</label><input className={fieldClass} value={openingHours} onChange={e => setOpeningHours(e.target.value)} placeholder="e.g. Mon–Sat 8am–7pm" /></div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={walkin} onChange={e => setWalkin(e.target.checked)} className="w-4 h-4 accent-brand-forest" />
            <span className="text-sm font-medium text-brand-forest/90">Walk-ins welcome (no appointment needed)</span>
          </label>
          <div>
            <label className={labelClass}>About your salon <span className="text-brand-green font-normal">({about.length}/300)</span></label>
            <textarea className={`${fieldClass} resize-none`} rows={3} value={about} onChange={e => setAbout(e.target.value)} maxLength={300} placeholder="What do you offer? What makes you special?" />
          </div>
          <button onClick={() => { const e = validateStep1(); if (e) { setError(e); return; } setError(""); setStep(2); }}
            className="w-full rounded-xl bg-brand-forest py-4 text-sm font-black text-brand-gold">
            Next: Add Services →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-brand-forest">Services & Prices</h2>
          {services.map((svc, i) => (
            <div key={i} className="bg-brand-cream rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-brand-forest">Service {i + 1}</p>
                {services.length > 1 && <button onClick={() => removeService(i)} className="text-xs text-red-500">Remove</button>}
              </div>
              <input aria-label="Service name" className={fieldClass} value={svc.name} onChange={e => updateService(i, "name", e.target.value)} placeholder="Service name (e.g. Box Braids)" />
              <select aria-label="Service gender" className={fieldClass} value={svc.gender} onChange={e => updateService(i, "gender", e.target.value)}>
                <option value="men">👨 Men</option>
                <option value="women">👩 Women</option>
                <option value="unisex">✂️ Unisex</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="Price from" className={fieldClass} type="number" value={svc.price_from} onChange={e => updateService(i, "price_from", e.target.value)} placeholder="Price from (UGX)" />
                <input aria-label="Price to" className={fieldClass} type="number" value={svc.price_to} onChange={e => updateService(i, "price_to", e.target.value)} placeholder="Price to (UGX)" />
              </div>
              <input aria-label="Service duration" className={fieldClass} type="number" value={svc.duration_minutes} onChange={e => updateService(i, "duration_minutes", e.target.value)} placeholder="Duration (minutes, e.g. 45)" />
            </div>
          ))}
          {services.length < 20 && (
            <button onClick={addService} className="w-full rounded-xl border-2 border-dashed border-brand-forest py-3 text-sm font-bold text-brand-forest">
              + Add another service
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-xl border-2 border-brand-forest py-3 text-sm font-bold text-brand-forest">← Back</button>
            <button onClick={() => { const e = validateStep2(); if (e) { setError(e); return; } setError(""); setStep(3); }} className="flex-1 rounded-xl bg-brand-forest py-3 text-sm font-black text-brand-gold">Next: Photos →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-brand-forest">Photos</h2>
          <p className="text-xs text-brand-green">Paste image URLs from your phone or social media. You can add up to 10 portfolio photos.</p>
          <div>
            <label className={labelClass}>Cover photo URL (main photo shown on the card)</label>
            <input className={fieldClass} value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Portfolio photos (paste URLs of your work)</label>
            {portfolioUrls.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={fieldClass} value={url} onChange={e => setPortfolioUrls(portfolioUrls.map((u, idx) => idx === i ? e.target.value : u))} placeholder={`Photo ${i + 1} URL`} />
                {portfolioUrls.length > 1 && <button onClick={() => setPortfolioUrls(portfolioUrls.filter((_, idx) => idx !== i))} className="text-xs text-red-500 px-2">✕</button>}
              </div>
            ))}
            {portfolioUrls.length < 10 && (
              <button onClick={() => setPortfolioUrls([...portfolioUrls, ""])} className="text-xs font-bold text-brand-forest underline">+ Add photo</button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 rounded-xl border-2 border-brand-forest py-3 text-sm font-bold text-brand-forest">← Back</button>
            <button onClick={() => { setError(""); setStep(4); }} className="flex-1 rounded-xl bg-brand-forest py-3 text-sm font-black text-brand-gold">Next: Review →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-brand-forest">Review & Submit</h2>
          <div className="bg-white rounded-xl border border-brand-beige p-4 space-y-2 text-sm">
            <p><span className="font-bold">Name:</span> {name}</p>
            <p><span className="font-bold">Type:</span> {type === "salon" ? "Salon" : "Mobile Stylist"}</p>
            <p><span className="font-bold">Gender:</span> {gender}</p>
            <p><span className="font-bold">Location:</span> {town ? `${town}, ` : ""}{district}</p>
            <p><span className="font-bold">WhatsApp:</span> {whatsapp}</p>
            <p><span className="font-bold">Hours:</span> {openingHours}</p>
            <p><span className="font-bold">Walk-ins:</span> {walkin ? "Yes" : "No"}</p>
            <p><span className="font-bold">Services:</span> {services.filter(s => s.name.trim()).length} added</p>
            <p><span className="font-bold">Photos:</span> {portfolioUrls.filter(u => u.trim()).length} added</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="flex-1 rounded-xl border-2 border-brand-forest py-3 text-sm font-bold text-brand-forest">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-xl bg-brand-forest py-3 text-sm font-black text-brand-gold disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit for Review →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
