import type { FederationGraph, Issue, PackageJson, ParsedConfig } from '../core/types';

export interface RuleContext {
  graph: FederationGraph;
  configs: ParsedConfig[];
  packageJsons: PackageJson[];
  options?: Record<string, unknown>;
}

export interface Rule {
  id: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  check(context: RuleContext): Issue[] | Promise<Issue[]>;
}
