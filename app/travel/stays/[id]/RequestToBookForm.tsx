"use client";

import { useState } from "react";

export default function RequestToBookForm({ stayName, stayWhatsapp }: { stayName: string; stayWhatsapp: string }) {
  const [guestName, setGuestName] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("1");
  const [myWhatsapp, setMyWhatsapp] = useState("");

  const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1C3A2A] bg-white";

  const handleRequest = () => {
    const message = `Hi, I'd like to book ${stayName}. Name: ${guestName}. Check-in: ${checkin}. Check-out: ${checkout}. Guests: ${guests}. My WhatsApp: ${myWhatsapp}.`;
    const url = `https://wa.me/${stayWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const isValid = guestName.trim() && checkin && checkout && myWhatsapp.trim();

  return (
    <div className="space-y-3">
      <input className={fieldClass} placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <input className={fieldClass} type="date" placeholder="Check-in" value={checkin} onChange={e => setCheckin(e.target.value)} />
        <input className={fieldClass} type="date" placeholder="Check-out" value={checkout} onChange={e => setCheckout(e.target.value)} />
      </div>
      <input className={fieldClass} type="number" min="1" placeholder="Number of guests" value={guests} onChange={e => setGuests(e.target.value)} />
      <input className={fieldClass} type="tel" placeholder="Your WhatsApp number" value={myWhatsapp} onChange={e => setMyWhatsapp(e.target.value)} />
      <button
        onClick={handleRequest}
        disabled={!isValid}
        className="w-full bg-[#1C3A2A] text-white font-black text-sm py-3 rounded-xl disabled:opacity-40"
      >
        Send Request via WhatsApp →
      </button>
    </div>
  );
}
