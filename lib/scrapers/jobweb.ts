import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const BASE_URL = "https://www.jobwebuganda.com";
const PAGES = 3;

function extractJobId(url: string): string {
  const match = url.match(/\/jobs\/([^/?#]+)/);
  return match ? match[1] : url.replace(/[^a-z0-9]/gi, "-").slice(0, 80);
}

function parseCompanyFromTitle(raw: string): { title: string; company: string } {
  const atIndex = raw.lastIndexOf(" at ");
  if (atIndex > 0) {
    return { title: raw.slice(0, atIndex).trim(), company: raw.slice(atIndex + 4).trim() };
  }
  return { title: raw, company: "Unknown Employer" };
}

function expiresFromPubDate(pubDate: string): string | null {
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  } catch {
    return null;
  }
}

async function fetchPage(page: number): Promise<ScrapedJob[]> {
  const url = page === 1
    ? `${BASE_URL}/feed`
    : `${BASE_URL}/feed/?post_type=job_listing&paged=${page}`;

  let xml: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BusinessYooBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const root = parse(xml);
  const jobs: ScrapedJob[] = [];

  for (const item of root.querySelectorAll("item")) {
    try {
      const rawTitle = item.querySelector("title")?.text?.trim() ?? "";
      if (!rawTitle || rawTitle.length < 5) continue;

      const { title, company: employerName } = parseCompanyFromTitle(rawTitle);

      // node-html-parser treats <link> as void element — use guid or regex instead
      const guidEl = item.querySelector("guid");
      const rawGuid = guidEl?.text?.trim() ?? "";
      // Prefer the actual job URL from <link> via regex on raw XML
      const linkMatch = item.toString().match(/<link>(https?:\/\/[^<]+)<\/link>/);
      const link = linkMatch?.[1]?.trim() ?? rawGuid;
      if (!link) continue;

      const sourceUrl = link.startsWith("http") ? link : `${BASE_URL}${link}`;
      const sourceJobId = extractJobId(link);
      const pubDate = item.querySelector("pubDate")?.text?.trim() ?? "";

      jobs.push({
        title,
        employer_name: employerName,
        district: "Kampala",
        skill_category: "Other",
        job_type: null,
        description: null,
        source: "jobweb",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: expiresFromPubDate(pubDate),
      });
    } catch {
      // skip malformed items
    }
  }

  return jobs;
}

export async function scrapeJobweb(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];

  for (let page = 1; page <= PAGES; page++) {
    const jobs = await fetchPage(page);
    results.push(...jobs);
    if (page < PAGES) await new Promise(r => setTimeout(r, 500));
  }

  const seen = new Set<string>();
  return results.filter(j => {
    if (seen.has(j.source_job_id)) return false;
    seen.add(j.source_job_id);
    return true;
  });
}
