import type { Report } from '../core/types';

export function htmlReporter(report: Report): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>mfe-doctor Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .issue { margin-bottom: 15px; padding: 10px; border-left: 4px solid; }
        .error { border-color: #dc3545; background: #f8d7da; }
        .warning { border-color: #ffc107; background: #fff3cd; }
        .info { border-color: #17a2b8; background: #d1ecf1; }
        .suggestion { color: #28a745; font-style: italic; }
    </style>
</head>
<body>
    <h1>mfe-doctor Analysis Report</h1>

    <div class="summary">
        <h2>Summary</h2>
        <p>Errors: ${report.summary.errors}</p>
        <p>Warnings: ${report.summary.warnings}</p>
        <p>Infos: ${report.summary.infos}</p>
    </div>

    <h2>Issues</h2>
    ${report.issues.length === 0 ? '<p>No issues found</p>' : report.issues.map(issue => `
        <div class="issue ${issue.severity}">
            <h3>${issue.severity.toUpperCase()} [${issue.ruleId}]</h3>
            <p>${issue.message}</p>
            <p><strong>File:</strong> ${issue.file || 'unknown'}</p>
            ${issue.suggestion ? `<p class="suggestion">Suggestion: ${issue.suggestion}</p>` : ''}
        </div>
    `).join('')}

    <h2>Graph</h2>
    <pre>${JSON.stringify(report.graph, null, 2)}</pre>
</body>
</html>`;

  console.log(html);
}