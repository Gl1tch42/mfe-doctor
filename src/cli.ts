#!/usr/bin/env node

import cac from 'cac';
import picocolors from 'picocolors';
import { analyze } from './core/analyze';
import { terminalReporter } from './reporters/terminal';

const { red } = picocolors;

const cli = cac('mfe-doctor');

interface AnalyzeOptions {
  json?: boolean;
}

cli.command('analyze [config]', 'Analyze Module Federation configs').option('--json', 'Output JSON report').action(async (config: string | undefined, options: AnalyzeOptions) => {
  const configs = config ? [config] : ['webpack.config.js'];
  try {
    const report = await analyze({ configs, packageJsons: [] });
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      terminalReporter(report);
    }
  } catch (error) {
    console.error(red((error as Error).message));
    process.exit(1);
  }
});

cli.help();
cli.version('0.1.0');

cli.parse();
