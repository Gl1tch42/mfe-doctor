import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

function getInstalledPackages(packageJsons: RuleContext['packageJsons']): Set<string> {
  const installed = new Set<string>();

  for (const pkg of packageJsons) {
    for (const dependencyField of [
      pkg.dependencies,
      pkg.devDependencies,
      pkg.peerDependencies,
      pkg.optionalDependencies,
    ]) {
      if (dependencyField && typeof dependencyField === 'object') {
        for (const packageName of Object.keys(dependencyField)) {
          installed.add(packageName);
        }
      }
    }
  }

  return installed;
}

const rule: Rule = {
  id: 'shared-not-installed',
  severity: 'error',
  description: 'Detects shared packages declared in Module Federation configs but missing from package.json.',
  async check(context: RuleContext): Promise<Issue[]> {
    if (context.packageJsons.length === 0) {
      return [];
    }

    const installed = getInstalledPackages(context.packageJsons);
    const issues: Issue[] = [];

    for (const config of context.configs) {
      for (const shared of config.shared) {
        if (!installed.has(shared.packageName)) {
          issues.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: `Shared package '${shared.packageName}' is declared but not installed in any provided package.json.`,
            file: config.filePath,
            suggestion: `Add '${shared.packageName}' to dependencies or peerDependencies in the relevant package.json.`,
            context: {
              packageName: shared.packageName,
            },
          });
        }
      }
    }

    return issues;
  },
};

export default rule;
