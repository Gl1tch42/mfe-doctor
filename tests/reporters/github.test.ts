import { describe, expect, it, vi } from 'vitest';
import { githubReporter } from '../../src/reporters/github';
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

function captureLines(report: Report): string[] {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  githubReporter(report);
  const lines = spy.mock.calls.map((call) => call[0] as string);
  spy.mockRestore();
  return lines;
}

describe('githubReporter', () => {
  it('escapes newlines so a package name cannot forge a second workflow command', () => {
    const lines = captureLines(reportWith('pkg\n::error::INJECTED'));

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain('\n');
    expect(lines[0]).toContain('pkg%0A::error::INJECTED');
  });

  it('escapes % and CR in the message (data) section', () => {
    const lines = captureLines(reportWith('pkg%with,comma:colon\r'));
    // ',' and ':' are only delimiters in the property section (file/line/title),
    // not in the message/data section, so they're left as-is there.
    expect(lines[0]).toContain("pkg%25with,comma:colon%0D' is eager");
  });

  it('escapes : and , (delimiters) plus % and CR in property values like file', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    githubReporter({
      issues: [
        {
          ruleId: 'eager-loading-heavy',
          severity: 'warning',
          message: 'Shared package eager',
          file: 'weird,file:name%with\rcr.js',
        },
      ],
      graph: { remotes: [], sharedPackages: {} },
      summary: { errors: 0, warnings: 1, infos: 0 },
    });
    const line = spy.mock.calls[0][0] as string;
    spy.mockRestore();

    expect(line).toContain('file=weird%2Cfile%3Aname%25with%0Dcr.js,line=1');
  });

  it('produces a well-formed workflow command line for a clean package name', () => {
    const lines = captureLines(reportWith('react'));
    expect(lines[0]).toMatch(/^::warning file=webpack\.config\.js,line=1,title=.*::Shared package 'react' is eager$/);
  });
});
