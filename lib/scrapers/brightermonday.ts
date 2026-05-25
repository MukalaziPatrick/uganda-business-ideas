import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const BASE_URL = "https://www.brightermonday.co.ug";
const PAGES = 3;

const CATEGORY_MAP: Record<string, string> = {
  "accounting": "Accounting / Finance",
  "finance": "Accounting / Finance",
  "administration": "Administration",
  "customer service": "Customer Service",
  "education": "Education / Teaching",
  "teaching": "Education / Teaching",
  "engineering": "Engineering",
  "health": "Healthcare",
  "healthcare": "Healthcare",
  "human resources": "Human Resources",
  "ict": "ICT / Technology",
  "information technology": "ICT / Technology",
  "technology": "ICT / Technology",
  "logistics": "Logistics / Transport",
  "transport": "Logistics / Transport",
  "marketing": "Marketing / Sales",
  "sales": "Marketing / Sales",
  "procurement": "Procurement / Supply Chain",
  "supply chain": "Procurement / Supply Chain",
  "legal": "Legal",
  "media": "Media / Communications",
  "communications": "Media / Communications",
  "ngo": "NGO / Non-Profit",
  "construction": "Construction / Building",
  "building": "Construction / Building",
  "agriculture": "Agriculture / Farming",
  "farming": "Agriculture / Farming",
  "security": "Security / Guard",
  "hospitality": "Hospitality / Tourism",
  "tourism": "Hospitality / Tourism",
  "government": "Government / Public Service",
  "public service": "Government / Public Service",
};

function mapCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return raw.trim() || "Other";
}

function extractJobId(url: string): string {
  const match = url.match(/\/jobs\/([^/?#]+)/);
  return match ? match[1] : url;
}

async function fetchPage(page: number): Promise<ScrapedJob[]> {
  const url = `${BASE_URL}/jobs?page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BusinessYooBot/1.0)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const root = parse(html);
  const jobs: ScrapedJob[] = [];

  const cards = root.querySelectorAll(
    "article.job, div.job-listing, [data-job-id], .job-card, article[class*='job']"
  );

  for (const card of cards) {
    try {
      const titleEl = card.querySelector("h2 a, h3 a, .job-title a, a[class*='title']");
      const title = titleEl?.text?.trim() ?? "";
      if (!title) continue;

      const href = titleEl?.getAttribute("href") ?? "";
      const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      const sourceJobId = extractJobId(href);

      const employerEl = card.querySelector(".company-name, .employer, [class*='company'], [class*='employer']");
      const employerName = employerEl?.text?.trim() ?? "Unknown Employer";

      const locationEl = card.querySelector(".location, [class*='location'], [class*='district']");
      const locationRaw = locationEl?.text?.trim() ?? "Kampala";
      const district = locationRaw.split(",")[0].trim() || "Kampala";

      const categoryEl = card.querySelector(".category, [class*='category'], [class*='sector']");
      const categoryRaw = categoryEl?.text?.trim() ?? "";
      const skillCategory = mapCategory(categoryRaw);

      const jobTypeEl = card.querySelector(".job-type, [class*='type'], [class*='contract']");
      const jobType = jobTypeEl?.text?.trim() ?? null;

      const descEl = card.querySelector(".description, .summary, [class*='desc'], [class*='summary']");
      const description = descEl?.text?.trim().slice(0, 500) ?? null;

      jobs.push({
        title,
        employer_name: employerName,
        district,
        skill_category: skillCategory,
        job_type: jobType,
        description,
        source: "brightermonday",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: null,
      });
    } catch {
      // Skip malformed cards
    }
  }

  return jobs;
}

export async function scrapeBrighterMonday(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];

  for (let page = 1; page <= PAGES; page++) {
    const jobs = await fetchPage(page);
    results.push(...jobs);
    if (page < PAGES) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}
