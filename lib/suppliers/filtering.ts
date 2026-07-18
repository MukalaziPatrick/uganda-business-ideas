import type {
  Supplier,
  SupplierCategory,
  SupplierContactStatus,
} from "@/app/data/suppliers";

export function canShowSupplierContact(
  contactStatus: SupplierContactStatus,
): boolean {
  return contactStatus === "verified";
}

export function deriveSupplierCategories(
  suppliers: Supplier[],
): SupplierCategory[] {
  return [...new Set(suppliers.map((supplier) => supplier.category))].sort(
    (left, right) => left.localeCompare(right),
  );
}

export function filterSuppliers(
  suppliers: Supplier[],
  category: "All" | SupplierCategory,
): Supplier[] {
  if (category === "All") return suppliers;
  return suppliers.filter((supplier) => supplier.category === category);
}
