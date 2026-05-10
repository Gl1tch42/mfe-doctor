import picocolors from 'picocolors';
import type { Report } from '../core/types';

const { green, red, yellow, cyan } = picocolors;

export function terminalReporter(report: Report): void {
  if (report.issues.length === 0) {
    console.log(green('✔ No Module Federation issues found'));
    return;
  }

  report.issues.forEach((issue) => {
    const severityColor = issue.severity === 'error' ? red : issue.severity === 'warning' ? yellow : cyan;
    const location = issue.file ? `${issue.file}${issue.line ? `:${issue.line}` : ''}` : 'unknown location';

    console.log(severityColor(`${issue.severity.toUpperCase()} [${issue.ruleId}] ${issue.message}`));
    console.log(`  ${location}`);
    if (issue.suggestion) {
      console.log(green(`  Suggestion: ${issue.suggestion}`));
    }
    console.log('');
  });

  console.log(green(`Summary: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} infos`));
}
