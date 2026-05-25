export type ScrapedJob = {
  title: string;
  employer_name: string;
  district: string;
  skill_category: string;
  job_type: string | null;
  description: string | null;
  source: "brightermonday" | "psc";
  source_url: string;
  source_job_id: string;
  expires_at: string | null;
};
