import { describe, expect, it, vi } from 'vitest';
import { junitReporter } from '../../src/reporters/junit';
import type { Report } from '../../src/core/types';

function reportWith(packageName: string): Report {
  return {
    issues: [
      {
        ruleId: 'eager-loading-heavy',
        severity: 'warning',
        message: `Shared package '${packageName}' is eager`,
        file: 'webpack.config.js',
        suggestion: 'fix it',
      },
    ],
    graph: { remotes: [], sharedPackages: {} },
    summary: { errors: 0, warnings: 1, infos: 0 },
  };
}

function captureXml(report: Report): string {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  junitReporter(report);
  const xml = spy.mock.calls[0][0] as string;
  spy.mockRestore();
  return xml;
}

describe('junitReporter', () => {
  it('escapes XML attribute-breaking characters so a package name cannot inject a new element', () => {
    const xml = captureXml(reportWith('pkg"><injected tag="pwned'));

    expect(xml).not.toContain('<injected tag="pwned');
    expect(xml).toContain('pkg&quot;&gt;&lt;injected tag=&quot;pwned');
  });

  it('produces well-formed, parseable XML', () => {
    const xml = captureXml(reportWith('react'));
    expect(() => new DOMParserFallback(xml)).not.toThrow();
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });
});

// Minimal structural sanity check without pulling in a DOM/XML parser dependency:
// every opening tag we emit must have a matching closing tag.
class DOMParserFallback {
  constructor(xml: string) {
    const opens = xml.match(/<(\w+)(?=[ >])/g)?.map((t) => t.slice(1)) ?? [];
    const closes = xml.match(/<\/(\w+)>/g)?.map((t) => t.slice(2, -1)) ?? [];
    const openCounts = new Map<string, number>();
    for (const tag of opens) openCounts.set(tag, (openCounts.get(tag) ?? 0) + 1);
    for (const tag of closes) openCounts.set(tag, (openCounts.get(tag) ?? 0) - 1);
    for (const [tag, count] of openCounts) {
      if (count !== 0) throw new Error(`Unbalanced tag <${tag}>`);
    }
  }
}
