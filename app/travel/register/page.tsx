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
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>🏨 List Your Place</h1>
        <p className="text-sm text-white/70">Free to list. Reach travellers across Uganda.</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TravelRegisterForm />
      </div>
    </div>
  );
}
