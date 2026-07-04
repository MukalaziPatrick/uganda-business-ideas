import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import LaunchWizard from "./LaunchWizard";

export const metadata: Metadata = {
  title: "Start Your Launch — Founder OS | Business Yoo",
  description:
    "Answer a few questions and get your personalised 30-day launch plan — free.",
  alternates: {
    canonical: `${SITE_URL}/launch/start`,
  },
};

export default function LaunchStartPage() {
  return (
    <main className="min-h-screen bg-[#FBF8F1]">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
        <header className="mb-10 flex items-center justify-between border-b border-[#1C3A2A]/10 pb-6">
          <Link href="/launch" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C3A2A] text-[11px] font-black text-[#F5C842]">
              FO
            </div>
            <span className="text-[15px] font-bold text-[#1C3A2A]">Founder OS</span>
          </Link>
          <span className="text-[12px] font-semibold text-[#1C3A2A]/50">
            Free readiness assessment
          </span>
        </header>
        <LaunchWizard />
      </section>
    </main>
  );
}
