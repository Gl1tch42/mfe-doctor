import type { Report } from '../core/types';

export function junitReporter(report: Report): void {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="mfe-doctor" tests="${report.issues.length}" failures="${report.summary.errors}" warnings="${report.summary.warnings}" time="0">
    ${report.issues.map((issue, index) => `
    <testcase name="${issue.ruleId}" classname="${issue.file || 'unknown'}" time="0">
      <failure message="${issue.message}" type="${issue.severity}">
        ${issue.suggestion ? `Suggestion: ${issue.suggestion}` : ''}
      </failure>
    </testcase>`).join('')}
  </testsuite>
</testsuites>`;

  console.log(xml);
}