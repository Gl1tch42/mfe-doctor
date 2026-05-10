import semver from 'semver';
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

  // Try to find a common version that satisfies all ranges
  const uniqueVersions = [...new Set(versions)];

  if (uniqueVersions.length === 1) return false;

  // Check if all versions are compatible via semver
  try {
    const parsedVersions = uniqueVersions.map(v => semver.validRange(v)).filter(Boolean);
    if (parsedVersions.length !== uniqueVersions.length) {
      // Some versions are not valid ranges, fall back to string comparison
      return true;
    }

    // Check if there's an intersection between all ranges
    const intersection = parsedVersions.reduce((acc, range) => {
      if (!acc) return range;
      return semver.intersects(acc, range) ? semver.intersects(acc, range) : null;
    });

    return !intersection;
  } catch {
    // Fallback to string comparison if semver fails
    return true;
  }
}

const rule: Rule = {
  id: 'version-mismatch',
  meta: {
    name: 'Version Mismatch',
    description: 'Detects shared packages with conflicting versions across package.json files',
    category: 'dependency',
  },
  severity: 'error',
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
            suggestion: `Ensure all package.json files specify compatible versions for '${shared.packageName}'.`,
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