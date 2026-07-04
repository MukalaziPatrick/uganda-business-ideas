import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/public', () => ({
  getSupabasePublicClient: vi.fn(),
}));

import {
  getFeaturedLandListings,
  getLandAgents,
  getLandContent,
  getLandContentBySlug,
  getLandListingById,
  getLandListingByQr,
  getLandListings,
} from './queries';
import { getSupabasePublicClient } from '@/lib/supabase/public';

const mockCreate = getSupabasePublicClient as ReturnType<typeof vi.fn>;

function makeBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn((resolve: (value: unknown) => unknown) => resolve({ data: [], error: null })),
    ...overrides,
  };

  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.eq as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.gte as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.lte as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.ilike as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.limit as ReturnType<typeof vi.fn>).mockReturnValue(builder);

  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('land public-read queries (B6)', () => {
  it('returns [] for listing collections when the public client is unavailable', async () => {
    mockCreate.mockReturnValue(null);

    expect(await getLandListings()).toEqual([]);
    expect(await getFeaturedLandListings()).toEqual([]);
    expect(await getLandContent()).toEqual([]);
    expect(await getLandAgents()).toEqual([]);
  });

  it('returns null for single-record helpers when the public client is unavailable', async () => {
    mockCreate.mockReturnValue(null);

    expect(await getLandListingById('listing-1')).toBeNull();
    expect(await getLandListingByQr('qr-1')).toBeNull();
    expect(await getLandContentBySlug('slug-1')).toBeNull();
  });

  it('uses the shared anon client for public listing queries', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getLandListings({ district: 'Kampala', q: 'acre' }, 12);

    expect(mockCreate).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('district', 'Kampala');
    expect(builder.ilike).toHaveBeenCalledWith('title', '%acre%');
  });
});
