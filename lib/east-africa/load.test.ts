import { describe, expect, it } from "vitest";

import { loadEastAfricaCatalog } from "./load";

describe("loadEastAfricaCatalog", () => {
  it("loads the checked-in catalog for all four launch countries", async () => {
    const catalog = await loadEastAfricaCatalog();

    expect(catalog.countries.map((country) => country.name)).toEqual([
      "Uganda",
      "Kenya",
      "Tanzania",
      "Rwanda",
    ]);
    expect(catalog.countries[0].opportunities.length).toBeGreaterThan(10);
    expect(catalog.countries.slice(1).every((country) => country.opportunities.length > 0)).toBe(
      true,
    );
    expect(catalog.countries.every((country) => country.hubs.length > 0)).toBe(
      true,
    );
  });
});
