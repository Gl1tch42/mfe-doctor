import { describe, expect, it, vi } from 'vitest';
import { terminalReporter } from '../../src/reporters/terminal';
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
  terminalReporter(report);
  const lines = spy.mock.calls.map((call) => call[0] as string);
  spy.mockRestore();
  return lines;
}

describe('terminalReporter', () => {
  it('strips ANSI/control bytes from a malicious package name so it cannot spoof terminal output', () => {
    // eslint-disable-next-line no-control-regex
    const payload = 'pkg\x1b]0;PWNED-TITLE\x07\x1b[2K\x1b[1A\x1b[2Kfake-safe-package';
    const lines = captureLines(reportWith(payload));
    const joined = lines.join('\n');

    // The attacker-controlled bytes must be gone...
    // eslint-disable-next-line no-control-regex
    expect(joined).not.toMatch(/\x1b\][^\x07]*\x07/); // OSC set-title sequence
    expect(joined).not.toContain('pkg\x1b'); // ESC immediately after the package name is gone
    expect(joined).toContain("pkg]0;PWNED-TITLE[2K[1A[2Kfake-safe-package"); // inert leftover text
    // ...but our own picocolors coloring (legitimate, not attacker-controlled) is untouched.
    expect(joined).toContain('\x1b[33m'); // yellow (warning)
    expect(joined).toContain('\x1b[39m'); // reset
  });

  it('prints a clean summary line when there are no issues', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    terminalReporter({ issues: [], graph: { remotes: [], sharedPackages: {} }, summary: { errors: 0, warnings: 0, infos: 0 } });
    expect(spy.mock.calls[0][0]).toContain('No Module Federation issues found');
    spy.mockRestore();
  });
});
