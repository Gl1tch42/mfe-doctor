export type Severity = 'error' | 'warning' | 'info';

export interface ModuleFederationSharedItem {
  packageName: string;
  requiredVersion?: string;
  singleton?: boolean;
  eager?: boolean;
  import?: boolean | string[];
  shareKey?: string;
  shareScope?: string;
  version?: string;
}

export interface ModuleFederationExposeItem {
  exposeName: string;
  path: string;
}

export interface ModuleFederationRemoteItem {
  remoteName: string;
  url: string;
}

export interface ParsedConfig {
  filePath: string;
  name?: string;
  exposes: ModuleFederationExposeItem[];
  remotes: ModuleFederationRemoteItem[];
  shared: ModuleFederationSharedItem[];
  raw?: unknown;
}

export interface FederationGraph {
  host?: ParsedConfig;
  remotes: ParsedConfig[];
  sharedPackages: Record<string, SharedPackageInfo>;
}

export interface SharedPackageInfo {
  packageName: string;
  declaredIn: Array<{
    configPath: string;
    requiredVersion?: string;
    singleton?: boolean;
    eager?: boolean;
  }>;
}

export interface PackageJson {
  filePath: string;
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface Issue {
  ruleId: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
  context?: Record<string, unknown>;
}

export interface ReportSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export interface Report {
  issues: Issue[];
  graph: FederationGraph;
  summary: ReportSummary;
}
