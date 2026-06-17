import { createClient } from '@supabase/supabase-js';
import { ideas } from '../app/data/ideas';
import { stories } from '../app/data/stories';
import { resources } from '../app/data/resources';
import { suppliers } from '../app/data/suppliers';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 1) continue;
    const k = trimmed.slice(0, i).trim();
    let v = trimmed.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function mapBudgetBand(band?: string): string | null {
  if (!band) return null;
  if (band === 'under_500k') return '200k_500k';
  if (band === 'review') return null;
  return band;
}

async function seedIdeas() {
  const rows = ideas.map((idea) => ({
    slug: idea.slug,
    title: idea.title,
    category: idea.category,
    capital: idea.capital,
    description: idea.desc,
    skills: idea.skills,
    best_for: idea.bestFor,
    location: idea.location,
    steps: idea.steps,
    risks: idea.risks,
    profit: idea.profit,
    tips: idea.tips,
    budget_band: mapBudgetBand(idea.budgetBand),
    audience: idea.audience ?? [],
    regions: idea.regions,
    scoring_demand: idea.scoring?.incomeSpeed ?? null,
    scoring_ease: idea.scoring?.startupEase ?? null,
    scoring_risk: idea.scoring?.riskLevel ?? null,
    scoring_supplier: idea.scoring?.supplierDemand ?? null,
    published: true,
  }));

  const { data, error } = await supabase
    .from('business_ideas')
    .upsert(rows, { onConflict: 'slug' })
    .select('slug');

  if (error) {
    console.error('ideas upsert error:', error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function seedStories() {
  const rows = stories.map((story) => ({
    id: story.id,
    idea_slugs: story.ideaSlugs,
    categories: story.categories,
    name: story.name,
    business: story.business,
    location: story.location,
    timeframe: story.timeframe,
    result: story.result,
    quote: story.quote,
    avatar_emoji: story.avatarEmoji,
    youtube_id: story.youtubeId ?? null,
  }));

  const { data, error } = await supabase
    .from('idea_stories')
    .upsert(rows, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('stories upsert error:', error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function seedResources() {
  const rows = resources.map((resource) => ({
    title: resource.title,
    url: resource.url,
    description: resource.desc,
    type: resource.type,
    categories: resource.categories,
    free: resource.free,
  }));

  // Resources have no natural conflict key (no slug/id in static data), use upsert on url
  const { data, error } = await supabase
    .from('idea_resources')
    .upsert(rows, { onConflict: 'url' })
    .select('id');

  if (error) {
    // url may not have a unique constraint — fall back to insert-or-skip
    console.warn('resources upsert with url conflict failed, trying insert:', error.message);
    const { data: insertData, error: insertError } = await supabase
      .from('idea_resources')
      .insert(rows)
      .select('id');
    if (insertError) {
      console.error('resources insert error:', insertError.message);
      return 0;
    }
    return insertData?.length ?? 0;
  }
  return data?.length ?? 0;
}

async function seedSuppliers() {
  const rows = suppliers.map((supplier) => ({
    id: supplier.id,
    idea_slugs: supplier.ideaSlugs,
    category: supplier.category,
    name: supplier.name,
    type: supplier.category === 'General' ? 'General Supplier' : `${supplier.category} Supplier`,
    tip: supplier.description,
  }));

  const { data, error } = await supabase
    .from('idea_suppliers')
    .upsert(rows, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('suppliers upsert error:', error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function main() {
  console.log('Seeding ideas vertical...');

  const [ideaCount, storyCount, resourceCount, supplierCount] = await Promise.all([
    seedIdeas(),
    seedStories(),
    seedResources(),
    seedSuppliers(),
  ]);

  console.log(`ideas:     ${ideaCount} rows upserted`);
  console.log(`stories:   ${storyCount} rows upserted`);
  console.log(`resources: ${resourceCount} rows upserted`);
  console.log(`suppliers: ${supplierCount} rows upserted`);

  if (ideaCount === 0) {
    console.error('ERROR: 0 ideas seeded — check errors above');
    process.exit(1);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
