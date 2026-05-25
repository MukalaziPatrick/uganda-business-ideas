import { parse } from "node-html-parser";
import type { ScrapedJob } from "./types";

const PSC_URL = "https://www.psc.go.ug/vacancies";

function parseDeadline(raw: string): string | null {
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

function extractJobId(url: string): string {
  const match = url.match(/\/(vacancies|node)\/([^/?#]+)/);
  return match ? match[2] : url.replace(/[^a-z0-9]/gi, "-").slice(0, 80);
}

export async function scrapePSC(): Promise<ScrapedJob[]> {
  const BASE = "https://www.psc.go.ug";
  let html: string;

  try {
    const res = await fetch(PSC_URL, {
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

  const rows = root.querySelectorAll(
    "table tr, .view-content .views-row, article, .vacancy-item, li[class*='vacancy']"
  );

  for (const row of rows) {
    try {
      const titleEl = row.querySelector("a, h2, h3, td:first-child, .views-field-title a");
      const title = titleEl?.text?.trim() ?? "";
      if (!title || title.length < 5) continue;

      const href = titleEl?.getAttribute("href") ?? "";
      const sourceUrl = href.startsWith("http") ? href : `${BASE}${href}`;
      const sourceJobId = extractJobId(href || title);

      const ministryEl = row.querySelector(
        "td:nth-child(2), .views-field-field-ministry, [class*='ministry'], [class*='employer']"
      );
      const employerName = ministryEl?.text?.trim() || "Public Service Commission Uganda";

      const deadlineEl = row.querySelector(
        "td:last-child, .views-field-field-deadline, [class*='deadline'], [class*='closing'], time"
      );
      const deadlineRaw = deadlineEl?.text?.trim() ?? "";
      const expiresAt = parseDeadline(deadlineRaw);

      jobs.push({
        title,
        employer_name: employerName,
        district: "Kampala",
        skill_category: "Government / Public Service",
        job_type: "full_time",
        description: null,
        source: "psc",
        source_url: sourceUrl,
        source_job_id: sourceJobId,
        expires_at: expiresAt,
      });
    } catch {
      // Skip malformed rows
    }
  }

  const seen = new Set<string>();
  return jobs.filter(j => {
    if (seen.has(j.source_job_id)) return false;
    seen.add(j.source_job_id);
    return true;
  });
}
