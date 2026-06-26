import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { getActivePharmacies } from './queries';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const mockCreate = createSupabaseAdminClient as ReturnType<typeof vi.fn>;

function makeBuilder() {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.in as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.or as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.order as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.limit as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], error: null });
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getActivePharmacies compliance contract', () => {
  it('restricts to active/featured status', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getActivePharmacies();

    expect(builder.in).toHaveBeenCalledWith('status', ['active', 'featured']);
  });

  it('filters out lapsed licences (licence_expiry in the future or null only)', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    await getActivePharmacies();

    const orArg = (builder.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(orArg).toContain('licence_expiry.is.null');
    expect(orArg).toContain('licence_expiry.gte.');
  });

  it('returns [] when DB has no matching rows', async () => {
    const builder = makeBuilder();
    mockCreate.mockReturnValue({ from: () => builder });

    const result = await getActivePharmacies();

    expect(result).toEqual([]);
  });
});
