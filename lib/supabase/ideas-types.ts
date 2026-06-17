export type IdeaCategory = 'Agriculture' | 'Food' | 'Retail' | 'Services' | 'Digital';
export type IdeaBudgetBand = 'under_200k' | '200k_500k' | '500k_2m' | 'above_2m';
export type IdeaRegion = 'Central' | 'Eastern' | 'Northern' | 'Western';
export type IdeaAudience = 'beginners' | 'youth' | 'women' | 'diaspora' | 'farmers' | 'students';

export type BusinessIdea = {
  id: string;
  slug: string;
  title: string;
  category: IdeaCategory;
  capital: string;
  description: string;
  skills: string[];
  best_for: string;
  location: string;
  steps: string[];
  risks: string[];
  profit: string;
  tips: string[];
  budget_band: IdeaBudgetBand | null;
  audience: IdeaAudience[];
  regions: IdeaRegion[];
  scoring_demand: number | null;
  scoring_ease: number | null;
  scoring_risk: number | null;
  scoring_supplier: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type IdeaStory = {
  id: string;
  idea_slugs: string[];
  categories: string[];
  name: string;
  business: string;
  location: string;
  timeframe: string;
  result: string;
  quote: string;
  avatar_emoji: string;
  youtube_id: string | null;
  created_at: string;
};

export type IdeaResource = {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'Government' | 'Training' | 'Finance' | 'Market' | 'Community';
  categories: string[];
  free: boolean;
  created_at: string;
};

export type IdeaSupplier = {
  id: string;
  idea_slugs: string[];
  category: string | null;
  name: string;
  type: string;
  tip: string;
  created_at: string;
};
