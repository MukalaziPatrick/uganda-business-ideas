import type { BusinessIdea, IdeaCategory, IdeaBudgetBand, IdeaRegion } from '@/lib/supabase/ideas-types';

export type SortOption = 'demandScore' | 'startupEaseScore' | 'supplierPotentialScore' | 'title';

export type IdeaFilters = {
  q: string;
  category: 'All' | IdeaCategory;
  budget: 'All' | IdeaBudgetBand;
  region: 'All' | IdeaRegion;
  sort: SortOption;
};

const CATEGORIES: Array<'All' | IdeaCategory> = ['All', 'Agriculture', 'Food', 'Retail', 'Services', 'Digital'];
const BUDGETS: Array<'All' | IdeaBudgetBand> = ['All', 'under_200k', '200k_500k', '500k_2m', 'above_2m'];
const REGIONS: Array<'All' | IdeaRegion> = ['All', 'Central', 'Eastern', 'Northern', 'Western'];
const SORTS: SortOption[] = ['demandScore', 'startupEaseScore', 'supplierPotentialScore', 'title'];

export function validCategory(v: string | null): 'All' | IdeaCategory {
  return v && (CATEGORIES as string[]).includes(v) ? (v as IdeaCategory) : 'All';
}
export function validBudget(v: string | null): 'All' | IdeaBudgetBand {
  return v && (BUDGETS as string[]).includes(v) ? (v as IdeaBudgetBand) : 'All';
}
export function validRegion(v: string | null): 'All' | IdeaRegion {
  return v && (REGIONS as string[]).includes(v) ? (v as IdeaRegion) : 'All';
}
export function validSort(v: string | null): SortOption {
  return v && (SORTS as string[]).includes(v) ? (v as SortOption) : 'demandScore';
}

function sortScore(idea: BusinessIdea, sort: SortOption): number {
  if (sort === 'demandScore') return idea.scoring_demand ?? 0;
  if (sort === 'startupEaseScore') return idea.scoring_ease ?? 0;
  if (sort === 'supplierPotentialScore') return idea.scoring_supplier ?? 0;
  return 0;
}

export function filterAndSortIdeas(ideas: BusinessIdea[], f: IdeaFilters): BusinessIdea[] {
  const q = f.q.trim().toLowerCase();
  return ideas
    .filter(idea =>
      (!q || idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q)) &&
      (f.category === 'All' || idea.category === f.category) &&
      (f.budget === 'All' || idea.budget_band === f.budget) &&
      (f.region === 'All' || idea.regions.includes(f.region))
    )
    .sort((a, b) =>
      f.sort === 'title' ? a.title.localeCompare(b.title) : sortScore(b, f.sort) - sortScore(a, f.sort)
    );
}

export function countActiveFilters(f: Pick<IdeaFilters, 'q' | 'category' | 'budget' | 'region'>): number {
  let n = 0;
  if (f.q.trim() !== '') n++;
  if (f.category !== 'All') n++;
  if (f.budget !== 'All') n++;
  if (f.region !== 'All') n++;
  return n;
}
