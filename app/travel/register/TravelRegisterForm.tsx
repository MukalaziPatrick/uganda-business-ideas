"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { STAY_TYPE_LABELS, STAY_AMENITY_OPTIONS, SEED_DESTINATIONS } from "@/app/data/travel";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

type RoomDraft = { name: string; capacity: string; price_per_night: string };

export default function TravelRegisterForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [type, setType] = useState("guesthouse");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [town, setTown] = useState("");
  const [district, setDistrict] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingComUrl, setBookingComUrl] = useState("");
  const [checkinTime, setCheckinTime] = useState("2:00 PM");
  const [checkoutTime, setCheckoutTime] = useState("11:00 AM");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [amenities, setAmenities] = useState<string[]>([]);

  // Step 3
  const [rooms, setRooms] = useState<RoomDraft[]>([{ name: "", capacity: "2", price_per_night: "" }]);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([""]);

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1";

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const validateStep1 = () => {
    if (!name.trim()) return "Accommodation name is required.";
    if (!destinationSlug) return "Please select a destination.";
    if (!town.trim()) return "Town/area is required.";
    if (!district.trim()) return "District is required.";
    if (!whatsapp.trim()) return "WhatsApp number is required.";
    if (!capacity) return "Maximum capacity is required.";
    if (!description.trim()) return "Description is required.";
    if (description.length > 500) return "Description must be 500 characters or less.";
    return "";
  };

  const validateStep3 = () => {
    if (rooms.every(r => !r.name.trim())) return "Please add at least one room type.";
    return "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const supabase = getSupabase();

    const dest = SEED_DESTINATIONS.find(d => d.slug === destinationSlug);
    if (!dest) { setError("Invalid destination."); setSubmitting(false); return; }

    const { data: destData } = await supabase.from("travel_destinations").select("id").eq("slug", destinationSlug).single();
    if (!destData) { setError("Destination not found. Please try again."); setSubmitting(false); return; }

    const { data: stayData, error: stayError } = await supabase
      .from("travel_stays")
      .insert({
        name: name.trim(),
        slug: slugify(name.trim()),
        destination_id: destData.id,
        type,
        district: district.trim(),
        town: town.trim(),
        description: description.trim(),
        price_from: rooms.filter(r => r.price_per_night).length > 0
          ? Math.min(...rooms.filter(r => r.price_per_night).map(r => parseInt(r.price_per_night)))
          : 0,
        checkin_time: checkinTime,
        checkout_time: checkoutTime,
        capacity: parseInt(capacity),
        whatsapp: whatsapp.trim(),
        phone: phone.trim() || null,
        booking_com_url: bookingComUrl.trim() || null,
        amenities,
        cover_photo_url: coverPhotoUrl.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (stayError || !stayData) { setError("Something went wrong. Please try again."); setSubmitting(false); return; }
    const stayId = stayData.id;

    const validRooms = rooms.filter(r => r.name.trim() && r.price_per_night);
    if (validRooms.length > 0) {
      await supabase.from("travel_stay_rooms").insert(validRooms.map((r, i) => ({
        stay_id: stayId, name: r.name.trim(), capacity: parseInt(r.capacity) || 2,
        price_per_night: parseInt(r.price_per_night), sort_order: i,
      })));
    }

    const validPhotos = photoUrls.filter(u => u.trim());
    if (validPhotos.length > 0) {
      await supabase.from("travel_stay_photos").insert(validPhotos.map((url, i) => ({ stay_id: stayId, photo_url: url.trim(), sort_order: i })));
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-[#1C3A2A] mb-2">Listing submitted!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">Your listing is under review. We&apos;ll contact you on WhatsApp once approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-[#1C3A2A]" : "bg-gray-200"}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">Step {step} of 4</p>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Basic Info</h2>
          <div><label className={labelClass}>Accommodation name *</label><input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bwindi Forest Guesthouse" /></div>
          <div>
            <label className={labelClass}>Type *</label>
            <select className={fieldClass} value={type} onChange={e => setType(e.target.value)}>
              {Object.entries(STAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Destination *</label>
            <select className={fieldClass} value={destinationSlug} onChange={e => setDestinationSlug(e.target.value)}>
              <option value="">Select destination</option>
              {SEED_DESTINATIONS.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Town / area within destination *</label><input className={fieldClass} value={town} onChange={e => setTown(e.target.value)} placeholder="e.g. Buhoma" /></div>
          <div><label className={labelClass}>District *</label><input className={fieldClass} value={district} onChange={e => setDistrict(e.target.value)} placeholder="e.g. Kanungu" /></div>
          <div><label className={labelClass}>WhatsApp number *</label><input className={fieldClass} type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Phone number</label><input className={fieldClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" /></div>
          <div><label className={labelClass}>Booking.com listing URL (optional)</label><input className={fieldClass} type="url" value={bookingComUrl} onChange={e => setBookingComUrl(e.target.value)} placeholder="https://booking.com/hotel/..." /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Check-in time *</label><input className={fieldClass} value={checkinTime} onChange={e => setCheckinTime(e.target.value)} placeholder="2:00 PM" /></div>
            <div><label className={labelClass}>Check-out time *</label><input className={fieldClass} value={checkoutTime} onChange={e => setCheckoutTime(e.target.value)} placeholder="11:00 AM" /></div>
          </div>
          <div><label className={labelClass}>Max guests *</label><input className={fieldClass} type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g. 20" /></div>
          <div>
            <label className={labelClass}>Description * ({description.length}/500)</label>
            <textarea className={`${fieldClass} resize-none`} rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={500} placeholder="Describe your accommodation, location, and what makes it special." />
          </div>
          <button onClick={() => { const e = validateStep1(); if (e) { setError(e); return; } setError(""); setStep(2); }}
            className="w-full rounded-xl bg-[#1C3A2A] py-4 text-sm font-black text-[#F5C842]">Next: Amenities →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Amenities</h2>
          <p className="text-xs text-gray-500">Select all that apply.</p>
          <div className="grid grid-cols-2 gap-2">
            {STAY_AMENITY_OPTIONS.map(a => (
              <button key={a} onClick={() => toggleAmenity(a)}
                className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${amenities.includes(a) ? "bg-[#1C3A2A] text-white border-[#1C3A2A]" : "bg-white text-gray-700 border-gray-300"}`}>
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={() => { setError(""); setStep(3); }} className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842]">Next: Rooms →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Room Types & Photos</h2>
          {rooms.map((r, i) => (
            <div key={i} className="bg-[#f5f0e8] rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <p className="text-xs font-bold text-[#1C3A2A]">Room Type {i + 1}</p>
                {rooms.length > 1 && <button onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))} className="text-xs text-red-500">Remove</button>}
              </div>
              <input className={fieldClass} value={r.name} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Room name (e.g. Standard Room, Family Cabin)" />
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} type="number" value={r.capacity} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, capacity: e.target.value } : x))} placeholder="Max guests" />
                <input className={fieldClass} type="number" value={r.price_per_night} onChange={e => setRooms(rooms.map((x, idx) => idx === i ? { ...x, price_per_night: e.target.value } : x))} placeholder="Price/night (UGX)" />
              </div>
            </div>
          ))}
          <button onClick={() => setRooms([...rooms, { name: "", capacity: "2", price_per_night: "" }])}
            className="w-full rounded-xl border-2 border-dashed border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">
            + Add room type
          </button>
          <div>
            <label className={labelClass}>Cover photo URL</label>
            <input className={fieldClass} value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Gallery photos (paste URLs)</label>
            {photoUrls.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className={fieldClass} value={url} onChange={e => setPhotoUrls(photoUrls.map((u, idx) => idx === i ? e.target.value : u))} placeholder={`Photo ${i + 1} URL`} />
                {photoUrls.length > 1 && <button onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))} className="text-xs text-red-500 px-2">✕</button>}
              </div>
            ))}
            {photoUrls.length < 10 && <button onClick={() => setPhotoUrls([...photoUrls, ""])} className="text-xs font-bold text-[#1C3A2A] underline">+ Add photo</button>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={() => { const e = validateStep3(); if (e) { setError(e); return; } setError(""); setStep(4); }}
              className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842]">Next: Review →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#1C3A2A]">Review & Submit</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p><span className="font-bold">Name:</span> {name}</p>
            <p><span className="font-bold">Type:</span> {STAY_TYPE_LABELS[type]}</p>
            <p><span className="font-bold">Destination:</span> {destinationSlug}</p>
            <p><span className="font-bold">Location:</span> {town}, {district}</p>
            <p><span className="font-bold">WhatsApp:</span> {whatsapp}</p>
            <p><span className="font-bold">Capacity:</span> {capacity} guests</p>
            <p><span className="font-bold">Amenities:</span> {amenities.length} selected</p>
            <p><span className="font-bold">Room types:</span> {rooms.filter(r => r.name.trim()).length} added</p>
            <p><span className="font-bold">Photos:</span> {photoUrls.filter(u => u.trim()).length} added</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="flex-1 rounded-xl border-2 border-[#1C3A2A] py-3 text-sm font-bold text-[#1C3A2A]">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842] disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit for Review →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
