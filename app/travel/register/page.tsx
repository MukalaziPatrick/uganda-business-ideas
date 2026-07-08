import type { Metadata } from "next";
import TravelRegisterForm from "./TravelRegisterForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "List Your Accommodation | ZuulaUganda",
  description: "Register your hotel, guesthouse, lodge, or campsite on ZuulaUganda. Reach travellers across Uganda for free.",
  alternates: { canonical: `${SITE_URL}/travel/register` },
};

export default function TravelRegisterPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-gradient-to-br from-brand-forest to-brand-green px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-brand-gold mb-1" style={{ fontFamily: "Georgia, serif" }}>🏨 List Your Place</h1>
        <p className="text-sm text-white/70">Free to list. Reach travellers across Uganda.</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TravelRegisterForm />
      </div>
    </div>
  );
}
