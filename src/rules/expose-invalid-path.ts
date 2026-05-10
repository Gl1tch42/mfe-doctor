import fs from 'node:fs/promises';
import path from 'node:path';
import type { Issue } from '../core/types';
import type { Rule, RuleContext } from './rule-interface';

const rule: Rule = {
  id: 'expose-invalid-path',
  meta: {
    name: 'Invalid Expose Path',
    description: 'Detects exposes that point to nonexistent files',
    category: 'configuration',
  },
  severity: 'error',
  async check(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];

    for (const config of context.configs) {
      for (const expose of config.exposes) {
        const resolved = path.resolve(path.dirname(config.filePath), expose.path);
        try {
          await fs.access(resolved);
        } catch {
          issues.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: `Exposed module '${expose.exposeName}' points to missing file '${expose.path}'.`,
            file: config.filePath,
            suggestion: `Create the file or update the expose path to an existing file relative to ${config.filePath}.`,
            context: { resolvedPath: resolved },
          });
        }
      }
    }

    return issues;
  },
};

export default rule;
