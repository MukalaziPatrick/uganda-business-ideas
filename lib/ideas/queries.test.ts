import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { getPublishedIdeas, getIdeaBySlug, getIdeaStories, getIdeaResources, getIdeaSuppliers } from './queries';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const mockCreate = createSupabaseAdminClient as ReturnType<typeof vi.fn>;

function makeBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  // All chainable methods return the builder itself
  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.eq as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.neq as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
  (builder.limit as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPublishedIdeas security contract', () => {
  it('applies published=true filter and returns [] when DB has no matching rows', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getPublishedIdeas();

    expect(builder.eq).toHaveBeenCalledWith('published', true);
    expect(result).toEqual([]);
  });
});

describe('getIdeaBySlug security contract', () => {
  it('applies published=true filter and returns null for unpublished slug', async () => {
    const builder = makeBuilder({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    // Re-wire chainable methods since overrides replaces them
    (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
    (builder.eq as ReturnType<typeof vi.fn>).mockReturnValue(builder);
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getIdeaBySlug('test-slug');

    expect(builder.eq).toHaveBeenCalledWith('published', true);
    expect(result).toBeNull();
  });

  it('rejects a slug shaped like a PostgREST filter-injection payload without querying the DB', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    // B7: braces/commas in the slug would rewrite the .or() filter expression
    // (PostgREST filter injection) if interpolated raw. It must be rejected
    // before any client is constructed / query issued.
    const result = await getIdeaBySlug('test},categories.cs.{malicious');

    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('getIdeaStories slug/category injection guard (B7)', () => {
  it('returns [] and never queries the DB when slug contains filter-injection characters', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    // Crafted route param: closes the idea_slugs.cs.{...} clause early and
    // appends an attacker-controlled .or() branch.
    const maliciousSlug = 'foo},categories.cs.{bar';

    const result = await getIdeaStories(maliciousSlug, 'Digital');

    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns [] and never queries the DB when category contains filter-injection characters', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getIdeaStories('valid-slug', 'Digital},categories.cs.{All');

    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('still queries normally for a well-formed slug and category', async () => {
    const builder = makeBuilder();
    (builder.or as unknown) = vi.fn().mockResolvedValue({ data: [], error: null });
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getIdeaStories('valid-slug', 'Digital');

    expect(mockCreate).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('getIdeaResources category injection guard (B7)', () => {
  it('returns [] and never queries the DB when category contains filter-injection characters', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getIdeaResources('All},categories.cs.{malicious');

    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('getIdeaSuppliers slug/category injection guard (B7)', () => {
  it('returns [] and never queries the DB when slug contains filter-injection characters', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getIdeaSuppliers('foo},category.eq.General', 'Digital');

    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
