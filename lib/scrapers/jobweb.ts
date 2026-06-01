import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const BASE_URL = "https://www.jobwebuganda.com";
const PAGES = 3;

function extractJobId(url: string): string {
  const match = url.match(/\/job\/([^/?#]+)/);
  return match ? match[1] : url.replace(/[^a-z0-9]/gi, "-").slice(0, 80);
}

async function fetchPage(page: number): Promise<ScrapedJob[]> {
  const url = page === 1 ? `${BASE_URL}/jobs` : `${BASE_URL}/jobs/page/${page}`;
  let html: string;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BusinessYooBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    return [];
  }

  const root = parse(html);
  const jobs: ScrapedJob[] = [];

  const items = root.querySelectorAll("ol li, .job_listings li, .job-listing");

  for (const item of items) {
    try {
      const titleEl = item.querySelector("h1 a, h2 a, h3 a, a.position, .position a, a");
      const title = titleEl?.text?.trim() ?? "";
      if (!title || title.length < 5) continue;

      const href = titleEl?.getAttribute("href") ?? "";
      if (!href) continue;
      const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      const sourceJobId = extractJobId(href);

      const companyEl = item.querySelector(".company strong, .company, [class*='company']");
      const employerName = companyEl?.text?.trim() || "Unknown Employer";

      const locationEl = item.querySelector(".location, [class*='location']");
      const locationRaw = locationEl?.text?.trim() ?? "Uganda";
      const district = locationRaw.split(",")[0].trim() || "Kampala";

      const typeEl = item.querySelector(".job-type, [class*='job-type'], .type");
      const jobType = typeEl?.text?.trim() ?? null;

      const dateEl = item.querySelector(".date, time, [class*='date']");
      const dateRaw = dateEl?.text?.trim() ?? "";
      let expiresAt: string | null = null;
      if (dateRaw) {
        const d = new Date(dateRaw);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + 30);
          expiresAt = d.toISOString();
        }
      }

      jobs.push({
        title,
        employer_name: employerName,
        district,
        skill_category: "Other",
        job_type: jobType,
        description: null,
        source: "jobweb",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: expiresAt,
      });
    } catch {
      // skip malformed
    }
  }

  return jobs;
}

export async function scrapeJobweb(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];
  for (let page = 1; page <= PAGES; page++) {
    const jobs = await fetchPage(page);
    results.push(...jobs);
    if (page < PAGES) await new Promise(r => setTimeout(r, 1000));
  }
  return results;
}
