import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

function getPackageVersions(packageJsons: RuleContext['packageJsons'], packageName: string): string[] {
  const versions: string[] = [];

  for (const pkg of packageJsons) {
    for (const dependencyField of [
      pkg.dependencies,
      pkg.devDependencies,
      pkg.peerDependencies,
      pkg.optionalDependencies,
    ]) {
      if (dependencyField && typeof dependencyField === 'object' && dependencyField[packageName]) {
        versions.push(dependencyField[packageName]);
      }
    }
  }

  return versions;
}

function hasVersionMismatch(versions: string[]): boolean {
  if (versions.length <= 1) return false;
  const firstVersion = versions[0];
  return versions.some(version => version !== firstVersion);
}

const rule: Rule = {
  id: 'version-mismatch',
  severity: 'error',
  description: 'Detects shared packages with conflicting versions across provided package.json files.',
  async check(context: RuleContext): Promise<Issue[]> {
    if (context.packageJsons.length <= 1) {
      return [];
    }

    const issues: Issue[] = [];

    for (const config of context.configs) {
      for (const shared of config.shared) {
        const versions = getPackageVersions(context.packageJsons, shared.packageName);
        if (hasVersionMismatch(versions)) {
          issues.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: `Shared package '${shared.packageName}' has conflicting versions: ${versions.join(', ')}.`,
            file: config.filePath,
            suggestion: `Ensure all package.json files specify the same version for '${shared.packageName}' or use a compatible range.`,
            context: {
              packageName: shared.packageName,
              versions,
            },
          });
        }
      }
    }

    return issues;
  },
};

export default rule;