import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

const rule: Rule = {
  id: 'eager-loading-heavy',
  severity: 'warning',
  description: 'Detects shared packages marked as eager, which can increase initial bundle size and slow startup.',
  async check(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const config of context.configs) {
      for (const shared of config.shared) {
        if (shared.eager) {
          issues.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: `Shared package '${shared.packageName}' is configured with eager loading. This can increase initial bundle size and slow down startup.`,
            file: config.filePath,
            suggestion: `Avoid using eager loading for large shared packages unless absolutely necessary.`,
            context: {
              packageName: shared.packageName,
              eager: true,
            },
          });
        }
      }
    }

    return issues;
  },
};

export default rule;
