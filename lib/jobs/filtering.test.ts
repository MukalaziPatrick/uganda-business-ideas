import { describe, it, expect } from 'vitest';
import { deriveJobFilterOptions, deriveDistricts, filterJobs } from './filtering';

const jobs = [
  { title: 'Farm hand', skill_category: 'Agriculture / Farming', district: 'Wakiso', job_type: 'Full Time', pay_amount: 300000 },
  { title: 'Accountant', skill_category: 'Accounting / Finance', district: 'Kampala', job_type: null, pay_amount: null },
  { title: 'Driver', skill_category: 'Driver', district: 'Gulu', job_type: 'full_time', pay_amount: 500000 },
  { title: 'Farm manager', skill_category: 'Agriculture / Farming', district: 'Mbarara', job_type: 'Contract', pay_amount: null },
];

describe('deriveJobFilterOptions', () => {
  it('returns unique categories sorted alphabetically with counts', () => {
    const { categories } = deriveJobFilterOptions(jobs);
    expect(categories).toEqual([
      { value: 'Accounting / Finance', count: 1 },
      { value: 'Agriculture / Farming', count: 2 },
      { value: 'Driver', count: 1 },
    ]);
  });

  it('returns unique sorted job types, skipping nulls, deduped case-insensitively', () => {
    const { jobTypes } = deriveJobFilterOptions(jobs);
    expect(jobTypes).toEqual(['Contract', 'Full Time']);
  });
});

describe('deriveDistricts', () => {
  it('returns unique sorted districts from the data, not a fixed constant', () => {
    expect(deriveDistricts(jobs)).toEqual(['Gulu', 'Kampala', 'Mbarara', 'Wakiso']);
  });
});

describe('filterJobs', () => {
  it('filters by category', () => {
    const out = filterJobs(jobs, { category: 'Agriculture / Farming', district: '', jobType: '', payStatedOnly: false, search: '' });
    expect(out.map(j => j.title)).toEqual(['Farm hand', 'Farm manager']);
  });

  it('payStatedOnly keeps only jobs with a pay_amount', () => {
    const out = filterJobs(jobs, { category: '', district: '', jobType: '', payStatedOnly: true, search: '' });
    expect(out.map(j => j.title)).toEqual(['Farm hand', 'Driver']);
  });

  it('search matches title or category, case-insensitive', () => {
    const out = filterJobs(jobs, { category: '', district: '', jobType: '', payStatedOnly: false, search: 'farm' });
    expect(out.map(j => j.title)).toEqual(['Farm hand', 'Farm manager']);
  });

  it('jobType matches case-insensitively across mixed vocabularies', () => {
    const out = filterJobs(jobs, { category: '', district: '', jobType: 'Full Time', payStatedOnly: false, search: '' });
    expect(out.map(j => j.title)).toEqual(['Farm hand', 'Driver']);
  });

  it('combines all filters', () => {
    const out = filterJobs(jobs, { category: 'Agriculture / Farming', district: 'Wakiso', jobType: '', payStatedOnly: true, search: '' });
    expect(out.map(j => j.title)).toEqual(['Farm hand']);
  });
});
