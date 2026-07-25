import { describe, expect, it, vi } from 'vitest';
import { htmlReporter } from '../../src/reporters/html';
import type { Report } from '../../src/core/types';

function reportWith(message: string, packageName: string): Report {
  return {
    issues: [
      {
        ruleId: 'eager-loading-heavy',
        severity: 'warning',
        message,
        file: 'webpack.config.js',
        suggestion: 'fix it',
      },
    ],
    graph: {
      remotes: [],
      sharedPackages: {
        [packageName]: { packageName, declaredIn: [{ configPath: 'webpack.config.js' }] },
      },
    },
    summary: { errors: 0, warnings: 1, infos: 0 },
  };
}

function captureHtml(report: Report): string {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  htmlReporter(report);
  const html = spy.mock.calls[0][0] as string;
  spy.mockRestore();
  return html;
}

describe('htmlReporter', () => {
  it('escapes HTML in the issue message so a malicious package name cannot inject a script tag', () => {
    const payload = "<script>alert(document.cookie)</script>";
    const html = captureHtml(reportWith(`Shared package '${payload}' is eager`, 'safe-pkg'));

    expect(html).not.toContain('<script>alert(document.cookie)</script>');
    expect(html).toContain('&lt;script&gt;alert(document.cookie)&lt;/script&gt;');
  });

  it('escapes HTML in the raw graph JSON dump', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const html = captureHtml(reportWith('Shared package eager', payload));

    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('renders normally for a clean report (apostrophes are still HTML-escaped, as expected)', () => {
    const html = captureHtml(reportWith("Shared package 'react' is eager", 'react'));
    expect(html).toContain('Shared package &#39;react&#39; is eager');
    expect(html).toContain('<title>mfe-doctor Report</title>');
  });
});
