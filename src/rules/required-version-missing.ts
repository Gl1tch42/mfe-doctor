import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

function resolvePackageVersion(packageJsons: RuleContext['packageJsons'], packageName: string): string | undefined {
  for (const pkg of packageJsons) {
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.peerDependencies ?? {}),
      ...(pkg.optionalDependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    const version = deps[packageName];
    if (typeof version === 'string' && version.length > 0) {
      return version;
    }
  }
  return undefined;
}

const rule: Rule = {
  id: 'required-version-missing',
  meta: {
    name: 'Required Version Missing',
    description: 'Detects shared packages without requiredVersion and without a version derivable from package.json.',
    category: 'dependency',
  },
  severity: 'warning',
  async check(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const config of context.configs) {
      for (const shared of config.shared) {
        if (shared.requiredVersion) {
          continue;
        }

        const packageVersion = resolvePackageVersion(context.packageJsons, shared.packageName);
        if (packageVersion) {
          continue;
        }

        issues.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: `Shared package '${shared.packageName}' is missing requiredVersion and cannot derive a version from provided package.json files.`,
          file: config.filePath,
          suggestion: `Add requiredVersion for '${shared.packageName}' or ensure it is present in the provided package.json files.`,
          context: {
            packageName: shared.packageName,
          },
        });
      }
    }

    return issues;
  },
};

export default rule;
