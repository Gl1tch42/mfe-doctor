import type { Report } from '../core/types';

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeXmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function junitReporter(report: Report): void {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="mfe-doctor" tests="${report.issues.length}" failures="${report.summary.errors}" warnings="${report.summary.warnings}" time="0">
    ${report.issues.map((issue, index) => `
    <testcase name="${escapeXmlAttr(issue.ruleId)}" classname="${escapeXmlAttr(issue.file || 'unknown')}" time="0">
      <failure message="${escapeXmlAttr(issue.message)}" type="${escapeXmlAttr(issue.severity)}">
        ${issue.suggestion ? `Suggestion: ${escapeXmlText(issue.suggestion)}` : ''}
      </failure>
    </testcase>`).join('')}
  </testsuite>
</testsuites>`;

  console.log(xml);
}