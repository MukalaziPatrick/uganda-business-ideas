import type { Metadata } from "next";
import SalonRegisterForm from "./SalonRegisterForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "List Your Salon | Business Yoo",
  description: "Register your salon or barbershop on Business Yoo. Reach customers across Uganda for free.",
  alternates: { canonical: `${SITE_URL}/salons/register` },
};

export default function SalonRegisterPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842] mb-1" style={{ fontFamily: "Georgia, serif" }}>
          ✂️ List Your Salon
        </h1>
        <p className="text-sm text-white/70">Free to list. Reach customers across Uganda.</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <SalonRegisterForm />
      </div>
    </div>
  );
}
