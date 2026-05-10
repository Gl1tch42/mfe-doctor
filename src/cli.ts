#!/usr/bin/env node

import path from 'node:path';
import cac from 'cac';
import picocolors from 'picocolors';
import { analyze } from './core/analyze';
import { loadConfig } from './core/config';
import { loadRulesFromDir } from './rules';
import { terminalReporter } from './reporters/terminal';
import { jsonReporter } from './reporters/json';
import { htmlReporter } from './reporters/html';
import { junitReporter } from './reporters/junit';
import { githubReporter } from './reporters/github';
import type { Rule } from './rules/rule-interface';

const { red } = picocolors;

const cli = cac('mfe-doctor');

interface AnalyzeCliOptions {
  json?: boolean;
  html?: boolean;
  rulesDir?: string;
  config?: string;
  disable?: string;
}

interface CiOptions {
  'max-warnings'?: number;
  format?: 'junit' | 'gh';
  rulesDir?: string;
  config?: string;
  disable?: string;
}

async function resolveExtraRules(rulesDir?: string, configPath?: string): Promise<{ extraRules: Rule[]; disable: string[] }> {
  const fileConfig = await loadConfig(configPath ? path.dirname(path.resolve(configPath)) : process.cwd());

  let dirRules: Rule[] = [];
  if (rulesDir) {
    dirRules = await loadRulesFromDir(path.resolve(rulesDir));
  }

  return {
    extraRules: [...(fileConfig.extraRules ?? []), ...dirRules],
    disable: fileConfig.disable ?? [],
  };
}

cli.command('analyze [config]', 'Analyze Module Federation configs')
  .option('--json', 'Output JSON report')
  .option('--html', 'Output HTML report')
  .option('--rules-dir <dir>', 'Directory with custom rule files (.js/.mjs)')
  .option('--config <path>', 'Path to mfe-doctor.config.js')
  .option('--disable <rules>', 'Comma-separated list of rule IDs to disable')
  .action(async (config: string | undefined, options: AnalyzeCliOptions) => {
    const configs = config ? [config] : ['webpack.config.js', '**/webpack.config.js'];
    try {
      const { extraRules, disable: configDisable } = await resolveExtraRules(options.rulesDir, options.config);
      const disable = [
        ...configDisable,
        ...(options.disable ? options.disable.split(',').map((s) => s.trim()) : []),
      ];
      const report = await analyze({
        configs,
        packageJsons: ['package.json', '**/package.json'],
        extraRules,
        disable,
      });
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
  .option('--rules-dir <dir>', 'Directory with custom rule files (.js/.mjs)')
  .option('--config <path>', 'Path to mfe-doctor.config.js')
  .option('--disable <rules>', 'Comma-separated list of rule IDs to disable')
  .action(async (options: CiOptions) => {
    try {
      const { extraRules, disable: configDisable } = await resolveExtraRules(options.rulesDir, options.config);
      const disable = [
        ...configDisable,
        ...(options.disable ? options.disable.split(',').map((s) => s.trim()) : []),
      ];
      const report = await analyze({
        configs: ['webpack.config.js', '**/webpack.config.js'],
        packageJsons: ['package.json', '**/package.json'],
        extraRules,
        disable,
      });

      if (options.format === 'gh') {
        githubReporter(report);
      } else {
        junitReporter(report);
      }

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
