import { describe, expect, it } from "vitest";

import type { Supplier } from "@/app/data/suppliers";
import {
  canShowSupplierContact,
  deriveSupplierCategories,
  filterSuppliers,
} from "./filtering";

const suppliers: Supplier[] = [
  {
    id: "agro",
    slug: "agro",
    name: "Agro-input slot",
    category: "Agriculture",
    location: "Uganda",
    description: "Verification slot",
    ideaSlugs: [],
    contactStatus: "needs_verification",
    verificationSummary: "Contact hidden until verified",
    verificationChecks: [],
    isFeatured: false,
    phone: "+256700000000",
  },
  {
    id: "digital",
    slug: "digital",
    name: "Digital services slot",
    category: "Digital",
    location: "Uganda",
    description: "Verification slot",
    ideaSlugs: [],
    contactStatus: "needs_verification",
    verificationSummary: "Contact hidden until verified",
    verificationChecks: [],
    isFeatured: false,
  },
  {
    id: "retail",
    slug: "retail",
    name: "Retail wholesale slot",
    category: "Retail",
    location: "Uganda",
    description: "Verification slot",
    ideaSlugs: [],
    contactStatus: "placeholder",
    verificationSummary: "Placeholder only",
    verificationChecks: [],
    isFeatured: false,
  },
];

describe("deriveSupplierCategories", () => {
  it("returns unique categories in alphabetical order", () => {
    expect(deriveSupplierCategories(suppliers)).toEqual([
      "Agriculture",
      "Digital",
      "Retail",
    ]);
  });
});

describe("filterSuppliers", () => {
  it("returns every supplier for All", () => {
    expect(filterSuppliers(suppliers, "All")).toEqual(suppliers);
  });

  it("filters by exact category", () => {
    expect(filterSuppliers(suppliers, "Digital").map((item) => item.id)).toEqual([
      "digital",
    ]);
  });

  it("does not change trust status or strip hidden contact data", () => {
    const result = filterSuppliers(suppliers, "Agriculture")[0];

    expect(result.contactStatus).toBe("needs_verification");
    expect(result.phone).toBe("+256700000000");
    expect(result).toBe(suppliers[0]);
  });
});

describe("canShowSupplierContact", () => {
  it("allows contact only for verified suppliers", () => {
    expect(canShowSupplierContact("verified")).toBe(true);
    expect(canShowSupplierContact("needs_verification")).toBe(false);
    expect(canShowSupplierContact("placeholder")).toBe(false);
  });
});
