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
    <div className="min-h-screen bg-brand-cream">
      <div className="motion-page relative overflow-hidden bg-brand-forest px-4 py-8 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />
        <h1 className="relative text-2xl font-black text-brand-gold mb-1 sm:text-3xl" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          ✂️ List Your Salon
        </h1>
        <p className="relative text-sm text-brand-cream/80">Free to list. Reach customers across Uganda.</p>
      </div>
      <div className="motion-page-delay px-4 py-6 max-w-lg mx-auto">
        <SalonRegisterForm />
      </div>
    </div>
  );
}
