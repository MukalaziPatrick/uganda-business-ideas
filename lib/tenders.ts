import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type TenderRow = {
  id: number;
  source: string;
  country_iso2: string | null;
  country_name: string | null;
  title: string;
  entity_name: string | null;
  category: string | null;
  deadline: string | null;
  source_url: string | null;
  updated_at: string | null;
};

type TenderCountry = {
  id: number;
  iso2: string | null;
  name: string | null;
};

type TenderBaseRow = {
  id: number;
  source: string;
  country_id: number | null;
  title: string;
  entity_name: string | null;
  category: string | null;
  deadline: string | null;
  source_url: string | null;
  updated_at: string | null;
};

const LIVE_VIEW_COLUMNS =
  "id,source,country_iso2,country_name,title,entity_name,category,deadline,source_url,updated_at";

const FALLBACK_COLUMNS =
  "id,source,country_id,title,entity_name,category,deadline,source_url,updated_at";

function isMissingReadModel(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "PGRST205"
  );
}

function mapTender(
  row: TenderBaseRow,
  countriesById: Map<number, TenderCountry>
): TenderRow {
  const country = row.country_id ? countriesById.get(row.country_id) : undefined;

  return {
    id: row.id,
    source: row.source,
    country_iso2: country?.iso2 ?? null,
    country_name: country?.name ?? null,
    title: row.title,
    entity_name: row.entity_name,
    category: row.category?.trim() ?? null,
    deadline: row.deadline,
    source_url: row.source_url,
    updated_at: row.updated_at,
  };
}

function shouldIncludePublicTender(row: TenderBaseRow): boolean {
  if (row.country_id !== 1 && row.country_id !== 2) {
    return false;
  }

  if (
    row.country_id === 2 &&
    row.source === "combine_all_2026-07-02" &&
    !row.category
  ) {
    return false;
  }

  return true;
}

export async function getLiveTenders(): Promise<TenderRow[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const liveView = await supabase
    .from("tenders_live")
    .select(LIVE_VIEW_COLUMNS)
    .order("deadline", { ascending: true })
    .limit(200);

  if (!liveView.error) {
    return (liveView.data ?? []) as TenderRow[];
  }

  if (!isMissingReadModel(liveView.error)) {
    console.error("tenders_live query failed, falling back to public.tenders:", liveView.error);
  }

  const [tendersResult, countriesResult] = await Promise.all([
    supabase
      .from("tenders")
      .select(FALLBACK_COLUMNS)
      .order("deadline", { ascending: true })
      .limit(200),
    supabase.from("tender_countries").select("id,iso2,name"),
  ]);

  if (tendersResult.error) {
    console.error("public.tenders fallback query failed:", tendersResult.error);
    return [];
  }

  if (countriesResult.error) {
    console.error("tender_countries lookup failed:", countriesResult.error);
    return [];
  }

  const countriesById = new Map(
    ((countriesResult.data ?? []) as TenderCountry[]).map((country) => [
      country.id,
      country,
    ])
  );

  return ((tendersResult.data ?? []) as TenderBaseRow[])
    .filter(shouldIncludePublicTender)
    .map((row) => mapTender(row, countriesById));
}
