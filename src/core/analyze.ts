import { readFile } from 'node:fs/promises';
import { glob } from 'tinyglobby';
import type { Issue, PackageJson, ParsedConfig, Report } from './types';
import type { Rule } from '../rules/rule-interface';
import { ruleRegistry } from '../rules/rule-interface';
import { parseWebpackConfig } from './parser';
import { buildFederationGraph } from './graph';
import { loadBuiltinRules } from '../rules';

export interface AnalyzeOptions {
  configs: string[];
  packageJsons?: string[];
  ruleOptions?: Record<string, unknown>;
  extraRules?: Rule[];
  disable?: string[];
}

export async function analyze(options: AnalyzeOptions): Promise<Report> {
  const configPaths: string[] = [];
  for (const pattern of options.configs) {
    if (pattern.includes('*') || pattern.includes('{') || pattern.includes('}')) {
      const matches = await glob(pattern, { cwd: process.cwd() });
      configPaths.push(...matches);
    } else {
      configPaths.push(pattern);
    }
  }

  const configs: ParsedConfig[] = [];
  for (const configPath of configPaths) {
    configs.push(await parseWebpackConfig(configPath));
  }

  const packageJsonPaths: string[] = [];
  if (options.packageJsons) {
    for (const pattern of options.packageJsons) {
      if (pattern.includes('*') || pattern.includes('{') || pattern.includes('}')) {
        const matches = await glob(pattern, { cwd: process.cwd() });
        packageJsonPaths.push(...matches);
      } else {
        packageJsonPaths.push(pattern);
      }
    }
  }

  const packageJsons: PackageJson[] = [];
  for (const packageJsonPath of packageJsonPaths) {
    const raw = await readFile(packageJsonPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    packageJsons.push({
      filePath: packageJsonPath,
      ...parsed,
    });
  }

  const graph = buildFederationGraph(configs);

  const disabled = new Set(options.disable ?? []);
  const builtins = await loadBuiltinRules();
  const allRules: Rule[] = [
    ...builtins,
    ...ruleRegistry.list(),
    ...(options.extraRules ?? []),
  ].filter((rule) => !disabled.has(rule.id));

  const issues: Issue[] = [];
  for (const rule of allRules) {
    const context = {
      graph,
      configs,
      packageJsons,
      options: options.ruleOptions?.[rule.id] as Record<string, unknown> | undefined,
    };
    const result = await rule.check(context);
    issues.push(...result);
  }

  const summary = issues.reduce(
    (acc, issue) => {
      if (issue.severity === 'error') acc.errors += 1;
      if (issue.severity === 'warning') acc.warnings += 1;
      if (issue.severity === 'info') acc.infos += 1;
      return acc;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );

  return {
    issues,
    graph,
    summary,
  };
}
