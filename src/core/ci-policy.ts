import type { ReportSummary } from './types';

export function shouldFailCi(summary: ReportSummary, maxWarnings: number): boolean {
  return summary.errors > 0 || summary.warnings > maxWarnings;
}
