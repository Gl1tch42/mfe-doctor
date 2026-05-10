import type { FederationGraph, Issue, PackageJson, ParsedConfig } from '../core/types';

export interface RuleMeta {
  name: string;
  description: string;
  category: 'configuration' | 'dependency' | 'performance' | 'architecture';
  docsUrl?: string;
}

export interface RuleContext {
  graph: FederationGraph;
  configs: ParsedConfig[];
  packageJsons: PackageJson[];
  options?: Record<string, unknown>;
}

export interface Rule {
  id: string;
  meta: RuleMeta;
  severity: 'error' | 'warning' | 'info';
  check(context: RuleContext): Issue[] | Promise<Issue[]>;
}

export interface RuleRegistry {
  register(rule: Rule): void;
  get(id: string): Rule | undefined;
  list(): Rule[];
  clear(): void;
}

// Global registry instance
class RuleRegistryImpl implements RuleRegistry {
  private rules = new Map<string, Rule>();

  register(rule: Rule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id '${rule.id}' is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  get(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  list(): Rule[] {
    return Array.from(this.rules.values());
  }

  clear(): void {
    this.rules.clear();
  }
}

export const ruleRegistry = new RuleRegistryImpl();
