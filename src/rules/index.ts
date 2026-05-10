import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Rule } from './rule-interface';

const IGNORE_FILES = new Set(['index.js', 'index.ts', 'rule-interface.js', 'rule-interface.ts']);

export async function loadRules(): Promise<Rule[]> {
  const currentFilePath = typeof __dirname !== 'undefined'
    ? __dirname
    : typeof import.meta !== 'undefined' && typeof import.meta.url === 'string' && import.meta.url.startsWith('file://')
      ? fileURLToPath(import.meta.url)
      : process.argv[1] ?? process.cwd();

  const rulesDir = path.join(path.dirname(currentFilePath), 'rules');
  const entries = await fs.readdir(rulesDir);

  const ruleFiles = entries.filter((file) => {
    const isJs = file.endsWith('.js');
    const isTs = file.endsWith('.ts') && !file.endsWith('.d.ts');
    return (isJs || isTs) && !IGNORE_FILES.has(file);
  });

  const rules: Rule[] = [];

  for (const file of ruleFiles) {
    const fullPath = path.join(rulesDir, file);
    const importSource = process.env.VITEST ? fullPath : pathToFileURL(fullPath).href;
    const module = await import(importSource);
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
