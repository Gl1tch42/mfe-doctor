#!/usr/bin/env node

import cac from 'cac';
import picocolors from 'picocolors';
import { analyze } from './core/analyze';
import { terminalReporter } from './reporters/terminal';
import { jsonReporter } from './reporters/json';
import { htmlReporter } from './reporters/html';
import { junitReporter } from './reporters/junit';
import { githubReporter } from './reporters/github';

const { red } = picocolors;

const cli = cac('mfe-doctor');

interface AnalyzeOptions {
  json?: boolean;
  html?: boolean;
}

interface CiOptions {
  'max-warnings'?: number;
  format?: 'junit' | 'gh';
}

cli.command('analyze [config]', 'Analyze Module Federation configs')
  .option('--json', 'Output JSON report')
  .option('--html', 'Output HTML report')
  .action(async (config: string | undefined, options: AnalyzeOptions) => {
    const configs = config ? [config] : ['webpack.config.js', '**/webpack.config.js'];
    try {
      const report = await analyze({ configs, packageJsons: ['package.json', '**/package.json'] });
      if (options.json) {
        jsonReporter(report);
      } else if (options.html) {
        htmlReporter(report);
      } else {
        terminalReporter(report);
      }
    } catch (error) {
      console.error(red((error as Error).message));
      process.exit(1);
    }
  });

cli.command('ci', 'Run analysis in CI mode')
  .option('--max-warnings <n>', 'Maximum number of warnings allowed', { default: 0 })
  .option('--format <format>', 'Output format (junit or gh)', { default: 'junit' })
  .action(async (options: CiOptions) => {
    try {
      const report = await analyze({ configs: ['webpack.config.js', '**/webpack.config.js'], packageJsons: ['package.json', '**/package.json'] });

      if (options.format === 'gh') {
        githubReporter(report);
      } else {
        junitReporter(report);
      }

      const totalIssues = report.summary.errors + report.summary.warnings;
      if (report.summary.errors > 0 || report.summary.warnings > (options['max-warnings'] || 0)) {
        process.exit(1);
      }
    } catch (error) {
      console.error(red((error as Error).message));
      process.exit(1);
    }
  });

cli.help();
cli.version('0.1.0');

cli.parse();
