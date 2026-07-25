import picocolors from 'picocolors';
import type { Report } from '../core/types';
import { sanitizeForTerminal } from './sanitize';

const { green, red, yellow, cyan } = picocolors;

export function terminalReporter(report: Report): void {
  if (report.issues.length === 0) {
    console.log(green('✔ No Module Federation issues found'));
    return;
  }

  report.issues.forEach((issue) => {
    const severityColor = issue.severity === 'error' ? red : issue.severity === 'warning' ? yellow : cyan;
    const file = issue.file ? sanitizeForTerminal(issue.file) : undefined;
    const location = file ? `${file}${issue.line ? `:${issue.line}` : ''}` : 'unknown location';
    const message = sanitizeForTerminal(issue.message);
    const ruleId = sanitizeForTerminal(issue.ruleId);

    console.log(severityColor(`${issue.severity.toUpperCase()} [${ruleId}] ${message}`));
    console.log(`  ${location}`);
    if (issue.suggestion) {
      console.log(green(`  Suggestion: ${sanitizeForTerminal(issue.suggestion)}`));
    }
    console.log('');
  });

  console.log(green(`Summary: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} infos`));
}
