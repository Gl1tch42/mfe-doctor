import type { Report } from '../core/types';

export function jsonReporter(report: Report): void {
  console.log(JSON.stringify(report, null, 2));
}