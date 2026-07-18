export const SUPPORTED_COUNTRIES = [
  "Uganda",
  "Kenya",
  "Tanzania",
  "Rwanda",
] as const;

export type CountryName = (typeof SUPPORTED_COUNTRIES)[number];
export type CountryCode = "uganda" | "kenya" | "tanzania" | "rwanda";
export type CoverageLevel = "home_market" | "research_preview";
export type ResearchPriority = "High" | "Medium" | "Low";
export type CsvRow = Record<string, string>;

export type OpportunitySignal = {
  country: CountryName;
  city: string;
  businessCategory: string;
  subcategory: string;
  businessType: string;
  targetCustomer: string;
  problem: string;
  appOpportunity: string;
  leadValueScore: number;
  tenderRelevanceScore: number;
  researchPriority: ResearchPriority;
  sourcesToSearch: string;
  notes: string;
};

export type CommercialHub = {
  country: CountryName;
  city: string;
  region: string;
  commercialRole: string;
  priorityScore: number;
  whyItMatters: string;
  firstCategoriesToResearch: string;
};

export type ResearchSource = {
  sourceName: string;
  country: CountryName | "Regional";
  dataType: string;
  urlOrSearchQuery: string;
  riskLevel: string;
  updateFrequency: string;
  collectionMode: string;
  notes: string;
};

export type CountryCatalog = {
  code: CountryCode;
  name: CountryName;
  flag: string;
  coverage: CoverageLevel;
  opportunities: OpportunitySignal[];
  hubs: CommercialHub[];
  sources: ResearchSource[];
};

export type EastAfricaCatalog = {
  countries: CountryCatalog[];
};

type CatalogRows = {
  opportunityRows: CsvRow[];
  cityRows: CsvRow[];
  sourceRows: CsvRow[];
};

type OpportunityFilters = {
  query: string;
  priority: "All" | ResearchPriority;
};

const COUNTRY_META: Record<
  CountryName,
  { code: CountryCode; flag: string; coverage: CoverageLevel }
> = {
  Uganda: { code: "uganda", flag: "🇺🇬", coverage: "home_market" },
  Kenya: { code: "kenya", flag: "🇰🇪", coverage: "research_preview" },
  Tanzania: { code: "tanzania", flag: "🇹🇿", coverage: "research_preview" },
  Rwanda: { code: "rwanda", flag: "🇷🇼", coverage: "research_preview" },
};

function isCountryName(value: string): value is CountryName {
  return SUPPORTED_COUNTRIES.includes(value as CountryName);
}

function isSourceCountry(
  value: string,
): value is CountryName | "Regional" {
  return value === "Regional" || isCountryName(value);
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPriority(value: string): ResearchPriority {
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return "Low";
}

export function parseCsv(input: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field.trim());
    field = "";
  };

  const pushRow = () => {
    pushField();
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      pushField();
    } else if (character === "\n" && !quoted) {
      pushRow();
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) pushRow();
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

export function buildEastAfricaCatalog({
  opportunityRows,
  cityRows,
  sourceRows,
}: CatalogRows): EastAfricaCatalog {
  const opportunities = opportunityRows
    .filter((row) => isCountryName(row.country))
    .map(
      (row): OpportunitySignal => ({
        country: row.country as CountryName,
        city: row.city,
        businessCategory: row.business_category,
        subcategory: row.subcategory,
        businessType: row.business_type,
        targetCustomer: row.target_customer,
        problem: row.problem,
        appOpportunity: row.app_opportunity,
        leadValueScore: toNumber(row.lead_value_score),
        tenderRelevanceScore: toNumber(row.tender_relevance_score),
        researchPriority: toPriority(row.research_priority),
        sourcesToSearch: row.sources_to_search,
        notes: row.notes,
      }),
    );

  const hubs = cityRows
    .filter((row) => isCountryName(row.country))
    .map(
      (row): CommercialHub => ({
        country: row.country as CountryName,
        city: row.city,
        region: row.region,
        commercialRole: row.commercial_role,
        priorityScore: toNumber(row.priority_score),
        whyItMatters: row.why_it_matters,
        firstCategoriesToResearch: row.first_categories_to_research,
      }),
    );

  const sources = sourceRows
    .filter((row) => isSourceCountry(row.country))
    .map(
      (row): ResearchSource => ({
        sourceName: row.source_name,
        country: row.country as CountryName | "Regional",
        dataType: row.data_type,
        urlOrSearchQuery: row.url_or_search_query,
        riskLevel: row.risk_level,
        updateFrequency: row.update_frequency,
        collectionMode: row.manual_or_automated,
        notes: row.notes,
      }),
    );

  return {
    countries: SUPPORTED_COUNTRIES.map((name) => ({
      name,
      ...COUNTRY_META[name],
      opportunities: opportunities.filter((item) => item.country === name),
      hubs: hubs.filter((hub) => hub.country === name),
      sources: sources.filter(
        (source) => source.country === name || source.country === "Regional",
      ),
    })),
  };
}

export function filterOpportunitySignals(
  signals: OpportunitySignal[],
  filters: OpportunityFilters,
): OpportunitySignal[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return signals.filter((signal) => {
    if (
      filters.priority !== "All" &&
      signal.researchPriority !== filters.priority
    ) {
      return false;
    }

    if (!query) return true;

    return [
      signal.city,
      signal.businessCategory,
      signal.subcategory,
      signal.targetCustomer,
      signal.problem,
      signal.appOpportunity,
    ].some((value) => value.toLocaleLowerCase().includes(query));
  });
}
