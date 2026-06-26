"use client";

import { useState } from "react";

type PharmacyRow = {
  id: string;
  name: string;
  district: string | null;
  service_area: string | null;
  whatsapp: string | null;
  phone: string | null;
  status?: string;
  created_at: string;
};

export default function AdminPharmacyClient({
  pending,
  active,
}: {
  pending: PharmacyRow[];
  active: PharmacyRow[];
}) {
  const [tab, setTab] = useState<"pending" | "active">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [activeList, setActiveList] = useState(active);
  const [loading, setLoading] = useState<string | null>(null);

  const approve = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/pharmacy/approve", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    const moved = pendingList.find((pharmacy) => pharmacy.id === id);
    setPendingList((current) => current.filter((pharmacy) => pharmacy.id !== id));
    if (moved) {
      setActiveList((current) => [{ ...moved, status: "active" }, ...current]);
    }
    setLoading(null);
  };

  const reject = async (id: string) => {
    setLoading(id);
    await fetch("/api/admin/pharmacy/reject", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    setPendingList((current) => current.filter((pharmacy) => pharmacy.id !== id));
    setLoading(null);
  };

  const toggleFeatured = async (id: string, currentStatus: string) => {
    setLoading(id);
    const nextStatus = currentStatus === "featured" ? "active" : "featured";
    await fetch("/api/admin/pharmacy/feature", {
      method: "POST",
      body: JSON.stringify({ id, status: nextStatus }),
      headers: { "Content-Type": "application/json" },
    });
    setActiveList((current) =>
      current.map((pharmacy) =>
        pharmacy.id === id ? { ...pharmacy, status: nextStatus } : pharmacy
      )
    );
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <h1 className="mb-4 text-xl font-black text-[#1C3A2A]">Pharmacy Admin</h1>
      <p className="mb-4 text-sm text-gray-600">
        Review imported pharmacy rows before they appear publicly. Keep licence fields
        null until independently verified.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            tab === "pending" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"
          }`}
        >
          Pending ({pendingList.length})
        </button>
        <button
          onClick={() => setTab("active")}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            tab === "active" ? "bg-[#1C3A2A] text-white" : "bg-white text-[#1C3A2A]"
          }`}
        >
          Active ({activeList.length})
        </button>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingList.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No pending pharmacies.</p>
          )}
          {pendingList.map((pharmacy) => (
            <div key={pharmacy.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-black text-[#1C3A2A]">{pharmacy.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {[pharmacy.district, pharmacy.service_area].filter(Boolean).join(" - ") ||
                  "Location not set"}
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <p>Call: {pharmacy.phone || "Not listed"}</p>
                <p>WhatsApp: {pharmacy.whatsapp || "Not listed"}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => approve(pharmacy.id)}
                  disabled={loading === pharmacy.id}
                  className="flex-1 rounded-lg bg-[#1C3A2A] py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(pharmacy.id)}
                  disabled={loading === pharmacy.id}
                  className="flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-bold text-red-600 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "active" && (
        <div className="space-y-3">
          {activeList.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No active pharmacies yet.</p>
          )}
          {activeList.map((pharmacy) => (
            <div key={pharmacy.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black text-[#1C3A2A]">{pharmacy.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {[pharmacy.district, pharmacy.service_area].filter(Boolean).join(" - ") ||
                      "Location not set"}
                  </p>
                </div>
                {pharmacy.status === "featured" && (
                  <span className="rounded-full bg-[#F5C842] px-2 py-0.5 text-[10px] font-black text-[#1C3A2A]">
                    FEATURED
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <p>Call: {pharmacy.phone || "Not listed"}</p>
                <p>WhatsApp: {pharmacy.whatsapp || "Not listed"}</p>
              </div>
              <button
                onClick={() => toggleFeatured(pharmacy.id, pharmacy.status ?? "active")}
                disabled={loading === pharmacy.id}
                className={`mt-3 w-full rounded-lg py-2 text-sm font-bold disabled:opacity-50 ${
                  pharmacy.status === "featured"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-[#F5C842] text-[#1C3A2A]"
                }`}
              >
                {pharmacy.status === "featured" ? "Remove Featured" : "Make Featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
