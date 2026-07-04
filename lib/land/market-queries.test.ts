import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/public', () => ({
  getSupabasePublicClient: vi.fn(),
}));

import {
  getMarketListingById,
  getMarketListings,
  getTrustTier,
  sortListings,
} from './market-queries';
import { getSupabasePublicClient } from '@/lib/supabase/public';

const mockCreate = getSupabasePublicClient as ReturnType<typeof vi.fn>;

function makeBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    or: vi.fn(),
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
  (builder.or as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.limit as ReturnType<typeof vi.fn>).mockReturnValue(builder);

  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('market public-read queries (B6)', () => {
  it('returns empty/null results when the public client is unavailable', async () => {
    mockCreate.mockReturnValue(null);

    expect(await getMarketListings()).toEqual([]);
    expect(await getMarketListingById('market-1')).toBeNull();
  });

  it('uses the shared anon client for market listings', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getMarketListings({ district: 'Wakiso', source_site: 'olx' }, 24);

    expect(mockCreate).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('district', 'Wakiso');
    expect(builder.eq).toHaveBeenCalledWith('source_site', 'olx');
  });
});

describe('market trust helpers', () => {
  it('maps scores into trust tiers and sorts strongest/newest first', () => {
    expect(getTrustTier(null)).toBe('low');
    expect(getTrustTier(2)).toBe('medium');
    expect(getTrustTier(5)).toBe('high');

    const sorted = sortListings([
      {
        id: 'older-high',
        title: 'Older high trust',
        price_ugx: null,
        size_acres: null,
        land_type: null,
        district: null,
        road_area: null,
        has_title: null,
        contact_phone: null,
        trust_score: 5,
        trust_flags: [],
        source_url: '',
        source_site: 'olx',
        scraped_at: '2026-07-01T08:00:00Z',
      },
      {
        id: 'newer-medium',
        title: 'Newer medium trust',
        price_ugx: null,
        size_acres: null,
        land_type: null,
        district: null,
        road_area: null,
        has_title: null,
        contact_phone: null,
        trust_score: 3,
        trust_flags: [],
        source_url: '',
        source_site: 'lamudi',
        scraped_at: '2026-07-02T08:00:00Z',
      },
      {
        id: 'newer-high',
        title: 'Newest high trust',
        price_ugx: null,
        size_acres: null,
        land_type: null,
        district: null,
        road_area: null,
        has_title: null,
        contact_phone: null,
        trust_score: 4,
        trust_flags: [],
        source_url: '',
        source_site: 'olx',
        scraped_at: '2026-07-03T08:00:00Z',
      },
    ]);

    expect(sorted.map((listing) => listing.id)).toEqual([
      'newer-high',
      'older-high',
      'newer-medium',
    ]);
  });
});
