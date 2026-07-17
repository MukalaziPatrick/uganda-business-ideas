// Pure text helpers for job listings scraped from external boards.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  eacute: 'é',
  egrave: 'è',
  agrave: 'à',
};

/**
 * Decodes numeric (&#8217; / &#x2019;) and common named (&amp;) HTML entities
 * left behind by scrapers. Plain ampersands pass through untouched.
 */
export function decodeEntities<T extends string | null>(text: T): T {
  if (!text) return text;
  const decoded = text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      const code = parseInt(body.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (body.startsWith('#')) {
      const code = parseInt(body.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
  return decoded as T;
}

/**
 * Human label for a scraped job's source link. Every non-empty source gets a
 * label so the external link is never a bare arrow; manual posts get null.
 */
export function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source === 'brightermonday') return 'Via BrighterMonday';
  if (source === 'psc') return 'Via PSC Uganda';
  if (source === 'jobweb') return 'Via JobWeb Uganda';
  return 'View original';
}
