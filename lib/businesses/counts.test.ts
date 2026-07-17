import { describe, it, expect } from 'vitest';
import { tallyByField } from './counts';

describe('tallyByField', () => {
  it('counts occurrences per value', () => {
    const rows = [
      { category: 'Restaurant' },
      { category: 'Restaurant' },
      { category: 'Health & Pharmacy' },
    ];
    expect(tallyByField(rows, 'category')).toEqual({
      Restaurant: 2,
      'Health & Pharmacy': 1,
    });
  });

  it('returns empty object for empty input', () => {
    expect(tallyByField([], 'category')).toEqual({});
  });

  it('skips null, undefined, and empty-string values', () => {
    const rows = [{ region: 'Central' }, { region: '' }, { region: null }, { region: undefined }];
    expect(tallyByField(rows as Array<Record<string, unknown>>, 'region')).toEqual({ Central: 1 });
  });
});
