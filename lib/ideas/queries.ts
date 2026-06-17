import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { BusinessIdea, IdeaStory, IdeaResource, IdeaSupplier } from '@/lib/supabase/ideas-types';

export async function getPublishedIdeas(): Promise<BusinessIdea[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('business_ideas')
    .select('*')
    .eq('published', true)
    .order('scoring_demand', { ascending: false });

  if (error) { console.error('getPublishedIdeas:', error); return []; }
  return (data ?? []) as BusinessIdea[];
}

export async function getIdeaBySlug(slug: string): Promise<BusinessIdea | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('business_ideas')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) return null;
  return data as BusinessIdea;
}

export async function getRelatedIdeas(
  slug: string,
  category: string,
  limit = 4
): Promise<BusinessIdea[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('business_ideas')
    .select('*')
    .eq('category', category)
    .eq('published', true)
    .neq('slug', slug)
    .limit(limit);

  if (error) { console.error('getRelatedIdeas:', error); return []; }
  return (data ?? []) as BusinessIdea[];
}

export async function getIdeaStories(slug: string, category: string): Promise<IdeaStory[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_stories')
    .select('*')
    .or(`idea_slugs.cs.{${slug}},categories.cs.{${category}}`);

  if (error) { console.error('getIdeaStories:', error); return []; }
  return (data ?? []) as IdeaStory[];
}

export async function getIdeaResources(category: string): Promise<IdeaResource[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_resources')
    .select('*')
    .or(`categories.cs.{All},categories.cs.{${category}}`);

  if (error) { console.error('getIdeaResources:', error); return []; }
  return (data ?? []) as IdeaResource[];
}

export async function getIdeaSuppliers(slug: string, category: string): Promise<IdeaSupplier[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_suppliers')
    .select('*')
    .or(`idea_slugs.cs.{${slug}},category.eq.${category},category.eq.General`);

  if (error) { console.error('getIdeaSuppliers:', error); return []; }
  return (data ?? []) as IdeaSupplier[];
}

export async function getPublishedIdeasCount(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('business_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  if (error) { console.error('getPublishedIdeasCount:', error); return 0; }
  return count ?? 0;
}
