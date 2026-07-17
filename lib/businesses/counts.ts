export function tallyByField(
  rows: Array<Record<string, unknown>>,
  field: string
): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {};
  for (const row of rows) {
    const value = row[field];
    if (typeof value !== 'string' || value === '') continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}
