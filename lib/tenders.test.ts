import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getLiveTenders } from "./tenders";

const mockCreate = createSupabaseAdminClient as ReturnType<typeof vi.fn>;

function makeBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.limit as ReturnType<typeof vi.fn>).mockResolvedValue(result);
  return builder;
}

function makeSelectResult(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockResolvedValue(result),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getLiveTenders", () => {
  it("falls back to public.tenders and maps country metadata from tender_countries", async () => {
    const viewBuilder = makeBuilder({
      data: null,
      error: { message: "relation does not exist" },
    });
    const tendersBuilder = makeBuilder({
      data: [
        {
          id: 420,
          source: "uganda_gpp_seed_2026-07-03",
          country_id: 1,
          title: "Acquisition of land with property at Nakawa Industrial Area",
          entity_name: "Uganda Revenue Authority",
          category: "Supplies",
          deadline: "2026-07-08T00:00:00+00:00",
          source_url: "https://example.com/tender",
          updated_at: "2026-07-03T09:19:28.328723+00:00",
        },
      ],
      error: null,
    });
    const countriesBuilder = makeSelectResult({
      data: [{ id: 1, iso2: "UG", name: "Uganda" }],
      error: null,
    });

    mockCreate.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(tendersBuilder)
        .mockReturnValueOnce(countriesBuilder),
    });

    const result = await getLiveTenders();

    expect(result).toEqual([
      {
        id: 420,
        source: "uganda_gpp_seed_2026-07-03",
        country_iso2: "UG",
        country_name: "Uganda",
        title: "Acquisition of land with property at Nakawa Industrial Area",
        entity_name: "Uganda Revenue Authority",
        category: "Supplies",
        deadline: "2026-07-08T00:00:00+00:00",
        source_url: "https://example.com/tender",
        updated_at: "2026-07-03T09:19:28.328723+00:00",
      },
    ]);
  });

  it("does not log an error when tenders_live is simply missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const viewBuilder = makeBuilder({
      data: null,
      error: { code: "PGRST205", message: "Could not find the table 'public.tenders_live'" },
    });
    const tendersBuilder = makeBuilder({
      data: [],
      error: null,
    });
    const countriesBuilder = makeSelectResult({
      data: [],
      error: null,
    });

    mockCreate.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(tendersBuilder)
        .mockReturnValueOnce(countriesBuilder),
    });

    await getLiveTenders();

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("drops known-bad legacy Kenya rows with null categories from the public feed", async () => {
    const viewBuilder = makeBuilder({
      data: null,
      error: { code: "PGRST205", message: "Could not find the table 'public.tenders_live'" },
    });
    const tendersBuilder = makeBuilder({
      data: [
        {
          id: 11,
          source: "combine_all_2026-07-02",
          country_id: 2,
          title: "RETURN AIR TICKET FOR BOARD MEMBERS",
          entity_name: "Anti-Doping Agency of Kenya",
          category: null,
          deadline: "2026-07-03T10:00:00+00:00",
          source_url: "https://tenders.go.ke/tenders",
          updated_at: "2026-07-02T13:25:53.221252+00:00",
        },
        {
          id: 420,
          source: "uganda_gpp_seed_2026-07-03",
          country_id: 1,
          title: "Acquisition of land with property at Nakawa Industrial Area",
          entity_name: "Uganda Revenue Authority",
          category: "Supplies",
          deadline: "2026-07-08T00:00:00+00:00",
          source_url: "https://example.com/tender",
          updated_at: "2026-07-03T09:19:28.328723+00:00",
        },
      ],
      error: null,
    });
    const countriesBuilder = makeSelectResult({
      data: [
        { id: 1, iso2: "UG", name: "Uganda" },
        { id: 2, iso2: "KE", name: "Kenya" },
      ],
      error: null,
    });

    mockCreate.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(tendersBuilder)
        .mockReturnValueOnce(countriesBuilder),
    });

    const result = await getLiveTenders();

    expect(result).toHaveLength(1);
    expect(result[0]?.country_iso2).toBe("UG");
  });

  it("returns [] when the admin client is unavailable", async () => {
    mockCreate.mockReturnValue(null);

    await expect(getLiveTenders()).resolves.toEqual([]);
  });
});
