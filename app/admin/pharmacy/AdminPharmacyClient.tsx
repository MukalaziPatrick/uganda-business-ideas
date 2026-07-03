"use client";

import { FormEvent, useMemo, useState } from "react";
import { filterAdminPharmacies } from "@/lib/pharmacy/admin-filters";

type PharmacyRow = {
  id: string;
  name: string;
  district: string | null;
  service_area: string | null;
  whatsapp: string | null;
  phone: string | null;
  is_24_hour?: boolean;
  has_delivery?: boolean;
  google_rating?: number | null;
  google_review_count?: number | null;
  phone_verified?: boolean;
  map_verified?: boolean;
  licence_verified?: boolean;
  rank_score?: number;
  ranking_notes?: string | null;
  ranking_updated_at?: string | null;
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
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");

  const districts = useMemo(() => {
    const values = new Set(
      [...pendingList, ...activeList]
        .map((pharmacy) => pharmacy.district?.trim())
        .filter((value): value is string => Boolean(value))
    );

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [activeList, pendingList]);

  const filteredPending = useMemo(
    () => filterAdminPharmacies(pendingList, search, district),
    [district, pendingList, search]
  );
  const filteredActive = useMemo(
    () => filterAdminPharmacies(activeList, search, district),
    [activeList, district, search]
  );
  const sortedFilteredActive = useMemo(
    () =>
      [...filteredActive].sort((a, b) => {
        const scoreDiff = (b.rank_score ?? 0) - (a.rank_score ?? 0);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [filteredActive]
  );

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

  const saveRanking = async (event: FormEvent<HTMLFormElement>, pharmacy: PharmacyRow) => {
    event.preventDefault();
    setLoading(pharmacy.id);

    const formData = new FormData(event.currentTarget);
    const googleRatingValue = formData.get("googleRating")?.toString().trim();
    const googleReviewCountValue = formData.get("googleReviewCount")?.toString().trim();
    const payload = {
      id: pharmacy.id,
      googleRating: googleRatingValue ? Number(googleRatingValue) : null,
      googleReviewCount: googleReviewCountValue ? Number(googleReviewCountValue) : null,
      phoneVerified: formData.has("phoneVerified"),
      mapVerified: formData.has("mapVerified"),
      licenceVerified: formData.has("licenceVerified"),
      hasDelivery: Boolean(pharmacy.has_delivery),
      is24Hour: Boolean(pharmacy.is_24_hour),
      rankingNotes: formData.get("rankingNotes")?.toString() ?? null,
    };

    const response = await fetch("/api/admin/pharmacy/ranking", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const result = (await response.json()) as { rankScore?: number };

    if (!response.ok) {
      setLoading(null);
      return;
    }

    setActiveList((current) =>
      current.map((item) =>
        item.id === pharmacy.id
          ? {
              ...item,
              google_rating: payload.googleRating,
              google_review_count: payload.googleReviewCount,
              phone_verified: payload.phoneVerified,
              map_verified: payload.mapVerified,
              licence_verified: payload.licenceVerified,
              rank_score: result.rankScore ?? item.rank_score ?? 0,
              ranking_notes: payload.rankingNotes?.trim() || null,
              ranking_updated_at: new Date().toISOString(),
            }
          : item
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

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, district, service area, or phone"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0 placeholder:text-gray-400"
        />
        <select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-0"
        >
          <option value="">All districts</option>
          {districts.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

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
          {filteredPending.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No pending pharmacies match the current filters.
            </p>
          )}
          {filteredPending.map((pharmacy) => (
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
          {filteredActive.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No active pharmacies match the current filters.
            </p>
          )}
          {sortedFilteredActive.map((pharmacy) => (
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
              <form
                onSubmit={(event) => saveRanking(event, pharmacy)}
                className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase text-[#1C3A2A]">
                    Private rank score
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#1C3A2A]">
                    {pharmacy.rank_score ?? 0}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-gray-600">
                    Google rating
                    <input
                      name="googleRating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      defaultValue={pharmacy.google_rating ?? ""}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    Google reviews
                    <input
                      name="googleReviewCount"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={pharmacy.google_review_count ?? ""}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
                    />
                  </label>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-semibold text-gray-600 sm:grid-cols-3">
                  <label className="flex items-center gap-2">
                    <input
                      name="phoneVerified"
                      type="checkbox"
                      defaultChecked={Boolean(pharmacy.phone_verified)}
                    />
                    Phone checked
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      name="mapVerified"
                      type="checkbox"
                      defaultChecked={Boolean(pharmacy.map_verified)}
                    />
                    Map checked
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      name="licenceVerified"
                      type="checkbox"
                      defaultChecked={Boolean(pharmacy.licence_verified)}
                    />
                    Licence checked
                  </label>
                </div>
                <label className="mt-3 block text-xs font-semibold text-gray-600">
                  Private notes
                  <textarea
                    name="rankingNotes"
                    defaultValue={pharmacy.ranking_notes ?? ""}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading === pharmacy.id}
                  className="mt-3 w-full rounded-lg bg-[#1C3A2A] py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Save Private Ranking
                </button>
              </form>
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
