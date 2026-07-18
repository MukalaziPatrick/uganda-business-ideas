"use client";

import { useRef, useState } from "react";
import type { ImportRow } from "@/app/api/admin/import-places/route";

type RowWithSelection = ImportRow & { selected: boolean };

export default function ImportPlacesClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowWithSelection[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError("");
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("File must be a JSON array.");
        const withSelection: RowWithSelection[] = parsed.map((r: ImportRow) => ({
          ...r,
          selected: true,
        }));
        setRows(withSelection);
      } catch {
        setParseError("Invalid JSON file. Make sure it came from the scraper.");
      }
    };
    reader.readAsText(file);
  };

  const toggleAll = (selected: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, selected })));
  };

  const toggleRow = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedRows = rows.filter((r) => r.selected);

  const handleImport = async () => {
    if (selectedRows.length === 0) return;
    setImporting(true);
    setResult(null);

    const res = await fetch("/api/admin/import-places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedRows),
    });

    const data = await res.json();
    setImporting(false);

    if (!res.ok) {
      setParseError(data.error ?? "Import failed.");
    } else {
      setResult(data);
      setRows([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-brand-green mb-1">
          Upload scraper JSON file
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFile}
          className="block border border-brand-beige rounded-lg px-3 py-2 text-sm bg-white"
        />
      </div>

      {parseError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {parseError}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-brand-green/10 border border-brand-green/30 px-4 py-3 text-sm text-brand-forest">
          Done! {result.imported} imported, {result.skipped} skipped (already existed).{" "}
          <a href="/admin/businesses" className="font-bold underline">
            Review pending businesses →
          </a>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-forest/90">
              {rows.length} businesses found · {selectedRows.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="text-xs font-bold text-[#1C3A2A] underline"
              >
                Select all
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="text-xs font-bold text-brand-green/60 underline"
              >
                Deselect all
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-beige">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1C3A2A] text-white">
                  <th className="p-3 text-left w-8"></th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Region</th>
                  <th className="p-3 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.external_id}
                    className={`border-b border-brand-beige/60 cursor-pointer hover:bg-brand-cream/60 ${
                      !r.selected ? "opacity-40" : ""
                    }`}
                    onClick={() => toggleRow(idx)}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={() => toggleRow(idx)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-brand-green">{r.category}</td>
                    <td className="p-3 text-brand-green">{r.district}</td>
                    <td className="p-3 text-brand-green">{r.region}</td>
                    <td className="p-3 text-brand-green/60 text-xs">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || selectedRows.length === 0}
            className="w-full rounded-xl bg-[#1C3A2A] py-3 text-sm font-black text-[#F5C842] disabled:opacity-50"
          >
            {importing
              ? "Importing..."
              : `Import ${selectedRows.length} businesses →`}
          </button>
        </>
      )}
    </div>
  );
}
