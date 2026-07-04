import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Government Tenders in Uganda & Kenya | Business Yoo",
  description:
    "Browse public tenders from Uganda and Kenya with source links, sector filters, and a freshness stamp.",
  alternates: { canonical: `${SITE_URL}/tenders` },
};

type TenderRow = {
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

function sourceLabel(source: string): string {
  const lowered = source.toLowerCase();
  if (lowered.includes("uganda_gpp")) return "PPDA GPP";
  if (lowered.includes("kenya_ppip")) return "PPIP Kenya";
  if (lowered.includes("umucyo")) return "UMUCYO Rwanda";
  if (lowered.includes("nest")) return "NeST Tanzania";
  return source.replaceAll("_", " ");
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "Deadline not published";
  return new Date(deadline).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatUpdated(updatedAt: string | null): string {
  if (!updatedAt) return "unknown";
  return new Date(updatedAt).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function getTenders(): Promise<TenderRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data, error } = await supabase
      .from("tenders_live")
      .select("id,source,country_iso2,country_name,title,entity_name,category,deadline,source_url,updated_at")
      .order("deadline", { ascending: true })
      .limit(200);

    if (error) {
      console.error("tenders_live query failed:", error);
      return [];
    }

    return (data ?? []) as TenderRow[];
  } catch (error) {
    console.error("tenders_live fetch failed:", error);
    return [];
  }
}

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const country = typeof params.country === "string" ? params.country : "all";
  const sector = typeof params.sector === "string" ? params.sector : "all";

  const tenders = await getTenders();
  const sectors = Array.from(
    new Set(tenders.map((row) => row.category).filter((value): value is string => Boolean(value)))
  ).sort((a, b) => a.localeCompare(b));

  const filtered = tenders.filter((row) => {
    const matchesCountry = country === "all" || (row.country_iso2 ?? "").toLowerCase() === country.toLowerCase();
    const matchesSector = sector === "all" || (row.category ?? "") === sector;
    const haystack = [row.title, row.entity_name, row.category, row.country_name].join(" ").toLowerCase();
    const matchesQuery = !q || haystack.includes(q.toLowerCase());
    return matchesCountry && matchesSector && matchesQuery;
  });

  const freshest = filtered
    .map((row) => row.updated_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#1C3A2A]">
      <section className="relative overflow-hidden bg-[#1C3A2A] px-4 py-12 text-[#f5f0e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,200,66,0.18),_transparent_38%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.18em] text-[#F5C842]">
            Business Yoo
          </Link>
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C842]">
              Public Tenders
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Uganda and Kenya tenders, in one shortlist.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d6e4db] sm:text-base">
              Filter by country, sector, or keyword, then jump straight to the original source.
            </p>
          </div>
          <div className="inline-flex w-fit rounded-full border border-[#F5C842]/40 bg-[#2D5A40]/60 px-4 py-1.5 text-xs font-semibold text-[#F5C842]">
            Updated {formatUpdated(freshest ?? null)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <form className="rounded-[28px] border border-[#dfd4c5] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search title, entity, or sector"
              className="rounded-2xl border border-[#dfd4c5] bg-[#fbf7f0] px-4 py-3 text-sm outline-none focus:border-[#1C3A2A]"
            />
            <select
              name="country"
              defaultValue={country}
              className="rounded-2xl border border-[#dfd4c5] bg-[#fbf7f0] px-4 py-3 text-sm outline-none focus:border-[#1C3A2A]"
            >
              <option value="all">All countries</option>
              <option value="ug">Uganda</option>
              <option value="ke">Kenya</option>
            </select>
            <select
              name="sector"
              defaultValue={sector}
              className="rounded-2xl border border-[#dfd4c5] bg-[#fbf7f0] px-4 py-3 text-sm outline-none focus:border-[#1C3A2A]"
            >
              <option value="all">All sectors</option>
              {sectors.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-[#F5C842] px-5 py-3 text-sm font-black text-[#1C3A2A] hover:bg-[#ffd75d]"
            >
              Filter
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-[#5e6f64]">
          <p>
            Showing <span className="font-bold text-[#1C3A2A]">{filtered.length}</span> tender
            {filtered.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs">
            Source links point back to PPDA GPP or PPIP Kenya.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#d7cab9] bg-[#fbf7f0] px-6 py-12 text-center">
            <p className="text-sm font-bold text-[#1C3A2A]">No tenders match those filters yet.</p>
            <p className="mt-2 text-sm text-[#5e6f64]">
              Try clearing a filter or searching with a broader keyword.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {filtered.map((tender) => (
              <article
                key={tender.id}
                className="rounded-[28px] border border-[#dfd4c5] bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f0f6f2] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#1C3A2A]">
                        {tender.country_name ?? "Unknown country"}
                      </span>
                      {tender.category && (
                        <span className="rounded-full bg-[#fff5cc] px-3 py-1 text-[11px] font-bold text-[#7a5a00]">
                          {tender.category}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-lg font-black leading-snug text-[#1C3A2A] sm:text-xl">
                      {tender.title}
                    </h2>
                    {tender.entity_name && (
                      <p className="mt-2 text-sm text-[#466053]">{tender.entity_name}</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-[#fbf7f0] px-4 py-3 text-sm text-[#1C3A2A] sm:min-w-[180px]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5e6f64]">
                      Deadline
                    </p>
                    <p className="mt-1 font-black">{formatDeadline(tender.deadline)}</p>
                    <p className="mt-2 text-xs text-[#5e6f64]">Updated {formatUpdated(tender.updated_at)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[#efe6d8] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e6f64]">
                    Source: {sourceLabel(tender.source)}
                  </p>
                  {tender.source_url && (
                    <a
                      href={tender.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-[#1C3A2A] px-4 py-2 text-sm font-bold text-[#F5C842] hover:bg-[#2D5A40]"
                    >
                      Open source ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
