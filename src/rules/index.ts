import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Rule } from './rule-interface';
import { ruleRegistry } from './rule-interface';

const IGNORE_FILES = new Set(['index.js', 'index.ts', 'rule-interface.js', 'rule-interface.ts']);

export async function loadBuiltinRules(): Promise<Rule[]> {
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
    try {
      const module = await import(importSource);
      const rule = module?.default;
      if (rule && typeof rule.id === 'string' && typeof rule.check === 'function') {
        rules.push(rule as Rule);
      }
    } catch (error) {
      console.warn(`Failed to load rule from ${file}:`, error);
    }
  }

  return rules;
}

export async function loadRulesFromDir(dir: string): Promise<Rule[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    throw new Error(`Rules directory not found: ${dir}`);
  }

  const ruleFiles = entries.filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));
  const rules: Rule[] = [];

  for (const file of ruleFiles) {
    const fullPath = path.join(dir, file);
    try {
      const module = await import(pathToFileURL(fullPath).href);
      const rule = module?.default;
      if (rule && typeof rule.id === 'string' && typeof rule.check === 'function') {
        rules.push(rule as Rule);
      } else {
        console.warn(`File ${file} does not export a valid rule (missing id or check)`);
      }
    } catch (error) {
      console.warn(`Failed to load custom rule from ${file}:`, error);
    }
  }

  return rules;
}

export async function getRuleIds(): Promise<string[]> {
  const rules = await loadBuiltinRules();
  return rules.map((rule) => rule.id);
}

export { ruleRegistry };
