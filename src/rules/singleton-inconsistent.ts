import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

function getSingletonValues(context: RuleContext, packageName: string): boolean[] {
  const values: boolean[] = [];

  for (const config of context.configs) {
    for (const shared of config.shared) {
      if (shared.packageName === packageName) {
        values.push(shared.singleton ?? false);
      }
    }
  }

  return values;
}

function hasSingletonInconsistency(values: boolean[]): boolean {
  if (values.length <= 1) return false;
  const firstValue = values[0];
  return values.some(value => value !== firstValue);
}

const rule: Rule = {
  id: 'singleton-inconsistent',
  meta: {
    name: 'Singleton Inconsistent',
    description: 'Detects shared packages with inconsistent singleton configurations across Module Federation configs.',
    category: 'configuration',
  },
  severity: 'warning',
  async check(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const processedPackages = new Set<string>();

    for (const config of context.configs) {
      for (const shared of config.shared) {
        if (processedPackages.has(shared.packageName)) continue;

        const values = getSingletonValues(context, shared.packageName);
        if (hasSingletonInconsistency(values)) {
          issues.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: `Shared package '${shared.packageName}' has inconsistent singleton configurations: ${values.map(v => v ? 'true' : 'false').join(', ')}.`,
            file: config.filePath,
            suggestion: `Ensure all Module Federation configs specify the same singleton value for '${shared.packageName}' or remove the singleton property if not needed.`,
            context: {
              packageName: shared.packageName,
              singletonValues: values,
            },
          });
        }

        processedPackages.add(shared.packageName);
      }
    }

    return issues;
  },
};

export default rule;