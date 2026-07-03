type FilterablePharmacyRow = {
  id: string;
  name: string;
  district: string | null;
  service_area: string | null;
  whatsapp: string | null;
  phone: string | null;
  created_at: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterAdminPharmacies<T extends FilterablePharmacyRow>(
  rows: T[],
  search: string,
  district: string
) {
  const normalizedSearch = normalize(search);
  const normalizedDistrict = normalize(district);

  return rows.filter((row) => {
    if (normalizedDistrict && normalize(row.district ?? "") !== normalizedDistrict) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      row.name,
      row.district ?? "",
      row.service_area ?? "",
      row.phone ?? "",
      row.whatsapp ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}
