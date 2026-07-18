import { describe, expect, it } from "vitest";

import {
  buildEastAfricaCatalog,
  filterOpportunitySignals,
  parseCsv,
  type OpportunitySignal,
} from "./catalog";

describe("parseCsv", () => {
  it("keeps commas and escaped quotes inside quoted fields", () => {
    const csv = [
      "country,notes",
      'Kenya,"Port, freight and ""trusted"" clearing"',
    ].join("\n");

    expect(parseCsv(csv)).toEqual([
      {
        country: "Kenya",
        notes: 'Port, freight and "trusted" clearing',
      },
    ]);
  });

  it("ignores blank lines and trims unquoted values", () => {
    expect(parseCsv("country,city\n Uganda , Kampala \n\n")).toEqual([
      { country: "Uganda", city: "Kampala" },
    ]);
  });
});

describe("buildEastAfricaCatalog", () => {
  const catalog = buildEastAfricaCatalog({
    opportunityRows: parseCsv(
      [
        "country,city,business_category,subcategory,business_type,target_customer,problem,app_opportunity,lead_value_score,tender_relevance_score,research_priority,sources_to_search,notes",
        "Uganda,Kampala,Tender suppliers,General supplies,B2B,SMEs,Finding tenders,Tender matching,10,10,High,PPDA,Home market signal",
        "Kenya,Mombasa,Transport and logistics,Freight and clearing,B2B,Importers,Trusted clearing agents,Logistics directory,10,9,High,KPA,Regional port signal",
        "Tanzania,Dar es Salaam,Import export,Port clearing,B2B,Importers,Port bureaucracy,Transit guides,9,8,Medium,TPA,Alternative route",
        "Rwanda,Kigali,Professional services,Legal and accounting,B2B,Investors,Advisor discovery,Investor landing pad,9,7,High,RDB,Research preview",
        "DRC,Goma,Hardware,Construction supply,B2B,Contractors,Cross-border supply,Supplier directory,8,7,Medium,Associations,Outside this release",
      ].join("\n"),
    ),
    cityRows: parseCsv(
      [
        "country,city,region,commercial_role,priority_score,why_it_matters,first_categories_to_research",
        "Uganda,Kampala,Central,National Capital,10,Economic center,Tenders; ICT",
        "Kenya,Mombasa,Coast,Major Port City,9,Primary import route,Logistics",
        "Tanzania,Dar es Salaam,Coast,Major Port City,8,Alternative port,Import export",
        "Rwanda,Kigali,Central,Corporate Hub,8,B2B services market,Professional services",
      ].join("\n"),
    ),
    sourceRows: parseCsv(
      [
        "source_name,country,data_type,url_or_search_query,risk_level,update_frequency,manual_or_automated,notes",
        "PPDA Uganda,Uganda,Tenders,https://gpp.ppda.go.ug/,Low,Daily,Automated,Primary public source",
        "UNGM,Regional,Tenders,https://www.ungm.org/,Low,Daily,Automated,Regional source",
        "Kenya Ports Authority,Kenya,Logistics,https://www.kpa.co.ke/,Low,Yearly,Manual,Port starting point",
      ].join("\n"),
    ),
  });

  it("builds only the four supported countries in a stable order", () => {
    expect(catalog.countries.map((country) => country.code)).toEqual([
      "uganda",
      "kenya",
      "tanzania",
      "rwanda",
    ]);
  });

  it("labels Uganda as the home market and the other countries as previews", () => {
    expect(catalog.countries[0].coverage).toBe("home_market");
    expect(
      catalog.countries.slice(1).map((country) => country.coverage),
    ).toEqual(["research_preview", "research_preview", "research_preview"]);
  });

  it("shares Regional sources with every country without changing their provenance", () => {
    for (const country of catalog.countries) {
      expect(country.sources.some((source) => source.country === "Regional")).toBe(
        true,
      );
    }
  });

  it("coerces catalog scores to numbers", () => {
    const kenya = catalog.countries.find((country) => country.code === "kenya");
    expect(kenya?.opportunities[0].leadValueScore).toBe(10);
    expect(kenya?.hubs[0].priorityScore).toBe(9);
  });
});

describe("filterOpportunitySignals", () => {
  const signals: OpportunitySignal[] = [
    {
      country: "Kenya",
      city: "Mombasa",
      businessCategory: "Transport and logistics",
      subcategory: "Freight and clearing",
      businessType: "B2B",
      targetCustomer: "Importers",
      problem: "Finding trusted clearing agents",
      appOpportunity: "Logistics directory",
      leadValueScore: 10,
      tenderRelevanceScore: 9,
      researchPriority: "High",
      sourcesToSearch: "KPA",
      notes: "Regional port signal",
    },
    {
      country: "Kenya",
      city: "Nairobi",
      businessCategory: "ICT and software services",
      subcategory: "SME automation",
      businessType: "B2B",
      targetCustomer: "SMEs",
      problem: "Vendor trust",
      appOpportunity: "Tech vendor directory",
      leadValueScore: 10,
      tenderRelevanceScore: 8,
      researchPriority: "Medium",
      sourcesToSearch: "LinkedIn",
      notes: "Regional tech signal",
    },
  ];

  it("matches search across category, subcategory, city, and app opportunity", () => {
    expect(
      filterOpportunitySignals(signals, {
        query: "logistics",
        priority: "All",
      }).map((signal) => signal.city),
    ).toEqual(["Mombasa"]);

    expect(
      filterOpportunitySignals(signals, {
        query: "nairobi",
        priority: "All",
      }).map((signal) => signal.city),
    ).toEqual(["Nairobi"]);
  });

  it("combines a priority filter with search", () => {
    expect(
      filterOpportunitySignals(signals, {
        query: "directory",
        priority: "High",
      }).map((signal) => signal.city),
    ).toEqual(["Mombasa"]);
  });
});
