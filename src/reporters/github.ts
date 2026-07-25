import type { Report } from '../core/types';
import { stripControlChars } from './sanitize';

// Escaping rules per GitHub's workflow command format: https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts
// Control characters (e.g. ANSI escapes, which GitHub's log viewer renders) are
// stripped first since they carry no legitimate meaning in a package name/path/version.
function escapeData(value: string): string {
  return stripControlChars(value).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function escapeProperty(value: string): string {
  return stripControlChars(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C');
}

export function githubReporter(report: Report): void {
  for (const issue of report.issues) {
    const level = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'notice';
    const file = escapeProperty(issue.file || 'unknown');
    const line = issue.line || 1;
    const title = escapeProperty(`${issue.severity.toUpperCase()} [${issue.ruleId}]`);
    const message = escapeData(issue.message);

    console.log(`::${level} file=${file},line=${line},title=${title}::${message}`);
  }
}