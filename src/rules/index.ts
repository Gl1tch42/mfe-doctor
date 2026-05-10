import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Rule } from './rule-interface';

const IGNORE_FILES = new Set(['index.js', 'index.ts', 'rule-interface.js', 'rule-interface.ts']);

export async function loadRules(): Promise<Rule[]> {
  const rulesDir = path.dirname(fileURLToPath(import.meta.url));
  const entries = await fs.readdir(rulesDir);

  const ruleFiles = entries.filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.ts')) && !IGNORE_FILES.has(file),
  );

  const rules: Rule[] = [];

  for (const file of ruleFiles) {
    const fullPath = path.join(rulesDir, file);
    const module = await import(fullPath);
    const rule = module?.default;

    if (rule && typeof rule.id === 'string') {
      rules.push(rule as Rule);
    }
  }

  return rules;
}

export async function getRuleIds(): Promise<string[]> {
  const rules = await loadRules();
  return rules.map((rule) => rule.id);
}
