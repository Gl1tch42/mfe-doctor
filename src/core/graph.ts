import type { FederationGraph, ParsedConfig, SharedPackageInfo } from './types';

export function buildFederationGraph(configs: ParsedConfig[]): FederationGraph {
  const sharedPackages: Record<string, SharedPackageInfo> = {};

  for (const config of configs) {
    for (const shared of config.shared) {
      const declaredIn = sharedPackages[shared.packageName]?.declaredIn ?? [];
      declaredIn.push({
        configPath: config.filePath,
        requiredVersion: shared.requiredVersion,
        singleton: shared.singleton,
        eager: shared.eager,
      });
      sharedPackages[shared.packageName] = {
        packageName: shared.packageName,
        declaredIn,
      };
    }
  }

  return {
    host: configs.length > 0 ? configs[0] : undefined,
    remotes: configs,
    sharedPackages,
  };
}
