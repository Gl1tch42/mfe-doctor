import type { Report } from '../core/types';

export function githubReporter(report: Report): void {
  for (const issue of report.issues) {
    const level = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'notice';
    const file = issue.file || 'unknown';
    const line = issue.line || 1;
    const message = issue.message.replace(/"/g, '\\"');
    const title = `${issue.severity.toUpperCase()} [${issue.ruleId}]`;

    console.log(`::${level} file=${file},line=${line},title=${title}::${message}`);
  }
}