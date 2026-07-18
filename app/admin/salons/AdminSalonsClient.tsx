"use client";

import { useState } from "react";

type SalonRow = { id: string; name: string; type: string; gender: string; district: string; whatsapp?: string; status?: string; created_at: string };

export default function AdminSalonsClient({ pending, active }: { pending: SalonRow[]; active: SalonRow[] }) {
  const [tab, setTab] = useState<"pending" | "active">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [activeList, setActiveList] = useState(active);
  const [loading, setLoading] = useState<string | null>(null);

  const approve = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/salons/approve", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const reject = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/salons/reject", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const toggleFeatured = async (id: string, currentStatus: string) => {
    setLoading(id);
    const newStatus = currentStatus === "featured" ? "active" : "featured";
    await fetch("/api/admin/salons/feature", { method: "POST", body: JSON.stringify({ id, status: newStatus }), headers: { "Content-Type": "application/json" } });
    setActiveList(a => a.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-4">✂️ Salon Admin</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "pending" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>
          Pending ({pendingList.length})
        </button>
        <button onClick={() => setTab("active")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "active" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>
          Active ({activeList.length})
        </button>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingList.length === 0 && <p className="text-sm text-brand-green text-center py-8">No pending salons.</p>}
          {pendingList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-brand-beige">
              <p className="font-black text-[#1C3A2A]">{s.name}</p>
              <p className="text-xs text-brand-green mt-1">{s.type} · {s.gender} · {s.district}</p>
              {s.whatsapp && <p className="text-xs text-brand-green">📱 {s.whatsapp}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(s.id)} disabled={loading === s.id} className="flex-1 bg-[#1C3A2A] text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">✅ Approve</button>
                <button onClick={() => reject(s.id)} disabled={loading === s.id} className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-bold disabled:opacity-50">❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "active" && (
        <div className="space-y-3">
          {activeList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-brand-beige">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-[#1C3A2A]">{s.name}</p>
                  <p className="text-xs text-brand-green mt-1">{s.type} · {s.gender} · {s.district}</p>
                </div>
                {s.status === "featured" && <span className="bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">⭐ FEATURED</span>}
              </div>
              <button onClick={() => toggleFeatured(s.id, s.status!)} disabled={loading === s.id}
                className={`mt-3 w-full rounded-lg py-2 text-sm font-bold disabled:opacity-50 ${s.status === "featured" ? "bg-brand-cream text-brand-green" : "bg-[#F5C842] text-[#1C3A2A]"}`}>
                {s.status === "featured" ? "Remove Featured" : "⭐ Make Featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
