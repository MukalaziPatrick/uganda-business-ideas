"use client";

import { useState } from "react";
import type { TravelDestination } from "@/lib/supabase/travel-types";

type StayRow = { id: string; name: string; type: string; town: string; whatsapp?: string; status?: string; created_at: string };

export default function AdminTravelClient({
  pending,
  active,
  destinations,
}: {
  pending: StayRow[];
  active: StayRow[];
  destinations: TravelDestination[];
}) {
  const [tab, setTab] = useState<"pending" | "active" | "destinations">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [activeList, setActiveList] = useState(active);
  const [destList, setDestList] = useState(destinations);
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TravelDestination>>({});

  const approve = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/approve", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const reject = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/reject", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setPendingList(p => p.filter(s => s.id !== id));
    setLoading(null);
  };

  const toggleFeatured = async (id: string, currentStatus: string) => {
    setLoading(id);
    const newStatus = currentStatus === "featured" ? "active" : "featured";
    await fetch("/api/admin/travel/feature", { method: "POST", body: JSON.stringify({ id, status: newStatus }), headers: { "Content-Type": "application/json" } });
    setActiveList(a => a.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setLoading(null);
  };

  const startEdit = (dest: TravelDestination) => {
    setEditingId(dest.id);
    setEditForm({
      description: dest.description,
      cover_photo_url: dest.cover_photo_url ?? "",
      activities: dest.activities,
      sort_order: dest.sort_order,
      is_featured: dest.is_featured,
    });
  };

  const saveDestination = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/travel/update-destination", {
      method: "POST",
      body: JSON.stringify({ id, ...editForm, activities: editForm.activities ?? [] }),
      headers: { "Content-Type": "application/json" },
    });
    setDestList(dl => dl.map(d => d.id === id ? { ...d, ...editForm, activities: editForm.activities ?? d.activities } as TravelDestination : d));
    setEditingId(null);
    setLoading(null);
  };

  const fieldClass = "w-full border border-brand-beige rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C3A2A] bg-white";

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <h1 className="text-xl font-black text-[#1C3A2A] mb-4">🏨 Travel Admin — ZuulaUganda</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "pending" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Pending ({pendingList.length})</button>
        <button onClick={() => setTab("active")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "active" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Active ({activeList.length})</button>
        <button onClick={() => setTab("destinations")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "destinations" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"}`}>Destinations ({destList.length})</button>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingList.length === 0 && <p className="text-sm text-brand-green text-center py-8">No pending stays.</p>}
          {pendingList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-brand-beige">
              <p className="font-black text-[#1C3A2A]">{s.name}</p>
              <p className="text-xs text-brand-green mt-1">{s.type} · {s.town}</p>
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
          {activeList.length === 0 && <p className="text-sm text-brand-green text-center py-8">No active stays yet.</p>}
          {activeList.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-brand-beige">
              <div className="flex justify-between items-start">
                <div><p className="font-black text-[#1C3A2A]">{s.name}</p><p className="text-xs text-brand-green mt-1">{s.type} · {s.town}</p></div>
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

      {tab === "destinations" && (
        <div className="space-y-3">
          {destList.map(d => (
            <div key={d.id} className="bg-white rounded-xl p-4 border border-brand-beige">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-black text-[#1C3A2A]">{d.name}</p>
                  <p className="text-xs text-brand-green/60">/{d.slug} · order {d.sort_order}</p>
                </div>
                {d.is_featured && <span className="bg-[#F5C842] text-[#1C3A2A] text-[10px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>}
              </div>

              {editingId === d.id ? (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-brand-green block mb-1">Description</label>
                    <textarea className={`${fieldClass} resize-none`} rows={3} value={editForm.description ?? ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-green block mb-1">Cover photo URL</label>
                    <input className={fieldClass} value={editForm.cover_photo_url ?? ""} onChange={e => setEditForm(f => ({ ...f, cover_photo_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-green block mb-1">Activities (comma-separated)</label>
                    <input className={fieldClass} value={(editForm.activities ?? []).join(", ")}
                      onChange={e => setEditForm(f => ({ ...f, activities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-brand-green block mb-1">Sort order</label>
                      <input className={fieldClass} type="number" value={editForm.sort_order ?? 0} onChange={e => setEditForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={editForm.is_featured ?? false} onChange={e => setEditForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
                        <span className="text-xs font-bold text-brand-green">🔥 Featured (HOT badge)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 border border-brand-beige rounded-lg py-2 text-sm font-bold text-brand-green">Cancel</button>
                    <button onClick={() => saveDestination(d.id)} disabled={loading === d.id}
                      className="flex-1 bg-[#1C3A2A] text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50">
                      {loading === d.id ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-brand-green mt-1 line-clamp-2">{d.description}</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {d.activities.slice(0, 3).map(a => <span key={a} className="bg-[#f0f7f0] text-[#2d6a4f] text-[10px] px-2 py-0.5 rounded-full">{a}</span>)}
                  </div>
                  <button onClick={() => startEdit(d)} className="mt-3 w-full border border-[#1C3A2A] text-[#1C3A2A] rounded-lg py-2 text-sm font-bold">✏️ Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
