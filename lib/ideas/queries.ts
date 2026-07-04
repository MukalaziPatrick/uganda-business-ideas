// B6: these are all public reads of published-content tables — RLS policies
// in supabase/migrations/20260617000002_ideas_rls.sql already express the
// visibility rules (published=true for business_ideas; open reads for the
// story/resource/supplier tables), so the anon client is used here instead
// of the service-role admin client, letting those policies actually gate
// access instead of being bypassed.
import { getSupabasePublicClient } from '@/lib/supabase/public';
import type { BusinessIdea, IdeaStory, IdeaResource, IdeaSupplier } from '@/lib/supabase/ideas-types';

// B7: `slug` and `category` come straight from URL route params and are used
// to build PostgREST `.or()` filters by string interpolation below. Braces
// or commas in a crafted URL rewrite the filter expression (PostgREST filter
// injection), so both are validated against a strict allowlist before they
// ever reach a query string.
const SLUG_RE = /^[a-z0-9-]+$/;
const CATEGORY_RE = /^[A-Za-z0-9 ]+$/;

function isValidSlug(slug: string): boolean {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

function isValidCategory(category: string): boolean {
  return typeof category === 'string' && CATEGORY_RE.test(category);
}

export async function getPublishedIdeas(): Promise<BusinessIdea[]> {
  const supabase = getSupabasePublicClient();
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
  if (!isValidSlug(slug)) return null;

  const supabase = getSupabasePublicClient();
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
  if (!isValidSlug(slug) || !isValidCategory(category)) return [];

  const supabase = getSupabasePublicClient();
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
  if (!isValidSlug(slug) || !isValidCategory(category)) return [];

  const supabase = getSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_stories')
    .select('*')
    .or(`idea_slugs.cs.{${slug}},categories.cs.{${category}}`);

  if (error) { console.error('getIdeaStories:', error); return []; }
  return (data ?? []) as IdeaStory[];
}

export async function getIdeaResources(category: string): Promise<IdeaResource[]> {
  if (!isValidCategory(category)) return [];

  const supabase = getSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_resources')
    .select('*')
    .or(`categories.cs.{All},categories.cs.{${category}}`);

  if (error) { console.error('getIdeaResources:', error); return []; }
  return (data ?? []) as IdeaResource[];
}

export async function getIdeaSuppliers(slug: string, category: string): Promise<IdeaSupplier[]> {
  if (!isValidSlug(slug) || !isValidCategory(category)) return [];

  const supabase = getSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('idea_suppliers')
    .select('*')
    .or(`idea_slugs.cs.{${slug}},category.eq.${category},category.eq.General`);

  if (error) { console.error('getIdeaSuppliers:', error); return []; }
  return (data ?? []) as IdeaSupplier[];
}

export async function getPublishedIdeasCount(): Promise<number> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('business_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  if (error) { console.error('getPublishedIdeasCount:', error); return 0; }
  return count ?? 0;
}
