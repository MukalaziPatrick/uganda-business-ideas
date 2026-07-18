import { describe, it, expect } from 'vitest';
import { decodeEntities, sourceLabel } from './format';

describe('decodeEntities', () => {
  it('decodes numeric entities from scraped text', () => {
    expect(decodeEntities('Uganda&#8217;s cocoa industry')).toBe('Uganda’s cocoa industry');
    expect(decodeEntities('Certification &#38; Compliance')).toBe('Certification & Compliance');
  });

  it('decodes common named entities', () => {
    expect(decodeEntities('Sales &amp; Marketing')).toBe('Sales & Marketing');
    expect(decodeEntities('&quot;Driver&quot; &ndash; Kampala')).toBe('"Driver" – Kampala');
    expect(decodeEntities('caf&eacute; &nbsp;work')).toBe('café  work');
  });

  it('decodes hex numeric entities', () => {
    expect(decodeEntities('A&#x2019;s shop')).toBe('A’s shop');
  });

  it('leaves plain text and stray ampersands unchanged', () => {
    expect(decodeEntities('Food & Beverage')).toBe('Food & Beverage');
    expect(decodeEntities('No entities here')).toBe('No entities here');
  });

  it('handles null and empty input', () => {
    expect(decodeEntities(null)).toBe(null);
    expect(decodeEntities('')).toBe('');
  });
});

describe('sourceLabel', () => {
  it('labels every known scraper source', () => {
    expect(sourceLabel('brightermonday')).toBe('Via BrighterMonday');
    expect(sourceLabel('psc')).toBe('Via PSC Uganda');
    expect(sourceLabel('jobweb')).toBe('Via JobWeb Uganda');
  });

  it('falls back to a generic label for unknown non-null sources', () => {
    expect(sourceLabel('somefutureboard')).toBe('View original');
  });

  it('returns null for manual posts (no source)', () => {
    expect(sourceLabel(null)).toBe(null);
    expect(sourceLabel('')).toBe(null);
  });
});
