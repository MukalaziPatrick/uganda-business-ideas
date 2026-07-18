import { describe, it, expect } from 'vitest';
import { filterAndSortIdeas, countActiveFilters, validCategory, validBudget, validRegion, validSort } from './filtering';
import type { BusinessIdea } from '@/lib/supabase/ideas-types';

function idea(overrides: Partial<BusinessIdea>): BusinessIdea {
  return {
    id: '1', slug: 's', title: 'Poultry Farming', category: 'Agriculture',
    capital: 'UGX 500k–2M', description: 'Raise birds', skills: ['Coop'],
    best_for: '', location: '', steps: [], risks: [], profit: '', tips: [],
    budget_band: '500k_2m', audience: [], regions: ['Central'],
    scoring_demand: 8, scoring_ease: 6, scoring_risk: null, scoring_supplier: 4,
    published: true, created_at: '2026-01-01', updated_at: '2026-06-01',
    ...overrides,
  } as BusinessIdea;
}

const ideas = [
  idea({ slug: 'a', title: 'Poultry Farming', category: 'Agriculture', scoring_demand: 8, regions: ['Central'] }),
  idea({ slug: 'b', title: 'Liquid Soap', category: 'Retail', budget_band: 'under_200k', scoring_demand: 9, regions: ['Eastern'] }),
  idea({ slug: 'c', title: 'Bakery', category: 'Food', scoring_demand: 5, scoring_ease: 9, regions: ['Central', 'Western'] }),
];

describe('filterAndSortIdeas', () => {
  it('returns all ideas sorted by demand desc with default filters', () => {
    const out = filterAndSortIdeas(ideas, { q: '', category: 'All', budget: 'All', region: 'All', sort: 'demandScore' });
    expect(out.map(i => i.slug)).toEqual(['b', 'a', 'c']);
  });

  it('matches search against title and description, case-insensitive', () => {
    const out = filterAndSortIdeas(ideas, { q: 'POULTRY', category: 'All', budget: 'All', region: 'All', sort: 'demandScore' });
    expect(out.map(i => i.slug)).toEqual(['a']);
  });

  it('applies category, budget, and region filters together', () => {
    const out = filterAndSortIdeas(ideas, { q: '', category: 'Retail', budget: 'under_200k', region: 'Eastern', sort: 'demandScore' });
    expect(out.map(i => i.slug)).toEqual(['b']);
  });

  it('sorts A–Z when sort is title', () => {
    const out = filterAndSortIdeas(ideas, { q: '', category: 'All', budget: 'All', region: 'All', sort: 'title' });
    expect(out.map(i => i.title)).toEqual(['Bakery', 'Liquid Soap', 'Poultry Farming']);
  });

  it('treats null scores as 0 when sorting', () => {
    const withNull = [...ideas, idea({ slug: 'd', scoring_demand: null })];
    const out = filterAndSortIdeas(withNull, { q: '', category: 'All', budget: 'All', region: 'All', sort: 'demandScore' });
    expect(out[out.length - 1].slug).toBe('d');
  });
});

describe('countActiveFilters', () => {
  it('is 0 for defaults and counts each non-default filter', () => {
    expect(countActiveFilters({ q: '', category: 'All', budget: 'All', region: 'All' })).toBe(0);
    expect(countActiveFilters({ q: 'soap', category: 'Retail', budget: 'All', region: 'All' })).toBe(2);
  });
});

describe('param validators', () => {
  it('fall back to defaults on unknown values', () => {
    expect(validCategory('Bogus')).toBe('All');
    expect(validBudget(null)).toBe('All');
    expect(validRegion('Mars')).toBe('All');
    expect(validSort('hack')).toBe('demandScore');
  });
  it('accept known values', () => {
    expect(validCategory('Food')).toBe('Food');
    expect(validSort('title')).toBe('title');
  });
});
