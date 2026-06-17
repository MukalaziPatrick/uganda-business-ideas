import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { getPublishedIdeas, getIdeaBySlug } from './queries';
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
});
