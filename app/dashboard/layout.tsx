import type { Metadata } from "next";
import React from "react";
import BottomNav from "./components/BottomNav";
import DemoBanner from "./components/DemoBanner";

export const metadata: Metadata = {
  title: "Dashboard | Business Yoo",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20 text-slate-900">
      <DemoBanner />
      {children}
      <BottomNav />
    </div>
  );
}
