export function getSafeLandsAppUrl(
  raw: string | undefined = process.env.NEXT_PUBLIC_SAFELANDS_APP_URL
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}
