import { describe, expect, it } from "vitest";

import { filterAdminPharmacies } from "./admin-filters";

const rows = [
  {
    id: "1",
    name: "MYDAWA Pharmacy - Jinja Main Street",
    district: "Jinja",
    service_area: "Jinja",
    whatsapp: null,
    phone: "0778 139879",
    created_at: "2026-06-26T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Guardian Health Pharmacy Wandegeya",
    district: "Kampala",
    service_area: "Kampala",
    whatsapp: null,
    phone: "0778 139629",
    created_at: "2026-06-26T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Abacus Pharma",
    district: "Mbarara",
    service_area: "Mbarara",
    whatsapp: null,
    phone: "0700 637104",
    created_at: "2026-06-26T00:00:00.000Z",
  },
];

describe("filterAdminPharmacies", () => {
  it("returns all rows when no filters are applied", () => {
    expect(filterAdminPharmacies(rows, "", "")).toEqual(rows);
  });

  it("filters by free-text search across name, district, service area, and phone", () => {
    expect(filterAdminPharmacies(rows, "139629", "")).toEqual([rows[1]]);
    expect(filterAdminPharmacies(rows, "abacus", "")).toEqual([rows[2]]);
    expect(filterAdminPharmacies(rows, "jinja", "")).toEqual([rows[0]]);
  });

  it("filters by district", () => {
    expect(filterAdminPharmacies(rows, "", "Mbarara")).toEqual([rows[2]]);
  });

  it("combines search and district filters", () => {
    expect(filterAdminPharmacies(rows, "pharmacy", "Kampala")).toEqual([rows[1]]);
  });
});
