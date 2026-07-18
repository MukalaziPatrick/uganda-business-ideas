export type FilterableJob = {
  title: string;
  skill_category: string;
  district: string;
  job_type: string | null;
  pay_amount: number | null;
};

export type JobFilters = {
  category: string;      // '' = all
  district: string;      // '' = all
  jobType: string;       // '' = all, matched case-insensitively
  payStatedOnly: boolean;
  search: string;
};

export function deriveJobFilterOptions(jobs: FilterableJob[]): {
  categories: Array<{ value: string; count: number }>;
  jobTypes: string[];
} {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const cat = job.skill_category.trim();
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  const categories = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const typesSeen = new Map<string, string>(); // lowercase -> first display form
  for (const job of jobs) {
    const t = job.job_type?.trim();
    if (!t) continue;
    const key = t.toLowerCase().replace(/[_-]/g, ' ');
    if (!typesSeen.has(key)) typesSeen.set(key, t.replace(/[_-]/g, ' '));
  }
  const jobTypes = [...typesSeen.values()]
    .map(t => t.replace(/\b\w/g, c => c.toUpperCase()))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));

  return { categories, jobTypes };
}

export function deriveDistricts(items: Array<{ district: string }>): string[] {
  return [...new Set(items.map(i => i.district.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function normalizeType(t: string): string {
  return t.toLowerCase().replace(/[_-]/g, ' ').trim();
}

export function filterJobs<T extends FilterableJob>(jobs: T[], f: JobFilters): T[] {
  const q = f.search.trim().toLowerCase();
  return jobs.filter(job =>
    (!f.category || job.skill_category === f.category) &&
    (!f.district || job.district === f.district) &&
    (!f.jobType || (job.job_type != null && normalizeType(job.job_type) === normalizeType(f.jobType))) &&
    (!f.payStatedOnly || job.pay_amount != null) &&
    (!q || job.title.toLowerCase().includes(q) || job.skill_category.toLowerCase().includes(q))
  );
}

export function paginateJobs<T>(jobs: T[], visibleCount: number): {
  visibleJobs: T[];
  hasMore: boolean;
} {
  const safeCount = Math.max(0, Math.floor(visibleCount));
  return {
    visibleJobs: jobs.slice(0, safeCount),
    hasMore: safeCount < jobs.length,
  };
}
