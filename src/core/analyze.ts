import { readFile } from 'node:fs/promises';
import { glob } from 'tinyglobby';
import type { Issue, PackageJson, ParsedConfig, Report } from './types';
import { parseWebpackConfig } from './parser';
import { buildFederationGraph } from './graph';
import { loadRules } from '../rules';

export interface AnalyzeOptions {
  configs: string[];
  packageJsons?: string[];
  rules?: Record<string, unknown>;
}

export async function analyze(options: AnalyzeOptions): Promise<Report> {
  // Expand globs for configs
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

  // Expand globs for packageJsons
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
  const rules = await loadRules();

  const issues: Issue[] = [];
  for (const rule of rules) {
    const context = {
      graph,
      configs,
      packageJsons,
      options: options.rules?.[rule.id] as Record<string, unknown> | undefined,
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
